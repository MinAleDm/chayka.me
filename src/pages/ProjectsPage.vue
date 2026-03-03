<script setup lang="ts">
import { computed } from "vue";
import { getProjects, type ContentEntry } from "../lib/content";

const projects = getProjects();

type ProjectGroup = {
  year: string;
  entries: ContentEntry[];
};

const projectGroups = computed<ProjectGroup[]>(() => {
  const groups = new Map<string, ContentEntry[]>();

  for (const project of projects) {
    const year = project.date?.slice(0, 4) ?? "Ongoing";
    const bucket = groups.get(year);

    if (bucket) {
      bucket.push(project);
    } else {
      groups.set(year, [project]);
    }
  }

  return Array.from(groups.entries()).map(([year, entries]) => ({ year, entries }));
});

const fallbackText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor sem ut nulla porta, vitae faucibus arcu varius.";
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
                class="entry-anchor"
              >
                {{ project.title }}
              </a>
              <span v-else>{{ project.title }}</span>
            </h3>
            <p class="entry-summary">{{ project.summary || fallbackText }}</p>

            <p v-if="project.tags.length" class="entry-tags">
              {{ project.tags.join(" · ") }}
            </p>
          </div>
          <span class="entry-date">{{ project.date ?? "ongoing" }}</span>
        </article>
      </div>
    </div>
  </section>
</template>
