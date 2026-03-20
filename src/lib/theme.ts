interface ThemePalette {
  accent: string;
  accent2: string;
  accentGlow: string;
  accent2Glow: string;
  orbA: string;
  orbB: string;
  bgGlowA: string;
  bgGlowB: string;
}

const PALETTES: ThemePalette[] = [
  {
    accent: "#1d4ed8",
    accent2: "#bfdbfe",
    accentGlow: "rgba(29, 78, 216, 0.42)",
    accent2Glow: "rgba(191, 219, 254, 0.34)",
    orbA: "#1e40af",
    orbB: "#93c5fd",
    bgGlowA: "rgba(29, 78, 216, 0.18)",
    bgGlowB: "rgba(191, 219, 254, 0.16)"
  },
  {
    accent: "#2563eb",
    accent2: "#dbeafe",
    accentGlow: "rgba(37, 99, 235, 0.44)",
    accent2Glow: "rgba(219, 234, 254, 0.3)",
    orbA: "#1d4ed8",
    orbB: "#bfdbfe",
    bgGlowA: "rgba(37, 99, 235, 0.2)",
    bgGlowB: "rgba(147, 197, 253, 0.18)"
  },
  {
    accent: "#0f172a",
    accent2: "#60a5fa",
    accentGlow: "rgba(15, 23, 42, 0.34)",
    accent2Glow: "rgba(96, 165, 250, 0.3)",
    orbA: "#1e3a8a",
    orbB: "#60a5fa",
    bgGlowA: "rgba(15, 23, 42, 0.14)",
    bgGlowB: "rgba(96, 165, 250, 0.16)"
  },
  {
    accent: "#1e40af",
    accent2: "#93c5fd",
    accentGlow: "rgba(30, 64, 175, 0.42)",
    accent2Glow: "rgba(147, 197, 253, 0.3)",
    orbA: "#0f172a",
    orbB: "#bfdbfe",
    bgGlowA: "rgba(30, 64, 175, 0.18)",
    bgGlowB: "rgba(191, 219, 254, 0.18)"
  },
  {
    accent: "#3b82f6",
    accent2: "#f8fafc",
    accentGlow: "rgba(59, 130, 246, 0.4)",
    accent2Glow: "rgba(248, 250, 252, 0.24)",
    orbA: "#2563eb",
    orbB: "#dbeafe",
    bgGlowA: "rgba(59, 130, 246, 0.16)",
    bgGlowB: "rgba(248, 250, 252, 0.12)"
  }
];

const STORAGE_KEY = "chayka_palette_index";

const readPreviousIndex = (): number | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) return null;
    if (parsed < 0 || parsed >= PALETTES.length) return null;
    return parsed;
  } catch {
    return null;
  }
};

const storeIndex = (index: number): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // ignore storage errors in private mode
  }
};

const pickPaletteIndex = (): number => {
  if (PALETTES.length === 1) return 0;

  const previous = readPreviousIndex();
  if (previous === null) {
    return Math.floor(Math.random() * PALETTES.length);
  }

  const candidates = PALETTES.map((_, index) => index).filter((index) => index !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const applyRandomPalette = (): void => {
  const root = document.documentElement;
  const index = pickPaletteIndex();
  const palette = PALETTES[index];

  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-2", palette.accent2);
  root.style.setProperty("--accent-glow", palette.accentGlow);
  root.style.setProperty("--accent-2-glow", palette.accent2Glow);
  root.style.setProperty("--orb-a", palette.orbA);
  root.style.setProperty("--orb-b", palette.orbB);
  root.style.setProperty("--bg-glow-a", palette.bgGlowA);
  root.style.setProperty("--bg-glow-b", palette.bgGlowB);

  storeIndex(index);
};
