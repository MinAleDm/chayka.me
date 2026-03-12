<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getProjects, type ContentEntry } from "../lib/content";
import myLogo from "../assets/images/logos/mylogo.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import aimsoraLogo from "../assets/images/logos/aimsora.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";

type GithubRepo = {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  pushed_at?: string | null;
  updated_at?: string | null;
  language: string | null;
  topics?: string[];
  private: boolean;
  activity_at?: string | null;
};

type GithubCommitSearchItem = {
  commit?: {
    author?: {
      date?: string | null;
    };
    committer?: {
      date?: string | null;
    };
  };
  repository?: GithubRepo;
};

type GithubCommitSearchResponse = {
  items?: GithubCommitSearchItem[];
};

const GITHUB_USERNAME = "MinAleDm";
const GITHUB_REPOS_PER_PAGE = 100;
const GITHUB_SEARCH_RESULTS_PER_PAGE = 100;
const GITHUB_MAX_PAGES = 10;
const FALLBACK_SUMMARY = "Описание проекта не заполнено на GitHub.";
const PINNED_REPO_NAMES = ["StackMIREA", "chayka.me"] as const;
const EXCLUDED_REPO_NAMES = [GITHUB_USERNAME] as const;

const fallbackProjects = getProjects();
const projects = ref<ContentEntry[]>([]);
const isLoading = ref(true);
const errorText = ref("");

type ProjectGroup = {
  year: string;
  entries: ContentEntry[];
};

const getGroupLabel = (project: ContentEntry): string => {
  const rawDate = project.date?.trim();

  if (!rawDate) return "No date";
  if (rawDate.toLowerCase() === "pinned") return "Pinned";

  const yearMatch = rawDate.match(/^\d{4}/);
  return yearMatch?.[0] ?? "No date";
};

const compareGroups = (left: string, right: string): number => {
  if (left === "Pinned" && right !== "Pinned") return -1;
  if (right === "Pinned" && left !== "Pinned") return 1;

  const leftYear = Number(left);
  const rightYear = Number(right);
  const leftIsYear = Number.isInteger(leftYear);
  const rightIsYear = Number.isInteger(rightYear);

  if (leftIsYear && rightIsYear) return rightYear - leftYear;
  if (leftIsYear) return -1;
  if (rightIsYear) return 1;
  return left.localeCompare(right);
};

const projectGroups = computed<ProjectGroup[]>(() => {
  const groups = new Map<string, ContentEntry[]>();

  for (const project of projects.value) {
    const year = getGroupLabel(project);
    const bucket = groups.get(year);

    if (bucket) {
      bucket.push(project);
    } else {
      groups.set(year, [project]);
    }
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => compareGroups(left, right))
    .map(([year, entries]) => ({
      year,
      entries: [...entries].sort((left, right) => {
        const leftDate = left.date ? Date.parse(left.date) : 0;
        const rightDate = right.date ? Date.parse(right.date) : 0;
        const safeLeftDate = Number.isNaN(leftDate) ? 0 : leftDate;
        const safeRightDate = Number.isNaN(rightDate) ? 0 : rightDate;
        return safeRightDate - safeLeftDate;
      })
    }));
});

const fallbackText = "No info yet";

type ProjectLogoMeta = {
  src: string;
  alt: string;
};

const PROJECT_LOGOS: Record<string, ProjectLogoMeta> = {
  "chayka.me": { src: myLogo, alt: "chayka.me logo" },
  stackmirea: { src: stackMireaLogo, alt: "StackMIREA logo" },
  crossroad: { src: crossRoadLogo, alt: "CrossRoad logo" }
};

const PROJECT_OWNER_LOGOS: Record<string, ProjectLogoMeta> = {
  aimsora: { src: aimsoraLogo, alt: "aimsora logo" }
};

const getRepoSlugFromLink = (link: string | undefined): string => {
  if (!link) return "";

  try {
    const url = new URL(link);
    const segments = url.pathname.split("/").filter(Boolean);
    return (segments.at(-1) ?? "").toLowerCase();
  } catch {
    return "";
  }
};

