# Handoff Report — Explorer 2 (Animation & Scroll Mechanics)

This report summarizes observations, logic, conclusions, and verification methods for updating the scroll and animation mechanics of the portfolio to match the seamlessness of `oryzo.ai`.

---

## 1. Observation

Direct observations made in the portfolio codebase:

* **App Structure & Zero-Scroll Setup (`src/App.jsx:7`)**:
  ```javascript
  <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
  ```
  And `src/index.css:31`:
  ```css
  overflow: hidden;
  ```
  *Analysis*: The window layout successfully prevents default native document scrolling by keeping `overflow: hidden` on html/body and the App container.

* **Scroll Interception Mechanism (`src/components/Scene.jsx:244`)**:
  ```javascript
  <ScrollControls pages={15} damping={0.1}>
  ```
  *Analysis*: Drei's `<ScrollControls>` is used, which creates a scrollable virtual overlay. On mobile devices, this scrollable container conflicts with the browser viewports (e.g., resizing elements, address bar jitter).

* **Damping and Camera Movement (`src/components/Scene.jsx:22-26`)**:
  ```javascript
  useFrame((state, delta) => {
    if (cameraGroup.current) {
      const targetZ = scroll.offset * SCENE_DEPTHS.END;
      cameraGroup.current.position.z += (targetZ - cameraGroup.current.position.z) * 0.05;
    }
  });
  ```
  *Analysis*: `CameraController` performs a manual linear interpolation (`* 0.05`) in `useFrame`, which acts on top of the already damped `scroll.offset` (from `<ScrollControls damping={0.1}>`). This results in double-damping (laggy inputs).

* **HTML Elements in 3D WebGL Space (`src/components/Scene.jsx:50-54`)**:
  ```javascript
  <Html position={[-2, -1, 0]} transform distanceFactor={5}>
    <div style={{ color: '#9CA3AF', width: '400px', fontSize: '18px', fontFamily: 'Inter' }}>
      {PORTFOLIO_DATA.hero.tagline}
    </div>
  </Html>
  ```
  *Analysis*: The text elements are mapped into R3F via `<Html transform>`. This causes aliasing/blurry rendering on dynamic scaling, and limits responsive CSS styling.

* **Dependencies (`package.json:13-16`)**:
  ```json
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.6.1",
  "framer-motion": "^12.42.2",
  ```
  *Analysis*: We have access to React Three Fiber, Drei, and Framer Motion out-of-the-box.

---

## 2. Logic Chain

1. **Scroll Jank Elimination**: Because native scrollable containers on mobile cause browser address bars to toggle and layout shifts to occur (causing WebGL rebuild lag), we need a pure zero-scroll system. 
2. **Event Interception**: Since we want zero-scroll, we must intercept pointer/wheel events (`wheel`, `touchmove`, `keydown`) using window event listeners, disabling default behavior, and writing delta offsets to a custom state.
3. **Synchronized Animation**: By storing the custom scroll state in a shared Framer Motion `MotionValue` (`scrollTarget`) and damping it with a `useSpring` MotionValue (`scrollSmooth`), we can drive both the WebGL camera (inside `useFrame`) and DOM layers concurrently. This avoids rendering latency or lag.
4. **Text Sharpness & Responsiveness**: To avoid WebGL text blurriness and projection performance overhead from `<Html transform>`, HTML layouts should be decoupled into a standard 2D/3D overlay div placed absolute-positioned *over* the WebGL Canvas.
5. **Spatial Depth in DOM**: By using a perspectived CSS parent container (`perspective: 1200px`) and mapping the `scrollSmooth` offset to each overlay section's `translate3d(0, 0, z)`, `scale`, and `opacity` properties using Framer Motion's `useTransform`, we can simulate spatial depth and camera fly-through transitions entirely in the DOM.

---

## 3. Caveats

* **Accessibility (a11y)**: Decoupling sections into an absolute overlay requires careful management of keyboard focus and tab navigation, as well as hiding inactive sections from screen readers (e.g. `aria-hidden={!isActive}`).
* **Mouse Sensitivity**: Wheel speed varies heavily between a precision mouse wheel (clicks) and a trackpad (continuous scrolling). Sensitivity multipliers (`sensitivity = 0.002`) should be fine-tuned or normalized.
* **Canvas Raycasting**: Click-through behavior on the overlay container requires `pointer-events: none` on the container, but active content nodes must have `pointer-events: auto` to allow link clicks.

---

## 4. Conclusion

The portfolio should adopt a **Decoupled DOM Overlay + Zero-Scroll Canvas** architecture:
* **Scroll Mechanics**: Implement a custom virtual-scroll hook (`useVirtualScroll.js`) to capture and normalize wheel, touch, and key events, feeding a single target scroll value.
* **Interpolation**: Use Framer Motion's `useSpring` on a shared scroll state to smoothly drive both the 3D camera Z-position and the DOM overlay animation.
* **Section Transitions**: Render all HTML sections in a standard React absolute overlay overlaying the Canvas. Transform each section in 3D using CSS transforms based on its distance from the active scroll index.

---

## 5. Verification Method

Once implemented, the setup can be verified by:
1. **Scrolling Performance (DevTools Audit)**: Check the Frame Rate and paint times. The decoupled DOM overlay will run at 60fps/120fps with no reflow or WebGL texture rebuild warnings.
2. **Resize/Mobile Check**: Load on mobile and verify that scrolling does not resize the browser address bar or trigger viewport layout updates.
3. **Focus Verification**: Check console errors. Run `npm run build` to verify there are no compilation or typescript/react bundling issues.
