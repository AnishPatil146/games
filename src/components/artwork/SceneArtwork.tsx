"use client";

import React from "react";

/**
 * Landing Page Full-Bleed Architectural Threshold & Meridian Composition
 */
export function HeroMonographArtwork() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full object-cover select-none"
      role="img"
      aria-label="Minimalist architectural threshold casting a warm shaft of ivory light across stone geometry"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="heroWarmGlow" cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#F5EFE4" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#9E8C76" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#12100E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lightShaft" x1="50%" y1="15%" x2="62%" y2="95%">
          <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.22" />
          <stop offset="65%" stopColor="#E7DEC8" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#12100E" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="doorInterior" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#D8CCB8" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Deep espresso-charcoal atmosphere */}
      <rect width="1200" height="800" fill="#141210" />
      <rect width="1200" height="800" fill="url(#heroWarmGlow)" />

      {/* Subtle architectural perspective grid */}
      <g stroke="#FAF7F2" strokeOpacity="0.06" strokeWidth="1">
        <line x1="0" y1="560" x2="1200" y2="560" />
        <line x1="600" y1="560" x2="160" y2="800" />
        <line x1="600" y1="560" x2="380" y2="800" />
        <line x1="600" y1="560" x2="600" y2="800" />
        <line x1="600" y1="560" x2="820" y2="800" />
        <line x1="600" y1="560" x2="1040" y2="800" />
      </g>

      {/* Celestial meridian rings */}
      <g fill="none" stroke="#D8CCB8" strokeWidth="0.8">
        <circle cx="600" cy="360" r="250" strokeOpacity="0.14" />
        <circle
          cx="600"
          cy="360"
          r="310"
          strokeOpacity="0.09"
          strokeDasharray="3 9"
        />
        <ellipse cx="600" cy="360" rx="370" ry="120" strokeOpacity="0.08" />
        <line x1="600" y1="30" x2="600" y2="120" strokeOpacity="0.18" />
      </g>

      {/* Monolithic archway & illuminated threshold */}
      <path
        d="M536 560 L536 284 A64 64 0 0 1 664 284 L664 560 Z"
        fill="url(#doorInterior)"
      />
      <path
        d="M524 560 L524 282 A76 76 0 0 1 676 282 L676 560"
        fill="none"
        stroke="#D8CCB8"
        strokeOpacity="0.32"
        strokeWidth="1"
      />

      {/* Cast light polygon across floor */}
      <polygon
        points="536,560 664,560 830,800 370,800"
        fill="url(#lightShaft)"
      />

      {/* Lone silhouette scale reference at the threshold */}
      <g fill="#1C1917" opacity="0.88">
        <circle cx="600" cy="492" r="5.5" />
        <path d="M591 502 C591 499 609 499 609 502 L612 538 L605 538 L604 560 L596 560 L595 538 L588 538 Z" />
      </g>
    </svg>
  );
}

/**
 * Chapter 01 — The Last Train (Platform 4 at 23:58)
 */
