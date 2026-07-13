# Portfolio Oryzo AI Replicant — Animation & Scroll Mechanics Analysis

## Core Summary
This report analyzes the portfolio's scroll and animation architecture, proposing a transition from the current Drei `ScrollControls` and inline `<Html>` elements to a unified **Zero-Scroll / Decoupled DOM Overlay** system. By driving both a WebGL camera flight path and a perspectived CSS 3D DOM overlay from a single Framer Motion `useSpring` value, we can achieve high-performance, responsive section transitions with spatial depth and no scrollbar jank, matching the experience of `oryzo.ai`.

---

## 1. Current Implementation Audit & Limitations

Currently, the 3D portfolio utilizes a hybrid system that introduces several performance and rendering bottlenecks:

### A. Scroll Interception via `@react-three/drei`'s `ScrollControls`
* **Mechanism**: In `Scene.jsx` (line 244), the entire scene is wrapped in `<ScrollControls pages={15} damping={0.1}>`.
* **Issue**: `ScrollControls` works by placing a transparent native HTML scrollbar layer over or behind the WebGL Canvas. When the user scrolls, Drei syncs this scroll position to the scene. 
* **Bottlenecks**:
  * On mobile devices, native scrolling triggers address bar hide/show resizing, which causes layout shifts and WebGL canvas rebuilds (jank).
  * Since the outer window is set to `overflow: hidden` (in `index.css` line 31 and 39), the browser's standard scrollbar is hidden, but the virtual overlay scrollbar still receives wheel momentum.
  * Rubber-banding and elastic scrolling on macOS/Safari/iOS can cause the 3D scene to bounce uncontrollably or clip.

### B. Double Damping in Camera Movement
* **Mechanism**: In `Scene.jsx` (lines 22-27), the `CameraController` reads Drei's scroll offset and moves the camera:
  ```javascript
  const targetZ = scroll.offset * SCENE_DEPTHS.END;
  cameraGroup.current.position.z += (targetZ - cameraGroup.current.position.z) * 0.05;
  ```
* **Issue**: Drei's `ScrollControls` already applies its own damping (configured as `damping={0.1}`). Adding a manual linear interpolation (`* 0.05`) in `useFrame` results in **double-damping**. This makes scroll responsiveness feel sluggish, lagging, and disconnected from user input.

### C. In-WebGL HTML Elements (`<Html transform>`)
* **Mechanism**: Stats, Services, Process, and Work sections are rendered as children of the WebGL Canvas using Drei's `<Html transform>` component.
* **Issue**: `<Html transform>` forces DOM elements to be projected inside the WebGL 3D world space using CSS 3D matrices calculated on the fly.
* **Bottlenecks**:
  * **Text Aliasing / Blur**: Transforming HTML elements inside the canvas frequently leads to blurry text on high-DPI displays or when scaled far from the camera.
  * **Render Overhead**: R3F has to recalculate the bounding box and 3D matrix projection for every single HTML element on every frame.
  * **Responsive Layouts**: Designing complex layouts (grids, flex containers, text wrapping, dynamic height) inside a WebGL transform wrapper is extremely difficult and breaks normal CSS responsiveness.
  * **Event Bubble & Pointer Interactivity**: Click events on `<a href>` or buttons inside `<Html transform>` can be unreliable because pointer events are intercepted by R3F's raycaster.

---

## 2. Scroll Mechanics: Zero-Scroll and Event Interception

To achieve the seamless visual flow of `oryzo.ai`, the native-scrolling overlay should be replaced with a **Zero-Scroll (Virtual Scroll)** model. The screen is locked at `100vh` with no scrollbars, and we capture pointer/wheel inputs to increment a custom scroll index.

### A. Capturing Event Listeners
A hook should listen to `wheel`, `touch` (mobile), and `keydown` (keyboard accessibility) events.
* **Mouse Wheels / Trackpads**: Read `e.deltaY` to update target scroll. We must call `e.preventDefault()` to avoid any default browser scroll or page-bounce actions.
* **Mobile Touch**: Track `touchmove` delta Y compared to `touchstart` client Y.
* **Keyboards**: Support arrow keys (`ArrowUp`/`ArrowDown`), Page Up/Down, and Space.

### B. Virtual Scroll React Hook Blueprint
Below is the proposed design for `useVirtualScroll.js`, which exports the normalized `targetScroll`:

