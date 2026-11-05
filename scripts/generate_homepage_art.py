import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

BASE_DIR = r"c:\Users\USER\OneDrive\Desktop\games\public\art"
ENV_DIR = os.path.join(BASE_DIR, "environments")
CHAR_DIR = os.path.join(BASE_DIR, "characters")
os.makedirs(ENV_DIR, exist_ok=True)
os.makedirs(CHAR_DIR, exist_ok=True)

W, H = 1920, 1080

def add_paper_grain(img, intensity=10):
    arr = np.array(img, dtype=float)
    h, w, c = arr.shape
    noise = np.random.normal(0, intensity, (h, w, 1))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def draw_vignette(img, strength=0.45):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cx, cy = W // 2, H // 2
    max_r = math.hypot(cx, cy)
    for i in range(16):
        r = max_r * (0.55 + 0.45 * (i / 16))
        alpha = int(255 * strength * ((i / 16) ** 2))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(10, 8, 7, alpha), width=int(max_r * 0.035))
    overlay = overlay.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    return img

# -----------------------------------------------------------------------------
# 1. ENVIRONMENT A: INITIAL SELECTION WORLD (The Night Institute)
# -----------------------------------------------------------------------------
def make_env_selection():
    path = os.path.join(ENV_DIR, "env_initial_selection.jpg")
    img = Image.new("RGBA", (W, H), "#0B0E14")
    d = ImageDraw.Draw(img)

    # Sky gradient: dark indigo night to deep twilight
    for y in range(int(H * 0.65)):
        t = y / (H * 0.65)
        col = (int(8 + 14 * t), int(11 + 18 * t), int(20 + 26 * t), 255)
        d.line([(0, y), (W, y)], fill=col)

    # Stars in upper sky
    random.seed(42)
    for _ in range(120):
        sx = random.randint(0, W)
        sy = random.randint(0, int(H * 0.45))
        s_bright = random.randint(140, 240)
        d.point((sx, sy), fill=(s_bright, s_bright, int(s_bright * 0.95), 255))

    # Distant glowing moon and moonlight halo
    moon_x, moon_y = W // 2 + 320, 160
    for r in range(110, 20, -5):
        alpha = int(45 * (1 - r / 110))
        d.ellipse([moon_x - r, moon_y - r, moon_x + r, moon_y + r], fill=(220, 230, 245, alpha))
    d.ellipse([moon_x - 30, moon_y - 30, moon_x + 30, moon_y + 30], fill=(245, 248, 255, 255))

    # Gothic-Brutalist Institute facade
    facade_y = int(H * 0.28)
    # Main institute central block
    d.rectangle([int(W * 0.15), facade_y, int(W * 0.85), int(H * 0.72)], fill=(18, 20, 26, 255))
    # Pediment / roofline
    d.polygon([
        (int(W * 0.35), facade_y),
        (int(W * 0.50), facade_y - 120),
        (int(W * 0.65), facade_y)
    ], fill=(24, 27, 34, 255), outline=(45, 50, 62, 255))
    # Clock tower spire in center
    d.rectangle([int(W * 0.46), facade_y - 200, int(W * 0.54), facade_y - 120], fill=(20, 22, 28, 255), outline=(42, 48, 60, 255))
    d.polygon([(int(W * 0.46), facade_y - 200), (int(W * 0.50), facade_y - 280), (int(W * 0.54), facade_y - 200)], fill=(30, 34, 44, 255))
    # Glowing tower clock face
    d.ellipse([int(W * 0.50) - 22, facade_y - 180, int(W * 0.50) + 22, facade_y - 136], fill=(240, 225, 185, 255), outline=(60, 50, 35, 255), width=2)

    # Classical Colonnade pillars (8 monumental pillars)
    for i in range(8):
        px = int(W * 0.22 + i * (W * 0.56 / 7))
        pw = 34
        d.rectangle([px - pw // 2, facade_y + 60, px + pw // 2, int(H * 0.72)], fill=(32, 36, 46, 255), outline=(52, 58, 72, 255), width=2)
        # Pillar capital and base
        d.rectangle([px - pw // 2 - 6, facade_y + 50, px + pw // 2 + 6, facade_y + 66], fill=(45, 50, 64, 255))
        d.rectangle([px - pw // 2 - 8, int(H * 0.72) - 16, px + pw // 2 + 8, int(H * 0.72)], fill=(45, 50, 64, 255))

    # Warm amber arched windows behind pillars
    for i in range(6):
        wx = int(W * 0.24 + i * (W * 0.52 / 5))
        wy = facade_y + 110
        # Window glow
        d.rectangle([wx - 26, wy, wx + 26, wy + 160], fill=(225, 175, 80, 220))
        d.arc([wx - 26, wy - 30, wx + 26, wy + 30], 180, 360, fill=(225, 175, 80, 220), width=4)
        # Window mullions
        d.line([(wx, wy - 20), (wx, wy + 160)], fill=(40, 30, 18, 255), width=2)
        d.line([(wx - 26, wy + 60), (wx + 26, wy + 60)], fill=(40, 30, 18, 255), width=2)
        d.line([(wx - 26, wy + 110), (wx + 26, wy + 110)], fill=(40, 30, 18, 255), width=2)

    # Grand central bronze entrance doors
    door_w, door_h = 140, 220
    door_x = int(W * 0.50 - door_w // 2)
    door_y = int(H * 0.72 - door_h)
    d.rectangle([door_x, door_y, door_x + door_w, door_y + door_h], fill=(36, 28, 20, 255), outline=(130, 95, 45, 255), width=4)
    d.arc([door_x, door_y - 40, door_x + door_w, door_y + 40], 180, 360, fill=(130, 95, 45, 255), width=4)
    # Warm amber light spilling from under the doors
    d.polygon([(door_x - 30, int(H * 0.72)), (door_x + door_w + 30, int(H * 0.72)), (door_x + door_w + 140, int(H * 0.82)), (door_x - 140, int(H * 0.82))], fill=(245, 190, 85, 90))

    # Stone courtyard & steps
    courtyard_y = int(H * 0.72)
    for y in range(courtyard_y, H):
        t = (y - courtyard_y) / (H - courtyard_y)
        c = (int(16 + 10 * t), int(18 + 10 * t), int(22 + 8 * t), 255)
        d.line([(0, y), (W, y)], fill=c)

    # Perspective flagstones
    for i in range(-12, 28):
        x1 = W * 0.5 + (i - 7) * 45
        x2 = W * 0.5 + (i - 7) * 165
        d.line([(x1, courtyard_y), (x2, H)], fill=(28, 32, 40, 140), width=2)
    for y in [800, 860, 930, 1000]:
        d.line([(0, y), (W, y)], fill=(28, 32, 40, 120), width=2)

    # Atmospheric volumetric ground fog
    for fy in range(courtyard_y - 40, H, 20):
        t = (fy - courtyard_y + 40) / (H - courtyard_y + 40)
        fog_alpha = int(40 * math.sin(t * math.pi))
        d.rectangle([0, fy, W, fy + 35], fill=(70, 85, 115, fog_alpha))

    # Perimeter wrought-iron gate in foreground
    for gx in range(0, W, 40):
        d.line([(gx, int(H * 0.86)), (gx, H)], fill=(22, 25, 30, 255), width=3)
        # Spear tops
        d.polygon([(gx - 4, int(H * 0.86)), (gx + 4, int(H * 0.86)), (gx, int(H * 0.84))], fill=(40, 45, 55, 255))
    d.line([(0, int(H * 0.88)), (W, int(H * 0.88))], fill=(30, 35, 44, 255), width=4)
    d.line([(0, int(H * 0.96)), (W, int(H * 0.96))], fill=(30, 35, 44, 255), width=4)

    img = img.convert("RGB")
    img = draw_vignette(img, 0.48)
    img = add_paper_grain(img, 11)
    img.save(path, quality=94)
    print("Generated env_initial_selection.jpg")

# -----------------------------------------------------------------------------
# 2. ENVIRONMENT B: JUNIOR ACADEMY / REASONING ARENA
# -----------------------------------------------------------------------------
def make_env_junior():
    path = os.path.join(ENV_DIR, "env_junior_academy.jpg")
    img = Image.new("RGBA", (W, H), "#161E1A")
    d = ImageDraw.Draw(img)

    # Vaulted Academy Rotunda: warm golden daylight pouring through skylights
    for y in range(H):
        t = y / H
        col = (int(22 + 18 * t), int(32 + 20 * t), int(26 + 18 * t), 255)
        d.line([(0, y), (W, y)], fill=col)

    # Tall curved bookshelves along left and right
    for side in ["left", "right"]:
        bx = 0 if side == "left" else int(W * 0.76)
        bw = int(W * 0.24)
        d.rectangle([bx, 80, bx + bw, int(H * 0.78)], fill=(32, 24, 18, 255), outline=(75, 55, 38, 255), width=3)
        # Shelves with books
        for sy in range(120, int(H * 0.76), 65):
            d.line([(bx, sy), (bx + bw, sy)], fill=(90, 68, 48, 255), width=4)
            # Books with rich jewel tones
            cx = bx + 12
            while cx < bx + bw - 15:
                book_w = random.randint(10, 24)
                book_h = random.randint(40, 56)
                book_c = random.choice([
                    (160, 50, 45), (45, 95, 75), (180, 135, 50),
                    (45, 70, 120), (130, 120, 110), (110, 55, 90)
                ])
                d.rectangle([cx, sy - book_h, cx + book_w, sy - 2], fill=book_c + (255,), outline=(30, 22, 16, 255))
                cx += book_w + 3

    # Grand arched central window with bright morning sky
    win_cx, win_cy = W // 2, 340
    win_w, win_h = 560, 420
    d.rectangle([win_cx - win_w // 2, win_cy - 120, win_cx + win_w // 2, win_cy + 220], fill=(210, 230, 235, 255))
    d.arc([win_cx - win_w // 2, win_cy - 240, win_cx + win_w // 2, win_cy], 180, 360, fill=(65, 80, 75, 255), width=6)

    # Luminous sunbeams pouring down diagonally
    sunbeam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sunbeam)
    for bx in [win_cx - 160, win_cx, win_cx + 160]:
        sd.polygon([(bx, win_cy), (bx + 80, win_cy), (bx + 380, H), (bx + 180, H)], fill=(255, 248, 215, 32))
    sunbeam = sunbeam.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, sunbeam)
    d = ImageDraw.Draw(img)

    # Parquet timber floor with geometric compass medallion
    floor_y = int(H * 0.74)
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        d.line([(0, y), (W, y)], fill=(int(48 - 14 * t), int(36 - 10 * t), int(26 - 8 * t), 255))
    # Compass in floor
    d.ellipse([W // 2 - 180, floor_y + 20, W // 2 + 180, floor_y + 140], outline=(170, 140, 75, 140), width=3)
    d.ellipse([W // 2 - 120, floor_y + 40, W // 2 + 120, floor_y + 120], outline=(170, 140, 75, 100), width=2)

    # Floating holographic curriculum displays (Science/Math curves & formulas)
    holo_pads = [
        (int(W * 0.28), 420, 180, 130, "E = mc^2\n\\nabla \\cdot B = 0"),
        (int(W * 0.72 - 180), 420, 180, 130, "\\int_a^b f(x)dx\n\\Delta H = Q")
    ]
    for hx, hy, hw, hh, text in holo_pads:
        d.rectangle([hx, hy, hx + hw, hy + hh], fill=(18, 48, 40, 140), outline=(82, 183, 136, 200), width=2)
        d.line([(hx + 10, hy + 24), (hx + hw - 10, hy + 24)], fill=(82, 183, 136, 120), width=1)
        # Sine wave / formula line in holo display
        for px in range(hx + 15, hx + hw - 15, 2):
            py = hy + 65 + int(18 * math.sin((px - hx) * 0.08))
            d.point((px, py), fill=(120, 240, 180, 240))

    img = img.convert("RGB")
    img = draw_vignette(img, 0.38)
    img = add_paper_grain(img, 9)
    img.save(path, quality=94)
    print("Generated env_junior_academy.jpg")

# -----------------------------------------------------------------------------
# 3. ENVIRONMENT C: SENIOR SOLO WORLD (The Detective Study / Observation Post)
# -----------------------------------------------------------------------------
def make_env_senior():
    path = os.path.join(ENV_DIR, "env_senior_investigation.jpg")
    img = Image.new("RGBA", (W, H), "#120F0C")
    d = ImageDraw.Draw(img)

    # Dark oak wainscoted study with deep amber noir shadows
    for y in range(H):
        t = y / H
        col = (int(18 + 10 * t), int(15 + 8 * t), int(12 + 6 * t), 255)
        d.line([(0, y), (W, y)], fill=col)

    # Investigation Evidence Corkboard in background center
    board_x, board_y = int(W * 0.22), 120
    board_w, board_h = int(W * 0.56), 460
    d.rectangle([board_x, board_y, board_x + board_w, board_y + board_h], fill=(70, 52, 38, 255), outline=(110, 85, 60, 255), width=6)
    # Pinned case file documents and photographs
    pins = [
        (board_x + 60, board_y + 50, 90, 120),
        (board_x + 220, board_y + 80, 110, 90),
        (board_x + 400, board_y + 40, 85, 115),
        (board_x + 580, board_y + 110, 100, 130),
        (board_x + 130, board_y + 240, 120, 85),
        (board_x + 320, board_y + 220, 130, 150),
        (board_x + 520, board_y + 260, 110, 110)
    ]
    for px, py, pw, ph in pins:
        d.rectangle([px, py, px + pw, py + ph], fill=(225, 218, 204, 255), outline=(135, 125, 110, 255), width=1)
        # Red pushpin at top center
        d.ellipse([px + pw // 2 - 4, py - 4, px + pw // 2 + 4, py + 4], fill=(195, 45, 40, 255))
        # Scribbled clue lines
        for ly in range(py + 25, py + ph - 15, 14):
            d.line([(px + 10, ly), (px + pw - 10, ly)], fill=(75, 68, 62, 180), width=1)

    # Red yarn connecting clues (classic detective investigation board)
    red_threads = [
        ((pins[0][0] + 45, pins[0][1] + 60), (pins[1][0] + 55, pins[1][1] + 45)),
        ((pins[1][0] + 55, pins[1][1] + 45), (pins[5][0] + 65, pins[5][1] + 75)),
        ((pins[5][0] + 65, pins[5][1] + 75), (pins[3][0] + 50, pins[3][1] + 65)),
        ((pins[4][0] + 60, pins[4][1] + 40), (pins[5][0] + 65, pins[5][1] + 75)),
        ((pins[2][0] + 40, pins[2][1] + 55), (pins[6][0] + 55, pins[6][1] + 55))
    ]
    for p1, p2 in red_threads:
        d.line([p1, p2], fill=(210, 45, 40, 220), width=2)

    # Heavy mahogany detective desk in foreground
    desk_y = int(H * 0.68)
    d.polygon([
        (int(W * 0.12), desk_y),
        (int(W * 0.88), desk_y),
        (int(W * 0.95), H),
        (int(W * 0.05), H)
    ], fill=(42, 28, 20, 255), outline=(75, 50, 35, 255))

    # Banker's lamp with glowing green glass shade on the desk
    lamp_x, lamp_y = int(W * 0.24), desk_y - 85
    # Brass base and stem
    d.rectangle([lamp_x - 18, lamp_y + 70, lamp_x + 18, lamp_y + 85], fill=(190, 150, 65, 255))
    d.line([(lamp_x, lamp_y + 20), (lamp_x, lamp_y + 70)], fill=(190, 150, 65, 255), width=6)
    # Emerald green shade
    d.polygon([(lamp_x - 45, lamp_y + 20), (lamp_x + 45, lamp_y + 20), (lamp_x + 35, lamp_y - 12), (lamp_x - 35, lamp_y - 12)], fill=(32, 115, 65, 255), outline=(190, 150, 65, 255), width=2)
    # Warm amber glow falling onto desk
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([lamp_x - 140, desk_y - 20, lamp_x + 140, desk_y + 160], fill=(255, 215, 120, 75))
    glow = glow.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # Heavy security blast door in the right background
    door_rx = int(W * 0.82)
    d.rectangle([door_rx, 140, door_rx + 180, int(H * 0.72)], fill=(28, 30, 34, 255), outline=(65, 70, 80, 255), width=4)
    # Brass illuminated keypad on the door frame
    d.rectangle([door_rx - 28, 360, door_rx - 6, 430], fill=(140, 105, 50, 255), outline=(190, 155, 75, 255), width=2)
    # Keypad LED green/amber
    d.rectangle([door_rx - 22, 368, door_rx - 12, 380], fill=(70, 230, 120, 255))

    img = img.convert("RGB")
    img = draw_vignette(img, 0.48)
    img = add_paper_grain(img, 11)
    img.save(path, quality=94)
    print("Generated env_senior_investigation.jpg")

# -----------------------------------------------------------------------------
# 4. ENVIRONMENT D: SENIOR ALLIANCE WAR ROOM (Multiplayer Tactical Center)
# -----------------------------------------------------------------------------
def make_env_alliance():
    path = os.path.join(ENV_DIR, "env_alliance_warroom.jpg")
    img = Image.new("RGBA", (W, H), "#0C1210")
    d = ImageDraw.Draw(img)

    # Brutalist subterranean bunker: charcoal concrete with neon tactical telemetry
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(12 + 12 * t), int(18 + 14 * t), int(16 + 12 * t), 255))

    # Background tactical radar screens and sector boards
    for i, sx in enumerate([int(W * 0.15), int(W * 0.38), int(W * 0.62), int(W * 0.85)]):
        sw = int(W * 0.18)
        sh = 240
        sy = 100
        d.rectangle([sx - sw // 2, sy, sx + sw // 2, sy + sh], fill=(10, 22, 18, 255), outline=(35, 70, 55, 255), width=2)
        # Tactical displays inside
        if i == 0:
            # 9x9 Sudoku Grid radar
            for gx in range(sx - sw // 2 + 15, sx + sw // 2 - 15, 20):
                d.line([(gx, sy + 15), (gx, sy + sh - 15)], fill=(45, 110, 85, 120))
            for gy in range(sy + 15, sy + sh - 15, 20):
                d.line([(sx - sw // 2 + 15, gy), (sx + sw // 2 - 15, gy)], fill=(45, 110, 85, 120))
        elif i == 1:
            # Count Vesper 8x8 Chess telemetry
            for cx in range(8):
                for cy in range(8):
                    if (cx + cy) % 2 == 1:
                        d.rectangle([sx - 60 + cx * 15, sy + 40 + cy * 15, sx - 45 + cx * 15, sy + 55 + cy * 15], fill=(35, 95, 70, 180))
        elif i == 2:
            # 90-Second Server Countdown Clock
            d.rectangle([sx - 70, sy + 80, sx + 70, sy + 150], fill=(25, 12, 12, 255), outline=(180, 50, 50, 255), width=2)
            d.text((sx - 48, sy + 95), "01:30", fill=(245, 60, 60, 255), font_size=32)
        elif i == 3:
            # Prisoner's Dilemma 4-Quadrant Betrayal Matrix
            d.line([(sx, sy + 30), (sx, sy + sh - 30)], fill=(52, 183, 136, 180), width=2)
            d.line([(sx - 65, sy + sh // 2), (sx + 65, sy + sh // 2)], fill=(52, 183, 136, 180), width=2)

    # Giant circular holographic War Room table in center foreground
    table_cx, table_cy = W // 2, int(H * 0.74)
    table_rx, table_ry = int(W * 0.42), 220
    # Table base
    d.ellipse([table_cx - table_rx, table_cy, table_cx + table_rx, table_cy + table_ry], fill=(16, 26, 22, 255), outline=(45, 90, 70, 255), width=4)
    # Tactical holographic projection concentric rings
    for r_pct in [0.85, 0.65, 0.45, 0.25]:
        d.ellipse([
            table_cx - int(table_rx * r_pct), table_cy + int(table_ry * (1 - r_pct) * 0.5),
            table_cx + int(table_rx * r_pct), table_cy + table_ry - int(table_ry * (1 - r_pct) * 0.5)
        ], outline=(52, 183, 136, 160), width=2)

    # Glowing vertical holographic beacon rising from table
    beacon = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beacon)
    bd.polygon([
        (table_cx - 160, table_cy + table_ry // 2),
        (table_cx + 160, table_cy + table_ry // 2),
        (table_cx + 260, 0),
        (table_cx - 260, 0)
    ], fill=(52, 183, 136, 32))
    beacon = beacon.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, beacon)
    d = ImageDraw.Draw(img)

    # Four operative high-back command chairs around the table
    chair_positions = [
        (int(W * 0.18), int(H * 0.62)),
        (int(W * 0.36), int(H * 0.56)),
        (int(W * 0.64), int(H * 0.56)),
        (int(W * 0.82), int(H * 0.62))
    ]
    for ch_x, ch_y in chair_positions:
        # Leather high-back silhouette
        d.rectangle([ch_x - 28, ch_y, ch_x + 28, ch_y + 110], fill=(12, 16, 14, 255), outline=(40, 60, 50, 255), width=2)
        d.arc([ch_x - 28, ch_y - 20, ch_x + 28, ch_y + 20], 180, 360, fill=(40, 60, 50, 255), width=2)

    img = img.convert("RGB")
    img = draw_vignette(img, 0.42)
    img = add_paper_grain(img, 10)
    img.save(path, quality=94)
    print("Generated env_alliance_warroom.jpg")

# -----------------------------------------------------------------------------
# 5. JUNIOR CHARACTER SPRITE (The Scholar Protagonist)
# -----------------------------------------------------------------------------
def make_junior_character():
    path = os.path.join(CHAR_DIR, "junior_student.png")
    cw, ch = 440, 640
    img = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = cw // 2

    # Ground shadow
    d.ellipse([cx - 110, ch - 35, cx + 110, ch - 5], fill=(0, 0, 0, 110))

    # Legs & tailored trousers
    d.rectangle([cx - 42, ch - 220, cx - 12, ch - 35], fill=(30, 36, 42, 255), outline=(45, 52, 60, 255))
    d.rectangle([cx + 12, ch - 220, cx + 42, ch - 35], fill=(30, 36, 42, 255), outline=(45, 52, 60, 255))
    # Shoes
    d.ellipse([cx - 48, ch - 40, cx - 8, ch - 20], fill=(22, 22, 24, 255))
    d.ellipse([cx + 8, ch - 40, cx + 48, ch - 20], fill=(22, 22, 24, 255))

    # Navy Academy Blazer
    blazer_top = ch - 430
    d.polygon([
        (cx - 75, blazer_top + 60),
        (cx + 75, blazer_top + 60),
        (cx + 60, ch - 220),
        (cx - 60, ch - 220)
    ], fill=(26, 40, 58, 255), outline=(42, 64, 92, 255), width=2)

    # White collared shirt & maroon school tie
    d.polygon([(cx - 24, blazer_top + 60), (cx + 24, blazer_top + 60), (cx, blazer_top + 130)], fill=(245, 244, 240, 255))
    d.polygon([(cx - 8, blazer_top + 75), (cx + 8, blazer_top + 75), (cx + 12, blazer_top + 160), (cx, blazer_top + 180), (cx - 12, blazer_top + 160)], fill=(150, 42, 45, 255))

    # Brass academy blazer buttons & crest
    d.ellipse([cx - 45, blazer_top + 100, cx - 33, blazer_top + 116], fill=(200, 160, 60, 255)) # Crest
    for by in [blazer_top + 150, blazer_top + 180, blazer_top + 210]:
        d.ellipse([cx - 4, by, cx + 4, by + 8], fill=(210, 175, 75, 255))

    # Cross-body leather messenger bag / satchel
    d.line([(cx - 68, blazer_top + 60), (cx + 55, ch - 230)], fill=(85, 55, 32, 255), width=8)
    d.rectangle([cx + 30, ch - 260, cx + 80, ch - 190], fill=(105, 70, 40, 255), outline=(65, 42, 24, 255), width=2)
    d.ellipse([cx + 52, ch - 230, cx + 58, ch - 220], fill=(200, 160, 60, 255)) # buckle

    # Neck & Head
    d.rectangle([cx - 16, blazer_top + 25, cx + 16, blazer_top + 65], fill=(215, 175, 145, 255))
    # Head contour
    head_y = blazer_top - 50
    d.ellipse([cx - 42, head_y - 45, cx + 42, head_y + 45], fill=(225, 185, 155, 255))

    # Expressive facial features (scholarly student)
    # Eyes
    d.ellipse([cx - 24, head_y - 6, cx - 12, head_y + 4], fill=(40, 30, 25, 255))
    d.ellipse([cx + 12, head_y - 6, cx + 24, head_y + 4], fill=(40, 30, 25, 255))
    d.ellipse([cx - 19, head_y - 4, cx - 15, head_y], fill=(255, 255, 255, 255)) # eye glint
    d.ellipse([cx + 17, head_y - 4, cx + 21, head_y], fill=(255, 255, 255, 255))
    # Eyebrows (focused, confident)
    d.line([(cx - 26, head_y - 14), (cx - 10, head_y - 12)], fill=(30, 22, 18, 255), width=3)
    d.line([(cx + 10, head_y - 12), (cx + 26, head_y - 14)], fill=(30, 22, 18, 255), width=3)
    # Subtle confident smile
    d.arc([cx - 12, head_y + 12, cx + 12, head_y + 26], 10, 170, fill=(120, 60, 50, 255), width=2)

    # Neat dark hair with side part
    d.ellipse([cx - 46, head_y - 56, cx + 46, head_y + 6], fill=(28, 22, 20, 255))
    d.polygon([(cx - 46, head_y - 30), (cx - 20, head_y - 45), (cx + 35, head_y - 35), (cx + 46, head_y - 10)], fill=(35, 28, 24, 255))

    # Hands holding a vintage notebook
    d.rectangle([cx - 35, ch - 280, cx + 25, ch - 220], fill=(220, 210, 195, 255), outline=(100, 75, 45, 255), width=2)
    # Fingers
    d.ellipse([cx - 42, ch - 260, cx - 28, ch - 240], fill=(215, 175, 145, 255))
    d.ellipse([cx + 18, ch - 260, cx + 32, ch - 240], fill=(215, 175, 145, 255))

    img = add_paper_grain(img, 4)
    img.save(path, "PNG")
    print("Generated junior_student.png")

# -----------------------------------------------------------------------------
# 6. ALLIANCE SQUAD CHARACTER SPRITE (Aarav, Aanya & Tactical Operative)
# -----------------------------------------------------------------------------
def make_alliance_squad():
    path = os.path.join(CHAR_DIR, "alliance_squad.png")
    # Composite Aarav and Aanya from their existing verified sprites!
    aarav_path = os.path.join(CHAR_DIR, "aarav_neutral.png")
    aanya_path = os.path.join(CHAR_DIR, "aanya_neutral.png")

    if os.path.exists(aarav_path) and os.path.exists(aanya_path):
        cw, ch = 680, 600
        comp = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        
        aarav_im = Image.open(aarav_path).convert("RGBA")
        aanya_im = Image.open(aanya_path).convert("RGBA")
        
        # Scale to squad height
        target_h = 560
        aarav_scaled = aarav_im.resize((int(aarav_im.width * (target_h / aarav_im.height)), target_h), Image.Resampling.LANCZOS)
        aanya_scaled = aanya_im.resize((int(aanya_im.width * (target_h / aanya_im.height)), target_h), Image.Resampling.LANCZOS)
        
        # Ground shadow
        cd = ImageDraw.Draw(comp)
        cd.ellipse([80, ch - 40, cw - 80, ch - 5], fill=(0, 0, 0, 120))
        
        # Paste Aarav on left, Aanya on right
        comp.alpha_composite(aarav_scaled, (40, ch - target_h))
        comp.alpha_composite(aanya_scaled, (cw - aanya_scaled.width - 40, ch - target_h))
        
        comp.save(path, "PNG")
        print("Generated alliance_squad.png composite")
    else:
        print("Could not find aarav or aanya sprites")

if __name__ == "__main__":
    make_env_selection()
    make_env_junior()
    make_env_senior()
    make_env_alliance()
    make_junior_character()
    make_alliance_squad()
    print("All homepage environments and characters generated successfully!")