export function LastTrainArtwork({ inspectedWallet }: { inspectedWallet: boolean }) {
  return (
    <svg
      viewBox="0 0 900 340"
      className="w-full h-auto block"
      role="img"
      aria-label="Nocturnal railway platform at 23:58 with an idling express carriage, overhead lamps, a retreating figure, and a fallen leather wallet"
    >
      <defs>
        <linearGradient id="ch1Sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#171615" />
          <stop offset="100%" stopColor="#262320" />
        </linearGradient>
        <linearGradient id="ch1LampCone" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F3E5C8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F3E5C8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="900" height="340" fill="url(#ch1Sky)" />

      {/* Canopy ironwork */}
      <g stroke="#3D3833" strokeWidth="1.5">
        <line x1="0" y1="48" x2="900" y2="48" />
        <line x1="140" y1="48" x2="140" y2="235" />
        <line x1="460" y1="48" x2="460" y2="235" />
        <line x1="760" y1="48" x2="760" y2="235" />
      </g>

      {/* Halogen mist cones */}
      <polygon points="270,48 330,48 410,250 190,250" fill="url(#ch1LampCone)" />
      <polygon points="600,48 650,48 730,250 520,250" fill="url(#ch1LampCone)" />

      {/* Express train carriage on left-center */}
      <g>
        <rect
          x="36"
          y="108"
          width="480"
          height="118"
          rx="6"
          fill="#1F1D1B"
          stroke="#575049"
          strokeWidth="1.2"
        />
        <line x1="36" y1="184" x2="516" y2="184" stroke="#8A7E6E" strokeWidth="1" />
        {/* Warm lit carriage windows */}
        {[68, 152, 236, 320].map((x) => (
          <rect
            key={x}
            x={x}
            y="128"
            width="60"
            height="38"
            rx="2"
            fill="#E8D7B9"
            fillOpacity="0.82"
          />
        ))}
        {/* Open pneumatic carriage door */}
        <rect
          x="416"
          y="122"
          width="68"
          height="102"
          fill="#E8D7B9"
          fillOpacity="0.9"
        />
        <line x1="450" y1="122" x2="450" y2="224" stroke="#262320" strokeWidth="1.5" />
      </g>

      {/* Station analog clock at 23:58 */}
      <g transform="translate(625, 92)">
        <line x1="0" y1="-44" x2="0" y2="-24" stroke="#6E665E" strokeWidth="2" />
        <circle cx="0" cy="0" r="24" fill="#FAF7F2" stroke="#575049" strokeWidth="2" />
        <line x1="0" y1="0" x2="-2" y2="-13" stroke="#1C1917" strokeWidth="2" />
        <line x1="0" y1="0" x2="-3" y2="-19" stroke="#9E6B68" strokeWidth="1.3" />
        <circle cx="0" cy="0" r="2" fill="#1C1917" />
      </g>

      {/* Wet stone platform */}
      <polygon points="0,232 900,232 900,340 0,340" fill="#211E1C" />
      <line x1="0" y1="234" x2="900" y2="234" stroke="#A69882" strokeWidth="1.5" strokeDasharray="10 6" />

      {/* Retreating stranger near stairway on right */}
      <g transform="translate(790, 168)" opacity="0.82">
        <circle cx="0" cy="0" r="7" fill="#D6CEC0" />
        <path d="M-11 10 L11 10 L16 58 L-14 58 Z" fill="#36322E" stroke="#6E665E" strokeWidth="0.8" />
      </g>

      {/* Dropped leather wallet in foreground */}
      <g transform="translate(612, 276)">
        {inspectedWallet && (
          <circle
            cx="18"
            cy="8"
            r="30"
            fill="none"
            stroke="#D8C39E"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        )}
        <polygon
          points="0,6 34,0 40,14 6,20"
          fill="#5C4332"
          stroke="#C8B28E"
          strokeWidth="1.2"
        />
        <circle cx="22" cy="9" r="2.2" fill="#E3C998" />
      </g>
    </svg>
  );
}

/**
 * Chapter 02 — The Locked Room (Interactive Sub-Level Library Artwork)
 */
