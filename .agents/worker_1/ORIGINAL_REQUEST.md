## 2026-07-10T21:56:10Z

You are the Lead Implementer. Your task is to implement the immersive 3D/scroll portfolio experience based on the Oryzo.ai design language.

Read PROJECT.md at C:\Serdar\portfolio\.agents\orchestrator\PROJECT.md and the explorer reports at:
- C:\Serdar\portfolio\.agents\explorer_1\analysis.md
- C:\Serdar\portfolio\.agents\explorer_2\analysis.md
- C:\Serdar\portfolio\.agents\explorer_3\analysis.md

Please implement the following changes in C:\Serdar\portfolio:
1. Create `src/hooks/useVirtualScroll.js`: Virtual scroll hook capturing wheel, touch, and key inputs, returning scrollTarget and smoothScroll (using Framer Motion `useSpring`).
2. Create `src/components/CentralMesh.jsx`: Central 3D mesh that stays centered, using R3F `useFrame` to rotate, scale, cross-fade opacities, and translate positions between [Hero, Stats, Services, Process, Work, Showcase, Contact] based on the smoothScroll value.
3. Replace `src/components/Scene.jsx`: A clean R3F Scene containing ambient/directional lights, environment map (e.g. `<Environment preset="city" />` or similar), floating particles/sparkles, and `<CentralMesh scrollSmooth={smoothScroll} />`.
4. Create `src/components/DOMOverlay.jsx`: A CSS 3D perspectived DOM overlay absolute container. Mount all 7 content sections from `src/data.js` with NO data loss:
   - Hero: include badge, pulsing green dot, headline, tagline, primary and secondary CTA buttons.
   - Stats: 4 statistics in a grid.
   - Services: all 3 services, custom description, features.
   - Process: all 4 steps.
   - Work: all 6 projects with descriptions, tags, and demo links.
   - CTA Banner: "Still reading?" banner with button.
   - Showcase: title, description, and all 3 websites.
   - Contact: title, headline, text, email, CTAs, availability, and reply time.
   - Footer: logo, links, copyright.
   Animate each section's opacity, scale, and translateZ based on smoothScroll using Framer Motion's `useTransform` (perspective container). Ensure `pointer-events: auto` only on the active section.
5. Replace `src/App.jsx`: Set up React Router. In the `/` route, render the Canvas + Scene + DOMOverlay + Navbar + dot indicators. In other routes (like `/showcase`, `/demo/:demoId`), render the corresponding pages from `src/pages`. Ensure navbar clicks and dot clicks smoothly update the virtual scrollTarget.
6. Modify `src/index.css`: Add styling for the virtual scroll, perspective overlays, glassmorphic cards, dot indicators, custom Outfit/Inter fonts, and mobile responsiveness.

Ensure that the project compiles cleanly (run `npm run build` to verify). Verify that `npm run dev` starts without runtime/WebGL errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your report to C:\Serdar\portfolio\.agents\worker_1\handoff.md and send a message back with the compilation/dev outcomes and file path.
