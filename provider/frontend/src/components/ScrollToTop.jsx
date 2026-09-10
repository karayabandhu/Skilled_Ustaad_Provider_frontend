import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Function to perform the scroll
    const performScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      
      // Target the main container specifically
      const mainContent = document.querySelector('main');
      if (mainContent) mainContent.scrollTo(0, 0);
    };

    // 1. Immediate resets
    performScroll();

    // 2. Immediate micro-task fallback
    const immediateTimeout = setTimeout(performScroll, 10);

    // 3. Slightly delayed fallback for heavy page renders
    const delayedTimeout = setTimeout(performScroll, 100);

    return () => {
      clearTimeout(immediateTimeout);
      clearTimeout(delayedTimeout);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
