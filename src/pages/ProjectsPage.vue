<script setup lang="ts">
import { computed } from "vue";
import { getProjects, type ContentEntry } from "../lib/content";
import brandMark from "../assets/brand-mark.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";
import { formatDate, getYearLabel, parseDateToTimestamp } from "../lib/dates";
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

const projects = getProjects();

usePageMeta(getStaticPageMeta("projects"));

type ProjectGroup = {
  year: string;
  entries: ContentEntry[];
};

const getGroupLabel = (project: ContentEntry): string => {
  return getYearLabel(project.date) ?? "No date";
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

  for (const project of projects) {
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
      entries: [...entries].sort((left, right) => parseDateToTimestamp(right.date) - parseDateToTimestamp(left.date))
    }));
});

const fallbackText = "Описание проекта появится позже.";

type ProjectLogoMeta = {
  src: string;
  alt: string;
};

const PROJECT_LOGOS: Record<string, ProjectLogoMeta> = {
  brand: { src: brandMark, alt: "minkin.tech brand mark" },
  stackmirea: { src: stackMireaLogo, alt: "StackMIREA logo" },
  crossroad: { src: crossRoadLogo, alt: "CrossRoad logo" }
};

const resolveProjectLogo = (project: ContentEntry): ProjectLogoMeta | undefined => {
  if (!project.logoKey) return undefined;
  return PROJECT_LOGOS[project.logoKey];
};

const projectLogoSrc = (project: ContentEntry): string | undefined => resolveProjectLogo(project)?.src;
const projectLogoAlt = (project: ContentEntry): string =>
  resolveProjectLogo(project)?.alt ?? `${project.title} logo`;
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
          <span class="entry-date">{{ formatDate(project.date, false) }}</span>
        </article>
      </div>
    </div>
  </section>
</template>
