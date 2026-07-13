# Scope: Portfolio Layout and Scroll Animations Redesign

## Architecture
- `src/App.jsx` and `src/components/Scene.jsx` coordinate 3D scene elements.
- `src/components/DOMOverlay.jsx` / `src/pages/Home.jsx` contain HTML sections (Hero, Stats, Services, Process, Work, Showcase, Contact).
- Scrolling logic is managed by custom hooks (e.g. `src/hooks/useVirtualScroll.js`) or CSS/JS layout.
- 3D models (from `public/` e.g. `server.gltf`, `brackets.gltf`, `microchip.gltf`) react to scroll snaps by animating out of the way of the HTML content.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Exploration | Analyze current layout, hooks, styles, and 3D scenes | None | DONE |
| M2 | Cinematic Snap Scrolling | Implement firm snap-scrolling layout between the 7 sections; prevent free-scrolling | M1 | DONE |
| M3 | Content Spotlight Interactions | Redesign 3D objects to animate out of the way when snapping to a section | M1, M2 | DONE |
| M4 | Verification & Forensic Audit | Run builds, tests, liveness check, and forensic audit to ensure clean implementation | M1, M2, M3 | DONE |

## Interface Contracts
- The scrolling hook / controller must expose section changes (index/name) to both the DOM layout and the 3D scene.
- The 3D scene must subscribe to section changes and animate/move the 3D models accordingly.