const getRepoOwnerFromLink = (link: string | undefined): string => {
  if (!link) return "";

  try {
    const url = new URL(link);
    const segments = url.pathname.split("/").filter(Boolean);
    return (segments[0] ?? "").toLowerCase();
  } catch {
    return "";
  }
};

const resolveProjectLogo = (project: ContentEntry): ProjectLogoMeta | undefined => {
  const titleKey = project.title.trim().toLowerCase();
  const repoKey = getRepoSlugFromLink(project.link);
  const ownerKey = getRepoOwnerFromLink(project.link);

  return PROJECT_LOGOS[repoKey] ?? PROJECT_LOGOS[titleKey] ?? PROJECT_OWNER_LOGOS[ownerKey];
};

const projectLogoSrc = (project: ContentEntry): string | undefined => resolveProjectLogo(project)?.src;
const projectLogoAlt = (project: ContentEntry): string =>
  resolveProjectLogo(project)?.alt ?? `${project.title} logo`;

const normalizeDate = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

const mapRepoToProject = (repo: GithubRepo): ContentEntry => {
  const lastActivity = normalizeDate(repo.activity_at ?? repo.pushed_at ?? repo.updated_at);
  const description = repo.description?.trim();
  const tags = [repo.language, ...(repo.topics ?? [])].filter(Boolean).slice(0, 4) as string[];

  return {
    slug: repo.name.toLowerCase(),
    title: repo.name,
    date: lastActivity,
    tags,
    summary: description || FALLBACK_SUMMARY,
    link: repo.html_url,
    html: ""
  };
};

const createPinnedFallbackProject = (repoName: string): ContentEntry => {
  if (repoName === "StackMIREA") {
    return {
      slug: "stackmirea",
      title: "StackMIREA",
      date: "Pinned",
      tags: ["Pinned"],
      summary:
        "StackMIREA — интерактивная образовательная платформа и цифровая методичка для студентов IT-направления МИРЭА.",
      link: "https://github.com/MinAleDm/StackMIREA",
      html: ""
    };
  }

  return {
    slug: repoName.toLowerCase(),
    title: repoName,
    date: "Pinned",
    tags: ["Pinned"],
    summary: FALLBACK_SUMMARY,
    link: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
    html: ""
  };
};

async function fetchAllPublicSourceRepos(): Promise<GithubRepo[]> {
  const allRepos: GithubRepo[] = [];

  for (let page = 1; page <= GITHUB_MAX_PAGES; page += 1) {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&sort=pushed&per_page=${GITHUB_REPOS_PER_PAGE}&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub repos request failed: ${response.status}`);
    }

    const pageRepos = (await response.json()) as GithubRepo[];
    allRepos.push(...pageRepos);

    if (pageRepos.length < GITHUB_REPOS_PER_PAGE) {
      break;
    }
  }

  return allRepos.filter((repo) => !repo.private);
}

async function fetchContributedPublicRepos(): Promise<GithubRepo[]> {
  try {
    const repos = new Map<string, GithubRepo>();

    for (let page = 1; page <= GITHUB_MAX_PAGES; page += 1) {
      const query = encodeURIComponent(`author:${GITHUB_USERNAME} is:public`);
      const response = await fetch(
        `https://api.github.com/search/commits?q=${query}&sort=author-date&order=desc&per_page=${GITHUB_SEARCH_RESULTS_PER_PAGE}&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.cloak-preview+json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub commit search failed: ${response.status}`);
      }

      const payload = (await response.json()) as GithubCommitSearchResponse;
      const pageItems = payload.items ?? [];

      for (const item of pageItems) {
        const repo = item.repository;
        if (!repo || repo.private) continue;

        const repoKey = repo.full_name.toLowerCase();
        const commitDate = item.commit?.author?.date ?? item.commit?.committer?.date ?? null;
        const previous = repos.get(repoKey);

        if (!previous) {
          repos.set(repoKey, {
            ...repo,
            activity_at: commitDate ?? repo.pushed_at ?? repo.updated_at ?? null
          });
          continue;
        }

        const previousMs = Date.parse(previous.activity_at ?? previous.pushed_at ?? previous.updated_at ?? "");
        const nextMs = Date.parse(commitDate ?? repo.pushed_at ?? repo.updated_at ?? "");

        if (!Number.isNaN(nextMs) && (Number.isNaN(previousMs) || nextMs > previousMs)) {
          repos.set(repoKey, {
            ...previous,
            ...repo,
            activity_at: commitDate ?? repo.pushed_at ?? repo.updated_at ?? previous.activity_at ?? null
          });
        }
      }

      if (pageItems.length < GITHUB_SEARCH_RESULTS_PER_PAGE) {
        break;
      }
    }

    if (repos.size > 0) {
      return Array.from(repos.values());
    }
  } catch {
    // Fallback when commit search is unavailable or rate-limited.
  }

  return fetchAllPublicSourceRepos();
}

