# THE UNWRITTEN — ASSET PIPELINE & VISUAL SPECIFICATION

**Art Direction:** Dark Cinematic Illustrated Mystery Graphic Novel  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

## 1. Visual Standards

1. **Environments:**
   - 16:9 full-screen illustrated backdrops rendered at high fidelity (`1920x1080` or `1280x720`).
   - Atmospheric lighting: deep shadows, amber candlelight/sirens, dust motes, misty fog depth.
   - Pinned full-viewport container (`fixed inset-0 w-full h-full overflow-hidden`).
   - Delivered via `next.config.ts` unoptimized mode to ensure immediate Vercel CDN availability without image transform failures.

2. **Characters:**
   - Hand-drawn illustrated 2D figures naturally scaled within the scene environment.
   - Aarav: Dark wavy hair, charcoal coat, brown eyes, expressive postures.
   - Aanya: Long dark hair, charcoal trench coat, observant gaze (exclusive to multiplayer).
   - NPCs: The Warden, Count Vesper, Mr. Halden, Mira.
   - Explicit inline coordinate anchors (`left: 50%`, `left: 20%`, `left: 80%`) replacing brittle dynamic classes.

3. **Dialogue & HUD:**
   - Top HUD bar: Pinned `fixed top-0 left-0 right-0 z-40` with campaign title and level index.
   - Bottom Speech Box: Pinned `fixed bottom-0 left-0 right-0 z-40` with speaker portrait, name tag, typography, and interactive choices.

---

## 2. Asset Registry

| Category | File Path | Resolution | Description |
|---|---|---|---|
| Background | `/art/backgrounds/solo_l1_wakeup.jpg` | 1280x720 | Observation Cell 09 with steel door and desk |
| Background | `/art/backgrounds/solo_l2_three_doors.jpg` | 1280x720 | Chamber of Paradox with three arched portals |
| Background | `/art/backgrounds/solo_l3_forgotten_room.jpg` | 1280x720 | Memory Study with Victorian book cases |
| Background | `/art/backgrounds/solo_l4_interrogation.jpg` | 1280x720 | Stark interrogation room with single lamp |
| Background | `/art/backgrounds/solo_l5_mirror_maze.jpg` | 1280x720 | Art-deco gilded hall of mirrors |
| Background | `/art/backgrounds/solo_l6_last_human.jpg` | 1280x720 | Flooded ruins at dusk |
| Background | `/art/backgrounds/solo_l7_impossible_second.jpg` | 1280x720 | Emergency reactor conduit |
| Background | `/art/backgrounds/solo_l8_final_truth.jpg` | 1280x720 | Central biometric panopticon |
| Background | `/art/backgrounds/alliance_lobby.jpg` | 1280x720 | Alliance war room briefing chamber |
| Background | `/art/backgrounds/alliance_l1_first_lock.jpg` | 1280x720 | Great circular glyph vault with Sudoku lock |
| Background | `/art/backgrounds/alliance_l2_vampire_offer.jpg` | 1280x720 | Gothic hall with marble chessboard |
| Character | `/art/characters/aarav_*.png` | 512x768 | Aarav sprites across neutral, speaking, thinking, victory |
| Character | `/art/characters/aanya_*.png` | 512x768 | Aanya sprites across neutral, speaking, thinking |
| Character | `/art/characters/warden_*.png` | 512x768 | Warden sprites across neutral, speaking, amused |
| Character | `/art/characters/vesper_*.png` | 512x768 | Count Vesper sprites across neutral, smiling, defeat |
