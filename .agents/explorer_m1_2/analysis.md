# Analysis of 3D Scene and Model Integration: Content Spotlight Interactions (R2)

## 1. Executive Summary
This report analyzes the current structure of `Scene.jsx` and its primary sub-component `CentralMesh.jsx`, maps how they interact with scroll events, and proposes a complete redesign for **Content Spotlight Interactions (R2)**. The redesign introduces a cinematic "spotlight" behavior: 3D models sweep into the center and swell during scroll transitions, then retreat (slide to the sides or fade into the background) when the scroll snaps to a section. This design ensures 100% HTML readability on all device sizes while maintaining high-fidelity interactive 3D visuals.

---

## 2. Component Structure & Asset Loading
The 3D canvas is integrated into the portfolio via the following components:

### A. `Scene.jsx`
- **Purpose**: Establishes the WebGL environment. It handles the background color, camera setup with mouse parallax, lighting rig, environmental reflections, and particle systems.
- **Lighting Rig**: Uses a high-contrast 3-point light setup (cyan key light, purple fill light, and white rim light) to catch the edges of metallic and glass materials.
- **Particles**: Renders two `<Sparkles>` systems (cyan and purple) to add environmental depth.
- **Camera**: Employs mouse parallax in the `<SceneCamera>` component, smoothly drifting the camera based on `state.pointer` coordinates.
- **Sub-components**: Renders a single `<CentralMesh>` wrapper wrapped in `<Suspense>`.

### B. `CentralMesh.jsx`
- **Purpose**: Loads and transitions between the seven IT-themed models mapping to the portfolio sections.
- **Asset Loading**: GLTF models are preloaded at the module scope using Drei's `useGLTF.preload` to prevent frame drops:
  - `brackets.gltf` (extruded code brackets `< >` or `{ }`)
  - `microchip.gltf` (circuit board substrate and metallic die)
  - `server.gltf` (blade server rack mount)
- **Geometry Traversal & Materials**: Clones the gltf scenes inside a `useMemo` block to allow multiple independent instances. It traverses meshes to apply custom shaders, wireframes, and physical material parameters (glassmorphism, metalness, roughness, clearcoat, and emission).
- **Opacities and Visibility**: Handles cross-fades by calculating the absolute scroll distance `diff = Math.abs(S - index)` for each section model, mapping it to material opacity, and setting `visible = false` when a model is far from the current scroll point.

### C. `DeviceMockup.jsx`
- **Purpose**: A standard HTML/CSS iframe wrapper showcasing live site previews in a simulated laptop/mobile viewport.
- **Integration**: Used in Section 5 (Showcase). It is styled as a DOM element and overlays on top of the 3D canvas. Because it contains interactive iframe frames, the 3D model must not block mouse clicks.

---

## 3. Current Reaction to Scroll Events
Scrolling is managed by a virtual scroll hook `src/hooks/useVirtualScroll.js`, which listens to `wheel`, `touchstart/touchmove`, and `keydown` events.
1. The hook maintains a Framer Motion `scrollTarget` (representing the raw target section index, `0.0` to `6.0`).
2. A `smoothScroll` spring-smoothed motion value is derived from `scrollTarget` with `stiffness: 50` and `damping: 25`.
3. In `CentralMesh.jsx`, the current smooth scroll position `S` is fetched:
   ```javascript
   const S = scrollSmooth.get(); // Float [0.0 - 6.0]
   const currentSection = Math.max(0, Math.min(5, Math.floor(S)));
   const nextSection = Math.min(6, currentSection + 1);
   const alpha = S - currentSection;
   ```
4. A **Cubic Ease-In-Out** is applied to `alpha` to get `easedAlpha`:
   ```javascript
   const easedAlpha = alpha < 0.5 
     ? 4 * alpha * alpha * alpha 
     : 1 - Math.pow(-2 * alpha + 2, 3) / 2;
   ```
5. **Position Interpolation**: The group position linearly interpolates between predefined coordinates in the `POSITIONS` array based on `easedAlpha`:
   ```javascript
   const targetPos = new THREE.Vector3().lerpVectors(
     POSITIONS[currentSection],
     POSITIONS[nextSection],
     easedAlpha
   );
   groupRef.current.position.copy(targetPos);
   ```

### ⚠️ Current Readability & Overlap Issues
1. **Centering Conflict**: Currently, all sections in `DOMOverlay.jsx` are wrapped in `<SectionWrapper align="center">`, centering all content (titles, grids, CTAs) on the screen.
2. **Overlap on Desktop**: The 3D model positions (`X = 1.8, -2.0, 2.2, -2.2, 2.0`) place models directly adjacent to the center content. On average-sized desktop screens, this causes the 3D geometries to visually collide with the edges of text blocks, reducing contrast and readability.
3. **Overlap on Mobile**: Mobile viewports force all text content to center (`justify-content: center !important`). Because the 3D canvas is behind the text, a model positioned at `X = 0` (Contact) or on the sides (which bleed into center space on narrow viewports) sits directly under or over the text, rendering text blocks unreadable.

