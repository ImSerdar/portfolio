# Portfolio Oryzo.ai Replicant — 3D Visual Scene & Material Analysis

## Core Summary
This analysis outlines the 3D scene elements, materials, lighting, and transitions required to replicate the premium aesthetic of `oryzo.ai`. We propose replacing the static, spaced-out meshes of the Z-tunnel fly-through with a **single, morphing central WebGL mesh group** that dynamically transitions its geometry, material attributes (glassmorphism, metalness, roughness, emission), lighting, and particle effects in response to a scroll-linked animation driver.

---

## 1. 3D Scene Elements: Geometries, Materials, and Lighting

To match the high-end visual fidelity of `oryzo.ai`, we must restructure the canvas to use physical-based materials, custom vertex shaders, high-contrast colored lighting, and responsive particle fields.

### A. Geometries & The Morphing Mesh Group
Instead of creating and destroying Three.js geometries during scroll (which triggers heavy CPU overhead and WebGL buffer re-allocations leading to frame drops), we propose rendering **three core meshes** within a single coordinate group and cross-fading their scale, opacity, and visibility.

1. **TorusKnotGeometry (`[1.2, 0.3, 128, 32]`)**: Used for the **Hero** and **Work** sections. The winding, self-overlapping structure is ideal for showing off physical glass refraction, clearcoat specular highlights, and ambient occlusion.
2. **IcosahedronGeometry (`[2.0, 6]`)**: A high-density geodesic sphere used for **Stats**, **Services**, and **Contact**. 
   * *Deformation*: By applying a custom vertex shader, we can displace its vertices along their normals using 3D Simplex Noise, morphing it into an organic, liquid-like "blob" that pulsates gently.
   * *Wireframe*: Renders structural complexity during the Stats and Contact sections.
3. **TorusGeometry (`[1.5, 0.25, 16, 100]`)**: A clean flat ring used for the **Process** and **Showcase** sections, representing structured flow and circular loops.

### B. Materials Specification
The materials must transition seamlessly between clear glassmorphism, brushed matte metal, and glowing holographic wireframes.

#### 1. Glassmorphism (Physical Transmission)
Achieved using Three.js `MeshPhysicalMaterial`. Crucially, this material **requires an environment map** to calculate refraction. We must inject a reflection environment preset (e.g., `<Environment preset="city" />` from `@react-three/drei`) into the scene.

* **Three.js Properties**:
  * `transmission`: `1.0` (100% light transmission through the material)
  * `thickness`: `2.0` (adds refractive depth, warping background elements)
  * `roughness`: `0.12` (smooth surface, but slightly blurs the refracted background for readability)
  * `ior` (Index of Refraction): `1.5` (standard glass refraction index)
  * `clearcoat`: `1.0` (adds a highly polished, secondary reflective outer layer)
  * `clearcoatRoughness`: `0.08`
  * `metalness`: `0.05` (reflects highlight colors on silhouette edges)
  * `color`: `#ffffff`
  * `attenuationColor`: `#ffffff`
  * `attenuationDistance`: `0.5`

#### 2. Brushed Industrial Metal
Used during **Services** and **Showcase** to emphasize engineering rigor.
* **Three.js Properties**:
  * `metalness`: `0.95` (highly metallic reflection)
  * `roughness`: `0.28` (satin, matte-brushed texture that diffuses specular highlights)
  * `color`: `#a1a1aa` (slate/platinum gray)
  * `clearcoat`: `0.0`
  * `envMapIntensity`: `1.5` (boosts reflection contrast)

#### 3. Glowing Holographic Shaders & Wireframes
For the **Stats** and **Contact** sections, we instantiate a secondary mesh with identical geometry scaled up to `1.015`.
* **Wireframe Material**:
  * `wireframe`: `true`
  * `transparent`: `true`
  * `opacity`: `0.25` (Stats) to `0.6` (Contact)
  * `color`: `#06b6d4` (cyan) or `#8b5cf6` (purple)
  * `blending`: `THREE.AdditiveBlending` (glow overlay)
* **Emissive Material (Contact)**:
  * `emissive`: `#8b5cf6`
  * `emissiveIntensity`: `2.5` (drives WebGL bloom shaders if post-processing is enabled)

