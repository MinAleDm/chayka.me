<script setup lang="ts">
import { computed } from "vue";
import brandMark from "../assets/brand-mark.svg";
import crossRoadLogo from "../assets/images/logos/CrossRoadlogo.svg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.svg";
import type { ContentEntry } from "../lib/content";
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
        <a
          v-if="project.link"
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
    </div>

    <span class="entry-date">{{ formattedDate }}</span>
  </article>
</template>
