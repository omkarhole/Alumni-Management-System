import { useEffect } from 'react';

const EASING = 0.14;
const DELTA_MULTIPLIER = 0.95;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function prefersReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isTouchDevice() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function findScrollableAncestor(target) {
    let node = target instanceof Element ? target : null;

    while (node && node !== document.body) {
        if (node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY)
                && node.scrollHeight > node.clientHeight + 1;
            if (canScrollY) {
                return node;
            }
        }
        node = node.parentElement;
    }

    return document.scrollingElement || document.documentElement;
}

const SmoothWheelScroll = () => {
    useEffect(() => {
        if (typeof window === 'undefined' || prefersReducedMotion() || isTouchDevice()) {
            return undefined;
        }

        const root = document.documentElement;
        const prevInlineScrollBehavior = root.style.scrollBehavior;
        let rafId = null;
        let currentY = window.scrollY || 0;
        let targetY = currentY;

        const getMaxScroll = () => {
            const scrollingEl = document.scrollingElement || document.documentElement;
            return Math.max(0, scrollingEl.scrollHeight - window.innerHeight);
        };

        const animate = () => {
            const diff = targetY - currentY;
            currentY += diff * EASING;

            if (Math.abs(diff) <= 0.6) {
                currentY = targetY;
            }

            window.scrollTo(0, currentY);

            if (currentY === targetY) {
                rafId = null;
                root.style.scrollBehavior = prevInlineScrollBehavior;
                return;
            }

            rafId = window.requestAnimationFrame(animate);
        };

        const ensureAnimation = () => {
            if (rafId) return;
            root.style.scrollBehavior = 'auto';
            rafId = window.requestAnimationFrame(animate);
        };

        const handleWheel = (event) => {
            if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
                return;
            }

            const scrollingEl = document.scrollingElement || document.documentElement;
            const nearestScrollable = findScrollableAncestor(event.target);
            const isPageScroller = nearestScrollable === scrollingEl
                || nearestScrollable === document.body
                || nearestScrollable === document.documentElement;

            if (!isPageScroller) {
                const atTop = nearestScrollable.scrollTop <= 0;
                const atBottom = nearestScrollable.scrollTop + nearestScrollable.clientHeight >= nearestScrollable.scrollHeight - 1;
                const scrollingInsideContainer = (event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom);
                if (scrollingInsideContainer) {
                    return;
                }
            }

            const next = clamp(targetY + (event.deltaY * DELTA_MULTIPLIER), 0, getMaxScroll());
            if (next === targetY) {
                return;
            }

            event.preventDefault();
            targetY = next;
            ensureAnimation();
        };

        const syncOnScroll = () => {
            if (rafId) return;
            currentY = window.scrollY || 0;
            targetY = currentY;
        };

        const syncBounds = () => {
            const max = getMaxScroll();
            targetY = clamp(targetY, 0, max);
            currentY = clamp(currentY, 0, max);
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('scroll', syncOnScroll, { passive: true });
        window.addEventListener('resize', syncBounds, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', syncOnScroll);
            window.removeEventListener('resize', syncBounds);
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            root.style.scrollBehavior = prevInlineScrollBehavior;
        };
    }, []);

    return null;
};

export default SmoothWheelScroll;
