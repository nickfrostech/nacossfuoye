import { useEffect, useRef } from "react";

function useScale({ letterHeadRef, previewRef, baseWidth = 794 }) {
   const rafRef = useRef(null);

   useEffect(() => {
      function scalePaper() {
         const paper = letterHeadRef.current;
         const wrapper = previewRef.current;
         if (!paper || !wrapper) return;

         if (paper.dataset.scalingPaused === 'true') return;

         // Get exact float width of wrapper container
         const exactWidth = wrapper.getBoundingClientRect().width;
         if (!exactWidth || exactWidth <= 0) return;
         const scale = exactWidth / baseWidth;

         const targetTransform = `scale(${scale})`;
         if (paper.style.transform !== targetTransform) {
            paper.style.transform = targetTransform;
            paper.style.transformOrigin = "top left";
         }
      }

      function scheduleScale() {
         if (rafRef.current) cancelAnimationFrame(rafRef.current);
         rafRef.current = requestAnimationFrame(scalePaper);
      }

      const wrapper = previewRef.current;
      let resizeObserver;

      if (wrapper && typeof ResizeObserver !== 'undefined') {
         resizeObserver = new ResizeObserver(() => {
            scheduleScale();
         });
         resizeObserver.observe(wrapper);
      }

      window.addEventListener("resize", scheduleScale, { passive: true });
      scheduleScale();

      const timer = setTimeout(scheduleScale, 120);

      return () => {
         clearTimeout(timer);
         if (rafRef.current) cancelAnimationFrame(rafRef.current);
         if (resizeObserver && wrapper) {
            resizeObserver.unobserve(wrapper);
         }
         resizeObserver?.disconnect();
         window.removeEventListener("resize", scheduleScale);
      };
   }, [baseWidth, letterHeadRef, previewRef]);
}

export default useScale;
