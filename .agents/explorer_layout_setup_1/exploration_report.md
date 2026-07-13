# Exploration Report: 3D Portfolio Layout & Responsiveness Improvements

This report details the exact code modifications and structural changes required to achieve a consistent left-aligned desktop layout, implement smooth horizontal scrolling for card grids (Services, Process, and Work), and adjust desktop 3D object positions in the Three.js Canvas.

---

## 1. Left-Aligning All Desktop Content Consistently

### Current Status
Currently, slides have alternating horizontal alignments on desktop to position content opposite to the 3D meshes:
- **Hero (Index 0)**: Left-aligned (`align="left"`).
- **Stats (Index 1)**: Right-aligned (`align="right"`), with text right-aligned.
- **Services (Index 2)**: Left-aligned (`align="left"`).
- **Process (Index 3)**: Right-aligned (`align="right"`), with text right-aligned.
- **Work (Index 4)**: Left-aligned (`align="left"`).
- **Showcase (Index 5)**: Center-aligned (`align="center"`), with text center-aligned.
- **Contact (Index 6)**: Center-aligned (`align="center"`), with elements centered.

### Recommended Improvements

#### A. DOMOverlay.jsx SectionWrapper Updates
In `src/components/DOMOverlay.jsx`, update the `align` prop on all `SectionWrapper` components to `"left"`. This forces `justifyContent: 'flex-start'` and `paddingLeft: '10%'` on desktop:

1. **Stats Section (Index 1)**:
   - Change: `<SectionWrapper scrollSmooth={scrollSmooth} index={1} align="right">`
   - To: `<SectionWrapper scrollSmooth={scrollSmooth} index={1} align="left">`
   - Update inner title `style={{ textAlign: 'right', ... }}` to `textAlign: 'left'`.

2. **Process Section (Index 3)**:
   - Change: `<SectionWrapper scrollSmooth={scrollSmooth} index={3} align="right">`
   - To: `<SectionWrapper scrollSmooth={scrollSmooth} index={3} align="left">`
   - Update title and subtitle `p` styles from `textAlign: 'right'` to `textAlign: 'left'`.

3. **Showcase Section (Index 5)**:
   - Change: `<SectionWrapper scrollSmooth={scrollSmooth} index={5} align="center">`
   - To: `<SectionWrapper scrollSmooth={scrollSmooth} index={5} align="left">`
   - Update title and subtitle `p` styles from `textAlign: 'center'` to `textAlign: 'left'`.
   - **Important**: Rename the class name of the container from `"services-grid"` to `"showcase-grid"` so it maintains a grid layout on desktop rather than inheriting the new horizontal-scrolling flex styles of the Services section.

4. **Contact Section (Index 6)**:
   - Change: `<SectionWrapper scrollSmooth={scrollSmooth} index={6} align="center">`
   - To: `<SectionWrapper scrollSmooth={scrollSmooth} index={6} align="left">`
   - In the availability header `div`, change `style={{ display: 'flex', justifyContent: 'center', ... }}` to `justifyContent: 'flex-start'`.
   - In the description `p` tag, remove/change `margin: '0 auto 2.5rem'` to `margin: '0 0 2.5rem'` to align text to the left.
   - In the contact CTA group, remove any centering styles if applicable.

#### B. CSS Layout Updates in index.css
- Add a new `.showcase-grid` class to preserve grid rendering on desktop:
  ```css
  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
  }
  ```
- Adjust `.contact-section` block styling on desktop:
  ```css
  .contact-section {
    text-align: left;
    width: 100%;
    max-width: 650px;
    padding: 0;
  }
  .contact-section .glass {
    text-align: left;
  }
  .contact-section .contact-cta-group {
    justify-content: flex-start;
  }
  ```

---

## 2. Implementing Horizontal Scrolling for Card Grids (Services, Process, Work)

### Current Status
Currently, `.services-grid`, `.process-grid`, and `.work-grid` use standard CSS grid layouts on desktop (`display: grid`). This causes card grids to wrap vertically when they overflow their space. Since the sections are constrained to `100vh`, vertical card stacking forces vertical scrolling inside `.section-content-container`, which disrupts the main vertical slide transitions.

*Note*: The JS scroll handler (`src/hooks/useVirtualScroll.js`) is already written to intercept mouse wheel vertical-to-horizontal scrolling and touch swipes for these selectors, but only if they have horizontal overflow (`scrollWidth > clientWidth`).

### Recommended Improvements

