import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

PUB_DIR = r"c:\Users\USER\OneDrive\Desktop\games\public\art"
BG_DIR = os.path.join(PUB_DIR, "backgrounds")
CHAR_DIR = os.path.join(PUB_DIR, "characters")
PROP_DIR = os.path.join(PUB_DIR, "props")

for d in [BG_DIR, CHAR_DIR, PROP_DIR]:
    os.makedirs(d, exist_ok=True)

W, H = 1920, 1080

def add_paper_grain(img, intensity=12):
    arr = np.array(img, dtype=float)
    h, w, c = arr.shape
    noise = np.random.normal(0, intensity, (h, w, 1))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def draw_vignette(img, strength=0.5):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cx, cy = W // 2, H // 2
    max_r = math.hypot(cx, cy)
    for i in range(15):
        r = max_r * (0.6 + 0.4 * (i / 15))
        alpha = int(255 * strength * (i / 15)**2)
        bbox = [cx - r, cy - r, cx + r, cy + r]
        d.ellipse(bbox, outline=(15, 12, 10, alpha), width=int(max_r * 0.04))
    overlay = overlay.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    return img

# -----------------------------------------------------------------------------
# 1. SOLO L2: THREE DOORS
# -----------------------------------------------------------------------------
def make_solo_l2():
    path = os.path.join(BG_DIR, "solo_l2_three_doors.jpg")
    img = Image.new("RGBA", (W, H), "#1B1714")
    d = ImageDraw.Draw(img)
    
    # Curved stone walls
    for y in range(H):
        t = y / H
        col = (int(30 + 15*t), int(26 + 12*t), int(22 + 10*t), 255)
        d.line([(0, y), (W, y)], fill=col)
        
    # Stone floor
    floor_y = int(H * 0.65)
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        c = (int(42 - 15*t), int(38 - 14*t), int(34 - 12*t), 255)
        d.line([(0, y), (W, y)], fill=c)
        
    # Perspective flagstones
    for i in range(-5, 15):
        x1 = W * 0.5 + (i - 5) * 50
        x2 = W * 0.5 + (i - 5) * 220
        d.line([(x1, floor_y), (x2, H)], fill=(25, 22, 19, 120), width=2)
    for y in [750, 840, 940, 1030]:
        d.line([(0, y), (W, y)], fill=(25, 22, 19, 100), width=2)

    # 3 Doors: Left (Oak/Brass), Center (Chalk White), Right (Black Wrought Iron)
    doors = [
        (int(W * 0.22), floor_y - 480, 260, 480, "brass", (120, 85, 45), (180, 140, 60)),
        (int(W * 0.50 - 130), floor_y - 480, 260, 480, "white", (220, 215, 205), (140, 135, 125)),
        (int(W * 0.78 - 260), floor_y - 480, 260, 480, "iron", (35, 33, 32), (80, 75, 72))
    ]
    for x, y, w, h, style, base_c, trim_c in doors:
        # Stone arch frame
        d.rectangle([x - 22, y - 22, x + w + 22, y + h], fill=(22, 19, 17, 255), outline=(55, 48, 42, 255), width=4)
        d.arc([x - 22, y - 60, x + w + 22, y + 40], 180, 360, fill=(55, 48, 42, 255), width=5)
        # Door body
        d.rectangle([x, y, x + w, y + h], fill=base_c + (255,), outline=trim_c + (255,), width=3)
        if style == "brass":
            for row in range(4):
                d.rectangle([x + 20, y + 30 + row*110, x + w - 20, y + 115 + row*110], outline=trim_c + (255,), width=2)
                d.ellipse([x + w//2 - 6, y + 70 + row*110, x + w//2 + 6, y + 82 + row*110], fill=(200, 160, 70, 255))
        elif style == "white":
            d.line([x + w//2, y, x + w//2, y + h], fill=trim_c + (255,), width=2)
            d.rectangle([x + 25, y + 40, x + w - 25, y + h - 40], outline=trim_c + (255,), width=2)
        elif style == "iron":
            for bar_x in range(x + 30, x + w - 20, 35):
                d.line([(bar_x, y), (bar_x, y + h)], fill=trim_c + (255,), width=4)
            d.line([(x, y + h//2), (x + w, y + h//2)], fill=trim_c + (255,), width=5)
        # Stone plaque beneath door
        d.rectangle([x + 30, floor_y + 10, x + w - 30, floor_y + 40], fill=(30, 26, 23, 255), outline=(70, 62, 54, 255), width=2)

    # Candles in wall niches casting warm amber glow
    for nx in [int(W * 0.08), int(W * 0.92)]:
        d.rectangle([nx - 30, 380, nx + 30, 520], fill=(12, 10, 9, 255), outline=(45, 38, 33, 255), width=2)
        d.arc([nx - 30, 350, nx + 30, 410], 180, 360, fill=(45, 38, 33, 255), width=2)
        # Candle & flame
        d.rectangle([nx - 8, 460, nx + 8, 510], fill=(210, 195, 175, 255))
        d.ellipse([nx - 10, 435, nx + 10, 460], fill=(255, 185, 60, 255))
        d.ellipse([nx - 4, 442, nx + 4, 455], fill=(255, 240, 180, 255))

    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l2_three_doors.jpg")

# -----------------------------------------------------------------------------
# 2. SOLO L3: THE FORGOTTEN ROOM
# -----------------------------------------------------------------------------
def make_solo_l3():
    path = os.path.join(BG_DIR, "solo_l3_forgotten_room.jpg")
    img = Image.new("RGBA", (W, H), "#221C18")
    d = ImageDraw.Draw(img)
    # Wainscoted room with tall arched window and clear table
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(26 + 18*t), int(22 + 14*t), int(19 + 12*t), 255))
    floor_y = 660
    # Parquet floor
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        d.line([(0, y), (W, y)], fill=(int(45 - 18*t), int(36 - 15*t), int(28 - 12*t), 255))
    # Wall panels & tall window
    d.rectangle([W//2 - 220, 80, W//2 + 220, floor_y - 80], fill=(40, 52, 60, 180), outline=(50, 40, 32, 255), width=6)
    d.arc([W//2 - 220, 20, W//2 + 220, 160], 180, 360, fill=(50, 40, 32, 255), width=6)
    # Window panes
    for x in range(W//2 - 180, W//2 + 200, 90):
        d.line([(x, 80), (x, floor_y - 80)], fill=(30, 25, 20, 255), width=3)
    for y in range(160, floor_y - 80, 100):
        d.line([(W//2 - 220, y), (W//2 + 220, y)], fill=(30, 25, 20, 255), width=3)
    # Massive Oak Observation Table (foreground-center)
    tx, ty, tw, th = int(W * 0.22), 650, int(W * 0.56), 280
    # Table top
    d.polygon([(tx, ty + 40), (tx + 120, ty), (tx + tw - 120, ty), (tx + tw, ty + 40)], fill=(62, 45, 32, 255), outline=(90, 68, 50, 255))
    d.rectangle([tx, ty + 40, tx + tw, ty + 65], fill=(48, 35, 24, 255), outline=(75, 55, 38, 255), width=2)
    # Table legs
    for lx in [tx + 30, tx + tw - 60]:
        d.rectangle([lx, ty + 65, lx + 30, ty + th], fill=(38, 28, 20, 255), outline=(55, 40, 28, 255), width=2)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.4)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l3_forgotten_room.jpg")

# -----------------------------------------------------------------------------
# 3. SOLO L4: THE INTERROGATION
# -----------------------------------------------------------------------------
def make_solo_l4():
    path = os.path.join(BG_DIR, "solo_l4_interrogation.jpg")
    img = Image.new("RGBA", (W, H), "#121314")
    d = ImageDraw.Draw(img)
    # Concrete wall & floor
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(22 + 10*t), int(24 + 10*t), int(26 + 10*t), 255))
    floor_y = 680
    d.rectangle([0, floor_y, W, H], fill=(28, 30, 32, 255))
    # One-way mirror in back wall
    d.rectangle([W//2 - 400, 120, W//2 + 400, floor_y - 120], fill=(16, 20, 24, 255), outline=(45, 50, 56, 255), width=8)
    # Overhead hanging cone lamp
    lamp_x = W // 2
    d.line([(lamp_x, 0), (lamp_x, 240)], fill=(80, 85, 90, 255), width=3)
    d.polygon([(lamp_x - 60, 290), (lamp_x + 60, 290), (lamp_x + 20, 240), (lamp_x - 20, 240)], fill=(50, 55, 60, 255))
    # Cone light beam
    cone = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cone)
    cd.polygon([(lamp_x - 40, 290), (lamp_x + 40, 290), (lamp_x + 460, floor_y + 180), (lamp_x - 460, floor_y + 180)], fill=(240, 245, 250, 42))
    cone = cone.filter(ImageFilter.GaussianBlur(15))
    img = Image.alpha_composite(img, cone)
    d = ImageDraw.Draw(img)
    # Metal interrogation table & two steel chairs
    mx, my, mw, mh = W//2 - 280, 630, 560, 180
    d.polygon([(mx, my + 30), (mx + 80, my), (mx + mw - 80, my), (mx + mw, my + 30)], fill=(90, 95, 102, 255), outline=(130, 138, 148, 255), width=2)
    d.rectangle([mx, my + 30, mx + mw, my + 50], fill=(70, 75, 82, 255))
    for lx in [mx + 20, mx + mw - 40]:
        d.line([(lx, my + 50), (lx, my + mh)], fill=(110, 115, 122, 255), width=8)
    # File folder on table
    d.rectangle([mx + mw//2 - 50, my + 10, mx + mw//2 + 50, my + 25], fill=(160, 145, 110, 255), outline=(120, 105, 75, 255), width=2)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.5)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l4_interrogation.jpg")

# -----------------------------------------------------------------------------
# 4. SOLO L5: THE MIRROR MAZE
# -----------------------------------------------------------------------------
def make_solo_l5():
    path = os.path.join(BG_DIR, "solo_l5_mirror_maze.jpg")
    img = Image.new("RGBA", (W, H), "#15161A")
    d = ImageDraw.Draw(img)
    floor_y = 620
    # Checkered reflective floor
    for y in range(floor_y, H, 30):
        t = (y - floor_y) / (H - floor_y)
        for x in range(0, W, int(60 + 80*t)):
            is_ivory = ((x // 60) + (y // 30)) % 2 == 0
            c = (45, 48, 55, 255) if is_ivory else (22, 24, 28, 255)
            d.rectangle([x, y, x + int(60 + 80*t), y + 30], fill=c)
    # Receding gilded mirror frames in perspective
    for side in [-1, 1]:
        for i in range(5, -1, -1):
            mx = W // 2 + side * (120 + i * 160)
            my = 120 + i * 40
            mw = 130
            mh = floor_y - my
            # Mirror glass with teal/rose tint
            tint = (40 + i*15, 60 + i*18, 75 + i*20, 200)
            d.rectangle([mx - mw//2, my, mx + mw//2, my + mh], fill=tint, outline=(180, 145, 85, 255), width=5)
            d.arc([mx - mw//2, my - 30, mx + mw//2, my + 30], 180, 360, fill=(180, 145, 85, 255), width=5)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l5_mirror_maze.jpg")

# -----------------------------------------------------------------------------
# 5. SOLO L6: THE LAST HUMAN
# -----------------------------------------------------------------------------
def make_solo_l6():
    path = os.path.join(BG_DIR, "solo_l6_last_human.jpg")
    img = Image.new("RGBA", (W, H), "#12161A")
    d = ImageDraw.Draw(img)
    # Gloomy dusk sky
    for y in range(int(H * 0.55)):
        t = y / (H * 0.55)
        d.line([(0, y), (W, y)], fill=(int(20 + 25*t), int(26 + 30*t), int(34 + 35*t), 255))
    # Ruined skyline silhouette
    for bx in range(0, W, 80):
        bh = random.randint(180, 420)
        d.rectangle([bx, int(H * 0.55) - bh, bx + 70, int(H * 0.55)], fill=(18, 22, 28, 255))
    # Wet asphalt ground
    floor_y = int(H * 0.55)
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        d.line([(0, y), (W, y)], fill=(int(24 + 15*t), int(28 + 15*t), int(32 + 15*t), 255))
    # Tarp shelter on the left with survival crates
    d.polygon([(60, floor_y + 80), (420, floor_y - 120), (520, floor_y + 80)], fill=(45, 60, 50, 255), outline=(65, 80, 68, 255), width=3)
    d.line([(420, floor_y - 120), (420, floor_y + 140)], fill=(80, 75, 65, 255), width=6)
    # Supply crates
    for cx, cy, cw, ch in [(140, floor_y + 40, 110, 80), (260, floor_y + 50, 95, 70), (190, floor_y - 20, 85, 60)]:
        d.rectangle([cx, cy, cx + cw, cy + ch], fill=(85, 65, 45, 255), outline=(55, 40, 25, 255), width=2)
        d.line([(cx, cy), (cx + cw, cy + ch)], fill=(55, 40, 25, 255), width=2)
    # Glowing amber lantern
    d.rectangle([380, floor_y + 20, 410, 60], fill=(25, 22, 18, 255))
    d.ellipse([375, floor_y + 25, 415, floor_y + 55], fill=(255, 180, 40, 220))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 12)
    img.save(path, quality=92)
    print("Generated solo_l6_last_human.jpg")

# -----------------------------------------------------------------------------
# 6. SOLO L7: THE IMPOSSIBLE SECOND
# -----------------------------------------------------------------------------
def make_solo_l7():
    path = os.path.join(BG_DIR, "solo_l7_impossible_second.jpg")
    img = Image.new("RGBA", (W, H), "#141010")
    d = ImageDraw.Draw(img)
    floor_y = 680
    d.rectangle([0, floor_y, W, H], fill=(22, 18, 18, 255))
    # Wall of CRT monitoring screens
    for row in range(3):
        for col in range(6):
            sx = 140 + col * 270
            sy = 60 + row * 180
            d.rectangle([sx, sy, sx + 240, sy + 150], fill=(18, 25, 22, 255), outline=(45, 42, 40, 255), width=6)
            # Screen glow & waveforms
            glow = (35, 65, 50, 255) if (row+col)%2==0 else (65, 30, 30, 255)
            d.rectangle([sx + 8, sy + 8, sx + 232, sy + 142], fill=glow)
            d.line([(sx + 15, sy + 75), (sx + 70, sy + 45), (sx + 120, sy + 105), (sx + 180, sy + 55), (sx + 225, sy + 75)], fill=(120, 210, 160, 255), width=2)
    # Flashing red emergency alarm beacon
    d.ellipse([W//2 - 35, 15, W//2 + 35, 55], fill=(230, 35, 35, 255))
    d.ellipse([W//2 - 15, 25, W//2 + 15, 45], fill=(255, 180, 180, 255))
    # Dispatch console in foreground
    d.polygon([(200, H), (340, floor_y - 20), (W - 340, floor_y - 20), (W - 200, H)], fill=(32, 28, 28, 255), outline=(65, 55, 55, 255), width=3)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l7_impossible_second.jpg")

# -----------------------------------------------------------------------------
# 7. SOLO L8: THE FINAL TRUTH
# -----------------------------------------------------------------------------
def make_solo_l8():
    path = os.path.join(BG_DIR, "solo_l8_final_truth.jpg")
    img = Image.new("RGBA", (W, H), "#0E0E12")
    d = ImageDraw.Draw(img)
    floor_y = 720
    d.rectangle([0, floor_y, W, H], fill=(20, 20, 24, 255))
    # Giant circular archive shelves with glowing memory jars
    for tier in range(4):
        ty = 80 + tier * 140
        d.line([(80, ty), (W - 80, ty)], fill=(45, 45, 52, 255), width=8)
        for jx in range(120, W - 100, 70):
            jar_col = (180, 220, 255, 220) if (jx//70)%3==0 else (255, 215, 130, 220)
            d.rectangle([jx, ty - 55, jx + 36, ty], fill=jar_col, outline=(90, 100, 115, 255), width=2)
            d.ellipse([jx + 10, ty - 35, jx + 26, ty - 15], fill=(255, 255, 255, 240))
    # Central golden light beam
    shaft = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shaft)
    sd.polygon([(W//2 - 60, 0), (W//2 + 60, 0), (W//2 + 320, floor_y + 120), (W//2 - 320, floor_y + 120)], fill=(255, 235, 175, 45))
    shaft = shaft.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img, shaft)
    d = ImageDraw.Draw(img)
    # Pedestal with open tome
    px, py, pw, ph = W//2 - 100, floor_y - 120, 200, 150
    d.polygon([(px + 20, py), (px + pw - 20, py), (px + pw, py + ph), (px, py + ph)], fill=(48, 48, 56, 255), outline=(90, 85, 75, 255), width=3)
    # Open glowing book
    d.polygon([(px + 30, py - 30), (px + pw//2, py - 15), (px + pw - 30, py - 30), (px + pw//2, py)], fill=(245, 235, 215, 255), outline=(130, 110, 75, 255), width=2)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.4)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated solo_l8_final_truth.jpg")

# -----------------------------------------------------------------------------
# 8. ALLIANCE BACKGROUNDS (L3 - L8)
# -----------------------------------------------------------------------------
def make_alliance_l3():
    path = os.path.join(BG_DIR, "alliance_l3_mind_snap.jpg")
    img = Image.new("RGBA", (W, H), "#101618")
    d = ImageDraw.Draw(img)
    floor_y = 660
    d.rectangle([0, floor_y, W, H], fill=(22, 28, 30, 255))
    # 6 glass cloning pods in an arc
    for i in range(6):
        px = 180 + i * 270
        py = 180 + int(math.sin(i / 5 * math.pi) * 60)
        d.rectangle([px, py, px + 170, py + 380], fill=(25, 55, 65, 160), outline=(75, 120, 135, 255), width=4)
        d.ellipse([px + 30, py + 120, px + 140, py + 260], fill=(130, 220, 240, 120))
        d.rectangle([px - 10, py - 25, px + 180, py], fill=(45, 50, 55, 255))
        d.rectangle([px - 10, py + 380, px + 180, py + 410], fill=(45, 50, 55, 255))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated alliance_l3_mind_snap.jpg")

def make_alliance_l4():
    path = os.path.join(BG_DIR, "alliance_l4_imposter.jpg")
    img = Image.new("RGBA", (W, H), "#181414")
    d = ImageDraw.Draw(img)
    floor_y = 640
    d.rectangle([0, floor_y, W, H], fill=(30, 24, 24, 255))
    # Banquet table set with masks on plates
    d.polygon([(160, H), (380, floor_y), (W - 380, floor_y), (W - 160, H)], fill=(48, 32, 32, 255), outline=(90, 65, 60, 255), width=3)
    # Chandeliers
    for cx in [W//2 - 320, W//2 + 320]:
        d.line([(cx, 0), (cx, 160)], fill=(120, 95, 50, 255), width=3)
        d.polygon([(cx - 100, 210), (cx + 100, 210), (cx, 160)], fill=(75, 58, 30, 255))
        for fx in range(cx - 80, cx + 100, 40):
            d.ellipse([fx - 8, 190, fx + 8, 208], fill=(255, 200, 80, 230))
    # Empty Venetian masks on plates
    for mx in range(480, W - 450, 180):
        d.ellipse([mx - 40, floor_y + 40, mx + 40, floor_y + 70], fill=(210, 200, 190, 255), outline=(140, 130, 120, 255), width=2)
        d.ellipse([mx - 22, floor_y + 48, mx - 8, floor_y + 58], fill=(35, 25, 25, 255))
        d.ellipse([mx + 8, floor_y + 48, mx + 22, floor_y + 58], fill=(35, 25, 25, 255))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated alliance_l4_imposter.jpg")

def make_alliance_l5():
    path = os.path.join(BG_DIR, "alliance_l5_memory_vault.jpg")
    img = Image.new("RGBA", (W, H), "#1B1710")
    d = ImageDraw.Draw(img)
    floor_y = 660
    d.rectangle([0, floor_y, W, H], fill=(32, 28, 20, 255))
    # Brass safety deposit box walls
    for row in range(8):
        for col in range(16):
            bx = 100 + col * 110
            by = 60 + row * 65
            d.rectangle([bx, by, bx + 95, by + 52], fill=(55, 46, 28, 255), outline=(95, 80, 45, 255), width=2)
            d.ellipse([bx + 40, by + 22, bx + 55, by + 32], fill=(160, 135, 75, 255))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated alliance_l5_memory_vault.jpg")

def make_alliance_l6():
    path = os.path.join(BG_DIR, "alliance_l6_human_choice.jpg")
    img = Image.new("RGBA", (W, H), "#10161C")
    d = ImageDraw.Draw(img)
    # Flooded subway platform
    floor_y = 580
    d.rectangle([0, 0, W, floor_y], fill=(22, 28, 34, 255))
    # Rising water
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        d.line([(0, y), (W, y)], fill=(int(18 + 12*t), int(34 + 20*t), int(42 + 25*t), 255))
    # Tiled columns
    for cx in [280, W//2, W - 280]:
        d.rectangle([cx - 45, 120, cx + 45, floor_y + 120], fill=(42, 50, 58, 255), outline=(65, 76, 86, 255), width=3)
    # Small yellow rescue raft
    rx, ry = W//2 - 140, floor_y + 60
    d.ellipse([rx, ry, rx + 280, ry + 120], fill=(220, 140, 25, 255), outline=(160, 95, 15, 255), width=4)
    d.ellipse([rx + 40, ry + 20, rx + 240, ry + 100], fill=(45, 65, 75, 255))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated alliance_l6_human_choice.jpg")

def make_alliance_l7():
    path = os.path.join(BG_DIR, "alliance_l7_breaking_point.jpg")
    img = Image.new("RGBA", (W, H), "#15120E")
    d = ImageDraw.Draw(img)
    floor_y = 680
    d.rectangle([0, floor_y, W, H], fill=(26, 22, 18, 255))
    # Splintered mining timber supports
    for tx in [200, 550, 950, 1350, 1700]:
        d.rectangle([tx - 25, 80, tx + 25, floor_y], fill=(55, 40, 26, 255), outline=(80, 58, 38, 255), width=3)
    d.line([(100, 160), (W - 100, 160)], fill=(55, 40, 26, 255), width=30)
    # Warning lamps
    for lx in [380, W//2, W - 380]:
        d.ellipse([lx - 18, 180, lx + 18, 216], fill=(240, 120, 20, 240))
    img = img.convert("RGB")
    img = draw_vignette(img, 0.5)
    img = add_paper_grain(img, 12)
    img.save(path, quality=92)
    print("Generated alliance_l7_breaking_point.jpg")

def make_alliance_l8():
    path = os.path.join(BG_DIR, "alliance_l8_final_betrayal.jpg")
    img = Image.new("RGBA", (W, H), "#0C0E14")
    d = ImageDraw.Draw(img)
    # Midnight storm sky
    for y in range(int(H * 0.6)):
        t = y / (H * 0.6)
        d.line([(0, y), (W, y)], fill=(int(12 + 10*t), int(14 + 12*t), int(22 + 18*t), 255))
    # Skyscraper rooftops on left & right
    d.rectangle([0, 360, 420, H], fill=(22, 25, 32, 255), outline=(42, 46, 56, 255), width=4)
    d.rectangle([W - 420, 360, W, H], fill=(22, 25, 32, 255), outline=(42, 46, 56, 255), width=4)
    # Steel bridge catwalk between towers
    by = 640
    d.rectangle([380, by, W - 380, by + 45], fill=(36, 40, 48, 255), outline=(68, 75, 88, 255), width=3)
    for bx in range(400, W - 400, 60):
        d.line([(bx, by - 60), (bx, by)], fill=(55, 60, 70, 255), width=3)
    d.line([(380, by - 60), (W - 380, by - 60)], fill=(75, 82, 95, 255), width=4)
    # Locked silver briefcase on central pedestal
    d.rectangle([W//2 - 35, by - 65, W//2 + 35, by], fill=(30, 34, 42, 255))
    d.rectangle([W//2 - 30, by - 100, W//2 + 30, by - 65], fill=(185, 195, 205, 255), outline=(95, 105, 115, 255), width=2)
    d.line([(W//2 - 12, by - 110), (W//2 + 12, by - 110)], fill=(120, 130, 140, 255), width=3)
    img = img.convert("RGB")
    img = draw_vignette(img, 0.45)
    img = add_paper_grain(img, 10)
    img.save(path, quality=92)
    print("Generated alliance_l8_final_betrayal.jpg")

# -----------------------------------------------------------------------------
# 9. STORY PROPS (Transparent PNGs)
# -----------------------------------------------------------------------------
def make_props():
    props = [
        ("prop_globe.png", "Antique Globe", (60, 110, 140)),
        ("prop_typewriter.png", "Vintage Typewriter", (35, 35, 38)),
        ("prop_vase.png", "Ivory Rose Vase", (220, 215, 200)),
        ("prop_chess.png", "Carved Chessboard", (85, 60, 40)),
        ("prop_candelabra.png", "Brass Candelabra", (195, 160, 70)),
        ("prop_clock.png", "Mantel Clock", (165, 125, 55)),
        ("prop_books.png", "Leather Books", (110, 45, 35)),
        ("prop_umbrella.png", "Black Umbrella", (28, 28, 30)),
        ("prop_teacup.png", "Porcelain Teacup", (235, 230, 222)),
        ("prop_key.png", "Ornate Iron Key", (140, 120, 95)),
    ]
    for filename, label, primary_col in props:
        out_path = os.path.join(PROP_DIR, filename)
        pimg = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        pd = ImageDraw.Draw(pimg)
        # Drop shadow
        pd.ellipse([60, 260, 260, 290], fill=(15, 12, 10, 90))
        # Icon / Illustration Silhouette
        if "globe" in filename:
            pd.arc([100, 70, 220, 190], 30, 330, fill=(180, 145, 75, 255), width=8)
            pd.ellipse([115, 85, 205, 175], fill=primary_col + (255,), outline=(180, 145, 75, 255), width=3)
            pd.rectangle([152, 190, 168, 260], fill=(160, 130, 65, 255))
            pd.ellipse([120, 250, 200, 275], fill=(160, 130, 65, 255))
        elif "typewriter" in filename:
            pd.polygon([(60, 250), (260, 250), (230, 140), (90, 140)], fill=primary_col + (255,), outline=(70, 70, 75, 255), width=3)
            pd.rectangle([110, 90, 210, 140], fill=(225, 220, 210, 255))
            pd.rectangle([80, 180, 240, 230], fill=(22, 22, 24, 255))
        elif "candelabra" in filename:
            pd.rectangle([152, 110, 168, 260], fill=primary_col + (255,))
            pd.arc([90, 140, 230, 220], 0, 180, fill=primary_col + (255,), width=6)
            for cx in [90, 160, 230]:
                pd.rectangle([cx - 8, 110, cx + 8, 140], fill=(225, 220, 205, 255))
                pd.ellipse([cx - 6, 85, cx + 6, 110], fill=(255, 190, 50, 255))
        elif "key" in filename:
            pd.ellipse([80, 130, 150, 190], outline=primary_col + (255,), width=10)
            pd.rectangle([140, 154, 250, 166], fill=primary_col + (255,))
            pd.rectangle([220, 166, 232, 195], fill=primary_col + (255,))
            pd.rectangle([240, 166, 250, 185], fill=primary_col + (255,))
        else:
            # Stylized display item
            pd.rounded_rectangle([70, 70, 250, 250], radius=24, fill=primary_col + (255,), outline=(65, 55, 45, 255), width=4)
            pd.text((160, 160), label[:2], fill=(250, 245, 235, 255), anchor="mm")
        pimg.save(out_path, format="PNG")
        print(f"Generated prop {filename}")

# -----------------------------------------------------------------------------
# 10. NPC CHARACTERS (Vesper, Halden, Mira)
# -----------------------------------------------------------------------------
def make_npcs():
    npcs = [
        ("vesper_neutral.png", (45, 30, 35), "Count Vesper", (200, 30, 30)),
        ("vesper_smiling.png", (45, 30, 35), "Count Vesper", (230, 40, 40)),
        ("vesper_angry.png", (45, 30, 35), "Count Vesper", (255, 20, 20)),
        ("halden_neutral.png", (140, 125, 95), "Mr. Halden", (90, 75, 55)),
        ("halden_nervous.png", (140, 125, 95), "Mr. Halden", (90, 75, 55)),
        ("halden_defensive.png", (140, 125, 95), "Mr. Halden", (90, 75, 55)),
        ("mira_neutral.png", (75, 85, 65), "Mira", (140, 130, 115)),
        ("mira_pleading.png", (75, 85, 65), "Mira", (140, 130, 115)),
        ("mira_grateful.png", (75, 85, 65), "Mira", (140, 130, 115)),
    ]
    for filename, coat_col, name, accent_col in npcs:
        out_path = os.path.join(CHAR_DIR, filename)
        cimg = Image.new("RGBA", (848, 1264), (0, 0, 0, 0))
        cd = ImageDraw.Draw(cimg)
        cx = 424
        # Torso & Clothing
        cd.polygon([(cx - 260, 1264), (cx + 260, 1264), (cx + 180, 680), (cx - 180, 680)], fill=coat_col + (255,), outline=(25, 20, 20, 255), width=4)
        cd.polygon([(cx - 90, 680), (cx, 850), (cx + 90, 680)], fill=(225, 220, 210, 255), outline=(50, 45, 40, 255), width=2)
        # Neck & Head
        cd.rectangle([cx - 45, 600, cx + 45, 700], fill=(205, 175, 145, 255))
        cd.ellipse([cx - 120, 340, cx + 120, 640], fill=(215, 185, 155, 255), outline=(40, 32, 28, 255), width=3)
        # Hair
        cd.ellipse([cx - 130, 310, cx + 130, 460], fill=(28, 24, 22, 255))
        # Eyes
        eye_y = 480
        cd.ellipse([cx - 65, eye_y, cx - 35, eye_y + 18], fill=(255, 255, 255, 255), outline=(30, 25, 22, 255), width=2)
        cd.ellipse([cx + 35, eye_y, cx + 65, eye_y + 18], fill=(255, 255, 255, 255), outline=(30, 25, 22, 255), width=2)
        cd.ellipse([cx - 55, eye_y + 2, cx - 45, eye_y + 14], fill=accent_col + (255,))
        cd.ellipse([cx + 45, eye_y + 2, cx + 55, eye_y + 14], fill=accent_col + (255,))
        # Eyebrows
        brow_y = eye_y - 14
        if "angry" in filename or "defensive" in filename:
            cd.line([(cx - 75, brow_y - 6), (cx - 30, brow_y + 6)], fill=(28, 24, 22, 255), width=4)
            cd.line([(cx + 30, brow_y + 6), (cx + 75, brow_y - 6)], fill=(28, 24, 22, 255), width=4)
        elif "nervous" in filename or "pleading" in filename:
            cd.line([(cx - 75, brow_y + 4), (cx - 30, brow_y - 4)], fill=(28, 24, 22, 255), width=4)
            cd.line([(cx + 30, brow_y - 4), (cx + 75, brow_y + 4)], fill=(28, 24, 22, 255), width=4)
        else:
            cd.line([(cx - 75, brow_y), (cx - 30, brow_y)], fill=(28, 24, 22, 255), width=4)
            cd.line([(cx + 30, brow_y), (cx + 75, brow_y)], fill=(28, 24, 22, 255), width=4)
        # Mouth
        mouth_y = 570
        if "smiling" in filename or "grateful" in filename:
            cd.arc([cx - 40, mouth_y - 15, cx + 40, mouth_y + 20], 10, 170, fill=(35, 25, 25, 255), width=3)
        else:
            cd.line([(cx - 35, mouth_y), (cx + 35, mouth_y)], fill=(35, 25, 25, 255), width=3)
        cimg.save(out_path, format="PNG")
        print(f"Generated NPC {filename}")

if __name__ == "__main__":
    make_solo_l2()
    make_solo_l3()
    make_solo_l4()
    make_solo_l5()
    make_solo_l6()
    make_solo_l7()
    make_solo_l8()
    make_alliance_l3()
    make_alliance_l4()
    make_alliance_l5()
    make_alliance_l6()
    make_alliance_l7()
    make_alliance_l8()
    make_props()
    make_npcs()
    print("ALL STORYBOARD ART GENERATED SUCCESSFULLY!")

