# plan.md — DOM Content Layout Redesign

## Architecture & Scope
The goal of this task is to completely redesign the DOM content layout of the existing 3D snap-scroll portfolio website to solve cramped text, disorientation due to alternating layout, 3D/text overlap, and cut-off card grids.

### Target Files
- `src/components/DOMOverlay.jsx`: Contains the DOM section elements and layout alignments.
- `src/components/CentralMesh.jsx`: Contains the 3D model positions and scale properties for desktop and mobile.
- `src/index.css`: Global styles, layout dimensions, grid rules, scroll behavior, and styling.

---

## Milestones

### Milestone 1: Assess & Align Layout Design
- **Goal**: Detailed codebase review, defining the exact CSS changes, class name structures, and design choices.
- **Tasks**:
  1. Explore current styles, classes, and positions.
  2. Map out how text and card elements are structured.
  3. Formulate the precise CSS layout specs (width, alignment, padding).
- **Status**: Planned

### Milestone 2: Redesign DOM Overlay Sections & CSS Core
- **Goal**: Align all content overlays consistently to the left (or center for Hero, Showcase, Contact) to eliminate the disorienting alternating left/right layout.
- **Tasks**:
  1. Modify `DOMOverlay.jsx` section wrappers so Stats and Process align left.
  2. Redesign sections (Hero, Stats, Services, Process, Work, Showcase, Contact) in `DOMOverlay.jsx` for readability, text proportions, and spacious margin/padding.
  3. Ensure headers and text sizes scale beautifully.
- **Status**: Planned

### Milestone 3: Implement Horizontal Card Grid Usability
- **Goal**: Transition card-based grids (Services, Process, Work) to horizontal scrollable rows with scroll snap on desktop/mobile to ensure they never overflow vertically.
- **Tasks**:
  1. Refactor CSS class definitions for `.services-grid`, `.process-grid`, and `.work-grid` to support horizontal flex containers with scrollbars.
  2. Optimize card widths (e.g., `flex: 0 0 350px`) so multiple cards fit neatly, and excess cards are browsable by scrolling horizontally.
  3. Polish card styles and borders for spaciousness and glassmorphism.
- **Status**: Planned

### Milestone 4: Harmonize 3D Object Placement
- **Goal**: Reposition 3D models in `CentralMesh.jsx` to the right-hand side of the screen on desktop to align with left-aligned DOM content.
- **Tasks**:
  1. Update `DESKTOP_PROPERTIES` in `CentralMesh.jsx` to move Stats and Process models to positive x coordinates (e.g., `2.2` or `2.4`).
  2. Fine-tune scale and position values for all desktop/tablet models to ensure no overlap with text overlays.
- **Status**: Planned

### Milestone 5: E2E Verification & Refinement
- **Goal**: Verify that the application builds, runs without compilation/console errors, motion is preserved, and visual quality is perfect.
- **Tasks**:
  1. Execute `npm run dev` and perform verification checks.
  2. Check for browser runtime errors (WebGL/React).
  3. Review layout responsiveness across multiple viewports.
- **Status**: Planned

---

## Interface Contracts
- **Virtual Scroll Integration**: Keep framer-motion hooks and `scrollSmooth`/`scrollTarget` variables intact in `App.jsx` and `DOMOverlay.jsx`.
- **3D Render Environment**: Maintain `Canvas` and `Scene` render properties and animations.

## Team Topology
- **Explorers**: Spawned at start of milestones to analyze and draft changes.
- **Worker**: Implement code edits, run compiles, and execute test verifications.
- **Reviewers**: Validate code correctness, style guidelines, and layout compatibility.
- **Challengers**: Empirically verify responsiveness and accessibility across layout permutations.
- **Forensic Auditor**: Validate that code changes are authentic, with no hardcodings or test bypasses.