```javascript
import { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

export function useVirtualScroll({ totalSections, sensitivity = 0.002, touchSensitivity = 0.005 }) {
  const targetScroll = useMotionValue(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // Stop default scroll/overscroll bounce
      
      const current = targetScroll.get();
      // Increments or decrements targetScroll between [0, totalSections - 1]
      const next = Math.max(0, Math.min(totalSections - 1, current + e.deltaY * sensitivity));
      targetScroll.set(next);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      // Prevent screen pulling/refreshing on mobile
      e.preventDefault();
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;
      const current = targetScroll.get();
      const next = Math.max(0, Math.min(totalSections - 1, current + deltaY * touchSensitivity));
      
      targetScroll.set(next);
      touchStartY.current = currentY; // Update base point
    };

    const handleKeyDown = (e) => {
      const current = targetScroll.get();
      let increment = 0;
      
      if (e.key === 'ArrowDown' || e.key === ' ') {
        increment = 0.5;
      } else if (e.key === 'ArrowUp') {
        increment = -0.5;
      } else if (e.key === 'PageDown') {
        increment = 1.0;
      } else if (e.key === 'PageUp') {
        increment = -1.0;
      }
      
      if (increment !== 0) {
        e.preventDefault();
        const next = Math.max(0, Math.min(totalSections - 1, current + increment));
        targetScroll.set(next);
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
  }, [totalSections, sensitivity, touchSensitivity, targetScroll]);

  return targetScroll;
}
```

---

## 3. Smooth Interpolation (Damping and Lerp)

To map the abrupt increments of `targetScroll` to a silky smooth transition, we must interpolate this value before applying it to the WebGL Camera and DOM elements.

### A. Damping Options

#### Option 1: Frame-Rate Independent Lerp (Custom useFrame)
In R3F's `useFrame` loop, we can manually lerp the scroll using delta time:
$$S_{current} = S_{current} + (S_{target} - S_{current}) \times (1 - e^{-\lambda \times \Delta t})$$
* **Pros**: Highly customizable per element, low overhead.
* **Cons**: Harder to share the exact same interpolated value out of the WebGL canvas back to the DOM without triggering React re-renders.

#### Option 2: Framer Motion `useSpring` (Recommended)
By feeding the `targetScroll` MotionValue into Framer Motion's `useSpring`, we obtain `smoothScroll`—a high-performance, spring-damped MotionValue.
```javascript
import { useSpring } from 'framer-motion';

const targetScroll = useVirtualScroll({ totalSections: 7 });
const smoothScroll = useSpring(targetScroll, {
  stiffness: 45,    // Controls spring tightness
  damping: 20,      // Controls friction (reduces overshoot)
  restDelta: 0.001  // Stop calculation once delta is tiny
});
```
* **Pros**:
  * Unified driver: The same `smoothScroll` is passed to both the WebGL canvas components and the DOM overlays.
  * Springs feel more natural than simple exponential lerps (they mimic physical mass, giving organic easing).
  * Framer Motion handles the animation loop on the main thread (for DOM elements) using CSS optimizations.

### B. Driving Camera Position & Orientation
In the R3F `<Canvas>` scene, we read the `smoothScroll` MotionValue inside a `useFrame` loop using `.get()`. This avoids React re-renders of the 3D structure.

* **Z-Axis (Flight)**: Map `smoothScroll` to depth. If each section has a spacing of $25$ units, the camera's Z position is:
  $$Z = S_{smooth} \times (-25) + 5$$
* **X/Y Parallax**: Incorporate the user mouse position. As the mouse moves, slightly offset the camera X/Y to give a 3D perspective shift.
* **Rotation (Tilt)**: Apply a subtle roll (Z-rotation) and yaw (Y-rotation) based on mouse and scroll momentum. When scrolling fast, tilt the camera slightly down/up.

#### Camera Controller Implementation:
```javascript
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function CameraController({ smoothScroll, spacing = 25 }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    // Get current smooth scroll value (e.g. 0.0 to 6.0)
    const scrollVal = smoothScroll.get();
    
    // 1. Z-Position (Flight through tunnel)
    const targetZ = scrollVal * -spacing + 5; // offset by 5 to view the first section
    
    // Apply camera position
    groupRef.current.position.z = targetZ;

    // 2. Mouse Parallax (X/Y movement)
    const targetX = state.pointer.x * 0.8;
    const targetY = state.pointer.y * 0.6;
    
    // Lerp camera X/Y for responsiveness
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;

    // 3. Dynamic Rotation / Tilt
    // Y-axis rotation looks at the X offset, Z-axis rotation rolls slightly during movement
    groupRef.current.rotation.y = -groupRef.current.position.x * 0.15;
    groupRef.current.rotation.x = groupRef.current.position.y * 0.15;
  });

  return (
    <group ref={groupRef}>
      <perspectiveCamera makeDefault fov={60} far={1000} near={0.1} />
    </group>
  );
}
```

---

## 4. DOM Overlay & Section Transitions with Spatial Depth

To bypass WebGL text limitations, we render section layouts in HTML, placed in a `div` absolutely positioned above the Canvas. 

