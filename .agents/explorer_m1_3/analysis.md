# Layout, CSS, and DOM Overlay Analysis

## 1. Executive Summary
This report analyzes the layout, CSS, and DOM overlay structures of the portfolio site. Currently, the site uses an **absolute virtual-scroll** system that hijacks user scroll inputs (wheel, touch, keyboard) globally to animate a 3D canvas and slide absolute overlays in and out of 3D space. 

**Core Finding**: The current scrolling setup has a critical user experience flaw: **the user cannot scroll within sections that have overflow content** (e.g., Services, Work, Showcase, and Process on mobile). This is because the global scroll interception blocks default scrolling behavior. Furthermore, multiple sections overflow their designated heights (`85vh` on desktop, `80vh` on mobile) on smaller viewports, resulting in clipped or unreachable text content.

We outline two clear design paths to address these issues:
* **Path A: Refined Absolute Virtual Scroll** — Keep the current absolute 3D transition effect, but fix scroll hijacking by stopping event propagation on scrollable containers and introducing mobile carousels to eliminate vertical overflow.
* **Path B: Native CSS Snap-Scrolling** — Transition to native scroll snapping, using Framer Motion's `useScroll` hook to drive the 3D scene in sync with standard browser scrolling.

---

## 2. Section-by-Section Layout Analysis

Each section is rendered inside a `SectionWrapper` component (`DOMOverlay.jsx`), which is positioned absolutely, scaled, and translated along the Z-axis in 3D perspective based on the current scroll value. Active sections are wrapped in a `.section-content-container` which is styled as follows:
* **Desktop**: `max-height: 85vh; overflow-y: auto; padding-right: 1rem;`
* **Mobile (max-width: 768px)**: `max-height: 80vh;`

Here is how each section's text content fits within these constraints:

| Section | Content Components | Desktop Fitting (`85vh`) | Mobile Fitting (`80vh` / Stacked Grids) |
| :--- | :--- | :--- | :--- |
| **0. Hero** | Badge, Headline, Tagline, CTA Button Group. | **Fits perfectly**. Small height footprint (~350px). | **Fits perfectly**. Text size scales fluidly via `clamp()`. |
| **1. Stats** | Title, 2x2 Grid of 4 Stats Items. | **Fits perfectly**. Grid structure keeps vertical height to ~400px. | **Tight/Slight Overflow**. Grid wraps to 1 column (`grid-template-columns: 1fr`). Total height is ~500px, which exceeds `80vh` on small viewports (e.g. height < 625px). |
| **2. Services** | Title, 3 detailed Service Cards (each has description, 3-4 feature list items). | **Fits on large screens**. On screens < 960px wide, the `repeat(auto-fit, minmax(320px, 1fr))` grid wraps into 2 columns + 1 centered. Vertical height increases to ~900px, overflowing `85vh` and requiring scroll. | **Severe Overflow**. Grid stacks into 1 column. Total height is ~1150px. Heavily overflows `80vh` and remains unreadable due to scroll hijacking. |
| **3. Process** | Title, Subtitle, 3 Process Step Cards. | **Fits perfectly**. Horizontal layout (3 columns) keeps height to ~350px. | **Slight Overflow**. Stacks to 1 column. Height becomes ~660px, overflowing `80vh` on small viewports. |
| **4. Work** | Title, 2 Project Cards, CTA Banner. | **Tight/Borderline Overflow**. Grid of 2 columns + banner below is ~720px tall. On an 800px high screen, `85vh` is 680px, causing it to overflow and clip. | **Severe Overflow**. Stacks to 1 column. Total height (Title + 2 Cards + Banner) is ~1020px. Heavily overflows `80vh`. |
| **5. Showcase** | Title, Subtitle, 3-4 Project Links. | **Fits perfectly**. Horizontal cards keep height to ~450px. | **Severe Overflow**. Stacks to 1 column. Total height is ~900px, overflowing `80vh` and clipping contents. |
| **6. Contact** | Badge, Title, Description, 2 Buttons, Footer. | **Fits on standard viewports**. Glass card + Footer is ~650px. Overflows `85vh` on screens smaller than 760px. | **Severe Overflow**. Footer wraps and contact card expands. Total height is ~800px, overflowing `80vh`. |

---

## 3. Current Scroll & Styling Issues

### A. Scroll Hijacking Conflict (`useVirtualScroll.js`)
The hook intercepts events globally on the window:
```javascript
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchmove', handleTouchMove, { passive: false });
```
Inside the handlers, `e.preventDefault()` is called unconditionally. This prevents the browser from executing its default scroll action. As a result:
1. **Inner Scrolling is Blocked**: Even though `.section-content-container` has `overflow-y: auto`, scrolling on a mouse wheel or swiping on a touch screen does not scroll the content; it instead propagates to the window and triggers a section transition.
2. **Keyboard Snapping Bug**: The keyboard handler changes sections by `0.5` index increments on ArrowDown/ArrowUp/Space:
   ```javascript
   if (e.key === 'ArrowDown' || e.key === ' ') {
     increment = 0.5;
   }
   ```
   Because `active` state is determined by `Math.abs(latest - index) < 0.45`, clicking ArrowDown once sets the scroll target to `0.5`, making **no section active** (both Hero and Stats will have `pointer-events: none` and be half-faded).

### B. Fixed Spacing & Sizing in CSS (`index.css`)
Several CSS styles take up excessive vertical space, aggravating the height overflows:
* Card paddings: `.service-card` has `padding: 3rem 2.5rem;` which is highly padded.
* Title margins: `.section-title` has `margin-bottom: 3rem;` and `.cta-banner` has `margin: 6rem auto;`.
* Footer inclusion: The footer is placed *inside* the Contact Section (index 6). This stacks the contact card and footer vertically inside the same `SectionWrapper`, causing it to overflow.

