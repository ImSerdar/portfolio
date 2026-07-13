import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

function canAncestorScroll(target, direction) {
  let current = target;
  while (current && current !== document.body && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const isScrollableY = style.overflowY === 'auto' || style.overflowY === 'scroll' || current.classList.contains('section-content-container');
    
    if (isScrollableY) {
      const scrollTop = current.scrollTop;
      const scrollHeight = current.scrollHeight;
      const clientHeight = current.clientHeight;
      
      if (direction > 0) {
        if (scrollHeight - scrollTop > clientHeight + 1) {
          return true;
        }
      } else if (direction < 0) {
        if (scrollTop > 0) {
          return true;
        }
      }
    }
    current = current.parentElement;
  }
  return false;
}

export function useVirtualScroll({ totalSections = 7 } = {}) {
  const scrollTarget = useMotionValue(0);
  
  const smoothScroll = useSpring(scrollTarget, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.001
  });

  const isLockedRef = useRef(false);
  const swipeTriggered = useRef(false);
  const timeoutRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Subscribe to changes to trigger lock cooldown
  useEffect(() => {
    const unsubscribe = scrollTarget.on('change', () => {
      isLockedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        isLockedRef.current = false;
      }, 1000);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scrollTarget]);

  // Track when we hit the edge of a horizontal carousel so we need
  // a second scroll gesture to actually advance to the next section
  const edgeHitRef = useRef(false);
  const edgeTimeoutRef = useRef(null);

  useEffect(() => {
    const SCROLL_MULTIPLIER = 2.5; // How fast horizontal cards scroll from vertical wheel

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) < 5 && Math.abs(e.deltaX) < 5) return;

      const directionY = e.deltaY > 0 ? 1 : -1;

      // Find the active section's horizontal carousel container
      const activeSection = document.querySelector('.section-wrapper');
      let hContainer = null;

      // Search from the event target up, or from the active visible section
      hContainer = e.target.closest('.work-grid, .services-grid, .process-grid');
      if (!hContainer) {
        // Also check if the current snap section has a carousel
        const allWrappers = document.querySelectorAll('.section-content-container');
        for (const wrapper of allWrappers) {
          const parent = wrapper.closest('.section-wrapper');
          if (parent && parent.style.opacity && parseFloat(parent.style.opacity) > 0.5) {
            const carousel = wrapper.querySelector('.work-grid, .services-grid, .process-grid');
            if (carousel) {
              hContainer = carousel;
              break;
            }
          }
        }
      }

      if (hContainer) {
        const maxScroll = hContainer.scrollWidth - hContainer.clientWidth;
        if (maxScroll > 2) {
          const scrollAmount = e.deltaY * SCROLL_MULTIPLIER;
          const isAtEnd = directionY > 0 && hContainer.scrollLeft >= maxScroll - 2;
          const isAtStart = directionY < 0 && hContainer.scrollLeft <= 1;

          if (!isAtEnd && !isAtStart) {
            e.preventDefault();
            if (isLockedRef.current) return;
            
            const firstChild = hContainer.children[0];
            const cardWidth = firstChild ? firstChild.offsetWidth + parseFloat(window.getComputedStyle(hContainer).gap || 0) : 350;
            const snapAmount = directionY * cardWidth;
            
            hContainer.scrollBy({ left: snapAmount, behavior: 'smooth' });
            
            isLockedRef.current = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => { isLockedRef.current = false; }, 400);

            edgeHitRef.current = false;
            if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
            return;
          }

          if (!edgeHitRef.current) {
            e.preventDefault();
            edgeHitRef.current = true;
            if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
            edgeTimeoutRef.current = setTimeout(() => { edgeHitRef.current = false; }, 800);
            return;
          }
        }
      } else {
        // Vertical container check for sections without horizontal carousels (e.g. Showcase, Contact)
        let vContainer = null;
        const allWrappers = document.querySelectorAll('.section-wrapper');
        for (const wrapper of allWrappers) {
          if (wrapper.style.opacity && parseFloat(wrapper.style.opacity) > 0.5) {
            vContainer = wrapper.querySelector('.section-content-container');
            break;
          }
        }

        if (vContainer) {
          const maxScroll = vContainer.scrollHeight - vContainer.clientHeight;
          if (maxScroll > 2) {
            const isAtEnd = directionY > 0 && vContainer.scrollTop >= maxScroll - 2;
            const isAtStart = directionY < 0 && vContainer.scrollTop <= 2;

            if (!isAtEnd && !isAtStart) {
              if (!vContainer.contains(e.target)) {
                 // Mouse is outside the text box (e.g. over 3D model) — manually proxy the scroll
                 e.preventDefault();
                 vContainer.scrollBy({ top: e.deltaY, behavior: 'auto' });
              }
              // If target IS inside, let browser handle the scroll natively, but still consume the wheel event
              edgeHitRef.current = false;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              return;
            }

            // We reached the vertical edge. Buffer the next snap just like horizontal.
            if (!edgeHitRef.current) {
              e.preventDefault();
              edgeHitRef.current = true;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              edgeTimeoutRef.current = setTimeout(() => { edgeHitRef.current = false; }, 800);
              return;
            }
          }
        }
      }

      if (canAncestorScroll(e.target, directionY)) {
        return;
      }

      e.preventDefault();
      if (isLockedRef.current) return;

      // Reset edge state on section change
      edgeHitRef.current = false;
      if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);

      const current = Math.round(scrollTarget.get());
      const next = Math.max(0, Math.min(totalSections - 1, current + directionY));
      scrollTarget.set(next);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      swipeTriggered.current = false;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY.current - currentY;
      const deltaX = touchStartX.current - currentX;
      
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const directionY = deltaY > 0 ? 1 : -1;
      
      // 1. Find active horizontal carousel
      let hContainer = e.target.closest('.work-grid, .services-grid, .process-grid');
      if (!hContainer) {
        const allWrappers = document.querySelectorAll('.section-content-container');
        for (const wrapper of allWrappers) {
          const parent = wrapper.closest('.section-wrapper');
          if (parent && parent.style.opacity && parseFloat(parent.style.opacity) > 0.5) {
            const carousel = wrapper.querySelector('.work-grid, .services-grid, .process-grid');
            if (carousel) {
              hContainer = carousel;
              break;
            }
          }
        }
      }

      if (hContainer) {
        const maxScroll = hContainer.scrollWidth - hContainer.clientWidth;
        if (maxScroll > 0) {
          if (isHorizontalSwipe) {
            // Horizontal swipe
            const isAtEnd = deltaX > 0 && hContainer.scrollLeft >= maxScroll - 1;
            const isAtStart = deltaX < 0 && hContainer.scrollLeft <= 0;
            if (!isAtEnd && !isAtStart) {
              if (!hContainer.contains(e.target)) {
                 e.preventDefault();
                 hContainer.scrollBy({ left: deltaX, behavior: 'auto' });
                 touchStartX.current = currentX;
              }
              return; 
            }
            return;
          } else {
            // Vertical swipe -> Translate to Horizontal scroll (card by card)!
            const isAtEnd = deltaY > 0 && hContainer.scrollLeft >= maxScroll - 1;
            const isAtStart = deltaY < 0 && hContainer.scrollLeft <= 0;
            
            if (!isAtEnd && !isAtStart) {
              e.preventDefault();
              
              if (Math.abs(deltaY) > 30 && !isLockedRef.current) {
                const firstChild = hContainer.children[0];
                const cardWidth = firstChild ? firstChild.offsetWidth + parseFloat(window.getComputedStyle(hContainer).gap || 0) : 350;
                const snapAmount = (deltaY > 0 ? 1 : -1) * cardWidth;
                
                hContainer.scrollBy({ left: snapAmount, behavior: 'smooth' });
                
                isLockedRef.current = true;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => { isLockedRef.current = false; }, 400);
                
                touchStartY.current = currentY; // reset delta to prevent multiple triggers
              }
              
              edgeHitRef.current = false;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              return;
            }
            
            // Reached edge of carousel with a vertical swipe. Buffer the section snap!
            if (!edgeHitRef.current) {
              e.preventDefault();
              edgeHitRef.current = true;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              edgeTimeoutRef.current = setTimeout(() => { edgeHitRef.current = false; }, 800);
              return;
            }
            // Second swipe at edge -> falls through to section snap below
          }
        }
      } else {
        // 2. Find active vertical container (Showcase, Contact)
        let vContainer = null;
        const allWrappers = document.querySelectorAll('.section-wrapper');
        for (const wrapper of allWrappers) {
          if (wrapper.style.opacity && parseFloat(wrapper.style.opacity) > 0.5) {
            vContainer = wrapper.querySelector('.section-content-container');
            break;
          }
        }

        if (vContainer) {
          const maxScroll = vContainer.scrollHeight - vContainer.clientHeight;
          if (maxScroll > 2) {
            const isAtEnd = directionY > 0 && vContainer.scrollTop >= maxScroll - 2;
            const isAtStart = directionY < 0 && vContainer.scrollTop <= 2;

            if (!isAtEnd && !isAtStart) {
              if (!vContainer.contains(e.target)) {
                 e.preventDefault();
                 vContainer.scrollBy({ top: deltaY, behavior: 'auto' });
                 touchStartY.current = currentY;
              }
              edgeHitRef.current = false;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              return;
            }
            
            if (!edgeHitRef.current) {
              e.preventDefault();
              edgeHitRef.current = true;
              if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
              edgeTimeoutRef.current = setTimeout(() => { edgeHitRef.current = false; }, 800);
              return;
            }
          }
        }
      }
      
      if (canAncestorScroll(e.target, directionY)) {
        return;
      }
      
      e.preventDefault();
      if (isLockedRef.current || swipeTriggered.current) return;
      
      if (Math.abs(deltaY) > 50) {
        edgeHitRef.current = false;
        if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
        
        const current = Math.round(scrollTarget.get());
        const next = Math.max(0, Math.min(totalSections - 1, current + directionY));
        scrollTarget.set(next);
        swipeTriggered.current = true;
      }
    };

    const handleTouchEnd = () => {
      swipeTriggered.current = false;
    };

    const handleKeyDown = (e) => {
      const navKeys = ['ArrowDown', ' ', 'PageDown', 'ArrowUp', 'PageUp'];
      if (!navKeys.includes(e.key)) return;
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      let direction = 0;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        direction = 1;
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        direction = -1;
      }

      if (direction !== 0) {
        if (canAncestorScroll(e.target, direction)) {
          return;
        }
        e.preventDefault();
        if (isLockedRef.current) return;

        const current = Math.round(scrollTarget.get());
        const next = Math.max(0, Math.min(totalSections - 1, current + direction));
        scrollTarget.set(next);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalSections, scrollTarget]);

  return { scrollTarget, smoothScroll };
}

