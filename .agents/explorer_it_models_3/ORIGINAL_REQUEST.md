## 2026-07-10T22:17:26Z
Analyze `src/components/CentralMesh.jsx`. Recommend how to add R3F pointer events (`onPointerOver`, `onPointerOut`, `onClick`) to the models such that they react to the user cursor:
1. Scale reaction: scale up smoothly on hover (e.g., 1.25x scale target) and return to baseline scale.
2. Spin reaction: spin faster when hovered or clicked (using delta and velocity logic in `useFrame`).
3. Glow/Emissive reaction: boost emissive intensity or change color on hover.
Provide a clean code proposal using state variables, references, and lerping in `useFrame` to achieve smooth animations without lagging. Write your report in C:\Serdar\portfolio\.agents\explorer_it_models_3\handoff.md.
