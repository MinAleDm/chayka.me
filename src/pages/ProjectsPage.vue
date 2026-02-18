<script setup lang="ts">
import { getProjects } from "../lib/content";

const projects = getProjects();
</script>

<template>
  <section class="card hero reveal">
    <span class="badge">Selected work</span>
    <h1>Проекты - продуктовый и инженерный подход.</h1>
    <p class="lead">
      Чуть чуть о проектах)
    </p>
  </section>

  <section class="grid grid-2 mt-1">
    <article v-for="project in projects" :key="project.slug" class="card item reveal">
      <div class="item-head">
        <h2 class="item-title">{{ project.title }}</h2>
        <span class="item-meta">{{ project.date ?? "ongoing" }}</span>
      </div>

      <p>{{ project.summary }}</p>

      <div class="tags" v-if="project.tags.length">
        <span v-for="tag in project.tags" :key="`${project.slug}-${tag}`">{{ tag }}</span>
      </div>

      <a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">Открыть</a>
      <details class="details">
        <summary>Подробнее</summary>
        <div class="markdown-body" v-html="project.html" />
      </details>
    </article>
  </section>
</template>
