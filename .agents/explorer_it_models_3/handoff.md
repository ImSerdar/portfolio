# Handoff Report: Adding R3F Pointer Events to CentralMesh Models

## Summary
This report analyzes `src/components/CentralMesh.jsx` and provides a clean, highly performant recommendation for adding React Three Fiber (R3F) pointer events (`onPointerEnter`, `onPointerLeave`, `onClick`) to the central 3D models. The proposal uses mutable React `useRef` hooks and frame-rate independent lerping in `useFrame` to achieve smooth animations for scaling, spinning, and emissive glowing without triggering React re-renders or causing performance degradation.

---

## 1. Observation
In `src/components/CentralMesh.jsx`, the models are rendered within a parent `<group ref={groupRef}>` and transitioned dynamically via scroll position:
- **Baseline Rotation (Lines 92–95)**:
  ```javascript
  // Idle Rotation + Scroll Momentum Spin
  const spinSpeed = 0.5 + Math.abs(scrollSmooth.getVelocity ? scrollSmooth.getVelocity() * 0.5 : (S - currentSection) * 2.0);
  groupRef.current.rotation.y += delta * 0.25 * spinSpeed;
  groupRef.current.rotation.x += delta * 0.12 * spinSpeed;
  ```
- **Baseline Scale (Lines 78–84)**:
  ```javascript
  // Interpolate Scale
  const targetScaleVal = THREE.MathUtils.lerp(
    SCALES[currentSection],
    SCALES[nextSection],
    easedAlpha
  );
  groupRef.current.scale.setScalar(targetScaleVal);
  ```
- **Cross-Fade & Visibility (Lines 105–119)**:
  Individual meshes are cross-faded and hidden when their opacity drops below `0.01` to save draw calls and prevent rendering order issues:
  ```javascript
  meshRefs.forEach((ref, index) => {
    if (ref.current) {
      const diff = Math.abs(S - index);
      const opacity = Math.max(0, 1 - diff);
      
      ref.current.visible = opacity > 0.01;
      // ...
    }
  });
  ```

---

## 2. Logic Chain

To implement the cursor interactions smoothly and efficiently, we must adhere to R3F performance best practices:

1. **Avoid React State for Animation Loops**:
   Updating React state (e.g. `useState`) on hover or click forces React to re-render the entire component (re-running the function, recreating meshes/materials, and possibly recompiling shaders). This causes noticeable frame drops (micro-stuttering) in R3F.
   * **Solution**: Use `useRef` for tracking interactive states (`hoveredRef`, `hoverScaleRef`, `hoverSpinRef`, `clickSpinVelocityRef`, `hoverIntensityRef`) and mutate/lerp them directly inside the `useFrame` animation loop.

2. **Pointer Cursor Handling**:
   To change the cursor to `pointer` when hovering over the model, modify `document.body.style.cursor` directly inside the pointer event handlers. This avoids triggering a React state-driven re-render.

3. **Smooth Lerping in `useFrame`**:
   Use `THREE.MathUtils.lerp` with `delta` to smoothly transition all interactive values. This ensures that the animation is frame-rate independent.
   * **Scale**: Lerp a scale multiplier (`hoverScaleRef`) between `1.0` and `1.25`. Apply it to the active section's scale: `groupRef.current.scale.setScalar(targetScaleVal * hoverScaleRef.current)`.
   * **Spin**:
     - Hover: Smoothly lerp a spin boost (`hoverSpinRef`) to `1.0` when hovered.
     - Click: Increment `clickSpinVelocityRef` by `6.0` on click, then decay it exponentially towards `0` using `lerp(clickSpinVelocityRef.current, 0, delta * 4)`.
     - Sum these values into the total `spinSpeed`.
   * **Glow/Emissive**:
     - Define custom `emissive` colors for each material in the JSX, starting with `emissiveIntensity={0}` (except the Contact model which has a baseline of `2.5`).
     - Lerp a `hoverIntensityRef` between `0` and `1`.
     - Update the active mesh's material `emissiveIntensity` in `useFrame`.
     - Boost wireframe opacities (for Stats and Contact) when hovered.

4. **Preventing Raycast Interference**:
   The wireframes (`wireframeRefs[0]`, `wireframeRefs[1]`) are slightly larger than the solid meshes. To prevent them from blocking clicks or causing hovering flicker, add `raycast={null}` to their JSX elements. This tells R3F's raycaster to ignore them, ensuring mouse interactions hit only the solid meshes.