```jsx
<div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
  <Canvas>
    <Scene smoothScroll={smoothScroll} />
  </Canvas>
  
  <DOMOverlay smoothScroll={smoothScroll} />
</div>
```

### A. Perspective CSS Container
To enable spatial depth in the DOM, the parent overlay container must have a `perspective` value defined in CSS:
```css
.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let canvas receive pointer events unless active card is clicked */
  perspective: 1200px;
  transform-style: preserve-3d;
}
```

### B. Section Progress Tracking
For each Section $i$, we define its progress relative to `smoothScroll` ($S$):
$$d_i = S - i$$
* If $d_i = 0$: Section $i$ is centered and active.
* If $d_i > 0$: Section has scrolled past (user is moving forward).
* If $d_i < 0$: Section is in the future (yet to be reached).

### C. Mapping Motion Values
Using Framer Motion's `useTransform`, we map the relative distance $d_i$ to CSS variables. 

```javascript
import { motion, useTransform } from 'framer-motion';

function SectionWrapper({ scrollSmooth, index, children }) {
  // Map range of [index - 1, index, index + 1] to specific style ranges
  
  // 1. Fading: Fade out quickly when moving out of view
  const opacity = useTransform(
    scrollSmooth,
    [index - 0.7, index - 0.25, index, index + 0.25, index + 0.7],
    [0, 1, 1, 1, 0]
  );

  // 2. Spatial Depth (translateZ): 
  // - Negative translateZ pushes it into the background (future)
  // - Positive translateZ pulls it past the camera (past)
  const z = useTransform(
    scrollSmooth,
    [index - 1, index, index + 1],
    [-400, 0, 800] // Pulls past the camera at index + 1
  );

  // 3. Subtle scaling
  const scale = useTransform(
    scrollSmooth,
    [index - 1, index, index + 1],
    [0.75, 1, 1.25]
  );

  // 4. Pointer Events: Only activate clicks/hover when this section is current
  const [active, setActive] = useState(false);
  
  useEffect(() => {
    return scrollSmooth.on("change", (latest) => {
      const isActive = Math.abs(latest - index) < 0.3;
      setActive(isActive);
    });
  }, [scrollSmooth, index]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        scale,
        z, // maps to translateZ
        transformStyle: 'preserve-3d',
        pointerEvents: active ? 'auto' : 'none' // Crucial: enables buttons on active slide
      }}
    >
      {children}
    </motion.div>
  );
}
```

### D. Visual Aesthetics (Oryzo Parity)
* **Depth Blur**: Apply CSS backdrop-filters. As sections recede, they can gain blur:
  ```javascript
  const blur = useTransform(
    scrollSmooth,
    [index - 1, index, index + 0.5],
    ["blur(10px)", "blur(0px)", "blur(15px)"]
  );
  ```
* **Color Temperature / Fading**: Make background elements shift colors or dim.
* **Layout Isolation**: In `index.css`, style `.glass` cards to utilize flex layouts, ensuring content scales cleanly when `scale` or `translateZ` changes.

---

## 5. Implementation Roadmap for the Implementer

To replace the existing Drei `ScrollControls` with this system, the Implementer should follow these sequential steps:

1. **Setup Shared State**:
   * Modify `App.jsx` to create the `scrollTarget` and `smoothScroll` variables.
   * Add a wrapper layout containing the R3F `<Canvas>` and the DOM `<div className="overlay-container">`.

2. **Integrate Event Listeners**:
   * Create `src/hooks/useVirtualScroll.js` using the event interceptor blueprint. Hook it to `scrollTarget` in `App.jsx`.

3. **Rebuild Scene.jsx**:
   * Remove `<ScrollControls>` and `<Scroll>` wrappers completely.
   * Inject `smoothScroll` into `<Scene scrollSmooth={smoothScroll} />`.
   * Bind the `CameraController` to modify the camera position and rotation inside `useFrame` using `scrollSmooth.get()`.
   * Place the 3D meshes (particles, floating shapes, torus knot) at fixed Z coordinates corresponding to their sections (e.g. `HERO = 0`, `STATS = -25`, `SERVICES = -50`).

4. **Construct DOM Overlay**:
   * Create `src/components/DOMOverlay.jsx`.
   * Create the `SectionWrapper` component using CSS `perspective` and Framer Motion transforms.
   * Move the HTML contents of the sections (Hero content, Stats cards, Service grids, Work list) from their R3F `<Html>` tags in `Scene.jsx` into standard React DOM components mounted inside `DOMOverlay.jsx`.

5. **Polish and Audit**:
   * Add active state hooks to toggle `pointer-events: auto` for active forms/links.
   * Adjust stiffness and damping on the spring configurations to ensure scrolling feels prompt yet organic.
