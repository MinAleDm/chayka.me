<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ProjectEntryRow from "../components/ProjectEntryRow.vue";
import { getProjects, type ContentEntry } from "../lib/content";
import { usePageMeta } from "../lib/meta";
import { GITHUB_PROFILE_URL, getStaticPageMeta } from "../lib/site";

usePageMeta(getStaticPageMeta("projects"));

type ProjectSectionConfig = {
  key: string;
  title: string;
  description: string;
};

const LOCAL_PROJECT_SECTIONS: ProjectSectionConfig[] = [
  {
    key: "current-focus",
    title: "Current Focus",
    description: "Проекты, в которые сейчас уходит основная энергия: личная платформа, контент и образовательные продукты."
  },
  {
    key: "product-work",
    title: "Products / Platforms",
    description: "Продуктовые сервисы и приложения, где важны интерфейс, пользовательский сценарий и цельный опыт."
  },
  {
    key: "systems",
    title: "Systems / Backend",
    description: "Более инженерные системы с акцентом на архитектуру, безопасность, интеграции и бизнес-логику."
  },
  {
    key: "experiments",
    title: "Experiments",
    description: "Идеи и прототипы, где я проверяю новые форматы взаимодействия, контента и community features."
  }
];

const FALLBACK_LOCAL_SECTION: ProjectSectionConfig = {
  key: "other-work",
  title: "Other Work",
  description: "Остальные выбранные проекты, которые пока не разложены по отдельным секциям."
};

const projects = ref<ContentEntry[]>([]);
const isLoading = ref(true);
const archiveSentinel = ref<HTMLElement | null>(null);
const visibleArchiveCount = ref(0);

const ARCHIVE_BATCH_SIZE = 8;

const localProjects = computed(() => projects.value.filter((project) => project.source === "local"));
const archiveProjects = computed(() => projects.value.filter((project) => project.source === "github"));
const visibleArchiveProjects = computed(() => archiveProjects.value.slice(0, visibleArchiveCount.value));
const hasMoreArchive = computed(() => visibleArchiveProjects.value.length < archiveProjects.value.length);

const localProjectSections = computed(() => {
  const sections = LOCAL_PROJECT_SECTIONS
    .map((config) => ({
      ...config,
      anchorId: `projects-section-${config.key}`,
      projects: localProjects.value.filter((project) => project.section === config.key)
    }))
    .filter((section) => section.projects.length > 0);

  const assignedKeys = new Set(LOCAL_PROJECT_SECTIONS.map((section) => section.key));
  const unassignedProjects = localProjects.value.filter((project) => !assignedKeys.has(project.section ?? ""));

  if (unassignedProjects.length > 0) {
    sections.push({
      ...FALLBACK_LOCAL_SECTION,
      anchorId: `projects-section-${FALLBACK_LOCAL_SECTION.key}`,
      projects: unassignedProjects
    });
  }

  return sections;
});

const projectStats = computed(() => [
  { label: "Total", value: String(projects.value.length).padStart(2, "0") },
  { label: "Selected", value: String(localProjects.value.length).padStart(2, "0") },
  { label: "Archive", value: String(archiveProjects.value.length).padStart(2, "0") }
]);

const projectIndexItems = computed(() => {
  const sectionItems = localProjectSections.value.map((section) => ({
    href: `#${section.anchorId}`,
    label: section.title
  }));

  return archiveProjects.value.length > 0
    ? [...sectionItems, { href: "#github-archive-title", label: "GitHub Archive" }]
    : sectionItems;
});

const loadMoreArchiveEntries = (): void => {
  visibleArchiveCount.value = Math.min(archiveProjects.value.length, visibleArchiveCount.value + ARCHIVE_BATCH_SIZE);
};

let archiveObserver: IntersectionObserver | null = null;

const syncArchiveObserver = (): void => {
  archiveObserver?.disconnect();

  if (!archiveObserver || !archiveSentinel.value || !hasMoreArchive.value) return;
  archiveObserver.observe(archiveSentinel.value);
};

watch([archiveSentinel, hasMoreArchive], syncArchiveObserver);