async function loadProjects() {
  isLoading.value = true;
  errorText.value = "";

  try {
    const excludedNames = new Set(EXCLUDED_REPO_NAMES.map((name) => name.toLowerCase()));
    const pinnedNames = new Set(PINNED_REPO_NAMES.map((name) => name.toLowerCase()));

    const repos = (await fetchContributedPublicRepos()).filter(
      (repo) => !excludedNames.has(repo.name.toLowerCase())
    );

    const pinnedProjects = PINNED_REPO_NAMES.map((pinnedName) => {
      const repo = repos.find((entry) => entry.name.toLowerCase() === pinnedName.toLowerCase());
      if (!repo) return createPinnedFallbackProject(pinnedName);

      return {
        ...mapRepoToProject(repo),
        date: "Pinned"
      } satisfies ContentEntry;
    });

    const nonPinnedProjects = repos
      .filter((repo) => !pinnedNames.has(repo.name.toLowerCase()))
      .map(mapRepoToProject);

    const mapped = [...pinnedProjects, ...nonPinnedProjects];
    projects.value = mapped.length > 0 ? mapped : fallbackProjects;

    if (mapped.length === 0) {
      errorText.value = "GitHub не вернул проекты с вашими коммитами, показываю локальный список.";
    }
  } catch {
    projects.value = fallbackProjects;
    errorText.value = "GitHub API временно недоступен, показываю локальный список.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadProjects();
});
</script>

<template>
  <section class="page-header reveal projects-hero-centered">
    <p class="eyebrow">Projects</p>
    <h1 class="page-title">Рабочие и pet-проекты: от идеи до реального релиза.</h1>
    <p class="page-lead">
      Ниже собран список текущих и завершенных проектов.
      минимум шума, максимум фактов.
    </p>
    <p class="page-lorem">
      Все мы с чего то начинали, ведь так?
    </p>
  </section>

  <section class="list-section reveal">
    <p v-if="isLoading" class="gh-muted">Загружаю проекты с вашими коммитами с GitHub...</p>
    <p v-else-if="errorText" class="gh-error">{{ errorText }}</p>

    <div v-for="group in projectGroups" :key="group.year" class="year-group">
      <h2 class="year-label">{{ group.year }}</h2>

      <div class="entry-list">
        <article v-for="project in group.entries" :key="project.slug" class="entry-row project-row">
          <div class="entry-main">
            <h3 class="entry-title">
              <a
                v-if="project.link"
                :href="project.link"
                target="_blank"
                rel="noreferrer noopener"
                class="entry-anchor entry-title-content"
              >
                <img
                  v-if="projectLogoSrc(project)"
                  :src="projectLogoSrc(project)"
                  :alt="projectLogoAlt(project)"
                  class="entry-logo"
                  loading="lazy"
                  decoding="async"
                />
                {{ project.title }}
              </a>
              <span v-else class="entry-title-content">
                <img
                  v-if="projectLogoSrc(project)"
                  :src="projectLogoSrc(project)"
                  :alt="projectLogoAlt(project)"
                  class="entry-logo"
                  loading="lazy"
                  decoding="async"
                />
                {{ project.title }}
              </span>
            </h3>
            <p class="entry-summary">{{ project.summary || fallbackText }}</p>

            <p v-if="project.tags.length" class="entry-tags">
              {{ project.tags.join(" · ") }}
            </p>
          </div>
          <span class="entry-date">{{ project.date ?? "n/a" }}</span>
        </article>
      </div>
    </div>
  </section>
</template>