Change these grid layouts to horizontal flex layouts on desktop (width > 768px). This creates a horizontal layout that enables horizontal swipe/scroll, triggering the JS scroll hook to seamlessly convert vertical scrolls into horizontal card navigation.

Add the following base styles (desktop-first) to `src/index.css`:

```css
/* Card grids horizontal flex layouts */
.services-grid, .work-grid, .process-grid {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 1.5rem;
  gap: 2rem;
  width: 100%;
  scrollbar-width: thin;
}

/* Custom scrollbars for the horizontal card lists */
.services-grid::-webkit-scrollbar,
.work-grid::-webkit-scrollbar,
.process-grid::-webkit-scrollbar {
  height: 6px;
}

.services-grid::-webkit-scrollbar-track,
.work-grid::-webkit-scrollbar-track,
.process-grid::-webkit-scrollbar-track {
  background: transparent;
}

.services-grid::-webkit-scrollbar-thumb,
.work-grid::-webkit-scrollbar-thumb,
.process-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.services-grid::-webkit-scrollbar-thumb:hover,
.work-grid::-webkit-scrollbar-thumb:hover,
.process-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Child cards sizing and snap alignment on desktop */
.service-card {
  flex: 0 0 350px;
  scroll-snap-align: start;
}

.project-card {
  flex: 0 0 400px;
  scroll-snap-align: start;
}

.process-step {
  flex: 0 0 300px;
  scroll-snap-align: start;
}
```

Since the mobile media query in `index.css` (`@media (max-width: 768px)`) utilizes `!important` rules to handle mobile responsiveness, it will automatically override these rules for mobile screens, keeping the layouts optimized for smaller widths.

---

## 3. Adjusting Desktop 3D Object Positions in CentralMesh.jsx

### Current Status
Currently, in `src/components/CentralMesh.jsx`, the `DESKTOP_PROPERTIES` array sets alternating positions for the 3D meshes along the X axis (`-2.2` for left-aligned meshes, `2.2` for right-aligned meshes, and `0` for center-aligned meshes):

```javascript
const DESKTOP_PROPERTIES = [
  { position: new THREE.Vector3(2.2, 0, 0), scale: 1.6, opacity: 1.0 }, // Hero
  { position: new THREE.Vector3(-2.2, 0.4, 0), scale: 1.2, opacity: 1.0 }, // Stats
  { position: new THREE.Vector3(2.4, -0.2, 0), scale: 1.4, opacity: 1.0 }, // Services
  { position: new THREE.Vector3(-2.4, -0.1, 0), scale: 1.3, opacity: 1.0 }, // Process
  { position: new THREE.Vector3(2.2, 0.2, 0), scale: 1.5, opacity: 1.0 }, // Work
  { position: new THREE.Vector3(0, 1.8, -4.0), scale: 0.6, opacity: 0.15 }, // Showcase
  { position: new THREE.Vector3(0, -1.5, -2.0), scale: 0.8, opacity: 0.3 } // Contact
];
```

### Recommended Improvements
Because all desktop overlay content is now consistently left-aligned, all 3D meshes should be positioned on the right side of the screen (positive X-coordinates) to prevent overlay overlaps and create a unified split-screen layout.

Update `DESKTOP_PROPERTIES` in `src/components/CentralMesh.jsx` to the following:

```javascript
const DESKTOP_PROPERTIES = [
  { position: new THREE.Vector3(2.2, 0, 0), scale: 1.6, opacity: 1.0 },       // Hero - remains on right
  { position: new THREE.Vector3(2.2, 0.4, 0), scale: 1.2, opacity: 1.0 },      // Stats - shifted left to right (-2.2 -> 2.2)
  { position: new THREE.Vector3(2.4, -0.2, 0), scale: 1.4, opacity: 1.0 },     // Services - remains on right
  { position: new THREE.Vector3(2.4, -0.1, 0), scale: 1.3, opacity: 1.0 },     // Process - shifted left to right (-2.4 -> 2.4)
  { position: new THREE.Vector3(2.2, 0.2, 0), scale: 1.5, opacity: 1.0 },      // Work - remains on right
  { position: new THREE.Vector3(2.2, 1.8, -4.0), scale: 0.6, opacity: 0.15 },  // Showcase - shifted center to right (0 -> 2.2)
  { position: new THREE.Vector3(2.2, -1.5, -2.0), scale: 0.8, opacity: 0.3 }   // Contact - shifted center to right (0 -> 2.2)
];
```
This aligns the 3D meshes perfectly with the left-aligned layout, ensuring maximum legibility of the content.
