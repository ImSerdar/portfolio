# Project: Portfolio Oryzo AI Replicant
# Scope: Full Architecture Replacement + Interactive IT-Themed 3D Models

## Architecture
- **Virtual Zero-Scroll Engine**: Window event listeners capture wheel, touch, and keyboard events, updating a normalized scroll index `S` in the range `[0, 6]` (for 7 sections). This bypasses Drei's `ScrollControls` to prevent native mobile scroll resize jank.
- **Spring-Damped Interpolation**: A Framer Motion `useSpring` maps raw scroll index targets to a smoothed motion value `smoothScroll` with organic physics.
- **Central Morphing WebGL Mesh**: A single 3D group rendered at the viewport center containing loaded IT/engineering 3D models (servers, microchips, brackets, etc.) that scale, rotate, cross-fade opacity, and translate (between right, left, and center) based on `smoothScroll`.
- **Refractive Glassmorphic Materials**: WebGL materials configured with high transmission, clearcoat, and index of refraction, utilizing an environment lighting map for realistic refraction.
- **Decoupled DOM Overlay with Spatial CSS 3D**: Section cards rendered as standard HTML overlays positioned absolutely on top of the Canvas. Framer Motion maps `smoothScroll` to `opacity`, `scale`, and `translateZ` relative to a container with `perspective: 1200px` to simulate spatial depth.
- **2D-to-3D Bridging Navigation**: Standard fixed navbar and side dot indicators update active sections based on current scroll value, and clicking links directly updates the scroll index target.
- **Full Data Integration**: 100% preservation of all fields in `src/data.js` including Hero badge/CTAs, all 6 projects, Services icons, CTA banner, and Contact metadata.
- **IT-Themed 3D Model Generation**: Headless Node.js script using Three.js and `GLTFExporter` to construct highly detailed 3D assets (Server rack, Microchip, Code bracket) and write them to the `public/` directory as `.gltf` files, ensuring complete compliance with the CODE_ONLY network restriction.
- **Interactive Event-Driven Behaviors**: `@react-three/fiber` event handlers (`onPointerOver`, `onPointerOut`, `onClick`) added to models to drive dynamic visual changes, such as local scale springs, increased rotation velocity, and material emission (glow) reactions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Research & Planning | Define architecture, cross-morph specifications, and zero-scroll hooks. | None | DONE |
| 2 | Core Layout & Scroll Infrastructure | Implement `useVirtualScroll.js` hook, absolute overlay layout, and 2D nav bridging in `App.jsx`. | M1 | DONE |
| 3 | Morphing Central Mesh & Lights | Implement `Scene.jsx` with light rig, environment map, floating sparkles, and the cross-morphing central mesh translating based on scroll. | M2 | DONE |
| 4 | Content & CSS Overlays | Build `DOMOverlay.jsx` containing all 7 sections mapped to `src/data.js` and animated with CSS 3D perspective. Style via `index.css`. | M3 | DONE |
| 5 | Verification & Forensic Audit | Run compilation, verify zero WebGL/React errors in browser, and perform Forensic Audit check. | M4 | DONE |
| 6 | IT Model Asset Generation | Write and run a node script using Three.js and `GLTFExporter` to generate and save server, chip, and bracket `.gltf` files in the `public/` directory. | M5 | DONE |
| 7 | Model Integration & Interactivity | Replace primitive shapes in `CentralMesh.jsx` with loaded assets using `@react-three/drei`'s `useGLTF`. Add hover/click event handlers for scale, spin, and glow effects. | M6 | DONE |
| 8 | Final Verification & Audit | Verify build, run `test.js` integrations, check console for 404/WebGL errors, and perform a Forensic Integrity Audit. | M7 | DONE |

## Interface Contracts
### App.jsx ↔ Scene.jsx
- `App.jsx` handles state, hooks for scroll index, rendering the 2D Navbar, side dot indicators, DOM overlay, and outer container layout.
- `Scene.jsx` exposes the 3D visual canvas containing `CentralMesh`, sparkles, lighting, and environments, driven by the `smoothScroll` prop.
