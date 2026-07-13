# Synthesized Technical Plan: Snap Scroll and 3D Spotlight Redesign

## Executive Summary
This document synthesizes the reports from Explorer 1, Explorer 2, and Explorer 3. We will implement discrete snap scrolling (R1) and mobile-responsive content spotlight positions for our 3D models (R2). To address text overflow and scroll-blocking on mobile viewports, we will refactor stacked mobile grids to horizontal swipe carousels.

---

## 1. Cinematic Snap Scrolling (R1)
Currently, `useVirtualScroll.js` increments a Framer Motion `scrollTarget` continuously, resulting in free-scrolling. To lock this to 7 discrete full-screen sections:

### A. Discrete `scrollTarget` Updates
- **Mouse Wheel**: Capture `e.deltaY` direction. If not locked, transition `scrollTarget` to `currentSection + direction` (clamped between `0` and `6`). Ignore delta values below `10px` to filter trackpad inertia.
- **Touch Swipes**: Record `touchstart` Y coordinate. On `touchmove`, if displacement exceeds `50px`, trigger a single section step. Lock further swipe triggers until the user's touch session ends (`touchend`).
- **Keyboard Keys**: Lock arrow and page navigation keys during transitions. Map ArrowDown/Space/PageDown to `+1` and ArrowUp/PageUp to `-1`.

### B. Input Lock and Cooldown
- Subscribe to `scrollTarget.on('change', ...)` inside the hook.
- When `scrollTarget` changes, set an `isLocked` reference to `true` for a `1000ms` cooldown period (matching the spring animation duration). This locks both scroll gestures and clicks on dot/navbar links, ensuring transitions settle before next inputs.

### C. Active Section Optimization
- In `App.jsx`, update the `activeSection` state tracking to listen directly to `scrollTarget.on('change', ...)` instead of `smoothScroll`. This updates indicators instantly when a transition begins, matching modern UX patterns.

---

## 2. Content Spotlight Interactions (R2)
To showcase the 3D models during transitions but keep them from overlapping HTML content when snapped:

### A. Desktop snapped alignments
- Modify `DOMOverlay.jsx` alignments: Hero (left), Stats (right), Services (left), Process (right), Work (left), Showcase (center), Contact (center).
- Set corresponding model positions in `CentralMesh.jsx`:
  - Hero (Index 0): `[2.2, 0, 0]` (far right)
  - Stats (Index 1): `[-2.2, 0.4, 0]` (far left)
  - Services (Index 2): `[2.4, -0.2, 0]` (far right)
  - Process (Index 3): `[-2.4, -0.1, 0]` (far left)
  - Work (Index 4): `[2.2, 0.2, 0]` (far right)
  - Showcase (Index 5): `[0, 1.8, -4.0]` (retreat back-top, scale 0.6, opacity 0.15)
  - Contact (Index 6): `[0, -1.5, -2.0]` (retreat back-bottom, scale 0.8, opacity 0.3)

### B. Mobile snapped alignments (width <= 768px)
- Since text is centered on mobile, models must retreat to the deep background and fade when snapped:
  - Sections 0-4: `[0, -2.0, -3.0]`, scale 1.0, opacity 0.12
  - Showcase (Index 5): `[0, 2.2, -5.0]`, scale 0.6, opacity 0.05 (prevent overlapping device iframes)
  - Contact (Index 6): `[0, -2.2, -2.0]`, scale 0.8, opacity 0.18 (pedestal position)

### C. Transition Spotlight Sweep
- During transitions (`alpha = S - currentSection` where `alpha` goes `0 -> 1`), calculate a sine blending factor `spotlightBlend = Math.sin(alpha * Math.PI)` peaking at `alpha = 0.5`.
- Blend the snapped positions with a center spotlight position `[0, 0.1, 0.8]` using `spotlightBlend * 0.85`.
- Boost the model scale by `1.0 + spotlightBlend * 0.25` (25% swell) and increase emissive glow intensities.

---

## 3. Mobile Grid Sizing & Layout Fixes
To prevent page height overflow and text clipping on mobile viewports:
- In `index.css`, override `.services-grid`, `.work-grid`, and `.process-grid` inside the `@media (max-width: 768px)` query to layout horizontally:
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
      flex: 0 0 85% !important;
      scroll-snap-align: center;
    }
  }
  ```
- This allows mobile users to swipe horizontally to read details of service items, process steps, and projects, ensuring they fit within `80vh` and avoiding clashing with the background 3D canvas.
