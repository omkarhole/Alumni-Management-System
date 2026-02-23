import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { smoothScrollToTop } from '../utils/smoothScroll';

const ScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        smoothScrollToTop();
    }, [location.pathname]); 

    return null;
};

export default ScrollToTop;
