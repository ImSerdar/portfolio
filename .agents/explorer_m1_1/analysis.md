# Scrolling Mechanism Analysis and Cinematic Snap Scrolling Proposal

This analysis document examines the current virtual scrolling mechanism in the portfolio application and details the architectural modifications needed to implement **Cinematic Snap Scrolling (R1)**.

---

## 1. Analysis of Current Scrolling Mechanism

### A. Custom Scrolling Implementation (`useVirtualScroll.js`)
The file `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` implements virtual scrolling using Framer Motion's `useMotionValue` and `useSpring`. The mechanism works as follows:

*   **State Management:**
    *   `scrollTarget` (Framer Motion `MotionValue` starting at `0`): Represents the raw/target scroll position. Under the current implementation, it is a continuous floating-point number bounded between `0` and `totalSections - 1` (6.0).
    *   `smoothScroll` (Framer Motion `useSpring` tracking `scrollTarget`): Smoothly interpolates toward the target position. It uses the following configuration:
        ```javascript
        stiffness: 50,
        damping: 25,
        restDelta: 0.001
        ```
        Due to the higher damping (`25`) relative to stiffness (`50`), the spring is overdamped, resulting in a smooth, non-oscillating transition that takes approximately 800ms–1000ms to fully settle.
    
*   **Event Tracking:**
    *   **Mouse Wheel (`wheel`):** The scroll event listener prevents the browser's default scroll behavior to avoid rubber-banding/bouncing. It retrieves the current value of `scrollTarget` and increments it by `e.deltaY * sensitivity` (continuous free scrolling).
    *   **Touch Events (`touchstart` & `touchmove`):** Tracks the user's vertical touch coordinate in `touchstart`. During `touchmove`, it computes the delta displacement from the last touch frame and increments `scrollTarget` by `deltaY * touchSensitivity` (continuous scrolling).
    *   **Keyboard (`keydown`):** Listens for keys. Arrow keys (`ArrowDown`/`ArrowUp`) and Space add or subtract fractional values (`0.5`), while page keys (`PageDown`/`PageUp`) add/subtract integer values (`1.0`).

### B. Binding and Transitions (`App.jsx`, `DOMOverlay.jsx`, `CentralMesh.jsx`)
In `C:\Serdar\portfolio\src\App.jsx`, the custom scroll values are bound to the visual scene and DOM layers:

*   **Tracking Active Section:**
    `App.jsx` tracks `activeSection` by subscribing to `smoothScroll` changes:
    ```javascript
    useEffect(() => {
      return smoothScroll.on('change', (latest) => {
        const current = Math.round(latest);
        setActiveSection(current);
      });
    }, [smoothScroll]);
    ```
    This updates `activeSection` (highlighting navigation links and the side dot indicators) when the spring animation passes the 50% mark between sections.
*   **DOM Animations (`DOMOverlay.jsx`):**
    Each of the 7 sections is wrapped in a `SectionWrapper` that uses Framer Motion's `useTransform` to map `smoothScroll` to 3D CSS transforms:
    *   `opacity`: Fades in and out using a keyframe array centered around each section index (e.g. `[index - 0.6, index - 0.25, index, index + 0.25, index + 0.6]`).
    *   `z` (depth displacement): Moves the section forward/backward in 3D space (`[-500, 0, 800]`) based on the delta from `smoothScroll` to `index`.
    *   `scale`: Scales from `0.85` to `1.15`.
    *   `pointerEvents`: Set to `auto` only when the active section is close to `index` (within `0.45` range), preventing overlapping click issues.
*   **3D WebGL Scene (`CentralMesh.jsx`):**
    The `<CentralMesh>` component receives `scrollSmooth` and uses it to interpolate properties:
    *   **Mesh Positioning and Scaling:** Interpolates the 3D position and scale between section presets (`POSITIONS` and `SCALES`) using a cubic-eased alpha derived from `scrollSmooth`.
    *   **Opacity and Emissive Cross-Fades:** Child meshes fade their opacity and emissive glow values based on the distance from the current index `Math.abs(scrollSmooth.get() - index)`.

---

## 2. Implementing Cinematic Snap Scrolling (R1)

### A. Architectural Strategy
To achieve **Cinematic Snap Scrolling** (firmly snapping between sections with no free-scrolling), we must make the following adjustments:

1.  **Replace Continuous Accumulation with Discrete Snapping:**
    Instead of adding fractional offsets (`delta * sensitivity`) to `scrollTarget`, scroll events must only determine scroll direction (up/down). The hook then rounds the current position to the nearest integer and transitions directly to `current + 1` or `current - 1`.
2.  **Introduce Transition Cooldown (Input Lock):**
    Because mouse wheel and touchmove events fire in rapid succession, initiating a transition would immediately scroll through all sections without a lock. We should introduce an input lock that disables scroll listeners for a configurable cooldown period (e.g. 1000ms, matching the spring transition).
3.  **Unified Lock on Target Change:**
    An extremely elegant way to handle both scroll-driven transitions and navigation clicks (Navbar / dots) is to subscribe to `scrollTarget`'s `'change'` event inside the hook. Whenever the target changes, the hook locks inputs and unlocks them after the cooldown. This guarantees that clicking navigation links locks scrolling during the animation, preventing interruptions.
