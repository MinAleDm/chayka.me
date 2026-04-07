<script setup lang="ts">
import { computed } from "vue";
import brandMark from "../assets/brand-mark.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";
import simpleParserLogo from "../assets/images/logos/simpleparser.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import { getGithubRepositories, siteMetadata, type GithubRepository } from "../lib/content";
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

usePageMeta(getStaticPageMeta("projects"));

type ProjectCard = {
  id: string;
  title: string;
  owner: string;
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

type ProjectYearSection = {
  year: string;
  anchorId: string;
  projects: ProjectCard[];
};

type ProjectCardIcon =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "monogram";
      text: string;
    };

const PROJECT_ICON_MAP: Record<string, { src: string; alt: string }> = {
  "minkinad/minkin.tech": { src: brandMark, alt: "minkin.tech logo" },
  "minkinad/stackmirea": { src: stackMireaLogo, alt: "StackMIREA logo" },
  "minkinad/crossroad": { src: crossRoadLogo, alt: "CrossRoad logo" },
  "minkinad/adm-parser": { src: simpleParserLogo, alt: "adm-parser logo" }
};

const startedAtFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

const updatedAtFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

const shouldDisplayRepository = (repository: GithubRepository): boolean => {
  const normalizedName = repository.name.trim().toLowerCase();
  const normalizedOwner = repository.owner.trim().toLowerCase();

  if (!normalizedName || normalizedName.startsWith(".")) return false;
  if (normalizedName === normalizedOwner) return false;
  if (normalizedName === siteMetadata.githubUsername.toLowerCase()) return false;

  return true;
};

const formatMonthYear = (value: string | null, formatter: Intl.DateTimeFormat): string => {
  if (!value) return "Unknown";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return formatter.format(parsed);
};

const getStartedYear = (value: string | null): string => {
  if (!value) return "Unknown";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return String(parsed.getFullYear());
};

const getRepositoryStartValue = (repository: GithubRepository): string | null =>
  repository.startedAt ?? repository.activityAt ?? repository.updatedAt ?? repository.pushedAt ?? null;

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

const repositories = computed<ProjectCard[]>(() =>
  getGithubRepositories()
    .filter(shouldDisplayRepository)
    .map((repository) => {
      const startValue = getRepositoryStartValue(repository);

      return {
      id: repository.fullName,
      title: repository.name,
      owner: repository.owner,
      repository: repository.fullName,
      href: repository.htmlUrl,
      summary: repository.description || "Repository on GitHub. Details will grow with the project itself.",
      startedAt: startValue,
      startedYear: getStartedYear(startValue),
      startedLabel: formatMonthYear(startValue, startedAtFormatter),
      updatedLabel: formatMonthYear(repository.activityAt ?? repository.updatedAt ?? repository.pushedAt, updatedAtFormatter),
      tags: [repository.language, ...repository.topics].filter(Boolean).slice(0, 4),
      isPinned: repository.isPinned,
      icon: getProjectIcon(repository)
    };
    })
    .sort((left, right) => {
      const yearDiff = Number(right.startedYear) - Number(left.startedYear);
      if (Number.isFinite(yearDiff) && yearDiff !== 0) return yearDiff;

      if (left.startedYear === "Unknown" && right.startedYear !== "Unknown") return 1;
      if (right.startedYear === "Unknown" && left.startedYear !== "Unknown") return -1;
      if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;

      const leftStartedMs = Date.parse(left.startedAt ?? "");
      const rightStartedMs = Date.parse(right.startedAt ?? "");
      const safeLeftStartedMs = Number.isNaN(leftStartedMs) ? 0 : leftStartedMs;
      const safeRightStartedMs = Number.isNaN(rightStartedMs) ? 0 : rightStartedMs;
      if (safeRightStartedMs !== safeLeftStartedMs) return safeRightStartedMs - safeLeftStartedMs;

      return left.title.localeCompare(right.title);
    })
);

const yearSections = computed<ProjectYearSection[]>(() => {
  const sectionsMap = new Map<string, ProjectCard[]>();

  for (const repository of repositories.value) {
    const current = sectionsMap.get(repository.startedYear) ?? [];
    current.push(repository);
    sectionsMap.set(repository.startedYear, current);
  }

  return Array.from(sectionsMap.entries())
    .sort(([leftYear], [rightYear]) => {
      if (leftYear === "Unknown") return 1;
      if (rightYear === "Unknown") return -1;
      return Number(rightYear) - Number(leftYear);
    })
    .map(([year, projects]) => ({
      year,
      anchorId: `projects-year-${year.toLowerCase()}`,
      projects
    }));
});
</script>

<template>
  <section class="page-header reveal projects-catalog-hero">
    <div class="projects-catalog-copy">
      <p class="eyebrow">Projects</p>
      <h1 class="page-title">Живая карта проектов на github</h1>
      <p class="page-lead">
        Каждый публичный проект с GitHub, сгруппированный
        по году старта
      </p>
    </div>
  </section>

  <section
    v-for="section in yearSections"
    :key="section.year"
    class="reveal projects-year-section"
    :aria-labelledby="section.anchorId"
  >
    <header class="projects-year-head">
      <p class="project-section-kicker">Year</p>
      <h2 :id="section.anchorId" class="projects-year-title">{{ section.year }}</h2>
      <p class="projects-year-summary">{{ section.projects.length }} repositories started in this year.</p>
    </header>

    <div class="projects-card-grid">
      <article
        v-for="project in section.projects"
        :key="project.id"
        class="project-catalog-card"
      >
        <div class="project-catalog-meta">
          <p class="project-catalog-repo">{{ project.repository }}</p>
          <span v-if="project.isPinned" class="project-catalog-badge">Pinned</span>
        </div>

        <h3 class="project-catalog-title">
          <a :href="project.href" target="_blank" rel="noreferrer noopener" class="project-catalog-link">
            <span class="project-catalog-title-row">
              <span
                :class="[
                  'project-catalog-icon-shell',
                  project.icon.type === 'image'
                    ? 'project-catalog-icon-shell-image'
                    : 'project-catalog-icon-shell-monogram'
                ]"
              >
                <img
                  v-if="project.icon.type === 'image'"
                  :src="project.icon.src"
                  :alt="project.icon.alt"
                  class="project-catalog-icon project-catalog-icon-image"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  v-else
                  class="project-catalog-icon project-catalog-icon-monogram"
                  aria-hidden="true"
                >
                  {{ project.icon.text }}
                </span>
              </span>
              <span>{{ project.title }}</span>
            </span>
          </a>
        </h3>

        <p class="project-catalog-summary">{{ project.summary }}</p>

        <div class="project-catalog-footer">
          <p class="project-catalog-timeline">
            <span>Started {{ project.startedLabel }}</span>
            <span class="project-catalog-divider">/</span>
            <span>Active {{ project.updatedLabel }}</span>
          </p>
          <p v-if="project.tags.length" class="project-catalog-tags">{{ project.tags.join(" · ") }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