### C. Lighting Rig Architecture
A high-contrast three-point light setup is required to catch the edges of the glass and metallic meshes:

1. **Key Directional Light (Cyan)**:
   * `position`: `[10, 10, 8]`
   * `color`: `#06b6d4` (cyan)
   * `intensity`: `1.5`
2. **Fill Directional Light (Purple)**:
   * `position`: `[-10, -10, -8]`
   * `color`: `#8b5cf6` (purple)
   * `intensity`: `1.2`
3. **Back/Rim Light (White/Gold)**:
   * `position`: `[0, 5, -10]` (positioned behind the mesh, pointing towards the camera)
   * `color`: `#ffffff`
   * `intensity`: `2.0` (highlights the glass boundaries via Fresnel reflection)
4. **Ambient Light**:
   * `intensity`: `0.15` (kept low to prevent flattening shadows)

### D. Responsive Particle Systems
We recommend replacing the static `<Stars>` with a custom, scroll-linked particle system utilizing `THREE.Points` or Drei's `<Sparkles>`:
* **Base Settings**: `count={300}`, `scale={15}`, `size={3}`, `speed={0.3}`, `color="#06b6d4"`.
* **Scroll Linkage**: We track the scroll position to change particle speed and direction. During transitions, particles speed up (e.g. `speed = 1.5`) along the Z-axis, creating a "warp speed" effect, then settle back down to `0.3` when the user stops on a section.
* **Active Section Behaviors**:
  * *Stats*: Particles cluster closer (scale drops from `15` to `6`), forming a neat bounding box.
  * *Services/Work*: Particles drift horizontally from right to left.
  * *Contact*: Particles orbit in a cylindrical vortex around the Y-axis.

---

## 2. Scroll-Linked Transition Matrix

The central mesh must adjust its position, rotation, scale, and material properties dynamically as the user scrolls. Assuming the scroll offset maps to a normalized value `S` from `0.0` (Hero) to `6.0` (Contact), the properties are mapped as follows:

| Section | Scroll `S` | Position `[X, Y, Z]` | Base Spin Speed | Scale | Geometry Visibility | Material Properties |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero** | `0.0` | `[1.8, 0, 0]` | Slow `(y: 0.05, x: 0.02)` | `1.6` | Torus Knot: 100%<br>Others: 0% | Glassmorphism (`transmission: 1.0`, `roughness: 0.12`, cyan tint) |
| **Stats** | `1.0` | `[-2.0, 0.4, 0]` | Fast `(y: 0.18, z: 0.05)` | `1.2` | Icosahedron: 100%<br>Others: 0% | Glass core + Cyan Additive Wireframe shell (`opacity: 0.4`) |
| **Services** | `2.0` | `[2.2, -0.2, 0]` | Tilted `(x: 0.08, y: 0.04)` | `1.4` | Icosahedron: 100%<br>Others: 0% | Matte Slate Metal (`metalness: 0.95`, `roughness: 0.28`) |
| **Process** | `3.0` | `[-2.2, -0.1, 0]` | Flat Spin `(y: 0.12)` | `1.3` | Torus Ring: 100%<br>Others: 0% | Semi-glass, colored sections glowing on loop |
| **Work** | `4.0` | `[2.0, 0.2, 0]` | Float `(y: 0.06, x: 0.04)` | `1.5` | Torus Knot: 100%<br>Others: 0% | Heavy Glass refractive lens (`thickness: 3.5`, `ior: 1.6`) |
| **Showcase** | `5.0` | `[0, 1.2, -2.0]` | Slow Roll `(z: 0.02, y: 0.01)`| `2.8` | Torus Ring: 100%<br>Others: 0% | Dark Glass (`color: #1e1b4b`, `transmission: 0.8`, `roughness: 0.2`) |
| **Contact** | `6.0` | `[0, -0.3, 0]` | Rapid Orbit `(x: 0.2, z: 0.15)` | `1.5` | Icosahedron: 100%<br>Others: 0% | Glowing Emissive Blob + Purple Wireframe (`emissiveIntensity: 2.5`) |

