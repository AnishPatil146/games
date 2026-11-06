# THE UNWRITTEN — Master Environment & Background Replacement Audit

**Audit Date:** 2026-11-06  
**Status:** Active Overhaul & Production Integration  
**Target Architecture:** Complete high-resolution illustrated environment artwork across Junior, Senior Solo, and Multiplayer Alliance experiences. All legacy PIL-generated geometry, empty grey keyholes, and unrendered backgrounds are systematically decommissioned.

---

## 1. Executive Summary & Audit Baseline

An exhaustive audit of the codebase revealed that while character sprites were successfully upgraded to high-resolution illustrated art, several scene environments still relied on procedurally generated PIL geometric drawings (`scripts/generate_all_storyboard_art.py`), placeholder color gradients, or repeated assets. 

This overhaul replaces every environment with full-depth, 16:9 widescreen illustrated environments adhering to the established bande-dessinée / French-Belgian graphic novel aesthetic, featuring:
- **Foreground, Midground, and Background architectural depth.**
- **Natural lighting, shadows, and perspective lines.**
- **Dedicated character staging space with realistic floor contact.**
- **Integration across all game routes (Junior, Senior Solo, Alliance Co-op, Homepage).**

---

## 2. Complete Scene-by-Scene Environment Mapping

### A. Junior Experience ("THE ACADEMY")

| Scene / Context | Legacy Asset / State | Upgraded Environment Asset | Component Path | Visual Description |
| :--- | :--- | :--- | :--- | :--- |
| **Academy Main Gate / Entrance** | Static flat library crop | `/art/environments/env_junior_academy_entrance.jpg` | `src/app/junior/page.tsx`, `CharacterSelectScreen.tsx` | Grand collegiate Gothic portico at twilight, sweeping flagstone steps, stone balustrades, and warm amber lanterns. |
| **Grand Library** | General crop / repeated | `/art/environments/env_junior_grand_library.jpg` | `BoardPrepHub.tsx`, `RevisionCentre.tsx` | Multi-story academic rotunda with mahogany shelves, rolling ladders, oak reading tables, and amber study lamps. |
| **Mathematics Laboratory** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_math_lab.jpg` | `PerformanceAnalyticsPanel.tsx`, `attempt/[attemptId]` | Inspiring lecture hall with blackboards filled with conic sections, 3D geometric polyhedra models, and brass drafting tools. |
| **Physics Laboratory** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_physics_lab.jpg` | `attempt/[attemptId]` (Sci-Physics) | Historic experimental lab with brass optical benches, prism light spectra, pendulums, galvanometers, and vacuum tubes. |
| **Chemistry Laboratory** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_chemistry_lab.jpg` | `attempt/[attemptId]` (Sci-Chemistry) | Marble-topped benches with jewel-toned glassware, periodic table wall mount, analytical scales, and fume hoods. |
| **Biology Laboratory** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_biology_lab.jpg` | `attempt/[attemptId]` (Sci-Biology) | Conservatory laboratory with botanical specimens, anatomical charts, brass binocular microscopes, and garden views. |
| **Examination Hall** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_exam_hall.jpg` | `CompetitiveExamHub.tsx`, `attempt/[attemptId]` | Monumental vaulted hall with aligned examination desks, parchment folios, inkwells, and high lancet windows. |
| **Achievement & Honors Hall** | None (Dark `#0F0D0C`) | `/art/environments/env_junior_achievement_hall.jpg` | `AchievementsPanel.tsx`, `result/[attemptId]` | Ceremonial gallery with marble reflections, gilded trophy display cabinets, academic banners, and triumphal arch. |

---

### B. Senior Solo Campaign (The Investigation)