4.  **Robust Discrete Gesture Detection:**
    *   **Touch Swipes:** Rather than cumulative frame-by-frame updates, we measure the total touch displacement from `touchstart` to `touchmove`. Once the displacement exceeds a threshold (e.g. 50px), we trigger a single transition step and set a `touchTriggered` flag to prevent further triggers until the user lifts their finger and touches again.
    *   **Mouse Wheel:** Ignore tiny scroll inputs (e.g., `< 10px` delta) to filter trackpad noise, treating larger inputs as single discrete triggers.
    *   **Keyboard:** Lock Arrow keys, Space, and Page keys during cooldown. Map ArrowDown/Space/PageDown to `+1` and ArrowUp/PageUp to `-1`.
5.  **Responsiveness Optimization (Optional but Recommended):**
    In `App.jsx`, update the active section tracking to listen to `scrollTarget` instead of `smoothScroll`. This updates the active nav link/dot immediately when the transition starts, making the UI feel highly responsive.

---

## 3. Suggested Code Modifications

### Modification 1: `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js`
Replace the entire file with the following snap-scrolling implementation:

```javascript
import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export function useVirtualScroll({ totalSections = 7, cooldown = 1000 } = {}) {
  const scrollTarget = useMotionValue(0);
  
  const smoothScroll = useSpring(scrollTarget, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.001
  });

  const touchStartY = useRef(0);
  const touchTriggered = useRef(false);
  const isLocked = useRef(false);
  const lockTimeout = useRef(null);

  // Automatically lock scroll input when scrollTarget changes (handles scroll + clicks)
  useEffect(() => {
    const unsubscribe = scrollTarget.on('change', () => {
      isLocked.current = true;
      if (lockTimeout.current) clearTimeout(lockTimeout.current);
      lockTimeout.current = setTimeout(() => {
        isLocked.current = false;
      }, cooldown);
    });

    return () => {
      unsubscribe();
      if (lockTimeout.current) clearTimeout(lockTimeout.current);
    };
  }, [scrollTarget, cooldown]);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // Prevent page bounce/default scrolling
      
      if (isLocked.current) return;

      // Ignore micro-scrolls (e.g., trackpad noise)
      if (Math.abs(e.deltaY) < 10) return;

      const current = Math.round(scrollTarget.get());
      const direction = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(totalSections - 1, current + direction));

      if (next !== current) {
        scrollTarget.set(next);
      }
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchTriggered.current = false;
    };

    const handleTouchMove = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      
      if (isLocked.current || touchTriggered.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY; // positive = swipe up/scroll down

      // Threshold of 50px for registering a swipe
      if (Math.abs(deltaY) > 50) {
        const current = Math.round(scrollTarget.get());
        const direction = deltaY > 0 ? 1 : -1;
        const next = Math.max(0, Math.min(totalSections - 1, current + direction));

        if (next !== current) {
          touchTriggered.current = true; // Mark triggered for this touch session
          scrollTarget.set(next);
        }
      }
    };

    const handleKeyDown = (e) => {
      // Prevent standard browser key scrolling behavior
      const keyScrolls = ['ArrowDown', ' ', 'ArrowUp', 'PageDown', 'PageUp'];
      if (keyScrolls.includes(e.key)) {
        e.preventDefault();
      }

      if (isLocked.current) return;

      const current = Math.round(scrollTarget.get());
      let direction = 0;

      if (e.key === 'ArrowDown' || e.key === ' ') {
        direction = 1;
      } else if (e.key === 'ArrowUp') {
        direction = -1;
      } else if (e.key === 'PageDown') {
        direction = 1;
      } else if (e.key === 'PageUp') {
        direction = -1;
      }

      if (direction !== 0) {
        const next = Math.max(0, Math.min(totalSections - 1, current + direction));
        if (next !== current) {
          scrollTarget.set(next);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalSections, scrollTarget]);

  return { scrollTarget, smoothScroll };
}
```

### Modification 2: `C:\Serdar\portfolio\src\App.jsx`
Optimizing active section changes by mapping directly to the `scrollTarget` instead of waiting for the spring animation to cross the 50% boundary.

*   **Locate Lines 43–49 in `App.jsx`:**
    ```javascript
    // Track active section to highlight dots and navbar links
    useEffect(() => {
      return smoothScroll.on('change', (latest) => {
        const current = Math.round(latest);
        setActiveSection(current);
      });
    }, [smoothScroll]);
    ```

*   **Replace with:**
    ```javascript
    // Track active section to highlight dots and navbar links immediately on target update
    useEffect(() => {
      return scrollTarget.on('change', (latest) => {
        setActiveSection(latest);
      });
    }, [scrollTarget]);
    ```

---

## 4. Verification and Visual Consistency

*   **Testing Transition Animation:** Because Framer Motion's `useSpring` is retained, snap scrolling will not create abrupt screen jumps. The visual transitions inside `DOMOverlay.jsx` (fades, scales, depth motions) and `CentralMesh.jsx` (smooth mesh deformations, positions, and materials) will animate identically to before, but strictly from integer section to integer section.
*   **Cooldown Bounds:** The 1000ms cooldown provides an optimal balance between avoiding accidental double-transitions and allowing user-driven navigation.
