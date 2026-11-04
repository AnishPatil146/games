import { CharacterId, CharacterExpression } from "./types";

export const CHARACTER_META: Record<
  CharacterId,
  {
    name: string;
    role: string;
    themeColor: string;
    badgeBg: string;
  }
> = {
  aarav: {
    name: "AARAV",
    role: "The Reluctant Investigator",
    themeColor: "#8A8178",
    badgeBg: "#2A2624",
  },
  aanya: {
    name: "AANYA",
    role: "The Analytical Observer",
    themeColor: "#9E6B68",
    badgeBg: "#2C2224",
  },
  warden: {
    name: "THE WARDEN",
    role: "Architect of the Experiment",
    themeColor: "#545E4E",
    badgeBg: "#1C221A",
  },
  vesper: {
    name: "COUNT VESPER",
    role: "The Nocturnal Tactician",
    themeColor: "#A83232",
    badgeBg: "#2B1616",
  },
  halden: {
    name: "MR. HALDEN",
    role: "The Custodian",
    themeColor: "#A08C65",
    badgeBg: "#28231A",
  },
  mira: {
    name: "MIRA",
    role: "The Stranded Survivor",
    themeColor: "#5B7A68",
    badgeBg: "#1B2820",
  },
  narrator: {
    name: "CHRONICLER",
    role: "Environmental Observer",
    themeColor: "#FAF7F2",
    badgeBg: "#12100E",
  },
  system: {
    name: "INTERFACE",
    role: "Terminal Telemetry",
    themeColor: "#52B788",
    badgeBg: "#0E1812",
  },
};

export function getCharacterSprite(
  id: CharacterId,
  expression: CharacterExpression = "neutral"
): string | null {
  if (id === "narrator" || id === "system") {
    return null;
  }

  // Exact file lookup
  return `/art/characters/${id}_${expression}.png`;
}
