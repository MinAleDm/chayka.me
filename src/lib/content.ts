import githubData from "../content/generated/github-data.json";
import siteConfig from "../content/site-config.json";
import { parseDateToTimestamp } from "./dates";
import { parseMarkdown, stripMarkdown, type FrontmatterObject, type FrontmatterValue } from "./markdown";

export interface ContentEntry {
  slug: string;
  title: string;
  date?: string;
  tags: string[];
  summary: string;
  link?: string;
  order?: number;
  html: string;
  repository?: string;
  logoKey?: string;
  source: "local" | "github";
}

export interface HomeStackItem {
  name: string;
  href?: string;
}

export interface HomeStackGroup {
  title: string;
  separator?: string;
  items: HomeStackItem[];
}

export interface HomeContent {
  eyebrow: string;
  title: string;
  lead: string;
  subtitle: string;
  supportTitle: string;
  supportText: string;
  stackGroups: HomeStackGroup[];
  html: string;
}

export interface GithubActivity {
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  repoName: string;
  repoUrl: string;
  projectDescription: string;
  createdAt: string;
}

export interface GithubRepository {
  fullName: string;
  name: string;
  owner: string;
  htmlUrl: string;
  description: string;
  language: string;
  topics: string[];
  pushedAt: string | null;
  updatedAt: string | null;
  activityAt: string | null;
  isPinned: boolean;
}

interface GithubDataPayload {
  activity: {
    commitSha: string;
    commitUrl: string;
    commitMessage: string;
    repoName: string;
    repoUrl: string;
    projectDescription: string;
    createdAt: string;
  } | null;
  repositories: GithubRepository[];
}

export const siteMetadata = siteConfig;
const githubPayload = githubData as GithubDataPayload;

const toStringValue = (value: FrontmatterValue | undefined): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
};

const toNumberValue = (value: FrontmatterValue | undefined): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  return undefined;
};

const toStringArray = (value: FrontmatterValue | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") return [value];
  return [];
};

const isObjectValue = (value: FrontmatterValue | undefined): value is FrontmatterObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getSlug = (path: string): string => {
  const file = path.split("/").at(-1) ?? "";
  return file.replace(/\.md$/, "");
};

const createSummary = (rawBody: string): string => {
  const plain = stripMarkdown(rawBody);
  if (plain.length <= 170) return plain;
  return `${plain.slice(0, 167).trimEnd()}...`;
};

const normalizeRepository = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/^https:\/\/github\.com\//i, "").replace(/\/+$/, "");
};

const getRepositoryFromLink = (link: string | undefined): string | undefined => {
  if (!link) return undefined;

  try {
    const url = new URL(link);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return undefined;
    return `${segments[0]}/${segments[1]}`;
  } catch {
    return undefined;
  }
};

const buildEntries = (modules: Record<string, string>, source: "local" | "github" = "local"): ContentEntry[] => {
  return Object.entries(modules).map(([path, raw]) => {
    const { attributes, body, html } = parseMarkdown(raw);
    const title = toStringValue(attributes.title) ?? getSlug(path);
    const date = toStringValue(attributes.date);
    const summary = toStringValue(attributes.summary) ?? createSummary(body);
    const link = toStringValue(attributes.link);
    const order = toNumberValue(attributes.order);
    const repository = normalizeRepository(toStringValue(attributes.repository) ?? getRepositoryFromLink(link));
    const logoKey = toStringValue(attributes.logoKey);

    return {
      slug: getSlug(path),
      title,
      date,
      tags: toStringArray(attributes.tags),
      summary,
      link,
      order,
      html,
      repository,
      logoKey,
      source
    };
  });
};

const normalizeHomeStackGroups = (value: FrontmatterValue | undefined): HomeStackGroup[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObjectValue)
    .map((group) => {
      const itemsValue = group.items;
      const items = Array.isArray(itemsValue)
        ? itemsValue
            .filter(isObjectValue)
            .map((item) => ({
              name: toStringValue(item.name) ?? "",
              href: toStringValue(item.href)
            }))
            .filter((item) => item.name)
        : [];

      return {
        title: toStringValue(group.title) ?? "",
        separator: toStringValue(group.separator),
        items
      };
    })
    .filter((group) => group.title && group.items.length > 0);
};

