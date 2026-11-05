# Audit of Existing Homepage & Obsolete Visual Assets

**Date:** November 2026  
**Subject:** THE UNWRITTEN — Homepage Architecture & Visual Background Audit

---

## 1. Source of the "Grey Keyhole" Background
The old geometric background is declared in:
- Component: `HeroMonographArtwork` in `src/components/artwork/SceneArtwork.tsx` (Lines 8–100).
- Usage: `src/app/page.tsx` line 8 and rendered at line 72: `<HeroMonographArtwork />`.

### Elements Identified for Complete Removal:
1. **Monolithic Keyhole Arch**: `<path d="M536 560 L536 284 A64 64 0 0 1 664 284 L664 560 Z" fill="url(#doorInterior)" />` which rendered a giant keyhole arch silhouette in the center of the viewport.
2. **Celestial Meridian Rings**: Concentric circles at $(600, 360)$ ($r=250$, $r=310$, ellipse $rx=370, ry=120$) creating geometric compass/keyhole line art.
3. **Perspective Floor Grid**: Floor lines converging to $(600, 560)$ and trapezoidal light polygon `<polygon points="536,560 664,560 830,800 370,800" />`.
4. **Vignette Gradients**: `#heroWarmGlow` radial gradient and static dark scrim `#12100E`.

---

## 2. Existing Character Assets & Identifications
- **Aarav (`/art/characters/aarav_*.png`)**: Reluctant Investigator, dark coat, expressive detective aesthetics. Perfectly fits Character 02 (Senior Solo Campaign protagonist).
- **Aanya (`/art/characters/aanya_*.png`)**: Analytical Observer, trench coat, pocket watch, braid. Fits Character 03 (Senior Alliance co-op squad member alongside Aarav & Warden).
- **Junior Character**: Currently missing dedicated student protagonist visual identity for Character 01 (Junior Learning Arena). Requires original artwork (Rohan / Priya / Ananya — an earnest, scholarly student in contemporary academic uniform/attire).

---

## 3. Four Required Dedicated Environments
1. **Environment A (Selection World)**: `/art/environments/env_initial_selection.jpg` — Exterior of the Gothic-Brutalist Institute at twilight/night with glowing arched windows, grand portico, atmospheric fog, wet flagstones.
2. **Environment B (Junior World)**: `/art/environments/env_junior_academy.jpg` — Beautiful, warm sunlit high-tech academy and rotunda library with floating interactive holographic study cards, bookshelves, welcoming light.
3. **Environment C (Senior Solo World)**: `/art/environments/env_senior_investigation.jpg` — Atmospheric, noir-lit detective study and underground archives, evidence board with red strings, green banker's lamp, typewriter, locked heavy steel doors.
4. **Environment D (Senior Alliance World)**: `/art/environments/env_alliance_warroom.jpg` — High-security circular War Room with giant tactical holographic projection table, multi-terminal operator stations, amber alert lamps, four executive leather chairs.

---

## 4. Remediation Plan
1. Completely remove `HeroMonographArtwork` and the SVG keyhole from `src/app/page.tsx`.
2. Generate all 4 rich, high-resolution illustrated environment backdrops in `public/art/environments/`.
3. Generate Character 01 (Junior student protagonist) in `public/art/characters/`.
4. Implement the interactive **Cinematic Player Selection** component (`src/components/home/CharacterSelectScreen.tsx`):
   - Fullscreen interactive environment stage with dynamic cross-fade transitions matching the active or hovered selection.
   - 3 selectable character figures with idle breathing, hover highlights, elevation, and depth.
   - Real-time character dossier panels detailing gameplay objectives.
   - Single-click "ENTER WORLD" action routing to `/junior`, `/solo`, and `/alliance`.
   - Real session state detection (displaying "Continue Chamber X" for returning players).
5. Document all generated assets in `docs/design/homepage-asset-registry.md`.
6. Update Command Centre dashboard with homepage redesign tracking.
