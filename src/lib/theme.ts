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
    accent: "#62e6c8",
    accent2: "#64a6ff",
    accentGlow: "rgba(98, 230, 200, 0.8)",
    accent2Glow: "rgba(100, 166, 255, 0.5)",
    orbA: "#5ea7ff",
    orbB: "#57eec8",
    bgGlowA: "rgba(101, 166, 255, 0.22)",
    bgGlowB: "rgba(98, 230, 200, 0.18)"
  },
  {
    accent: "#ffd166",
    accent2: "#ff6b6b",
    accentGlow: "rgba(255, 209, 102, 0.78)",
    accent2Glow: "rgba(255, 107, 107, 0.5)",
    orbA: "#ff9e4f",
    orbB: "#ff5f7a",
    bgGlowA: "rgba(255, 158, 79, 0.24)",
    bgGlowB: "rgba(255, 95, 122, 0.2)"
  },
  {
    accent: "#b8f576",
    accent2: "#43c59e",
    accentGlow: "rgba(184, 245, 118, 0.76)",
    accent2Glow: "rgba(67, 197, 158, 0.5)",
    orbA: "#a8f35c",
    orbB: "#35c79e",
    bgGlowA: "rgba(168, 243, 92, 0.2)",
    bgGlowB: "rgba(53, 199, 158, 0.18)"
  },
  {
    accent: "#ff9fdf",
    accent2: "#8f7bff",
    accentGlow: "rgba(255, 159, 223, 0.78)",
    accent2Glow: "rgba(143, 123, 255, 0.5)",
    orbA: "#f38ad6",
    orbB: "#8774ff",
    bgGlowA: "rgba(243, 138, 214, 0.2)",
    bgGlowB: "rgba(135, 116, 255, 0.2)"
  },
  {
    accent: "#7cf7f1",
    accent2: "#4f91ff",
    accentGlow: "rgba(124, 247, 241, 0.76)",
    accent2Glow: "rgba(79, 145, 255, 0.5)",
    orbA: "#71ebff",
    orbB: "#3d8dff",
    bgGlowA: "rgba(113, 235, 255, 0.2)",
    bgGlowB: "rgba(61, 141, 255, 0.2)"
  },
  {
    accent: "#f7b267",
    accent2: "#f4845f",
    accentGlow: "rgba(247, 178, 103, 0.78)",
    accent2Glow: "rgba(244, 132, 95, 0.5)",
    orbA: "#f6a85e",
    orbB: "#f67768",
    bgGlowA: "rgba(246, 168, 94, 0.2)",
    bgGlowB: "rgba(246, 119, 104, 0.2)"
  },
  {
    accent: "#9bf6ff",
    accent2: "#a0c4ff",
    accentGlow: "rgba(155, 246, 255, 0.78)",
    accent2Glow: "rgba(160, 196, 255, 0.5)",
    orbA: "#91f2ff",
    orbB: "#96bbff",
    bgGlowA: "rgba(145, 242, 255, 0.2)",
    bgGlowB: "rgba(150, 187, 255, 0.2)"
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
