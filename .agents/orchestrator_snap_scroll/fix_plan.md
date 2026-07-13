# Bugfix & Performance Optimization Plan

Based on the detailed quality and adversarial review reports, we will perform the following bugfixes and optimizations:

## 1. Fix React 19 Lint / Hook Violations (`react-hooks/refs` and `react-hooks/immutability`)
- **Refs in `CentralMesh.jsx`**: Do not declare an array of `useRef()` items at the top-level and index them during render. Instead, use a single `const meshRefs = useRef([]);` array and assign them dynamically via callback refs on the `<group>` elements:
  ```jsx
  <group ref={el => { meshRefs.current[index] = el; }} ...>
  ```
- **Immutability in `useVirtualScroll.js`**: Remove the code that overrides `scrollTarget.set = ...`. The motion value object must remain immutable. Handle the scroll lock status using event listener controls instead.

## 2. Cooldown Lock & Gesture Interception Fixes (`useVirtualScroll.js`)
- **Event Listener Scroll Locking**: Perform lock checks strictly inside the event handlers (`handleWheel`, `handleTouchMove`, `handleKeyDown`). Clicks from Navbar and dot indicators bypass the cooldown lock.
- **Predominant Vertical Swipes on Mobile**: In `handleTouchMove`, check horizontal displacement (`deltaX`). If horizontal sweep is larger than vertical sweep (`Math.abs(deltaX) > Math.abs(deltaY)`), do not trigger snap transitions and do not call `e.preventDefault()`, allowing the horizontal swipe carousels in Services/Work/Process to swipe normally.
- **Scrollable Containers Support**: Before intercepting `wheel` or `touchmove` events:
  - Traverse upwards from `e.target` to see if there is an ancestor with class `.section-content-container` (or `overflow-y: auto`).
  - If a scrollable ancestor is found:
    - Check if it can scroll in the direction of the scroll input.
    - If it can scroll (e.g. `scrollTop > 0` when scrolling up, or `scrollHeight - scrollTop > clientHeight + 1` when scrolling down), allow propagation and default behavior (do not call `e.preventDefault()` or trigger snaps).
- **Safety Checks**: Add `if (!e.touches || e.touches.length === 0) return;` at the top of `handleTouchMove`.

## 3. WebGL Visual & Performance Optimizations (`CentralMesh.jsx`)
- **Module-Level / Pre-allocated Vectors**: Declare module-level `THREE.Vector3` variables (e.g., `const tempBasePos = new THREE.Vector3();`, `const tempSpotlightPos = new THREE.Vector3();`, etc.) outside the component to avoid instantiating new vectors on every frame inside `useFrame`.
- **Mesh Clipping Avoidance (Individual Position Interpolation)**: Do not position the parent `<group ref={groupRef}>`. Keep the parent group at `(0, 0, 0)` and apply the position, rotation, and scale interpolations to each individual model's local group in `meshRefs.current[index]` within `useFrame`. This prevents all models from rendering at the exact same coordinates during cross-fades and eliminates Z-fighting.
- **Traversal Performance**: Inside `useFrame`, only run `traverse()` on meshes that have a visible opacity (e.g., `targetOpacity > 0.01`). Avoid traversing invisible meshes.