export function LockedRoomArtwork({
  inspectedClues,
  isUnlocked,
  onSelectClue,
}: {
  inspectedClues: string[];
  isUnlocked: boolean;
  onSelectClue: (clueId: string) => void;
}) {
  return (
    <svg
      viewBox="0 0 900 360"
      className="w-full h-auto block"
      role="img"
      aria-label="Sub-level library rotunda featuring towering bookshelves, a crooked pillar clock frozen at 07:45, a mahogany desk with a note and ledger, and a locked oak door"
    >
      <rect width="900" height="360" fill="#1A1715" />

      {/* Left & Right towering bookcases */}
      <g stroke="#3E3730" strokeWidth="1" fill="#231F1C">
        <rect x="24" y="28" width="210" height="270" />
        <rect x="666" y="28" width="210" height="270" />
        {[72, 118, 164, 210, 256].map((y) => (
          <React.Fragment key={y}>
            <line x1="24" y1={y} x2="234" y2={y} />
            <line x1="666" y1={y} x2="876" y2={y} />
          </React.Fragment>
        ))}
      </g>

      {/* Subtle book spines */}
      <g fill="#4A4138" opacity="0.7">
        {[38, 52, 64, 86, 102, 128, 144, 168, 190, 206].map((x, idx) => (
          <rect key={x} x={x} y={80 + (idx % 3) * 46} width="9" height="34" />
        ))}
        {[682, 698, 718, 736, 760, 782, 804, 822, 844].map((x, idx) => (
          <rect key={x} x={x} y={80 + ((idx + 1) % 3) * 46} width="10" height="34" />
        ))}
      </g>

      {/* Center Heavy Oak Door */}
      <g transform="translate(382, 54)">
        <path
          d="M0 244 L0 68 A68 68 0 0 1 136 68 L136 244 Z"
          fill={isUnlocked ? "#E8DEC9" : "#2D251F"}
          stroke="#7A6D5D"
          strokeWidth="2"
        />
        {!isUnlocked && (
          <>
            <line x1="68" y1="0" x2="68" y2="244" stroke="#1A1715" strokeWidth="2" />
            <line x1="6" y1="92" x2="130" y2="92" stroke="#594E42" strokeWidth="3" />
            <line x1="6" y1="186" x2="130" y2="186" stroke="#594E42" strokeWidth="3" />
            <rect
              x="52"
              y="128"
              width="32"
              height="22"
              rx="2"
              fill="#8F7D63"
              stroke="#1A1715"
            />
          </>
        )}
      </g>

      {/* Floor plane */}
      <rect x="0" y="298" width="900" height="62" fill="#141210" />
      <line x1="0" y1="298" x2="900" y2="298" stroke="#4A4138" strokeWidth="1" />

      {/* Interactive Hotspot 1: Broken Pillar Clock (07:45) */}
      <g
        transform="translate(302, 114)"
        onClick={() => onSelectClue("broken_clock")}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="Inspect the broken pillar clock"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectClue("broken_clock");
          }
        }}
      >
        <circle
          cx="0"
          cy="0"
          r="32"
          fill="none"
          stroke={inspectedClues.includes("broken_clock") ? "#7E9174" : "#C9B79B"}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <circle cx="0" cy="0" r="24" fill="#F3EDE2" stroke="#6E604F" strokeWidth="2" />
        {/* 07:45 hands: hour at ~7.75, minute at 9 (45m) */}
        <line x1="0" y1="0" x2="-9" y2="9" stroke="#1C1917" strokeWidth="2.2" />
        <line x1="0" y1="0" x2="-17" y2="0" stroke="#9E6B68" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="2" fill="#1C1917" />
      </g>

      {/* Librarian Desk holding Note & Vault Ledger */}
      <g transform="translate(556, 232)">
        <rect x="0" y="18" width="138" height="48" fill="#2E2620" stroke="#5E5245" />

        {/* Interactive Hotspot 2: Faded Note */}
        <g
          transform="translate(18, -4)"
          onClick={() => onSelectClue("faded_note")}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Inspect the faded note"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectClue("faded_note");
            }
          }}
        >
          <polygon
            points="0,6 32,0 38,18 6,22"
            fill="#F3EDE2"
            stroke={inspectedClues.includes("faded_note") ? "#7E9174" : "#B8A58B"}
            strokeWidth="1.5"
          />
          <line x1="8" y1="8" x2="26" y2="5" stroke="#57524C" strokeWidth="1" />
          <line x1="10" y1="13" x2="28" y2="10" stroke="#57524C" strokeWidth="1" />
        </g>

        {/* Interactive Hotspot 3: Vault Ledger */}
        <g
          transform="translate(76, -8)"
          onClick={() => onSelectClue("dusty_ledger")}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Inspect the vault ledger"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectClue("dusty_ledger");
            }
          }}
        >
          <polygon
            points="0,8 24,2 48,8 48,24 24,18 0,24"
            fill="#E7DEC8"
            stroke={inspectedClues.includes("dusty_ledger") ? "#7E9174" : "#8F7D63"}
            strokeWidth="1.5"
          />
          <line x1="24" y1="2" x2="24" y2="18" stroke="#57524C" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Chapter 03 — The Unknown Message (Nocturnal Study & Transmission Receiver)
 */
