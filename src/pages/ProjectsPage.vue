<script setup lang="ts">
import { usePageMeta } from "../lib/meta";
import { getProjectYearSections } from "../lib/projectCatalog";
import { getStaticPageMeta } from "../lib/site";

usePageMeta(getStaticPageMeta("projects"));

const yearSections = getProjectYearSections();
</script>

<template>
  <section class="page-header reveal projects-catalog-hero">
    <div class="projects-catalog-copy">
      <p class="eyebrow">Projects</p>
      <h1 class="page-title">Живая карта проектов на github</h1>
      <p class="page-lead">
        Мои проекты по году старта и активности.
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
