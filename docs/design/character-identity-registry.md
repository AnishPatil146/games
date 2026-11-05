# THE UNWRITTEN — CHARACTER IDENTITY REGISTRY
## Canonical Facial Anatomy, Wardrobe & Visual Identity Specification

**Document Version:** 1.0.0  
**Status:** Canonical & Production Enforced  
**Primary Directive:** Every selectable character identity must possess an entirely original, distinct, recognizable face, skull structure, facial proportions, and styling. **Zero face-cloning, recoloring, or asset-mixing across characters.**

---

## 1. DESIGN PHILOSOPHY & ART DIRECTION

THE UNWRITTEN utilizes a European graphic novel (*bande-dessinée*) illustration style:
- Hand-rendered ink contours with delicate line-weight modulation.
- Gouache-wash volumetric shading and motivated directional lighting.
- Muted atmospheric palettes with localized warm/cool complementary accents.
- Physiognomically accurate human anatomy and natural facial proportions (no cartoonish or anime distortion).
- Distinct character silhouettes, eye spacing, nose bridges, jawlines, and posture.

---

## 2. CANONICAL CHARACTER PROFILES

### CHARACTER 01: JUNIOR — THE SCHOLAR (Academic Reasoning Specialist)
*Original student protagonist for the Class 11 & Class 12 Learning Arena.*

| Spec | Canonical Specification |
| :--- | :--- |
| **Full Name** | Rohan / Kavya Deshmukh (Gender-neutral Scholarly Silhouette) |
| **Age / Role** | 16–17 Years · Secondary & Higher Secondary (FYJC/HSC) Reasoning Scholar |
| **Facial Contour** | Soft, youthful oval contour; refined chin without heavy jawline squaring; gentle cheekbones. |
| **Eyes & Gaze** | Wide-set, expressive almond eyes; warm amber-hazel irises; alert, eager, inquisitive, and intelligent gaze. |
| **Eyebrows** | Naturally arched, clean, slightly soft brows reflecting youthful analytical curiosity. |
| **Nose & Mouth** | Subtle, refined nasal bridge with rounded tip; soft natural lips with a poised, confident expression. |
| **Hairstyle** | Side-parted dark espresso wavy hair with subtle texture and clean student grooming. |
| **Skin Tone** | Warm golden olive with soft peach ambient highlights. |
| **Wardrobe & Props** | Midnight-navy tailored academy blazer with gold embroidered monogram crest on left chest; crisp white spread-collar shirt; deep burgundy and gold diagonal-stripe school tie; cross-body leather messenger bag strap; holding a leather-bound study journal and fountain pen. |
| **Height & Build** | 5'7" (170 cm) · Slender, athletic adolescent build (7.2 heads proportion). |
| **Mode Assignment** | `/junior` — Class 11 & Class 12 Academic Reasoning Arena. |
| **Sprite Asset** | `/art/characters/junior_student.png` (848×1264 RGBA, high-resolution illustrated figure). |

---

### CHARACTER 02: SENIOR — THE INVESTIGATOR (Aarav Kulkarni)
*Established solo protagonist for The Mind Experiment.*

| Spec | Canonical Specification |
| :--- | :--- |
| **Full Name** | Aarav Kulkarni |
| **Age / Role** | 26–27 Years · Private Investigator & Forensic Logician |
| **Facial Contour** | Angular, masculine square jawline; pronounced zygomatic arches; faint 5 o'clock shadow/stubble; distinct brooding intensity. |
| **Eyes & Gaze** | Deep-set, dark obsidian-brown eyes; hooded eyelids; focused, skeptical, piercing detective gaze. |
| **Eyebrows** | Low, thick, furrowed dark brows communicating intense deductive concentration. |
| **Nose & Mouth** | Strong straight aquiline nose with defined bridge; firm, set lips indicating cautious discipline. |
| **Hairstyle** | Layered, slightly tousled dark raven hair falling naturally across the forehead in deliberate disarray. |
| **Skin Tone** | Sun-weathered warm dusky brown with cool shadow gradients. |
| **Wardrobe & Props** | Heavy charcoal-grey wool overcoat with structured lapels; slate-grey crewneck knit sweater; dark charcoal trousers. |
| **Height & Build** | 6'0" (183 cm) · Lean, athletic adult frame (7.8 heads proportion). |
| **Mode Assignment** | `/solo` — The Mind Experiment (8 Subterranean Chambers, Strictly Alone). |
| **Sprite Asset** | `/art/characters/aarav_neutral.png` (848×1264 RGBA, canonical master sprite). |

