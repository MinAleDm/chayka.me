import brandMark from "../assets/brand-mark.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";
import simpleParserLogo from "../assets/images/logos/simpleparser.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import {
  getPublicGithubProjectRepositories,
  getRepositoryTags,
  type GithubRepository
} from "./content";

const UNKNOWN_LABEL = "Unknown";

export type ProjectCardIcon =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "monogram";
      text: string;
    };

export type ProjectCard = {
  id: string;
  title: string;
  repository: string;
  href: string;
  summary: string;
  startedAt: string | null;
  startedYear: string;
  startedLabel: string;
  updatedLabel: string;
  tags: string[];
  isPinned: boolean;
  icon: ProjectCardIcon;
};

export type ProjectYearSection = {
  year: string;
  anchorId: string;
  projects: ProjectCard[];
};

const PROJECT_ICON_MAP: Record<string, { src: string; alt: string }> = {
  "minkinad/minkin.tech": { src: brandMark, alt: "minkin.tech logo" },
  "minkinad/stackmirea": { src: stackMireaLogo, alt: "StackMIREA logo" },
  "minkinad/crossroad": { src: crossRoadLogo, alt: "CrossRoad logo" },
  "minkinad/adm-parser": { src: simpleParserLogo, alt: "adm-parser logo" }
};

const monthYearFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

const formatMonthYear = (value: string | null): string => {
  if (!value) return UNKNOWN_LABEL;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return UNKNOWN_LABEL;
  return monthYearFormatter.format(parsed);
};

const getStartedYear = (value: string | null): string => {
  if (!value) return UNKNOWN_LABEL;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return UNKNOWN_LABEL;
  return String(parsed.getFullYear());
};

const getRepositoryStartValue = (repository: GithubRepository): string | null =>
  repository.startedAt ?? repository.activityAt ?? repository.updatedAt ?? repository.pushedAt ?? null;

const getRepositoryActiveValue = (repository: GithubRepository): string | null =>
  repository.activityAt ?? repository.updatedAt ?? repository.pushedAt ?? null;

const createMonogram = (value: string): string => {
  const chunks = value
    .split(/[^a-zA-Z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length >= 2) {
    return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
  }

  const compact = chunks[0] ?? value.replace(/[^a-zA-Z0-9]+/g, "");
  return compact.slice(0, 2).toUpperCase() || "PR";
};

const getProjectIcon = (repository: GithubRepository): ProjectCardIcon => {
  const directKey = repository.fullName.toLowerCase();
  const fallbackKey = `${repository.owner}/${repository.name}`.toLowerCase();
  const match = PROJECT_ICON_MAP[directKey] ?? PROJECT_ICON_MAP[fallbackKey];

  if (match) {
    return {
      type: "image",
      src: match.src,
      alt: match.alt
    };
  }

  return {
    type: "monogram",
    text: createMonogram(repository.name)
  };
};

const toProjectCard = (repository: GithubRepository): ProjectCard => {
  const startValue = getRepositoryStartValue(repository);

  return {
    id: repository.fullName,
    title: repository.name,
    repository: repository.fullName,
    href: repository.htmlUrl,
    summary: repository.description || "Repository on GitHub. Details will grow with the project itself.",
    startedAt: startValue,
    startedYear: getStartedYear(startValue),
    startedLabel: formatMonthYear(startValue),
    updatedLabel: formatMonthYear(getRepositoryActiveValue(repository)),
    tags: getRepositoryTags(repository, 4),
    isPinned: repository.isPinned,
    icon: getProjectIcon(repository)
  };
};

const compareProjectCards = (left: ProjectCard, right: ProjectCard): number => {
  const yearDiff = Number(right.startedYear) - Number(left.startedYear);
  if (Number.isFinite(yearDiff) && yearDiff !== 0) return yearDiff;

  if (left.startedYear === UNKNOWN_LABEL && right.startedYear !== UNKNOWN_LABEL) return 1;
  if (right.startedYear === UNKNOWN_LABEL && left.startedYear !== UNKNOWN_LABEL) return -1;
  if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;

  const leftStartedMs = Date.parse(left.startedAt ?? "");
  const rightStartedMs = Date.parse(right.startedAt ?? "");
  const safeLeftStartedMs = Number.isNaN(leftStartedMs) ? 0 : leftStartedMs;
  const safeRightStartedMs = Number.isNaN(rightStartedMs) ? 0 : rightStartedMs;
  if (safeRightStartedMs !== safeLeftStartedMs) return safeRightStartedMs - safeLeftStartedMs;

  return left.title.localeCompare(right.title);
};

const compareYearLabels = (leftYear: string, rightYear: string): number => {
  if (leftYear === rightYear) return 0;
  if (leftYear === UNKNOWN_LABEL) return 1;
  if (rightYear === UNKNOWN_LABEL) return -1;
  return Number(rightYear) - Number(leftYear);
};

export const buildProjectCards = (
  repositories: GithubRepository[] = getPublicGithubProjectRepositories()
): ProjectCard[] => repositories.map(toProjectCard).sort(compareProjectCards);

export const groupProjectCardsByYear = (projects: ProjectCard[]): ProjectYearSection[] => {
  const sectionsMap = new Map<string, ProjectCard[]>();

  for (const project of projects) {
    const current = sectionsMap.get(project.startedYear) ?? [];
    current.push(project);
    sectionsMap.set(project.startedYear, current);
  }

  return Array.from(sectionsMap.entries())
    .sort(([leftYear], [rightYear]) => compareYearLabels(leftYear, rightYear))
    .map(([year, projects]) => ({
      year,
      anchorId: `projects-year-${year.toLowerCase()}`,
      projects
    }));
};

export const getProjectYearSections = (): ProjectYearSection[] =>
  groupProjectCardsByYear(buildProjectCards());