export function UnknownMessageArtwork({
  sweptPerimeter,
}: {
  sweptPerimeter: boolean;
}) {
  return (
    <svg
      viewBox="0 0 900 300"
      className="w-full h-auto block"
      role="img"
      aria-label="Quiet study at 03:14 AM with a rain-streaked casement window overlooking a streetlamp and an illuminated encrypted receiver on the desk"
    >
      <rect width="900" height="300" fill="#171615" />

      {/* Tall Casement Window */}
      <g transform="translate(88, 24)">
        <rect
          x="0"
          y="0"
          width="240"
          height="208"
          fill="#1F2326"
          stroke="#4A453E"
          strokeWidth="2"
        />
        <line x1="120" y1="0" x2="120" y2="208" stroke="#4A453E" strokeWidth="2" />
        <line x1="0" y1="104" x2="240" y2="104" stroke="#4A453E" strokeWidth="2" />

        {/* Distant streetlamp & parked sedan silhouette outside */}
        <circle cx="176" cy="66" r="22" fill="#E8D7B9" fillOpacity="0.16" />
        <circle cx="176" cy="66" r="4" fill="#F3E5C8" />
        <line x1="176" y1="70" x2="176" y2="180" stroke="#57524C" strokeWidth="1.5" />
        <rect
          x="138"
          y="168"
          width="62"
          height="16"
          rx="4"
          fill="#12100E"
          stroke={sweptPerimeter ? "#9E8C76" : "none"}
          strokeWidth="1"
        />
      </g>

      {/* Desk surface */}
      <rect x="0" y="232" width="900" height="68" fill="#211E1B" />
      <line x1="0" y1="232" x2="900" y2="232" stroke="#4A453E" strokeWidth="1" />

      {/* Encrypted Receiver Device on Desk */}
      <g transform="translate(520, 178)">
        <polygon
          points="0,54 24,18 196,18 220,54"
          fill="#2A2724"
          stroke="#6E655B"
          strokeWidth="1.2"
        />
        <rect
          x="36"
          y="25"
          width="148"
          height="20"
          rx="2"
          fill="#FAF7F2"
          fillOpacity="0.92"
        />
        <circle cx="24" cy="46" r="3" fill="#9E6B68" />
      </g>
    </svg>
  );
}

/**
 * Bespoke Vector Sculptural Glyphs for Chapter 04 Studio & Chapter 06 Relics (Zero Emojis)
 */
