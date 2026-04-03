<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { getProjectBySlug, type ContentEntry } from "../lib/content";
import { formatDate } from "../lib/dates";
import { usePageMeta } from "../lib/meta";
import { getGithubRepositoryUrl } from "../lib/site";

const route = useRoute();
const project = ref<ContentEntry | undefined>();
const isLoading = ref(true);

const projectDate = computed(() => formatDate(project.value?.date, false));
const repositoryUrl = computed(() => (
  project.value?.repository ? getGithubRepositoryUrl(project.value.repository) : undefined
));
const detailLinks = computed(() => {
  if (!project.value) return [];

  const entries = [
    project.value.link ? { href: project.value.link, label: "Открыть проект" } : null,
    repositoryUrl.value && repositoryUrl.value !== project.value.link
      ? { href: repositoryUrl.value, label: "Репозиторий" }
      : null
  ];

  return entries.filter(Boolean) as { href: string; label: string }[];
});

const loadProject = async (): Promise<void> => {
  isLoading.value = true;
  project.value = undefined;
  const slug = String(route.params.slug ?? "");
  project.value = await getProjectBySlug(slug);
  isLoading.value = false;
};

usePageMeta(
  computed(() => {
    if (isLoading.value) {
      return {
        title: "Загрузка проекта — Aleksandr Minkin",
        description: "Идёт загрузка страницы проекта.",
        path: "/projects"
      };
    }

    if (!project.value) {
      return {
        title: "Проект не найден — Aleksandr Minkin",
        description: "Такого проекта нет или ссылка устарела.",
        path: "/404"
      };
    }

    return {
      title: `${project.value.title} — Projects — Aleksandr Minkin`,
      description: project.value.summary,
      path: `/projects/${project.value.slug}`
    };
  })
);

watch(() => route.params.slug, () => {
  void loadProject();
}, { immediate: true });
</script>

<template>
  <section v-if="isLoading" class="article-page reveal">
    <p class="eyebrow">Project</p>
    <h1 class="page-title">Загружаю страницу проекта</h1>
    <p class="page-lead">Подтягиваю данные, summary и markdown-контент.</p>
  </section>

  <section v-else-if="project" class="article-page reveal project-detail-page">
    <p class="eyebrow">Project</p>
    <h1 class="page-title">{{ project.title }}</h1>
    <p class="page-lead project-detail-summary">{{ project.summary }}</p>

    <div class="post-head-meta">
      <span>{{ projectDate }}</span>
      <span v-if="project.repository">{{ project.repository }}</span>
      <span v-if="project.tags.length">{{ project.tags.join(" · ") }}</span>
    </div>

    <div v-if="detailLinks.length" class="action-row">
      <a
        v-for="item in detailLinks"
        :key="item.href"
        class="text-button"
        :href="item.href"
        target="_blank"
        rel="noreferrer noopener"
      >
        {{ item.label }}
      </a>
    </div>

    <article v-if="project.html" class="markdown-body post-content" v-html="project.html" />

    <p v-else class="page-lorem">
      Подробный кейс ещё оформляется. Пока здесь доступно краткое описание и ссылки на проект.
    </p>

    <RouterLink class="post-back-link" :to="{ name: 'projects' }">
      ← Назад к списку проектов
    </RouterLink>
  </section>

  <section v-else class="article-page reveal">
    <p class="eyebrow">404</p>
    <h1 class="page-title">Проект не найден</h1>
    <p class="page-lead">Такого проекта нет или ссылка устарела.</p>
    <p class="page-lorem">Возможно, проект был переименован, скрыт или ещё не оформлен как кейс.</p>
    <div class="action-row">
      <RouterLink class="text-button" :to="{ name: 'projects' }">
        Ко всем проектам
      </RouterLink>
    </div>
  </section>
</template>