---

## 4. Redesign Proposal: Content Spotlight Interactions (R2)

To maximize readability while showcasing 3D assets, we propose a two-phase coordinate and layout redesign for Desktop and Mobile viewports.

### A. Layout Realignment (Desktop)
We will alternate the layout alignments in `DOMOverlay.jsx` so that the HTML text and the 3D models occupy opposite sides of the viewport when snapped. When scrolling, the model sweeps to the center (spotlight) and then slides to its opposite side.

| Section | Scroll Index | Text Alignment (`DOMOverlay.jsx`) | Snapped Model Position `[X, Y, Z]` | Snapped Model Scale Modifier | Snapped Model Max Opacity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Hero** | `0` | **Left** (`align="left"`) | `[2.2, 0, 0]` (Far Right) | `1.0` | `1.0` |
| **1. Stats** | `1` | **Right** (`align="right"`) | `[-2.2, 0.4, 0]` (Far Left) | `1.0` | `1.0` |
| **2. Services** | `2` | **Left** (`align="left"`) | `[2.4, -0.2, 0]` (Far Right) | `1.0` | `1.0` |
| **3. Process** | `3` | **Right** (`align="right"`) | `[-2.4, -0.1, 0]` (Far Left) | `1.0` | `1.0` |
| **4. Work** | `4` | **Left** (`align="left"`) | `[2.2, 0.2, 0]` (Far Right) | `1.0` | `1.0` |
| **5. Showcase** | `5` | **Center** (`align="center"`) | `[0, 1.8, -4.0]` (Retreat Back-Top) | `0.6` (Shrunk) | `0.15` (Faded background) |
| **6. Contact** | `6` | **Center** (`align="center"`) | `[0, -1.5, -2.0]` (Retreat Back-Bottom) | `0.8` | `0.3` (Subtle glow base) |

* **Showcase Section (Z-retreat)**: Pushing the model deep to `Z = -4.0` and fading it to `0.15` opacity ensures it acts as a subtle background accent behind the device mockups, preventing visual collision and avoiding mouse interception.
* **Contact Section (Y-retreat)**: Dropping the model down to `Y = -1.5` and back to `Z = -2.0` places the glowing server rack below the main contact card, serving as a pedestal/foundation rather than overlapping form fields.

### B. Mobile Responsive Strategy (Mobile/Tablet <= 768px)
Because mobile screens cannot support side-by-side splits, the 3D models must hide or retreat to the background when snapped to a section:
1. **Transition State**: As the user scrolls, the active text block fades out (`DOMOverlay` has built-in opacity transforms). The 3D model sweeps to the center `[0, 0.2, 0]` and scales up to be displayed.
2. **Snapped State**: When the scroll settles, the model retreats:
   - For Sections 0-4: Moves to `[0, -2.0, -3.0]` (top/bottom background) and fades to `0.12` opacity.
   - For Section 5 (Showcase): Moves to `[0, 2.2, -5.0]` and fades to `0.05` opacity (nearly invisible) to prevent overlapping iframe mockups.
   - For Section 6 (Contact): Moves to `[0, -2.2, -2.0]` and fades to `0.18` opacity to sit below the card.

---

## 5. Technical Implementation Details

### A. Coordinate Interpolation Math in `useFrame`
To implement the spotlight sweep, we calculate `spotlightBlend` using a sine curve over the fractional scroll progress `alpha`. This pulls the model to the center spotlight `[0, 0, 0.8]` at the peak of the scroll transition:

