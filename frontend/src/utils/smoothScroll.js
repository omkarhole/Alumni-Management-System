const EASING = {
    easeInOutCubic: (t) => (t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2)
};

let activeAnimationFrame = null;
let restoreRootScrollBehavior = null;

function shouldReduceMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function smoothScrollToTop(duration = 920) {
    if (typeof window === 'undefined') {
        return;
    }

    if (activeAnimationFrame) {
        window.cancelAnimationFrame(activeAnimationFrame);
        activeAnimationFrame = null;
    }
    if (restoreRootScrollBehavior) {
        restoreRootScrollBehavior();
        restoreRootScrollBehavior = null;
    }

    if (shouldReduceMotion()) {
        window.scrollTo(0, 0);
        return;
    }

    const startY = window.scrollY || window.pageYOffset || 0;
    if (startY <= 0) {
        return;
    }

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    restoreRootScrollBehavior = () => {
        root.style.scrollBehavior = previousBehavior;
    };

    const startTime = performance.now();
    const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = EASING.easeInOutCubic(progress);
        const nextY = Math.max(0, startY * (1 - eased));

        window.scrollTo(0, nextY);

        if (progress < 1) {
            activeAnimationFrame = window.requestAnimationFrame(step);
            return;
        }

        activeAnimationFrame = null;
        window.scrollTo(0, 0);
        if (restoreRootScrollBehavior) {
            restoreRootScrollBehavior();
            restoreRootScrollBehavior = null;
        }
    };

    activeAnimationFrame = window.requestAnimationFrame(step);
}
