<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { getBlogPosts, type ContentEntry } from "../lib/content";

const posts = getBlogPosts();

type PostGroup = {
  year: string;
  entries: ContentEntry[];
};

const postGroups = computed<PostGroup[]>(() => {
  const groups = new Map<string, ContentEntry[]>();

  for (const post of posts) {
    const year = post.date?.slice(0, 4) ?? "Draft";
    const bucket = groups.get(year);

    if (bucket) {
      bucket.push(post);
    } else {
      groups.set(year, [post]);
    }
  }

  return Array.from(groups.entries()).map(([year, entries]) => ({ year, entries }));
});

const formatDate = (rawDate?: string): string => {
  if (!rawDate) return "draft";

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
};
</script>

<template>
  <section class="page-header reveal">
    <p class="eyebrow">Blog</p>
    <h1 class="page-title">Пишу про инженерную практику, архитектуру и процесс разработки.</h1>
    <p class="page-lead">
      Список публикаций из Markdown-файлов. Каждый пост открывается на отдельной странице.
    </p>
    <p class="page-lorem">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat sem ut mauris egestas,
      vitae feugiat augue imperdiet.
    </p>
  </section>

  <section class="list-section reveal">
    <div v-for="group in postGroups" :key="group.year" class="year-group">
      <h2 class="year-label">{{ group.year }}</h2>

      <div class="entry-list">
        <RouterLink
          v-for="post in group.entries"
          :key="post.slug"
          class="entry-row"
          :to="{ name: 'blog-post', params: { slug: post.slug } }"
        >
          <div class="entry-main">
            <h3 class="entry-title">{{ post.title }}</h3>
            <p class="entry-summary">{{ post.summary }}</p>
          </div>
          <span class="entry-date">{{ formatDate(post.date) }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
