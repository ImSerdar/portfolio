# Handoff Report: Layout, CSS, and DOM Overlay Analysis

## 1. Observation
We observed the following configurations, styles, and logic in the project:
* **Directory structure and routing**:
  * `App.jsx` defines a main route `/` rendering `<MainPortfolioView />` containing the `Canvas`, `<Scene />`, `<DOMOverlay />`, and `<DotIndicators />` (lines 94-105).
  * `App.jsx` also defines page routes like `/showcase` and `/demo/:demoId` (lines 159-161).
* **Virtual Scroll Hook**:
  * In `src/hooks/useVirtualScroll.js`, wheel and touch move events are intercepted and default behavior is blocked globally:
    * Wheel listener: `window.addEventListener('wheel', handleWheel, { passive: false });` (line 57).
    * Touch listener: `window.addEventListener('touchmove', handleTouchMove, { passive: false });` (line 59).
    * Wheel preventDefault: `e.preventDefault();` (line 18).
    * Touch preventDefault: `e.preventDefault();` (line 29).
  * Keyboard navigation in `useVirtualScroll.js` changes the scroll target by `0.5` index increments (lines 41-44):
    ```javascript
    if (e.key === 'ArrowDown' || e.key === ' ') {
      increment = 0.5;
    } else if (e.key === 'ArrowUp') {
      increment = -0.5;
    }
    ```
* **DOM Overlay Layout & Styling**:
  * In `src/components/DOMOverlay.jsx`, the layout uses `SectionWrapper` components for the 7 sections.
  * Active sections are determined by `Math.abs(latest - index) < 0.45` (line 31), which enables pointer events (`pointerEvents: active ? 'auto' : 'none'`, line 60).
  * The wrapper's children render inside `<div className="section-content-container custom-scrollbar">` (line 66).
  * In `src/index.css`, the `.section-content-container` is constrained:
    * Desktop: `max-height: 85vh; overflow-y: auto; padding-right: 1rem;` (lines 977-983).
    * Mobile (max-width: 768px): `max-height: 80vh;` (lines 1073-1075).
  * Section layout configurations (`DOMOverlay.jsx`):
    * **Hero (Index 0)**: Small amount of text (~350px).
    * **Stats (Index 1)**: Glass cards with `stats-grid` wrapping to 1 column on mobile (`grid-template-columns: 1fr !important` in `index.css:1077-1080`).
    * **Services (Index 2)**: 3 detailed cards with bullet lists, wrapping to 1 column on mobile (`services-grid` in `index.css:1082-1085`).
    * **Process (Index 3)**: 3 process steps with number/title/description.
    * **Work (Index 4)**: 2 project cards + a CTA Banner inside the section wrapper (lines 213-222).
    * **Showcase (Index 5)**: 3 site cards.
    * **Contact (Index 6)**: Contact glass card + a footer styled in-flow inside the wrapper (lines 278-292).
  * CSS Spacing and padding properties in `src/index.css`:
    * `.service-card` padding: `3rem 2.5rem;` (line 370).
    * `.section-title` margin-bottom: `3rem;` (line 81).
    * `.cta-banner` margin: `6rem auto;` (line 646).
* **3D Scene and Model Interpolation**:
  * In `src/components/CentralMesh.jsx`, the 3D model translates, scales, and fades based on the `scrollSmooth` value (from 0.0 to 6.0) updated by `useVirtualScroll` (lines 230-353).

---

## 2. Logic Chain
1. **Scrolling Bug**:
   * *Observation*: `useVirtualScroll.js` adds global window event listeners for `wheel` and `touchmove` and calls `e.preventDefault()`.
   * *Observation*: `index.css` sets `.section-content-container` to `max-height: 85vh` (desktop) and `max-height: 80vh` (mobile) with `overflow-y: auto`.
   * *Reasoning*: Because the global scroll listeners prevent all default browser scroll mechanics, the scroll events are intercepted before they can scroll the overflow content inside `.section-content-container`. Consequently, any content that overflows the `80vh` / `85vh` limit cannot be scrolled by wheel or touch swipe.
2. **Keyboard Focus Bug**:
   * *Observation*: `useVirtualScroll.js` increments the scroll target by `0.5` on arrow keys, while active sections are defined by `Math.abs(latest - index) < 0.45` in `DOMOverlay.jsx`.
   * *Reasoning*: If the user presses `ArrowDown` once, the index changes from `0` to `0.5`. Since the distance from both index `0` and index `1` is `0.5` (which is not `< 0.45`), both sections will have `pointer-events: none` and be half-faded, rendering the page unresponsive to click interactions.
3. **Responsive Heights Overflow**:
   * *Observation*: On mobile, grids (Services, Work, Showcase) stack to 1 column. 
   * *Reasoning*: The height of 3 stacked cards (Services or Showcase) or 2 cards + CTA banner (Work) exceeds `1000px`, which heavily overflows the `80vh` boundary (approx. 480px-600px on mobile screens). Combined with the scroll hijacking bug, this results in significant, unreadable content cutoffs on mobile and small desktops.
4. **Footer Collision**:
   * *Observation*: The footer is placed inside the Contact wrapper rather than being an independent scroll page.
   * *Reasoning*: Placing both the contact card and the footer within the same `SectionWrapper` causes the height to exceed `85vh` (desktop) and `80vh` (mobile), adding unnecessary vertical height to the final section.

---

## 3. Caveats
* We did not test touch scrolling on physical mobile devices; findings are based on code analysis of `touchstart`, `touchmove`, and styling viewport configurations.
* We assumed that the 3D canvas is expected to remain interactive with mouse parallax while the user is navigating.
* We didn't investigate options to lazy-load the `.gltf` assets in `CentralMesh.jsx` other than observing that they are preloaded at module scope (lines 7-9).

---

## 4. Conclusion
To support absolute or snap-scrolled pages and resolve the text overflow and hijacking bugs, the project layout should be adjusted using one of the following two solutions:
1. **Path A (Refining the current Absolute Virtual Scroll)**:
   * Implement selective stop-propagation on wheel/touch gestures in `.section-content-container` so inner scrolling is preserved.
   * Modify the keyboard handler in `useVirtualScroll.js` to increment/decrement by `1.0` integer steps.
   * Adjust mobile CSS to transform vertically stacked grids (Services, Work, Showcase) into horizontal swipers (carousels) to prevent vertical overflow.
2. **Path B (Native CSS Snap-Scrolling - Recommended)**:
   * Set up a scroll parent with `scroll-snap-type: y mandatory` and normal scrollable children sections.
   * Track native scroll using Framer Motion's `useScroll` hook and transform the progress into the `scrollSmooth` value to drive the Three.js mesh morphing and translations.
   * Disable scroll snapping and set sections to `height: auto` on mobile as a natural vertical flow fallback.

---

## 5. Verification Method
1. **Inspecting Files**:
   * Check `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` to confirm the window event listeners and the `0.5` increment values.
   * Check `C:\Serdar\portfolio\src\components\DOMOverlay.jsx` to confirm section contents and `SectionWrapper` definitions.
   * Check `C:\Serdar\portfolio\src\index.css` to confirm container heights and grid styles.
2. **Running Smoke Test**:
   * Run the local integration test suite by executing `node C:\Serdar\portfolio\test.js` (once the dev server script executes successfully) to check for page load console errors.
3. **Manual Verification**:
   * Open the portfolio site in a browser. Attempt to scroll inside the Services or Work sections using the mouse wheel; verify that they do not scroll and instead change the section (confirming the bug).
   * Press the ArrowDown key once; verify that both section 0 and section 1 fade out halfway and pointer events are blocked (confirming the keyboard bug).