const homeModules = import.meta.glob("../content/home.md", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

const blogModules = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

const projectModules = import.meta.glob("../content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

export const getHomePageContent = (): HomeContent => {
  const raw = Object.values(homeModules)[0] ?? "# Home\n";
  const { attributes, body, html } = parseMarkdown(raw);

  return {
    eyebrow: toStringValue(attributes.eyebrow) ?? "Frontend / Fullstack Engineer",
    title: toStringValue(attributes.title) ?? siteConfig.displayName,
    lead: toStringValue(attributes.lead) ?? siteConfig.defaultDescription,
    subtitle: toStringValue(attributes.subtitle) ?? "",
    supportTitle: toStringValue(attributes.supportTitle) ?? "Поддержка open source",
    supportText: toStringValue(attributes.supportText) ?? "",
    stackGroups: normalizeHomeStackGroups(attributes.stackGroups),
    html: body ? html : ""
  };
};

export const getBlogPosts = (): ContentEntry[] =>
  buildEntries(blogModules).sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));

export const getBlogPostBySlug = (slug: string): ContentEntry | undefined =>
  getBlogPosts().find((post) => post.slug === slug);

export const getGithubActivity = (): GithubActivity | null => {
  const activity = githubPayload.activity;
  if (!activity?.createdAt) return null;

  return {
    commitSha: activity.commitSha,
    commitUrl: activity.commitUrl,
    commitMessage: activity.commitMessage,
    repoName: activity.repoName,
    repoUrl: activity.repoUrl,
    projectDescription: activity.projectDescription,
    createdAt: activity.createdAt
  };
};

export const getGithubRepositories = (): GithubRepository[] =>
  [...githubPayload.repositories].map((repository) => ({
    fullName: repository.fullName,
    name: repository.name,
    owner: repository.owner,
    htmlUrl: repository.htmlUrl,
    description: repository.description,
    language: repository.language,
    topics: repository.topics,
    pushedAt: repository.pushedAt,
    updatedAt: repository.updatedAt,
    activityAt: repository.activityAt,
    isPinned: repository.isPinned
  }));

const mapGithubRepoToProject = (repository: GithubRepository): ContentEntry => {
  const tags = [repository.language, ...repository.topics].filter(Boolean).slice(0, 5);

  return {
    slug: repository.name.toLowerCase(),
    title: repository.name,
    date: repository.isPinned ? "Pinned" : repository.activityAt ?? repository.updatedAt ?? repository.pushedAt ?? undefined,
    tags,
    summary: repository.description || "Описание проекта не заполнено на GitHub.",
    link: repository.htmlUrl,
    repository: repository.fullName,
    html: "",
    source: "github"
  };
};

const matchesProjectRepository = (project: ContentEntry, repository: GithubRepository): boolean => {
  const explicitRepository = normalizeRepository(project.repository);
  if (explicitRepository) {
    return explicitRepository.toLowerCase() === repository.fullName.toLowerCase();
  }

  const fromLink = normalizeRepository(getRepositoryFromLink(project.link));
  if (fromLink) {
    return fromLink.toLowerCase() === repository.fullName.toLowerCase();
  }

  return project.slug.toLowerCase() === repository.name.toLowerCase();
};

const mergeProjectWithRepository = (project: ContentEntry, repository: GithubRepository | undefined): ContentEntry => {
  if (!repository) return project;

  const tags = project.tags.length > 0
    ? project.tags
    : [repository.language, ...repository.topics].filter(Boolean).slice(0, 5);

  return {
    ...project,
    date: project.date ?? (repository.isPinned ? "Pinned" : repository.activityAt ?? repository.updatedAt ?? repository.pushedAt ?? undefined),
    tags,
    summary: project.summary || repository.description || "Описание проекта не заполнено на GitHub.",
    link: project.link ?? repository.htmlUrl,
    repository: project.repository ?? repository.fullName
  };
};

export const getProjects = (): ContentEntry[] => {
  const localProjects = buildEntries(projectModules);
  const repositories = getGithubRepositories().filter(
    (repository) => repository.name.toLowerCase() !== siteConfig.githubUsername.toLowerCase()
  );

  const matchedRepositories = new Set<string>();
  const mergedLocalProjects = localProjects.map((project) => {
    const repository = repositories.find((entry) => matchesProjectRepository(project, entry));
    if (repository) {
      matchedRepositories.add(repository.fullName.toLowerCase());
    }
    return mergeProjectWithRepository(project, repository);
  });

  const generatedProjects = repositories
    .filter((repository) => !matchedRepositories.has(repository.fullName.toLowerCase()))
    .map(mapGithubRepoToProject);

  return [...mergedLocalProjects, ...generatedProjects].sort((left, right) => {
    if (typeof left.order === "number" && typeof right.order === "number") {
      return left.order - right.order;
    }

    if (typeof left.order === "number") return -1;
    if (typeof right.order === "number") return 1;
    return parseDateToTimestamp(right.date) - parseDateToTimestamp(left.date) || left.title.localeCompare(right.title);
  });
};