export function ArtifactVectorGlyph({
  artifactId,
  stroke = "currentColor",
  className = "w-8 h-8",
}: {
  artifactId: string;
  stroke?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke={stroke}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {(artifactId === "astrolabe" || artifactId.includes("Astrolabe")) && (
        <>
          <circle cx="24" cy="26" r="15" />
          <ellipse cx="24" cy="26" rx="15" ry="6" />
          <ellipse cx="24" cy="26" rx="6" ry="15" />
          <circle cx="24" cy="8" r="2.5" />
          <line x1="12" y1="38" x2="36" y2="14" />
        </>
      )}
      {(artifactId === "wild_rose" || artifactId.includes("Rose")) && (
        <>
          <path d="M24 22 C18 22 15 16 19 11 C22 8 26 8 29 11 C33 16 30 22 24 22 Z" />
          <path d="M24 22 L24 41" />
          <path d="M24 31 C19 29 16 31 15 34 C19 35 22 33 24 31 Z" />
          <path d="M24 27 C29 25 32 27 33 30 C29 31 26 29 24 27 Z" />
        </>
      )}
      {(artifactId === "antique_key" ||
        artifactId === "key" ||
        artifactId.includes("Key")) && (
        <>
          <circle cx="15" cy="24" r="7" />
          <circle cx="15" cy="24" r="2.5" />
          <line x1="22" y1="24" x2="40" y2="24" />
          <line x1="34" y1="24" x2="34" y2="31" />
          <line x1="39" y1="24" x2="39" y2="29" />
        </>
      )}
      {(artifactId === "crystal_prism" ||
        artifactId === "prism" ||
        artifactId.includes("Prism")) && (
        <>
          <polygon points="24,8 40,37 8,37" />
          <line x1="24" y1="8" x2="20" y2="37" strokeOpacity="0.6" />
          <line x1="32" y1="23" x2="43" y2="19" strokeOpacity="0.5" />
          <line x1="34" y1="27" x2="44" y2="27" strokeOpacity="0.5" />
        </>
      )}
      {(artifactId === "unsent_letter" ||
        artifactId === "letter" ||
        artifactId.includes("Letter")) && (
        <>
          <rect x="7" y="13" width="34" height="23" rx="2" />
          <polyline points="7,14 24,27 41,14" />
          <circle cx="24" cy="26" r="3" />
        </>
      )}
      {(artifactId === "hourglass" || artifactId.includes("Hourglass")) && (
        <>
          <line x1="13" y1="9" x2="35" y2="9" />
          <line x1="13" y1="39" x2="35" y2="39" />
          <path d="M16 9 C16 19 24 21 24 24 C24 27 16 29 16 39" />
          <path d="M32 9 C32 19 24 21 24 24 C24 27 32 29 32 39" />
        </>
      )}
    </svg>
  );
}

/**
 * Chapter 05 — Precision Vault Relay Chronometer Schematic
 */
export function VaultChronometerArtwork({
  timeLeft,
  totalSeconds = 10,
  resolvedValue,
}: {
  timeLeft: number;
  totalSeconds?: number;
  resolvedValue?: number | null;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / totalSeconds));
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      viewBox="0 0 900 220"
      className="w-full h-auto block"
      role="img"
      aria-label="Mechanical three-dial pressure relay schematic with countdown chronometer"
    >
      <rect width="900" height="220" fill="#181614" />

      {/* Connecting conduits */}
      <line x1="160" y1="110" x2="740" y2="110" stroke="#3F3A34" strokeWidth="2" />

      {/* Dial A (Target) */}
      <g transform="translate(220, 110)">
        <circle cx="0" cy="0" r="46" fill="#221F1C" stroke="#C9B79B" strokeWidth="1.5" />
        <text
          x="0"
          y="-10"
          textAnchor="middle"
          fill="#8A8178"
          fontSize="10"
          letterSpacing="2"
        >
          DIAL A
        </text>
        <text
          x="0"
          y="16"
          textAnchor="middle"
          fill="#FAF7F2"
          fontSize="24"
          fontFamily="serif"
        >
          {resolvedValue !== null && resolvedValue !== undefined ? resolvedValue : "?"}
        </text>
      </g>

      {/* Center Live Countdown Chronometer Ring */}
      <g transform="translate(450, 110)">
        <circle cx="0" cy="0" r={radius} fill="#141210" stroke="#332E29" strokeWidth="4" />
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke={timeLeft <= 3 ? "#9E6B68" : "#8FA184"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90)"
          style={{ transition: "stroke-dashoffset 0.9s linear" }}
        />
        <text
          x="0"
          y="-8"
          textAnchor="middle"
          fill="#8A8178"
          fontSize="9"
          letterSpacing="2"
        >
          SECONDS
        </text>
        <text
          x="0"
          y="18"
          textAnchor="middle"
          fill="#FAF7F2"
          fontSize="26"
          fontFamily="monospace"
        >
          {String(timeLeft).padStart(2, "0")}
        </text>
      </g>

      {/* Dial C = 2 Reference */}
      <g transform="translate(680, 110)">
        <circle cx="0" cy="0" r="46" fill="#221F1C" stroke="#5E564D" strokeWidth="1.5" />
        <text
          x="0"
          y="-10"
          textAnchor="middle"
          fill="#8A8178"
          fontSize="10"
          letterSpacing="2"
        >
          DIAL C
        </text>
        <text
          x="0"
          y="16"
          textAnchor="middle"
          fill="#D6CEC0"
          fontSize="24"
          fontFamily="serif"
        >
          2
        </text>
      </g>
    </svg>
  );
}

