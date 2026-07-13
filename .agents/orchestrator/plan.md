# Plan - Interactive IT-Themed 3D Models

This plan outlines the steps required to replace the portfolio's primitive geometries with custom, interactive, and high-quality IT/engineering 3D models.

## Phase 1: Model Asset Generation Script
1. **Design `generate-models.js` script**: Write a Node.js utility script that uses `three` and `three/examples/jsm/exporters/GLTFExporter.js` to create Three.js mesh groups and export them as GLTF files:
   - **Server Rack**: A cuboid enclosure with slots, multiple inset blades, rack-mount ears, and small emissive indicators (representing status LEDs).
   - **Microchip**: A thin PCB substrate with a central metallic die/heat spreader, surrounding circuit paths (traces), and perimeter connection pins.
   - **Code Brackets**: Extruded `< >` or `{ }` shapes representing programming/code brackets.
2. **Execute generation**: Run the script with Node to output `public/server.gltf`, `public/microchip.gltf`, and `public/brackets.gltf`.
3. **Verify assets**: Verify that the files are valid GLTF JSONs in the `public` directory.

## Phase 2: R3F Component Integration
1. **Load Models**: Update `src/components/CentralMesh.jsx` to load the `.gltf` files using `@react-three/drei`'s `useGLTF`.
2. **Map Models to Sections**: Assign the models to the 7 scroll sections:
   - Section 0 (Hero): Code Brackets
   - Section 1 (Stats): Microchip (with wireframe)
   - Section 2 (Services): Server Rack (metallic)
   - Section 3 (Process): Code Brackets (yellow tint)
   - Section 4 (Work): Microchip (heavy glass)
   - Section 5 (Showcase): Server Rack (dark blue glass)
   - Section 6 (Contact): Server Rack (purple glowing emissive)
3. **Handle Material Overrides**: Keep the premium glassmorphism, metallic, and emissive material settings from the original design by traversing the loaded GLTF models and applying custom materials or cloning their meshes.

## Phase 3: Interactive Behaviors
1. **Hover State**: Add `onPointerOver` and `onPointerOut` to each section mesh group.
2. **Click State**: Add `onClick` handlers to trigger temporary animation changes or toggle states.
3. **Smooth Interaction Animation**: Use `useFrame` or Framer Motion properties to:
   - Scale up (e.g., 1.25x) smoothly when hovered.
   - Increase rotation speed (spin faster) when hovered or clicked.
   - Boost material emissive intensity (glow) or clearcoat on hover.
   - Reset smoothly when the cursor leaves.

## Phase 4: Build & Verification
1. **Compile Check**: Run `npm run build` using a Worker subagent to ensure compilation is clean.
2. **Integration Test**: Run `node test.js` using a Worker to ensure the dev server starts and Vite compiles correctly, and the browser console has no 404 errors for the loaded assets.
3. **Forensic Audit**: Run `teamwork_preview_auditor` to ensure code integrity and check for cheating.
