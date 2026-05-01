<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getBlogPosts, type ContentEntry } from "../lib/content";
import { formatDate, getYearLabel, parseDateToTimestamp } from "../lib/dates";
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

const posts = ref<ContentEntry[]>([]);
const isLoading = ref(true);

usePageMeta(getStaticPageMeta("blog"));

type PostGroup = {
  year: string;
  entries: ContentEntry[];
};

const postGroups = computed<PostGroup[]>(() => {
  const groups = new Map<string, ContentEntry[]>();

  for (const post of posts.value) {
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
      entries: [...entries].sort((left, right) => parseDateToTimestamp(right.date) - parseDateToTimestamp(left.date))
    }));
});

onMounted(async () => {
  posts.value = await getBlogPosts();
  isLoading.value = false;
});
</script>

<template>
  <section class="page-header reveal">
    <p class="eyebrow">Blog</p>
    <h1 class="page-title">Пишу про инженерную практику, архитектуру и процесс разработки.</h1>
    <p class="page-lead">
      P.S. Каждый пост открывается на отдельной странице.
    </p>
    <p class="page-lorem">
      Пишу для души)
    </p>
  </section>

  <section class="list-section reveal">
    <p v-if="isLoading" class="gh-muted">Загружаю публикации...</p>
    <p v-else-if="postGroups.length === 0" class="gh-muted">Пока нет опубликованных постов.</p>

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