| Scene / Level | Legacy Asset | Upgraded Environment Asset | Resolution & Description |
| :--- | :--- | :--- | :--- |
| **Prologue / Mansion Exterior** | `solo_prologue.jpg` (PIL line art) | `/art/backgrounds/solo_prologue.jpg` | Victorian Gothic Archive Mansion facade enveloped in evening fog with arched carriage gates. |
| **Level 01: The Wake Up** | Defective modern clock (10:10) | `/art/backgrounds/solo_l1_wakeup.jpg` | High-res Victorian observation cell with vintage brass clock frozen at **07:45** and security blast door. |
| **Level 02: The Three Doors** | `solo_l2_three_doors.jpg` (PIL lines) | `/art/backgrounds/solo_l2_three_doors.jpg` | Vaulted subterranean stone hall with 3 distinct arched portals: Brass, Chalk-White Stone, and Wrought-Iron. |
| **Level 03: The Forgotten Room** | `solo_l3_forgotten_room.jpg` (PIL lines) | `/art/backgrounds/solo_l3_forgotten_room.jpg` | Sequestered evidence study with mahogany research desks, green banker lamps, evidence corkboard, and specimen jars. |
| **Level 04: Interrogation Room** | `solo_l4_interrogation.jpg` (PIL lines) | `/art/backgrounds/solo_l4_interrogation.jpg` | High-security custody room with two-way mirror, steel table, and stark overhead industrial pendant lamp. |
| **Level 05: Mirror Maze** | `solo_l5_mirror_maze.jpg` (PIL lines) | `/art/backgrounds/solo_l5_mirror_maze.jpg` | Surreal subterranean labyrinth of tarnished gilded mirrors reflecting infinite corridors and moonlight. |
| **Level 06: Last Human** | `solo_l6_last_human.jpg` (PIL lines) | `/art/backgrounds/solo_l6_last_human.jpg` | Panoramic cognitive panopticon overlooking the subterranean machinery and observation pods. |
| **Level 07: Impossible Second** | `solo_l7_impossible_second.jpg` (PIL lines) | `/art/backgrounds/solo_l7_impossible_second.jpg` | Chronological pendulum chamber with colossal clockwork escapements and brass gear mechanisms. |
| **Level 08: Final Truth** | `solo_l8_final_truth.jpg` (PIL lines) | `/art/backgrounds/solo_l8_final_truth.jpg` | The Architect's inner sanctum with obsidian floor, oscilloscope monitors, and panoramic abyss view. |

---

### C. Multiplayer Alliance Campaign (The Cooperative Experiment)

| Scene / Chamber | Legacy Asset | Upgraded Environment Asset | Resolution & Description |
| :--- | :--- | :--- | :--- |
| **Alliance Headquarters** | `alliance_lobby.jpg` (PIL lines) | `/art/backgrounds/alliance_lobby.jpg` & `env_alliance_warroom.jpg` | Subterranean bunker war room with circular holographic tactical table, radar monitors, and steel blast gates. |
| **Chamber 01: First Lock** | `alliance_l1_first_lock.jpg` (PIL lines) | `/art/backgrounds/alliance_l1_first_lock.jpg` | Massive circular vault door with interlocking dual brass cogs, rotating tumblers, and iron gangways. |
| **Chamber 02: Vampire's Gambit** | `alliance_l2_vampire_offer.jpg` (PIL lines) | `/art/backgrounds/alliance_l2_vampire_offer.jpg` | Count Vesper's gothic parlor with colossal marble chessboard table, candelabras, and stained glass lancets. |
| **Chamber 03: Mind Snap** | `alliance_l3_mind_snap.jpg` (PIL lines) | `/art/backgrounds/alliance_l3_mind_snap.jpg` | Collaborative analytical arena with suspended crystalline grid panels and tactical workstations. |
| **Chamber 04: The Imposter** | `alliance_l4_imposter.jpg` (PIL lines) | `/art/backgrounds/alliance_l4_imposter.jpg` | Cross-examination hall with acoustic baffles, circular operative pods, and harsh spotlight cones. |
| **Chamber 05: Memory Vault** | `alliance_l5_memory_vault.jpg` (PIL lines) | `/art/backgrounds/alliance_l5_memory_vault.jpg` | Vast rotunda lined with hundreds of illuminated vertical glass cylinders filled with luminescent memory fluids. |
| **Chamber 06: Human Choice** | `alliance_l6_human_choice.jpg` (PIL lines) | `/art/backgrounds/alliance_l6_human_choice.jpg` | Divergent suspension bridge overlooking a deep cavern with twin bi-directional routing controls. |
| **Chamber 07: Breaking Point** | `alliance_l7_breaking_point.jpg` (PIL lines) | `/art/backgrounds/alliance_l7_breaking_point.jpg` | Reactor core catwalk with flashing hazard strobes, fractured containment shields, and venting steam. |
| **Chamber 08: Final Betrayal** | `alliance_l8_final_betrayal.jpg` (PIL lines) | `/art/backgrounds/alliance_l8_final_betrayal.jpg` | Core reactor dilemma chamber with two brass pedestals, split terminal levers, and glowing central energy rift. |

---

## 3. Character and Background Layering Specifications

To avoid "pasted cutout" visual artifacts:
1. **Natural Footing / Ground Plane:** Staging horizons are aligned with the perspective lines of the floor flagstones or parquet.
2. **Contact Occlusion:** 25% soft radial contact shadow placed beneath character sprite bases (`filter: drop-shadow(0 14px 28px rgba(0,0,0,0.65))`).
3. **Lighting Harmony:** Ambient tone matching (cool blue-grey for Solo investigation, warm amber-sepia for Junior Academy, high-contrast cyan/crimson for Alliance war room).
4. **Cinematic Vignette:** 12% radial edge vignette applied uniformly to bind character layers and background into a unified frame.

