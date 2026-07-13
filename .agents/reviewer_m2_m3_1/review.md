# Review & Adversarial Challenge Report — Snap-Scrolling & Mobile Grid Layouts

## Part 1: Quality Review Report

**Verdict**: REQUEST_CHANGES

---

## Findings

### [Major] Finding 1: Mobile Horizontal Swiper Row Interception
- **What**: The window-level `touchmove` event listener calls `e.preventDefault()` unconditionally for every touch gesture.
- **Where**: `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` (lines 60-61)
- **Why**: In `index.css`, the `.services-grid`, `.work-grid`, and `.process-grid` are formatted as horizontal swiping flex rows on mobile viewports (`max-width: 768px`). However, when a user swipes horizontally to navigate these carousels, the gesture bubbles up to the `window` and is intercepted. Calling `e.preventDefault()` unconditionally blocks native horizontal scroll snapping. This makes the horizontal swiper rows on mobile viewports completely locked and unusable.
- **Suggestion**: Calculate both vertical (`deltaY`) and horizontal (`deltaX`) displacement in `handleTouchMove`. Only call `e.preventDefault()` if the movement is predominantly vertical (i.e. `Math.abs(deltaY) > Math.abs(deltaX)`).

### [Major] Finding 2: Card Overflow Scrolling Blocked
- **What**: Unconditional `e.preventDefault()` in `handleWheel` and `handleTouchMove` blocks scrolling inside scrollable containers.
- **Where**: `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` (lines 45 and 61)
- **Why**: The portfolio's section cards (such as Services and Work) use a custom scrollbar wrapper (`.section-content-container`) with `max-height: 85vh` (or `80vh` on mobile) and `overflow-y: auto`. On smaller desktop viewports or when text content is long, these cards become scrollable. However, if a user hovers over the card and attempts to scroll via mouse wheel or touch swipe, the event is immediately captured by the window listeners, calling `e.preventDefault()` and triggering a viewport snap. As a result, users cannot scroll or read overflow content inside the cards.
- **Suggestion**: Check if the event target (`e.target`) is inside a scrollable container (e.g. `.section-content-container`). If the container has remaining scrollable area in the direction of scrolling, allow propagation and do not prevent default or trigger snaps.

### [Major] Finding 3: Over-Aggressive Cooldown Lockout of Navbar and Dot Indicators
- **What**: Overriding `scrollTarget.set` globally locks out programmatic target settings during the transition cooldown.
- **Where**: `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` (lines 21-24)
- **Why**: Programmatic navigation clicks (navbar links and dot indicators) are subjected to the same `isLockedRef` cooldown as physical scrolling. If a user scrolls once (activating the 1000ms cooldown) and immediately clicks "Contact" in the navbar, the click is discarded. This makes navbar clicks feel sluggish or unresponsive.
- **Suggestion**: Remove the global override on `scrollTarget.set`. Instead, enforce the `isLockedRef` check inside the input event listeners (`handleWheel`, `handleTouchMove`, and `handleKeyDown`). Programmatic sets from the navbar/dots will bypass the lockout and remain responsive.

### [Minor] Finding 4: Missing Safety Check on `e.touches` Array
- **What**: Accessing `e.touches[0]` directly without verifying that the array is non-empty.
- **Where**: `C:\Serdar\portfolio\src\hooks\useVirtualScroll.js` (line 64)
- **Why**: In certain mobile browser edge cases or automated testing environments, touchmove events may fire with empty touch lists. Accessing index `0` directly can raise a `TypeError`, halting execution.
- **Suggestion**: Add a check at the beginning of `handleTouchMove`: `if (!e.touches || e.touches.length === 0) return;`.

---

## Verified Claims

- **Grid formatting on mobile viewports** &rarr; verified via visual code inspection of `index.css` &rarr; **PASS**
  - Mobile media query (lines 1061-1100) correctly converts `.services-grid`, `.work-grid`, and `.process-grid` to flex-row horizontal rows (`flex: 0 0 85% !important`, `overflow-x: auto !important`, `scroll-snap-type: x mandatory`).
