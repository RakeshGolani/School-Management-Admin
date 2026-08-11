---
name: UI Component Refactoring & Aesthetic Enhancement
description: Detailed workflow guidelines for refactoring Next.js / Tailwind CSS UI components with high aesthetic standards and stable layouts.
---

# UI Component Refactoring Skill

## Workflow
1. **Analyze Design System**: Inspect existing project color tokens, Tailwind configuration, glassmorphic styling, and spacing patterns before making changes.
2. **Dynamic UI Behaviors**:
   - For dropdowns/selects: calculate viewport space to automatically position overlays (opening top vs. bottom).
   - For tooltips: render via React Portals (`document.body`) to prevent horizontal scrollbars on scrollable containers. Wrap all action buttons, edit/delete links, and status toggles with `@/components/ui/Tooltip` for enhanced user guidance.
   - For flexbox layouts: use explicit `shrink-0` and minimum height constraints (`min-h-[...]`) to avoid vertical content jumps during data fetch states.
3. **Environment & API URLs**:
   - Avoid hardcoding static domain paths (such as `http://localhost:5000`). Always reference environment variables such as `process.env.NEXT_PUBLIC_BASE_URL` or `process.env.NEXT_PUBLIC_API_URL` with a default fallback.
4. **Verification**: Always run `npm run build` or the dev compiler to verify that syntax, imports, and hydration remain 100% clean.
5. **Off-Canvas Drawers**:
   - For side-panels/drawers: implement sliding transition layouts (e.g. using `animate-in slide-in-from-right`).
   - For drawer forms: separate fields and buttons using a `flex flex-col overflow-hidden` wrapper. Place form fields inside a scrollable `div` (`flex-1 overflow-y-auto`) and position submit actions inside a fixed bottom footer (`shrink-0 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md`) so buttons remain accessible.
6. **High-Fidelity Loading Skeletons**:
   - Avoid generic loading indicators (like spinners).
   - Design layout-matched skeletons with `animate-pulse` blocks that replicate the exact grid structures, avatar shapes, badges, and detail row counts of the page to provide smooth user experience.
   - Extract skeleton UI blocks into clean modular components in `src/components/skeletons` directory for reusability.