```javascript
// 1. Snapped positions (Desktop)
const DESKTOP_POSITIONS = [
  new THREE.Vector3(2.2, 0.0, 0),
  new THREE.Vector3(-2.2, 0.4, 0),
  new THREE.Vector3(2.4, -0.2, 0),
  new THREE.Vector3(-2.4, -0.1, 0),
  new THREE.Vector3(2.2, 0.2, 0),
  new THREE.Vector3(0.0, 1.8, -4.0),
  new THREE.Vector3(0.0, -1.5, -2.0)
];

// 2. Snapped positions (Mobile)
const MOBILE_POSITIONS = [
  new THREE.Vector3(0.0, -2.0, -3.0),
  new THREE.Vector3(0.0, 2.0, -3.0),
  new THREE.Vector3(0.0, -2.0, -3.0),
  new THREE.Vector3(0.0, 2.0, -3.0),
  new THREE.Vector3(0.0, -2.0, -3.0),
  new THREE.Vector3(0.0, 2.2, -5.0),
  new THREE.Vector3(0.0, -2.2, -2.0)
];

const BASE_SCALES = [1.6, 1.2, 1.4, 1.3, 1.5, 2.8, 1.5];
const SNAPPED_OPACITIES = [1.0, 1.0, 1.0, 1.0, 1.0, 0.15, 0.3];
const MOBILE_SNAPPED_OPACITIES = [0.12, 0.12, 0.12, 0.12, 0.12, 0.05, 0.18];

// Inside useFrame:
useFrame((state, delta) => {
  if (!groupRef.current) return;

  const S = scrollSmooth.get();
  const currentSection = Math.max(0, Math.min(5, Math.floor(S)));
  const nextSection = Math.min(6, currentSection + 1);
  
  // Detect mobile width dynamically
  const isMobile = state.size.width <= 768;
  const POSITIONS = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  const MAX_OPACITIES = isMobile ? MOBILE_SNAPPED_OPACITIES : SNAPPED_OPACITIES;

  const alpha = S - currentSection;
  const easedAlpha = alpha < 0.5 
    ? 4 * alpha * alpha * alpha 
    : 1 - Math.pow(-2 * alpha + 2, 3) / 2;

  // Dome shape peaking at 0.5 (mid-transition)
  const spotlightBlend = Math.sin(alpha * Math.PI); 

  // Interpolate snapped coordinates
  const basePos = new THREE.Vector3().lerpVectors(
    POSITIONS[currentSection],
    POSITIONS[nextSection],
    easedAlpha
  );

  // Spotlight position (centered and pushed closer for view)
  const spotlightPos = new THREE.Vector3(0, 0.1, 0.8);

  // Blend base position with spotlight position
  const finalPos = new THREE.Vector3().lerpVectors(
    basePos,
    spotlightPos,
    spotlightBlend * 0.85 // 85% pull to center at peak transition
  );
  groupRef.current.position.copy(finalPos);

  // Scale calculations (swell by 25% during transition)
  const baseScale = THREE.MathUtils.lerp(
    BASE_SCALES[currentSection],
    BASE_SCALES[nextSection],
    easedAlpha
  );
  const snapScaleModifier = THREE.MathUtils.lerp(
    currentSection === 5 || currentSection === 6 ? 0.6 : 1.0,
    nextSection === 5 || nextSection === 6 ? 0.6 : 1.0,
    easedAlpha
  );
  const transitionScaleBoost = 1.0 + spotlightBlend * 0.25; 
  groupRef.current.scale.setScalar(
    baseScale * snapScaleModifier * transitionScaleBoost * hoverScaleRef.current
  );

  // Apply opacities per model section (fade snapped models in background sections)
  meshRefs.forEach((ref, index) => {
    if (ref.current) {
      const diff = Math.abs(S - index);
      const baseOpacity = Math.max(0, 1 - diff);

      ref.current.visible = baseOpacity > 0.01;

      if (ref.current.visible) {
        // snapBlend: 1.0 when snapped (diff = 0), 0.0 when transitioning (diff >= 0.5)
        const snapBlend = Math.max(0, 1 - Math.min(1, diff * 2));
        
        // Spotlight brings model opacity to 1.0; snapped retreats use MAX_OPACITIES[index]
        const targetOpacity = baseOpacity * THREE.MathUtils.lerp(1.0, MAX_OPACITIES[index], snapBlend);

        ref.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = targetOpacity;
            child.material.transparent = true;
            child.material.depthWrite = targetOpacity > 0.85; // disable depthWrite when faded to prevent glass occlusion artifacts
            
            // Spotlight glow effect during transition
            if (child.material.emissive) {
              if (index === 6) {
                child.material.emissiveIntensity = 2.5 + hoverIntensityRef.current * 2.5;
              } else {
                const transitionGlow = spotlightBlend * 1.5;
                child.material.emissiveIntensity = Math.max(transitionGlow, hoverIntensityRef.current * 1.5);
              }
            }
          }
        });
      }
    }
  });
});
```

### B. DOM Alignment Adjustments in `DOMOverlay.jsx`
We will modify the alignments of the first five `<SectionWrapper>` instances in `src/components/DOMOverlay.jsx`:

```jsx
{/* 0. Hero Section */}
<SectionWrapper scrollSmooth={scrollSmooth} index={0} align="left">
  {/* Hero Content */}
</SectionWrapper>

{/* 1. Stats Section */}
<SectionWrapper scrollSmooth={scrollSmooth} index={1} align="right">
  {/* Stats Content */}
</SectionWrapper>

{/* 2. Services Section */}
<SectionWrapper scrollSmooth={scrollSmooth} index={2} align="left">
  {/* Services Content */}
</SectionWrapper>

{/* 3. Process Section */}
<SectionWrapper scrollSmooth={scrollSmooth} index={3} align="right">
  {/* Process Content */}
</SectionWrapper>

{/* 4. Work Section */}
<SectionWrapper scrollSmooth={scrollSmooth} index={4} align="left">
  {/* Work Content */}
</SectionWrapper>
```

---

## 6. Verification and Layout Compliance
1. **Layout Rules**: The modifications are clean and comply with the `PROJECT.md` structure. Source remains in `src/components/` and tests are co-located.
2. **Build and Test Verification**: We propose that a Worker subagent performs a test compile (`npm run build`) once the implementation is applied.
3. **No External Connections**: All models are served locally via the `public/` folder (`useGLTF('/brackets.gltf')`), keeping the app strictly local-only.
