export type SiteTheme = "dark" | "light";

type TransitionOrigin = {
  x: number;
  y: number;
};

type ThemeToggleOptions = {
  origin?: TransitionOrigin;
};

type ViewTransitionLike = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransitionLike;
};

const STORAGE_KEY = "minkin-theme";

const isSiteTheme = (value: string | null): value is SiteTheme => value === "dark" || value === "light";

const readStoredTheme = (): SiteTheme | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isSiteTheme(value) ? value : null;
  } catch {
    return null;
  }
};

const storeTheme = (theme: SiteTheme): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
};

const getMaxRadius = ({ x, y }: TransitionOrigin): number => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
};

export const applyTheme = (theme: SiteTheme): void => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export const getActiveTheme = (): SiteTheme => {
  const current = document.documentElement.dataset.theme ?? null;
  if (isSiteTheme(current)) return current;
  return readStoredTheme() ?? "dark";
};

export const initTheme = (): SiteTheme => {
  const theme = readStoredTheme() ?? "dark";
  applyTheme(theme);
  return theme;
};

export const toggleTheme = async (options: ThemeToggleOptions = {}): Promise<SiteTheme> => {
  const nextTheme: SiteTheme = getActiveTheme() === "dark" ? "light" : "dark";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as DocumentWithViewTransition;

  if (!doc.startViewTransition || !options.origin || prefersReducedMotion) {
    applyTheme(nextTheme);
    storeTheme(nextTheme);
    return nextTheme;
  }

  const origin = options.origin;
  const endRadius = getMaxRadius(origin);
  const transition = doc.startViewTransition(() => {
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });

  await transition.ready;

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${origin.x}px ${origin.y}px)`,
        `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`
      ]
    },
    {
      duration: 560,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      pseudoElement: "::view-transition-new(root)"
    }
  );

  return nextTheme;
};