---

## 3. Caveats
- **Raycasting Overhead**: Raycasting against geometries (especially complex ones like `torusKnotGeometry` with 128 radial segments) can consume CPU cycles. However, since only one mesh is active (`visible = true`) at any given scroll point, the raycaster only tests that active mesh, keeping overhead minimal.
- **Global Cursor Override**: Bypassing React state to change `document.body.style.cursor` is fast, but if other components in the application also modify the body cursor asynchronously, they might conflict. Since this is a single-page portfolio, this approach is clean and robust.

---

## 4. Conclusion & Code Proposal

Below is the complete, recommended implementation for `src/components/CentralMesh.jsx`:

```jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const POSITIONS = [
  new THREE.Vector3(1.8, 0, 0),      // Hero
  new THREE.Vector3(-2.0, 0.4, 0),   // Stats
  new THREE.Vector3(2.2, -0.2, 0),   // Services
  new THREE.Vector3(-2.2, -0.1, 0),  // Process
  new THREE.Vector3(2.0, 0.2, 0),    // Work
  new THREE.Vector3(0, 1.2, -2.0),   // Showcase
  new THREE.Vector3(0, -0.3, 0)      // Contact
];

const SCALES = [1.6, 1.2, 1.4, 1.3, 1.5, 2.8, 1.5];

export default function CentralMesh({ scrollSmooth }) {
  const groupRef = useRef();

  // Shader refs to update uTime for deforming blobs
  const shadersRef = useRef([]);

  const addShaderRef = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `
      uniform float uTime;
      ${shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float displacement = sin(position.x * 2.5 + uTime * 1.2) * 
                             cos(position.y * 2.5 + uTime * 1.2) * 
                             sin(position.z * 2.5 + uTime * 1.2) * 0.15;
        transformed += normal * displacement;
        `
      )}
    `;
    shadersRef.current.push(shader);
  };

  // Refs for meshes to control opacity and visibility
  const meshRefs = [
    useRef(), // Hero (0)
    useRef(), // Stats (1)
    useRef(), // Services (2)
    useRef(), // Process (3)
    useRef(), // Work (4)
    useRef(), // Showcase (5)
    useRef()  // Contact (6)
  ];

  const wireframeRefs = [
    useRef(), // Stats Wireframe (1)
    useRef()  // Contact Wireframe (6)
  ];

  // --- Interaction Refs ---
  const hoveredRef = useRef(false);
  const hoverScaleRef = useRef(1.0);
  const hoverSpinRef = useRef(0.0);
  const clickSpinVelocityRef = useRef(0.0);
  const hoverIntensityRef = useRef(0.0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const S = scrollSmooth.get(); // Float from 0.0 to 6.0
    const currentSection = Math.max(0, Math.min(5, Math.floor(S)));
    const nextSection = Math.min(6, currentSection + 1);
    
    // Calculate Cubic Easing on local transition progress
    const alpha = S - currentSection;
    const easedAlpha = alpha < 0.5 
      ? 4 * alpha * alpha * alpha 
      : 1 - Math.pow(-2 * alpha + 2, 3) / 2;

    // Interpolate Position
    const targetPos = new THREE.Vector3().lerpVectors(
      POSITIONS[currentSection],
      POSITIONS[nextSection],
      easedAlpha
    );
    groupRef.current.position.copy(targetPos);

    // --- INTERACTION LERPING ---
    
    // 1. Decay click spin velocity (exponential decay)
    clickSpinVelocityRef.current = THREE.MathUtils.lerp(clickSpinVelocityRef.current, 0, delta * 4.0);

    // 2. Lerp hover spin boost
    const targetHoverSpin = hoveredRef.current ? 1.0 : 0.0;
    hoverSpinRef.current = THREE.MathUtils.lerp(hoverSpinRef.current, targetHoverSpin, delta * 8.0);

    // 3. Lerp scale factor (target is 1.25x on hover)
    const targetHoverScale = hoveredRef.current ? 1.25 : 1.0;
    hoverScaleRef.current = THREE.MathUtils.lerp(hoverScaleRef.current, targetHoverScale, delta * 8.0);

    // 4. Lerp glow intensity
    const targetHoverIntensity = hoveredRef.current ? 1.0 : 0.0;
    hoverIntensityRef.current = THREE.MathUtils.lerp(hoverIntensityRef.current, targetHoverIntensity, delta * 8.0);

    // Interpolate Scale and apply hover scale multiplier
    const targetScaleVal = THREE.MathUtils.lerp(
      SCALES[currentSection],
      SCALES[nextSection],
      easedAlpha
    );
    groupRef.current.scale.setScalar(targetScaleVal * hoverScaleRef.current);

    // Mouse Parallax (Combine scroll position with pointer coordinates)
    const parallaxX = state.pointer.x * 0.4;
    const parallaxY = state.pointer.y * 0.3;
    groupRef.current.position.x += parallaxX;
    groupRef.current.position.y += parallaxY;

    // Idle Rotation + Scroll Momentum Spin + Hover Boost + Click Spin
    const spinSpeed = 0.5 
      + Math.abs(scrollSmooth.getVelocity ? scrollSmooth.getVelocity() * 0.5 : (S - currentSection) * 2.0)
      + hoverSpinRef.current
      + clickSpinVelocityRef.current;
    
    groupRef.current.rotation.y += delta * 0.25 * spinSpeed;
    groupRef.current.rotation.x += delta * 0.12 * spinSpeed;

    // Update uTime uniform in deforming shaders
    const elapsedTime = state.clock.getElapsedTime();
    shadersRef.current.forEach((shader) => {
      if (shader.uniforms.uTime) {
        shader.uniforms.uTime.value = elapsedTime;
      }
    });

    // Handle cross-fade opacities and emissive glow
    meshRefs.forEach((ref, index) => {
      if (ref.current) {
        const diff = Math.abs(S - index);
        const opacity = Math.max(0, 1 - diff);
        
        ref.current.visible = opacity > 0.01;
        if (ref.current.material) {
          ref.current.material.opacity = opacity;
          ref.current.material.transparent = true;
          // Set depthWrite to false when transparent to prevent rendering order sorting issues
          ref.current.material.depthWrite = opacity > 0.95;

          // Glow/Emissive reaction:
          if (ref.current.material.emissive) {
            if (index === 6) {
              // Contact model has standard base emissive intensity of 2.5, boosted up to 5.0 on hover
              ref.current.material.emissiveIntensity = 2.5 + hoverIntensityRef.current * 2.5;
            } else {
              // Standard models have base emissive intensity of 0.0, boosted up to 1.5 on hover
              ref.current.material.emissiveIntensity = hoverIntensityRef.current * 1.5;
            }
          }
        }
      }
    });

    // Handle wireframes (with subtle hover opacity boost)
    // Stats wireframe (index 1)
    if (wireframeRefs[0].current) {
      const diff = Math.abs(S - 1);
      const opacity = Math.max(0, 0.4 * (1 - diff));
      wireframeRefs[0].current.visible = opacity > 0.01;
      
      const hoverBoost = 1.0 + hoverIntensityRef.current * 0.5; // up to 1.5x opacity on hover
      wireframeRefs[0].current.material.opacity = Math.min(1.0, opacity * hoverBoost);
    }
    // Contact wireframe (index 6)
    if (wireframeRefs[1].current) {
      const diff = Math.abs(S - 6);
      const opacity = Math.max(0, 0.6 * (1 - diff));
      wireframeRefs[1].current.visible = opacity > 0.01;
      
      const hoverBoost = 1.0 + hoverIntensityRef.current * 0.5; // up to 1.5x opacity on hover
      wireframeRefs[1].current.material.opacity = Math.min(1.0, opacity * hoverBoost);
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        hoveredRef.current = true;
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        hoveredRef.current = false;
      }}
      onClick={(e) => {
        e.stopPropagation();
        clickSpinVelocityRef.current += 6.0; // Click spin impulse
      }}
    >
      {/* 0. Hero: Torus Knot - Glassmorphic with Purple Glow on Hover */}
      <mesh ref={meshRefs[0]}>
        <torusKnotGeometry args={[1.2, 0.3, 128, 32]} />
        <meshPhysicalMaterial 
          transmission={1.0}
          thickness={2.5}
          roughness={0.12}
          ior={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          metalness={0.05}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={0.5}
          transparent
          emissive="#a855f7"
          emissiveIntensity={0}
        />
      </mesh>

      {/* 1. Stats: Icosahedron (Blob) - Glassmorphic with Cyan Wireframe */}
      <group>
        <mesh ref={meshRefs[1]}>
          <icosahedronGeometry args={[1.3, 6]} />
          <meshPhysicalMaterial 
            transmission={0.8}
            thickness={1.5}
            roughness={0.2}
            ior={1.45}
            clearcoat={0.5}
            color="#ffffff"
            transparent
            emissive="#06b6d4"
            emissiveIntensity={0}
            onBeforeCompile={addShaderRef}
          />
        </mesh>
        <mesh ref={wireframeRefs[0]} raycast={null}>
          <icosahedronGeometry args={[1.315, 6]} />
          <meshBasicMaterial 
            color="#06b6d4"
            wireframe
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            onBeforeCompile={addShaderRef}
          />
        </mesh>
      </group>

      {/* 2. Services: Icosahedron (Blob) - Matte Metal with Silver Glow on Hover */}
      <mesh ref={meshRefs[2]}>
        <icosahedronGeometry args={[1.3, 6]} />
        <meshPhysicalMaterial 
          metalness={0.95}
          roughness={0.28}
          color="#a1a1aa"
          envMapIntensity={1.5}
          transparent
          emissive="#a1a1aa"
          emissiveIntensity={0}
          onBeforeCompile={addShaderRef}
        />
      </mesh>

      {/* 3. Process: Torus Ring - Semi-glass yellow with Yellow Glow on Hover */}
      <mesh ref={meshRefs[3]}>
        <torusGeometry args={[1.5, 0.25, 16, 100]} />
        <meshPhysicalMaterial 
          transmission={0.9}
          thickness={2.0}
          roughness={0.15}
          color="#fef08a"
          transparent
          emissive="#eab308"
          emissiveIntensity={0}
        />
      </mesh>

      {/* 4. Work: Torus Knot - Heavy Glass with Blue Glow on Hover */}
      <mesh ref={meshRefs[4]}>
        <torusKnotGeometry args={[1.2, 0.3, 128, 32]} />
        <meshPhysicalMaterial 
          transmission={1.0}
          thickness={3.5}
          ior={1.6}
          roughness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          color="#e0f2fe"
          transparent
          emissive="#38bdf8"
          emissiveIntensity={0}
        />
      </mesh>

      {/* 5. Showcase: Torus Ring - Dark Glass with Dark Indigo Glow on Hover */}
      <mesh ref={meshRefs[5]}>
        <torusGeometry args={[1.5, 0.25, 16, 100]} />
        <meshPhysicalMaterial 
          transmission={0.8}
          thickness={2.0}
          roughness={0.2}
          color="#1e1b4b"
          transparent
          emissive="#4f46e5"
          emissiveIntensity={0}
        />
      </mesh>

      {/* 6. Contact: Icosahedron (Blob) - Purple Glowing Emissive with Purple Wireframe */}
      <group>
        <mesh ref={meshRefs[6]}>
          <icosahedronGeometry args={[1.3, 6]} />
          <meshStandardMaterial 
            color="#1c1917"
            emissive="#8b5cf6"
            emissiveIntensity={2.5}
            roughness={0.2}
            transparent
            onBeforeCompile={addShaderRef}
          />
        </mesh>
        <mesh ref={wireframeRefs[1]} raycast={null}>
          <icosahedronGeometry args={[1.315, 6]} />
          <meshBasicMaterial 
            color="#8b5cf6"
            wireframe
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            onBeforeCompile={addShaderRef}
          />
        </mesh>
      </group>
    </group>
  );
}
```

---

## 5. Verification Method

To verify the proposed code changes:
1. **Lint Check**: Run `npm run lint` to verify that there are no syntax errors or unused imports/variables.
2. **Local Review**: Run `npm run dev` and navigate to the application. Verify that:
   - Hovering over a model smoothly increases its scale to 1.25x.
   - Cursor changes to `pointer` on hover.
   - Clicking a model causes a rapid spin burst that decays back to normal.
   - Hovering over a model causes a nice emissive glow color matching its theme.
   - Wireframe opacities are boosted by up to 1.5x on hover.
3. **Automated Test Check**: Execute `node test.js` to ensure the project continues to compile and run without any errors.
