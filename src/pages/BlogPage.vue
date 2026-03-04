<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { getBlogPosts, type ContentEntry } from "../lib/content";

const posts = getBlogPosts();

type PostGroup = {
  year: string;
  entries: ContentEntry[];
};

const getYearLabel = (rawDate?: string): string | null => {
  if (!rawDate) return null;

  const parsed = new Date(rawDate);
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getFullYear());
  }

  const fallback = rawDate.match(/^\d{4}/);
  return fallback?.[0] ?? null;
};

const postGroups = computed<PostGroup[]>(() => {
  const groups = new Map<string, ContentEntry[]>();

  for (const post of posts) {
    const year = getYearLabel(post.date);
    if (!year) continue;

    const bucket = groups.get(year);

    if (bucket) {
      bucket.push(post);
    } else {
      groups.set(year, [post]);
    }
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => Number(right) - Number(left))
    .map(([year, entries]) => ({
      year,
      entries: [...entries].sort((left, right) => {
        const leftDate = left.date ? Date.parse(left.date) : 0;
        const rightDate = right.date ? Date.parse(right.date) : 0;
        const safeLeft = Number.isNaN(leftDate) ? 0 : leftDate;
        const safeRight = Number.isNaN(rightDate) ? 0 : rightDate;
        return safeRight - safeLeft;
      })
    }));
});

const formatDate = (rawDate?: string): string => {
  if (!rawDate) return "n/a";

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow"
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
      Пишу для души
    </p>
  </section>

  <section class="list-section reveal">
    <p v-if="postGroups.length === 0" class="gh-muted">Пока нет опубликованных постов.</p>

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