/**
 * Chapter 06 — Four Fictional Horizon Plates (Observatory, Archives, Coastal Ruins, Botanical Glasshouse)
 */
export function WorldEnvironmentArtwork({
  environmentId,
}: {
  environmentId: string | null;
}) {
  const active = environmentId || "observatory";

  return (
    <svg
      viewBox="0 0 900 300"
      className="w-full h-auto block"
      role="img"
      aria-label={`Architectural vista illustrating ${active}`}
    >
      {active === "observatory" && (
        <>
          <rect width="900" height="300" fill="#1B1917" />
          <circle cx="640" cy="88" r="56" fill="#F3E5C8" fillOpacity="0.14" />
          <circle cx="640" cy="88" r="18" fill="#FAF7F2" fillOpacity="0.88" />
          <path
            d="M210 300 A240 240 0 0 1 690 300 Z"
            fill="#262320"
            stroke="#7A6D5D"
            strokeWidth="1.5"
          />
          <rect x="424" y="62" width="52" height="160" fill="#FAF7F2" fillOpacity="0.14" />
          <line x1="450" y1="190" x2="555" y2="95" stroke="#D8CCB8" strokeWidth="4" />
          <circle cx="450" cy="195" r="16" fill="#575049" />
        </>
      )}

      {active === "archives" && (
        <>
          <rect width="900" height="300" fill="#181512" />
          {[110, 280, 450, 620, 790].map((x) => (
            <path
              key={x}
              d={`M${x - 65} 300 L${x - 65} 90 A65 65 0 0 1 ${x + 65} 90 L${x + 65} 300`}
              fill="none"
              stroke="#5E5245"
              strokeWidth="1.5"
            />
          ))}
          <line x1="0" y1="185" x2="900" y2="185" stroke="#8A7B68" strokeWidth="2" />
          {[200, 450, 700].map((x) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2="115" stroke="#8A7B68" strokeWidth="1" />
              <circle cx={x} cy="122" r="7" fill="#F3E5C8" />
            </g>
          ))}
        </>
      )}

      {active === "coastal" && (
        <>
          <rect width="900" height="190" fill="#232629" />
          <rect y="190" width="900" height="110" fill="#191D20" />
          <line x1="0" y1="190" x2="900" y2="190" stroke="#9EA6AC" strokeOpacity="0.4" />
          {[190, 310, 560, 690].map((x, idx) => (
            <g key={x}>
              <rect
                x={x}
                y={74 + idx * 14}
                width="28"
                height={146 - idx * 14}
                fill="#E7E0D3"
                fillOpacity="0.85"
              />
              <rect
                x={x - 5}
                y={68 + idx * 14}
                width="38"
                height="8"
                fill="#FAF7F2"
              />
            </g>
          ))}
        </>
      )}

      {active === "greenhouse" && (
        <>
          <rect width="900" height="300" fill="#1A201B" />
          <path
            d="M120 300 Q450 -10 780 300"
            fill="#E9ECE6"
            fillOpacity="0.08"
            stroke="#97A68F"
            strokeWidth="1.5"
          />
          {[240, 345, 450, 555, 660].map((x) => (
            <line
              key={x}
              x1={x}
              y1="65"
              x2={x}
              y2="300"
              stroke="#97A68F"
              strokeOpacity="0.3"
            />
          ))}
          <ellipse
            cx="450"
            cy="264"
            rx="190"
            ry="18"
            fill="#DCE3D8"
            fillOpacity="0.16"
            stroke="#97A68F"
            strokeOpacity="0.5"
          />
        </>
      )}
    </svg>
  );
}

