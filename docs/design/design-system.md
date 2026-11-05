# THE UNWRITTEN — Design System Specification

## 1. Design Language: Dark Chiaroscuro & Academic Editorial
THE UNWRITTEN's visual identity unites vintage literary mystery with precise academic rigor:
- **Atmospheric Palette**: Deep obsidian (`#12100E`), warm charcoal (`#1C1917`), antique brass (`#C8B28E`), crimson alert (`#9E6B68`), emerald verified (`#52B788`, `#545E4E`), and archival ivory (`#FAF7F2`).
- **Typography Pairing**:
  - Headings & Narrative: Serif typography (`font-serif`) for cinematic graphic-novel weight and literary authority.
  - Controls, Badges & Mathematical Elements: Monospace (`font-mono`) and clean sans-serif (`font-sans`) for legibility.

## 2. Core Color Tokens
```css
--bg-void: #0E0C0A;
--bg-stage: #141210;
--bg-panel: #1C1917;
--bg-paper: #FAF7F2;
--bg-subtle: #F3EDE2;

--accent-brass: #C8B28E;
--accent-forest: #545E4E;
--accent-emerald: #52B788;
--accent-crimson: #9E6B68;
--accent-vermilion: #A83232;

--border-dark: #2E2822;
--border-light: #DDD4C5;
```

## 3. UI Component Standards
- **Buttons**:
  - `ivory`: Primary story CTA with high contrast and subtle shadow.
  - `secondary`: Ghost dark button with translucent brass/emerald borders.
  - `primary`: Forest green academic action button.
- **Modals**: Backdrop blur (`backdrop-blur-md`), dark charcoal container, rounded-2xl border with 1px stroke.
- **HUD Bars**: Fixed top/bottom positioning with gradient falloffs to ensure dialogue and stage artwork are never clipped or obstructed.