---

## 4. Proposed Layout Styling Adjustments

To resolve these layout fitting and scroll issues, we can proceed with one of two paths.

### Path A: Refined Absolute Virtual Scroll (Preserving 3D Slides)

If we want to maintain the absolute layout with 3D depth transitions, we must fix the scroll-hijacking and spacing bugs:

#### 1. Fix Scroll Hijacking (Selective Stop Propagation)
To allow scrolling within `.section-content-container` when it overflows, we can stop scroll events from bubbling up to the window when the container has scrollable content.

We can attach a handler to `.section-content-container`'s wheel and touch events:
```javascript
// Example helper for wheel events
const handleInnerWheel = (e) => {
  const container = e.currentTarget;
  const isScrollingDown = e.deltaY > 0;
  
  // Check if there is scrollable content remaining
  const canScrollDown = container.scrollHeight - container.scrollTop > container.clientHeight + 1;
  const canScrollUp = container.scrollTop > 0;
  
  if ((isScrollingDown && canScrollDown) || (!isScrollingDown && canScrollUp)) {
    // Let the container scroll naturally and block the page-switch listener
    e.stopPropagation();
  }
};
```
Similarly, we can track `touchmove` delta on the container and stop propagation if the container can scroll.

#### 2. Introduce Mobile Carousels (Grids to Horizontal Swipers)
To eliminate vertical overflow on mobile devices, we can convertstacked vertical grids into horizontally scrollable rows for screens under `768px`.
* Change `.services-grid`, `.work-grid`, and `.process-grid` on mobile:
  ```css
  @media (max-width: 768px) {
    .services-grid, .work-grid, .process-grid {
      display: flex !important;
      flex-direction: row !important;
      overflow-x: auto !important;
      scroll-snap-type: x mandatory;
      padding-bottom: 1rem;
      gap: 1rem !important;
      width: 100%;
    }
    .service-card, .project-card, .process-step {
      flex: 0 0 85% !important; /* Card takes up 85% of screen width */
      scroll-snap-align: center;
    }
  }
  ```
This keeps all content fitting perfectly within `80vh` without vertical scrolling.

#### 3. Keyboard Increment Bug Fix
Modify `useVirtualScroll.js` to increment by integer values (`1.0` and `-1.0` instead of `0.5`) on ArrowDown/ArrowUp/Space to ensure users land exactly on a section:
```javascript
if (e.key === 'ArrowDown' || e.key === ' ') {
  increment = 1.0;
} else if (e.key === 'ArrowUp') {
  increment = -1.0;
}
```

---

### Path B: Native CSS Snap-Scrolling

This is the recommended approach for modern web standards, accessibility, and smooth performance. It removes absolute positioning for the containers and instead lets the browser handle scroll snapping.

#### 1. Setup Scroll Container (HTML/CSS)
Modify the main wrapper and section elements:
```css
/* Container holds all sections */
.portfolio-scroll-container {
  width: 100vw;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

/* Base sections act as anchors */
.scroll-section {
  width: 100vw;
  height: 100vh;
  scroll-snap-align: start;
  position: relative;
}
```

#### 2. Bind Scroll Progress to Framer Motion & Three.js
In `App.jsx`, instead of virtual scrolling, we track the native scroll position using Framer Motion's `useScroll`:
```javascript
import { useScroll, useSpring, useTransform } from 'framer-motion';

function MainPortfolioView() {
  const containerRef = useRef(null);
  
  // Track scroll position of the native scroll container
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  
  // Transform scroll progress (0.0 to 1.0) into section indices (0.0 to 6.0)
  const scrollIndex = useTransform(scrollYProgress, [0, 1], [0, 6]);
  
  // Pass it through a spring to keep the 3D canvas smooth
  const smoothScroll = useSpring(scrollIndex, {
    stiffness: 50,
    damping: 25
  });

  return (
    <div ref={containerRef} className="portfolio-scroll-container">
      {/* 3D Canvas fixed in the background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Canvas>
          <Scene scrollSmooth={smoothScroll} />
        </Canvas>
      </div>

      {/* Render sections sequentially in normal scroll flow */}
      <div className="scroll-section"><HeroSection /></div>
      <div className="scroll-section"><StatsSection /></div>
      <div className="scroll-section"><ServicesSection /></div>
      <div className="scroll-section"><ProcessSection /></div>
      <div className="scroll-section"><WorkSection /></div>
      <div className="scroll-section"><ShowcaseSection /></div>
      <div className="scroll-section"><ContactSection /></div>
    </div>
  );
}
```
*Note: In this path, `DOMOverlay.jsx` is refactored from absolute overlay positioning to direct in-flow sections (`.scroll-section`), which ensures standard scroll mechanics work perfectly, including keyboard page down, spacebar, and touch scrolling. The 3D scene in the background still animates dynamically as the user scrolls.*

#### 3. Mobile Fallback (Disable Snap on Small Viewports)
On mobile devices, snap-scrolling can feel rigid. We can disable it via media query:
```css
@media (max-width: 768px) {
  .portfolio-scroll-container {
    scroll-snap-type: none;
    overflow-y: auto;
    height: auto;
  }
  .scroll-section {
    height: auto; /* allow sections to expand to fit their text content */
    min-height: 100vh;
    padding: 4rem 1.5rem;
  }
}
```
This guarantees that mobile users have a completely natural scrolling page, preventing any text clipping or overlapping issues.
