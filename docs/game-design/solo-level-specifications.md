# THE UNWRITTEN — SOLO CAMPAIGN LEVEL SPECIFICATIONS

**Campaign:** THE MIND EXPERIMENT  
**Protagonist:** Aarav ALONE (lone investigator; no partner present)  
**Version:** 2.0.0  
**Updated:** 2026-11-04

---

### Level 1: THE WAKE UP
- **Chamber:** Observation Cell 09
- **Atmosphere:** Cold concrete, dim amber emergency lights, steel reinforced blast door.
- **Narrative:** Aarav wakes up with acute amnesia in a locked cell.
- **Gameplay:**
  - Interactive Hotspots: Rusty desk drawer (finds note: "locked at 07:45"), frozen wall clock (stopped at 7:45).
  - Heavy Blast Door: Opens `DialLockModal`.
  - Dial Lock Keypad: 4 rotating brass cylinders. Entering `0745` unlocks the door.

### Level 2: THREE DOORS
- **Chamber:** The Chamber of Paradox
- **Atmosphere:** Ancient vaulted stone corridor with three massive portals.
- **Narrative:** Inscriptions on the stone archway outline a logical paradox.
- **Gameplay:**
  - Door of Oak: Claims "The iron door speaks absolute truth."
  - Door of Chalk: Claims "The oak door speaks falsehood."
  - Door of Iron: Claims "The center door leads to salvation."
  - Deduction: Choosing the Door of Chalk resolves the mutual paradox without contradiction.

### Level 3: THE FORGOTTEN ROOM
- **Chamber:** The Memory Study
- **Atmosphere:** Victorian library, dust motes dancing in green gaslamp light.
- **Narrative:** The Warden tests Aarav's perceptual reliability.
- **Gameplay:**
  - Observation phase: Player inspects room catalog.
  - Anomaly detection: Identify the missing artifact (the vintage brass mantel clock).

### Level 4: THE INTERROGATION
- **Chamber:** The Concrete Annex
- **Atmosphere:** Stark single-bulb interrogation room.
- **Narrative:** Cross-examining Mr. Halden to expose who authorized the security purge.
- **Gameplay:**
  - Analyze 3 testimonies.
  - Identify the timeline contradiction: Halden claims he locked the ledger at midnight, but the station records confirm the midnight train was delayed until 01:15.

### Level 5: THE MIRROR MAZE
- **Chamber:** The Art-Deco Hall of Reflections
- **Atmosphere:** Infinite gilded mirrors, distorted reflections, foggy glass floors.
- **Narrative:** Aarav must navigate through optical illusions to reach the courtyard.
- **Gameplay:**
  - Navigable 2D spatial maze (`InteractiveMaze.tsx`).
  - Arrow keys / WASD / on-screen D-pad controls.
  - Avoid mirror traps that disorient navigation; reach the green exit threshold.

### Level 6: THE LAST HUMAN
- **Chamber:** The Flooded Ruins at Dusk
- **Atmosphere:** Sunken laboratory with failing life-support.
- **Narrative:** Finding Mira injured; resources are insufficient to guarantee both survive.
- **Gameplay:**
  - Moral resource triage: Surrender antibiotics to save Mira, or keep them to guarantee personal survival.

### Level 7: THE IMPOSSIBLE SECOND
- **Chamber:** Primary Reactor Core
- **Atmosphere:** Flashing red sirens, escaping steam, countdown siren.
- **Narrative:** Cascade reactor failure requiring immediate 15-second power rerouting.
- **Gameplay:**
  - 15-second real-time triage console.
  - Rapid priority allocation to stabilize critical systems without overloading auxiliary grids.

### Level 8: THE FINAL TRUTH
- **Chamber:** The Central Observation Monolith
- **Atmosphere:** High-tech biometric panopticon overlooking the facility.
- **Narrative:** Confrontation with the Warden; synthesizing evidence from prior chambers.
- **Gameplay:**
  - Synthesize choices from Levels 1-7 to unlock one of 4 distinct narrative endings:
    1. **The Survivor** (individual pragmatism)
    2. **The Mastermind** (tactical dominance)
    3. **The Humanist** (unwavering empathy)
    4. **The Unpredictable** (disruptive unconventional choices)