---

### CHARACTER 03: SENIOR MULTIPLAYER — THE SQUAD (The Last Alliance)
*Synchronous 2–4 player tactical team composition featuring distinct individuals.*

#### Operative A: Aanya Shroff (Tactical & Cryptographic Specialist)
- **Age / Role:** 25 Years · Master Cryptanalyst & Strategic Operative.
- **Facial Contour:** High, sculpted cheekbones, elegant oval face tapering to a delicate yet firm chin.
- **Eyes & Gaze:** Brilliant hazel-green eyes with sharp feline corners; confident, calculating, composed expression.
- **Hairstyle:** Lustrous brunette hair styled into an intricate, thick side braid resting over the left shoulder.
- **Wardrobe:** Tailored taupe belted double-breasted trench coat over a black ribbed turtleneck; vintage gold pocket watch chain pinned to waist sash.
- **Canonical Asset:** `/art/characters/aanya_neutral.png`.

#### Operative B: Aarav Kulkarni (Tactical Lead)
- Preserves the established Aarav identity exactly as specified in Character 02.

#### Operative C: The Warden / Senior Operative (Strategic Architect)
- **Age / Role:** 52 Years · Former Panopticon Architect & Master Tactician.
- **Facial Contour:** Broad, weathered square face; mature forehead furrows; distinguished silver-streaked dark hair; stern grey eyes.
- **Wardrobe:** High-collar midnight-charcoal naval coat with brass clasps over a charcoal tactical turtleneck.
- **Canonical Asset:** `/art/characters/warden_neutral.png`.

#### Squad Composition Asset:
- **Composite Layout:** Aarav on left, Aanya in center-foreground, and Warden on right in unified War Room lighting.
- **Sprite Asset:** `/art/characters/alliance_squad.png` (1200×800 RGBA high-resolution group composition).

---

## 3. STRICT IDENTITY SEPARATION RULES

1. **Facial Geometry Non-Overlap:**
   - Junior's facial mesh features softer jaw curves and larger eye-to-face ratio ($1:4.8$), consistent with adolescent anatomy.
   - Aarav's facial mesh features sharp rectilinear jaw angles and deep-set ocular sockets ($1:5.8$).
   - Aanya's facial mesh features high feminine zygomatic arches and contoured nasal bridge.
   - Under no circumstances may any sprite reuse another character's facial textures, eyes, or mouth.

2. **Wardrobe Palette Differentiation:**
   - **Junior:** Navy blue (`#1A283A`), Gold brass (`#D4AF37`), Burgundy maroon (`#962A2D`).
   - **Aarav:** Charcoal wool (`#2B2E33`), Slate knit (`#42474E`), Obsidian (`#181A1D`).
   - **Aanya:** Olive-taupe trench (`#686358`), Black turtleneck (`#1A1918`), Antique brass (`#C5A880`).
   - **Warden:** Midnight naval grey (`#1E2228`), Steel silver (`#8E949E`).

3. **Solo Mode Absolute Isolation:**
   - Aarav must always stand completely alone in Solo Campaign mode (`/solo`).
   - Zero co-op partners, shadows, or secondary sprites may appear on stage in Solo mode unless narrative dialogue explicitly introduces an NPC suspect (e.g. Mr. Halden in Level 4, Mira in Level 6, Warden in Level 3/8).

---

## 4. REGISTRY VERIFICATION STATUS

- [x] **Character 01 (Junior Scholar):** High-resolution illustrated sprite generated with distinct youthful facial geometry, navy academy blazer, and satchel.
- [x] **Character 02 (Aarav Kulkarni):** Preserved canonical face and charcoal wardrobe across all Solo visual novel scenes.
- [x] **Character 03 (Alliance Squad):** Distinct multi-character tactical ensemble featuring Aanya, Aarav, and Warden.
- [x] **UI Verification:** Responsive character cards, live environment backdrops, and seamless keyboard navigation implemented on `/`.