### Easing & Interpolation Logic
In the R3F `useFrame` loop, the current scroll position `S` is decomposed:
```javascript
const currentSection = Math.floor(S);
const alpha = S - currentSection; // Progress from [0, 1] between sections
```
To prevent linear transition jank, we apply a **Cubic Ease-In-Out** to `alpha` before interpolating:
$$\alpha_{eased} = \alpha < 0.5 ? 4 \times \alpha^3 : 1 - \frac{(-2 \times \alpha + 2)^3}{2}$$

All target vectors (position, scale, colors) are calculated by interpolating between `array[currentSection]` and `array[currentSection + 1]` using $\alpha_{eased}$.

---

## 3. Suggestion for R3F Canvas Code Layout

Below is the proposed implementation layout for `src/components/CentralMesh.jsx`. It utilizes scale-and-fade cross-morphing, spring-damped scroll positions, mouse parallax, and physical materials.

```jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTransform } from 'framer-motion';
import * as THREE from 'three';

// Define configuration vectors for each section [Hero, Stats, Services, Process, Work, Showcase, Contact]
const POSITIONS = [
  new THREE.Vector3(1.8, 0, 0),    // Hero (Right)
  new THREE.Vector3(-2.0, 0.4, 0),  // Stats (Left)
  new THREE.Vector3(2.2, -0.2, 0),  // Services (Right)
  new THREE.Vector3(-2.2, -0.1, 0), // Process (Left)
  new THREE.Vector3(2.0, 0.2, 0),   // Work (Right)
  new THREE.Vector3(0, 1.2, -2.0),  // Showcase (Center-Back)
  new THREE.Vector3(0, -0.3, 0)     // Contact (Center)
];

const SCALES = [1.6, 1.2, 1.4, 1.3, 1.5, 2.8, 1.5];

export default function CentralMesh({ scrollSmooth }) {
  const groupRef = useRef();
  
  // Refs for individual geometries to control cross-fade
  const knotRef = useRef();
  const blobRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const S = scrollSmooth.get(); // Float from 0.0 to 6.0
    const currentSection = Math.max(0, Math.min(5, Math.floor(S)));
    const nextSection = Math.min(6, currentSection + 1);
    
    // 1. Calculate Cubic Easing on local transition progress
    const alpha = S - currentSection;
    const easedAlpha = alpha < 0.5 
      ? 4 * alpha * alpha * alpha 
      : 1 - Math.pow(-2 * alpha + 2, 3) / 2;

    // 2. Interpolate Position
    const targetPos = new THREE.Vector3().lerpVectors(
      POSITIONS[currentSection],
      POSITIONS[nextSection],
      easedAlpha
    );
    groupRef.current.position.copy(targetPos);

    // 3. Interpolate Scale
    const targetScaleVal = THREE.MathUtils.lerp(
      SCALES[currentSection],
      SCALES[nextSection],
      easedAlpha
    );
    groupRef.current.scale.setScalar(targetScaleVal);

    // 4. Mouse Parallax (Combine scroll position with pointer coordinates)
    const parallaxX = state.pointer.x * 0.4;
    const parallaxY = state.pointer.y * 0.3;
    groupRef.current.position.x += parallaxX;
    groupRef.current.position.y += parallaxY;

    // 5. Idle Rotation + Scroll Momentum Spin
    const spinSpeed = 0.5 + (S - currentSection) * 2.0; // spin faster during transitions
    groupRef.current.rotation.y += delta * 0.2 * spinSpeed;
    groupRef.current.rotation.x += delta * 0.1 * spinSpeed;

    // 6. Geometry Cross-Fade (Scale-and-Fade Morphing)
    // Map S to individual mesh visibilities
    const knotOpacity = S <= 1.0 ? (1 - S) : S >= 3.0 && S <= 4.0 ? (S - 3.0) : S >= 4.0 && S <= 5.0 ? (5.0 - S) : 0;
    const blobOpacity = S >= 0.0 && S <= 2.0 ? (S <= 1.0 ? S : 2.0 - S) : S >= 2.0 && S <= 3.0 ? (3.0 - S) : S >= 5.0 ? (S - 5.0) : 0;
    const ringOpacity = S >= 2.0 && S <= 4.0 ? (S <= 3.0 ? S - 2.0 : 4.0 - S) : S >= 4.0 && S <= 6.0 ? (S <= 5.0 ? S - 4.0 : 6.0 - S) : 0;

    // Apply opacities to materials and toggle visibility
    if (knotRef.current) {
      knotRef.current.visible = knotOpacity > 0.01;
      knotRef.current.material.opacity = knotOpacity;
    }
    if (blobRef.current) {
      blobRef.current.visible = blobOpacity > 0.01;
      blobRef.current.material.opacity = blobOpacity;
      
      // Update blob noise uniform if using custom shader
      if (blobRef.current.material.userData.shader) {
        blobRef.current.material.userData.shader.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    }
    if (ringRef.current) {
      ringRef.current.visible = ringOpacity > 0.01;
      ringRef.current.material.opacity = ringOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Torus Knot (Hero / Work) */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
        <meshPhysicalMaterial 
          transmission={1.0}
          thickness={2.5}
          roughness={0.12}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          color="#e0f2fe"
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* 2. Deforming Blob (Stats / Services / Contact) */}
      <mesh ref={blobRef}>
        <icosahedronGeometry args={[1.3, 6]} />
        {/* We can use standard material or inject vertex noise via onBeforeCompile */}
        <meshPhysicalMaterial 
          transmission={0.8}
          thickness={1.5}
          roughness={0.2}
          ior={1.45}
          clearcoat={0.5}
          color="#ffffff"
          transparent
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `
              uniform float uTime;
              // Include Simplex 3D Noise algorithms...
              ${simplexNoiseGLSL}
              ${shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                // Displace vertices along normal vector using noise
                float displacement = snoise(vec4(position * 1.5, uTime * 0.8)) * 0.15;
                transformed += normal * displacement;
                `
              )}
            `;
            blobRef.current.material.userData.shader = shader;
          }}
        />
      </mesh>

      {/* 3. Ring (Process / Showcase) */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.22, 32, 100]} />
        <meshPhysicalMaterial 
          transmission={0.9}
          thickness={2.0}
          roughness={0.15}
          color="#fef08a"
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Minimal Simplex Noise helper function to compile inside shader
const simplexNoiseGLSL = `
  // Ashima Arts Simplex Noise implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec4 v) {
    const vec4 C = vec4( 0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);
    vec4 i  = floor(v + dot(v, vec4(0.309016994374947)) );
    vec4 x0 = v -   i + dot(i, C.xxxx) ;
    vec4 i1, i2, i3;
    vec4 g1 = step(x0.yzwx, x0.xzwx);
    vec4 g2 = step(x0.zwyz, x0.xywz);
    i1.x = g1.x*(1.0-g2.x); i1.y = g1.y*(1.0-g2.y); i1.z = g1.z*(1.0-g2.z); i1.w = 1.0 - i1.x - i1.y - i1.z;
    i2.x = max(g1.x, g2.x); i2.y = max(g1.y, g2.y); i2.z = max(g1.z, g2.z); i2.w = 1.0 - i2.x - i2.y - i2.z;
    i3.x = min(g1.x, g2.x); i3.y = min(g1.y, g2.y); i3.z = min(g1.z, g2.z); i3.w = 1.0 - i3.x - i3.y - i3.z;
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;
    i = mod289(i);
    float n_ = 0.138196601125011;
    vec4 p = permute( permute( permute( permute(
               i.w + vec4(0.0, i3.w, i2.w, i1.w ))
             + i.z + vec4(0.0, i3.z, i2.z, i1.z ))
             + i.y + vec4(0.0, i3.y, i2.y, i1.y ))
             + i.x + vec4(0.0, i3.x, i2.x, i1.x ));
    vec4 ns = 1.0/289.0 * vec4( 0.0, 1.0, 2.0, 3.0 );
    vec4 j = p - 49.0 * floor(p * ns.x);
    vec4 x_ = floor(j * ns.y);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.z + ns.xxxx;
    vec4 y = y_ *ns.z + ns.xxxx;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec3 p4 = vec3(x4.xyz,1.0-abs(x4.x)-abs(x4.y));
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    p4 *= taylorInvSqrt(vec4(dot(p4,p4))).x;
    vec5 m = max(0.6 - vec5(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3), dot(x4,x4)), 0.0);
    m = m * m;
    return 49.0 * dot( m*m, vec5( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3), dot(p4,x4) ) );
  }
`;
// Note: vec5 helper is used for 4D simplex noise.
// For simplicity in three.js, we can also use standard 3D Simplex noise.
