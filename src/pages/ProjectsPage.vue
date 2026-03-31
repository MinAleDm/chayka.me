<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ProjectEntryRow from "../components/ProjectEntryRow.vue";
import { getProjects, type ContentEntry } from "../lib/content";
import { usePageMeta } from "../lib/meta";
import { GITHUB_PROFILE_URL, getStaticPageMeta } from "../lib/site";

usePageMeta(getStaticPageMeta("projects"));

const projects = ref<ContentEntry[]>([]);
const isLoading = ref(true);
const archiveSentinel = ref<HTMLElement | null>(null);
const visibleArchiveCount = ref(0);

const ARCHIVE_BATCH_SIZE = 8;

const isPinnedProject = (project: ContentEntry): boolean => project.date?.toLowerCase() === "pinned";

const featuredProjects = computed(() =>
  projects.value.filter((project) => project.source === "local" && isPinnedProject(project)).slice(0, 3)
);

const featuredSlugs = computed(() => new Set(featuredProjects.value.map((project) => project.slug)));

const selectedProjects = computed(() =>
  projects.value.filter((project) => project.source === "local" && !featuredSlugs.value.has(project.slug))
);

const archiveProjects = computed(() => projects.value.filter((project) => project.source === "github"));
const visibleArchiveProjects = computed(() => archiveProjects.value.slice(0, visibleArchiveCount.value));
const hasMoreArchive = computed(() => visibleArchiveProjects.value.length < archiveProjects.value.length);

const projectStats = computed(() => [
  { label: "Total", value: String(projects.value.length).padStart(2, "0") },
  { label: "Selected", value: String(projects.value.filter((project) => project.source === "local").length).padStart(2, "0") },
  { label: "Archive", value: String(archiveProjects.value.length).padStart(2, "0") }
]);

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
      <h1 class="page-title">Проекты, которые я запускаю, поддерживаю и довожу до релиза.</h1>
      <p class="page-lead">
        Больше о моих проектах можно узнать на GitHub, а о том, как я работаю над ними — в блоге. Если хотите поработать вместе или просто поболтать о технологиях, пишите в контактах.
      </p>
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
      <p class="project-section-copy">Собираю локальные карточки и GitHub-архив.</p>
    </header>
  </section>

  <template v-else>
    <section class="project-section reveal" aria-labelledby="current-focus-title">
      <header class="project-section-head">
        <p class="project-section-kicker">Current Focus</p>
        <h2 id="current-focus-title" class="project-section-title">Основные проекты, на которые сейчас делаю ставку.</h2>
        <p class="project-section-copy">
          Это флагманские штуки: личный сайт и образовательная платформа, вокруг которых собирается основная энергия.
        </p>
      </header>

      <div class="entry-list project-entry-list">
        <ProjectEntryRow
          v-for="project in featuredProjects"
          :key="project.slug"
          :project="project"
          show-logo
        />
      </div>
    </section>

    <section class="project-section reveal" aria-labelledby="selected-work-title">
      <header class="project-section-head">
        <p class="project-section-kicker">Selected Work</p>
        <h2 id="selected-work-title" class="project-section-title">Избранные продуктовые и инженерные проекты.</h2>
        <p class="project-section-copy">
          Более прикладные системы: CRM, productivity-приложения, образовательные и контентные продукты.
        </p>
      </header>

      <div class="entry-list project-entry-list">
        <ProjectEntryRow
          v-for="project in selectedProjects"
          :key="project.slug"
          :project="project"
          show-logo
        />
      </div>
    </section>

    <section class="project-section reveal" aria-labelledby="github-archive-title">
      <header class="project-section-head">
        <p class="project-section-kicker">GitHub Archive</p>
        <h2 id="github-archive-title" class="project-section-title">Остальные репозитории и экспериментальные ветки работы.</h2>
        <p class="project-section-copy">
          Архив тянется из GitHub и дорисовывается порциями по мере прокрутки, чтобы страница оставалась лёгкой.
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
