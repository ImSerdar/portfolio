# Handoff Report: reviewer_m2_m3_3

## 1. Observation
- **CentralMesh.jsx** located at `C:\Serdar\portfolio\src\components\CentralMesh.jsx` implements the 3D models with responsive layout. In mobile mode (`isMobile = true` inside `useFrame` via `window.innerWidth <= 768`), the positions returned from `getSectionProperties` are:
  - Section 5: `THREE.Vector3(0, 2.2, -5.0)`
  - Section 6: `THREE.Vector3(0, -2.2, -2.0)`
  - All other sections: `THREE.Vector3(0, -2.0, -3.0)`
- **DOMOverlay.jsx** located at `C:\Serdar\portfolio\src\components\DOMOverlay.jsx` aligns section wrappers to left, right, and center:
  - Hero (Index 0): `align="left"`, Stats (Index 1): `align="right"`, etc.
- **index.css** located at `C:\Serdar\portfolio\src\index.css` overrides the `justify-content` and `padding` rules of `.section-wrapper` under `@media (max-width: 768px)` with `justify-content: center !important` and `padding: 1.5rem !important`.
- **Lint Errors**: Running `npm run lint` results in a total of 22 errors. The lint errors include:
  ```
  C:\Serdar\portfolio\src\components\CentralMesh.jsx
    429:25  error  Error: Cannot access refs during render
    434:23  error  Error: Cannot access refs during render
    ...
  C:\Serdar\portfolio\src\hooks\useVirtualScroll.js
    20:5   error  Error: This value cannot be modified
    21:5   error  Error: This value cannot be modified
  ```
- **Vector Allocation**: `new THREE.Vector3()` is instantiated 4 times per frame inside the `useFrame` hook in `CentralMesh.jsx`.
- **Traversals**: `ref.current.traverse` is called on all 7 mesh groups and both wireframe groups every frame, regardless of their opacity.
- **Mesh Collision**: Group translation is performed on the parent group `groupRef.current` using `groupRef.current.position.copy(targetPos)`. Child elements have no separate positions, meaning they overlap at `targetPos` during transitions.

## 2. Logic Chain
- **Layout Alignment**:
  - The desktop layout aligns left-oriented text (in `DOMOverlay.jsx`) with right-oriented 3D meshes (in `CentralMesh.jsx` desktop positions), and vice-versa, which creates a visually balanced layout.
  - On mobile, the css overrides flex alignments with `justify-content: center !important`, which aligns text centered. At the same time, `CentralMesh.jsx` returns centered (`x = 0`) positions that are pushed back (`z = -3.0` to `-5.0`) with low opacity (`0.05` to `0.18`).
  - Therefore, the mobile layout retreats to the background to avoid text overlap.
- **Performance & Math**:
  - The transition math correctly shifts and scales elements during scrolls (e.g. `spotlightBlend` via `Math.sin(alpha * Math.PI)`).
  - However, allocating four `Vector3` objects inside `useFrame` per frame introduces garbage collection memory pressure (e.g. 240+ objects/sec), which can cause visual jank/drops.
  - Additionally, running `traverse` recursively on 9 scene nodes on every frame (even when their opacity is 0) causes redundant CPU/render cycles.
  - Positioning the single parent group at `targetPos` causes all child objects to overlap at the exact same world coordinate `targetPos` during transition.
- **React compilation**:
  - Direct array references of `useRef()` inside JSX render functions (`ref={meshRefs[i]}`) violate the `react-hooks/refs` rule in React 19.
  - Modifying `scrollTarget.set` directly inside `useVirtualScroll.js` violates the `react-hooks/immutability` rule.
  - Therefore, the code fails the compilation check (`npm run lint`), blocking build pipelines.

## 3. Caveats
- No profiling was performed on actual asset loading times of the `.gltf` assets due to network restrictions.

## 4. Conclusion
The layout balances correctly on desktop viewports and retreats into the deep background on mobile viewports. The transition calculations are mathematically sound. However, the build is currently broken due to React 19 hook and immutability linting errors. Furthermore, the 3D rendering loop contains significant performance bottlenecks (unnecessary garbage collection from vector allocations, redundant scene graph traversals, and mesh overlap/clipping during transitions) that must be addressed. A verdict of `REQUEST_CHANGES` is issued.

## 5. Verification Method
- **Lint Verification**: Run `powershell -ExecutionPolicy Bypass -Command "npm run lint"` or `cmd /c npm run lint` from the project root `C:\Serdar\portfolio`. The current code will return 22 errors.
- **Build Verification**: Run `cmd /c npm run build`. The build compiles successfully but lint checks must be passed.
- **E2E verification**: Run `cmd /c node test.js`. The page loads without browser console errors.