- **Cooldown Lock implementation** &rarr; verified via code inspection of `useVirtualScroll.js` &rarr; **PASS**
  - Lock duration is set to `1000ms`, which aligns with the slow decay of the spring configuration (`stiffness: 50`, `damping: 25`, overdamped $\zeta \approx 1.76$).
- **Keyboard navigation keys** &rarr; verified via code inspection of `useVirtualScroll.js` &rarr; **PASS**
  - Properly overrides standard navigation keys (`ArrowDown`, ` `, `PageDown`, `ArrowUp`, `PageUp`) and converts them to discrete section jumps.

---

## Coverage Gaps

- **Touch gesture direction analysis** — risk level: **HIGH** — recommendation: **Investigate**
  - The gesture tracker does not distinguish horizontal swipes from vertical swipes. This breaks the mobile swiper rows.
- **Scroll target bounds analysis** — risk level: **MEDIUM** — recommendation: **Investigate**
  - The wheel handler does not check if the event target is scrollable, causing card scroll blocks.

---

## Unverified Items

- **Visual layout and 3D rendering alignment** — reason: terminal command permissions for running local server (`npm run dev`/`build`) timed out. Code syntax and logic have been verified manually.

---
---

## Part 2: Adversarial Challenge Report

**Overall risk assessment**: HIGH

---

## Challenges

### [Critical] Challenge 1: Mobile Swipe Hijack
- **Assumption challenged**: All touch swipe gestures are intended to slide the entire page vertically.
- **Attack scenario**: A user on a mobile device swipes horizontally on the Services carousel to view the next card.
- **Blast radius**: The swipe gesture is intercepted. The carousel cards are locked and do not move. If the swipe has any vertical component, the page is abruptly snapped to the next vertical section (Process), frustrating the user.
- **Mitigation**: Track `touchStartX` and calculate `deltaX` alongside `deltaY`. If `Math.abs(deltaX) > Math.abs(deltaY)`, allow default behavior and do not snap.

### [High] Challenge 2: Scrollable Container Lock
- **Assumption challenged**: Desktop mouse scrolling is always intended to scroll sections.
- **Attack scenario**: A user is viewing the Services section on a small laptop screen. The content exceeds `85vh`, causing the scrollable card to display a scrollbar. The user attempts to use the mouse wheel to read the last bullet point on the card.
- **Blast radius**: The wheel scroll is intercepted, preventing the user from reading the content. Instead, the page immediately snaps to the Process section.
- **Mitigation**: Only prevent default and snap sections if the scroll event does not originate within a scrollable card container, or if the card container has already reached its scroll boundaries (top/bottom).

### [Medium] Challenge 3: Navigation Jam
- **Assumption challenged**: A user only clicks one navigation element per second.
- **Attack scenario**: A user scrolls down one section, changing their mind and clicking "Work" in the navbar, or clicks "Services" followed immediately by "Contact" in the header menu.
- **Blast radius**: The navigation target change is discarded because the cooldown lock is active. The navbar links feel broken or intermittent.
- **Mitigation**: Remove the lock wrapper from `scrollTarget.set`. Check the lock only inside wheel, touch, and key input listeners.

---

## Stress Test Results

- **Rapid scroll + navbar click** &rarr; expected: navbar click overrides transition and jumps to target &rarr; actual: navbar click is discarded during the 1000ms cooldown &rarr; **FAIL**
- **Horizontal swipe on mobile carousel** &rarr; expected: carousel scrolls horizontally &rarr; actual: touch movement is blocked, or page vertical snap triggers &rarr; **FAIL**
- **Mouse scroll inside overflow card** &rarr; expected: text inside card scrolls &rarr; actual: card does not scroll; page snaps to next section &rarr; **FAIL**