onMounted(async () => {
  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    archiveObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreArchiveEntries();
        }
      },
      { rootMargin: "320px 0px" }
    );
  }

  projects.value = await getProjects();
  visibleArchiveCount.value = Math.min(archiveProjects.value.length, ARCHIVE_BATCH_SIZE);
  isLoading.value = false;
  syncArchiveObserver();
});

onBeforeUnmount(() => {
  archiveObserver?.disconnect();
});
</script>

<template>
  <section class="page-header reveal projects-shell">
    <div class="projects-hero-copy">
      <p class="eyebrow">Projects</p>
      <h1 class="page-title">Проекты, которыми я горжусь и которые действительно хочу развивать дальше.</h1>
      <p class="page-lead">
        Я собрал эту страницу ближе к формату curated list: основные проекты идут тематическими секциями, а остальное
        остаётся в GitHub-архиве. Для локальных проектов есть отдельные case study страницы с контекстом и деталями реализации.
      </p>

      <nav v-if="projectIndexItems.length" class="projects-index" aria-label="Projects index">
        <a
          v-for="item in projectIndexItems"
          :key="item.href"
          class="projects-index-link"
          :href="item.href"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>

    <div class="projects-hero-meta">
      <div class="projects-stat-grid" aria-label="Projects summary">
        <article v-for="stat in projectStats" :key="stat.label" class="projects-stat-card">
          <span class="projects-stat-value">{{ stat.value }}</span>
          <span class="projects-stat-label">{{ stat.label }}</span>
        </article>
      </div>

      <nav class="projects-link-row" aria-label="Projects shortcuts">
        <a
          class="projects-link-chip"
          :href="GITHUB_PROFILE_URL"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
        <RouterLink class="projects-link-chip" :to="{ name: 'blog' }">Blog</RouterLink>
        <RouterLink class="projects-link-chip" :to="{ name: 'contact' }">Contact</RouterLink>
      </nav>
    </div>
  </section>

  <section v-if="isLoading" class="project-section reveal" aria-label="Projects loading state">
    <header class="project-section-head">
      <p class="project-section-kicker">Loading</p>
      <h2 class="project-section-title">Подгружаю проекты</h2>
      <p class="project-section-copy">Собираю локальные markdown-страницы и GitHub-архив.</p>
    </header>
  </section>

  <template v-else>
    <section
      v-for="section in localProjectSections"
      :key="section.key"
      class="project-section reveal"
      :aria-labelledby="section.anchorId"
    >
      <header class="project-section-head project-section-head-plain">
        <p class="project-section-kicker">Selected Work</p>
        <h2 :id="section.anchorId" class="project-section-title">{{ section.title }}</h2>
        <p class="project-section-copy">{{ section.description }}</p>
      </header>

      <div class="entry-list project-entry-list">
        <ProjectEntryRow
          v-for="project in section.projects"
          :key="project.slug"
          :project="project"
          show-logo
        />
      </div>
    </section>

    <section
      v-if="archiveProjects.length"
      class="project-section reveal"
      aria-labelledby="github-archive-title"
    >
      <header class="project-section-head project-section-head-plain">
        <p class="project-section-kicker">GitHub Archive</p>
        <h2 id="github-archive-title" class="project-section-title">Остальные репозитории и рабочие эксперименты.</h2>
        <p class="project-section-copy">
          Архив тянется из GitHub и подгружается порциями по мере прокрутки, чтобы страница оставалась лёгкой и читабельной.
        </p>
      </header>

      <div class="entry-list project-entry-list">
        <ProjectEntryRow
          v-for="project in visibleArchiveProjects"
          :key="project.slug"
          :project="project"
        />
      </div>

      <div
        v-if="hasMoreArchive"
        ref="archiveSentinel"
        class="projects-load-sentinel"
        aria-hidden="true"
      />

      <button
        v-if="hasMoreArchive"
        type="button"
        class="projects-load-more"
        @click="loadMoreArchiveEntries"
      >
        Показать ещё
      </button>
    </section>
  </template>
</template>
