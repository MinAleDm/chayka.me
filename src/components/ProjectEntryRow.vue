<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import brandMark from "../assets/brand-mark.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import type { ContentEntry } from "../lib/content";
import { getGithubRepositoryUrl } from "../lib/site";
import { formatDate } from "../lib/dates";

const props = withDefaults(defineProps<{
  project: ContentEntry;
  showLogo?: boolean;
  fallbackText?: string;
}>(), {
  showLogo: false,
  fallbackText: "Описание проекта появится позже."
});

type ProjectLogoMeta = {
  src: string;
  alt: string;
};

const PROJECT_LOGOS: Record<string, ProjectLogoMeta> = {
  brand: { src: brandMark, alt: "minkin.tech brand mark" },
  stackmirea: { src: stackMireaLogo, alt: "StackMIREA logo" },
  crossroad: { src: crossRoadLogo, alt: "CrossRoad logo" }
};

const projectLogo = computed<ProjectLogoMeta | undefined>(() => {
  if (!props.showLogo || !props.project.logoKey) {
    return undefined;
  }

  return PROJECT_LOGOS[props.project.logoKey];
});

const formattedDate = computed(() => formatDate(props.project.date, false));
const sourceLabel = computed(() => (props.project.source === "local" ? "Selected" : "GitHub"));
const metaLabel = computed(() => props.project.repository ?? sourceLabel.value);
const hasDetailPage = computed(() => props.project.source === "local");
const repositoryUrl = computed(() => (
  props.project.repository ? getGithubRepositoryUrl(props.project.repository) : undefined
));
const externalLinks = computed(() => {
  const entries = [
    props.project.link ? { href: props.project.link, label: "Открыть" } : null,
    repositoryUrl.value && repositoryUrl.value !== props.project.link
      ? { href: repositoryUrl.value, label: "GitHub" }
      : null
  ];

  return entries.filter(Boolean) as { href: string; label: string }[];
});
</script>

<template>
  <article class="entry-row project-row">
    <div class="entry-main">
      <p class="entry-kicker">
        <span>{{ sourceLabel }}</span>
        <span class="entry-kicker-divider">/</span>
        <span>{{ metaLabel }}</span>
      </p>

      <h3 class="entry-title">
        <RouterLink
          v-if="hasDetailPage"
          :to="{ name: 'project-detail', params: { slug: project.slug } }"
          class="entry-anchor entry-title-content"
        >
          <img
            v-if="projectLogo"
            :src="projectLogo.src"
            :alt="projectLogo.alt"
            class="entry-logo"
            loading="lazy"
            decoding="async"
          />
          {{ project.title }}
        </RouterLink>
        <a
          v-else-if="project.link"
          :href="project.link"
          target="_blank"
          rel="noreferrer noopener"
          class="entry-anchor entry-title-content"
        >
          <img
            v-if="projectLogo"
            :src="projectLogo.src"
            :alt="projectLogo.alt"
            class="entry-logo"
            loading="lazy"
            decoding="async"
          />
          {{ project.title }}
        </a>
        <span v-else class="entry-title-content">
          <img
            v-if="projectLogo"
            :src="projectLogo.src"
            :alt="projectLogo.alt"
            class="entry-logo"
            loading="lazy"
            decoding="async"
          />
          {{ project.title }}
        </span>
      </h3>

      <p class="entry-summary">{{ project.summary || fallbackText }}</p>
      <p v-if="project.tags.length" class="entry-tags">{{ project.tags.join(" · ") }}</p>
      <div v-if="hasDetailPage || externalLinks.length" class="entry-actions">
        <RouterLink
          v-if="hasDetailPage"
          class="entry-action"
          :to="{ name: 'project-detail', params: { slug: project.slug } }"
        >
          Кейс
        </RouterLink>
        <a
          v-for="item in externalLinks"
          :key="item.href"
          class="entry-action"
          :href="item.href"
          target="_blank"
          rel="noreferrer noopener"
        >
          {{ item.label }}
        </a>
      </div>
    </div>

    <span class="entry-date">{{ formattedDate }}</span>
  </article>
</template>
