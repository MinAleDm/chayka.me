<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { getBlogPostBySlug, type ContentEntry } from "../lib/content";
import { formatDate } from "../lib/dates";
import { usePageMeta } from "../lib/meta";

const route = useRoute();
const post = ref<ContentEntry | undefined>();
const isLoading = ref(true);
const formattedDate = computed(() => formatDate(post.value?.date));

const loadPost = async (): Promise<void> => {
  isLoading.value = true;
  post.value = undefined;
  const slug = String(route.params.slug ?? "");
  post.value = await getBlogPostBySlug(slug);
  isLoading.value = false;
};

usePageMeta(
  computed(() => {
    if (isLoading.value) {
      return {
        title: "Загрузка поста — Aleksandr Minkin",
        description: "Идёт загрузка публикации.",
        path: "/blog"
      };
    }

    if (!post.value) {
      return {
        title: "Пост не найден — Aleksandr Minkin",
        description: "Такой записи нет или ссылка устарела.",
        path: "/404"
      };
    }

    return {
      title: `${post.value.title} — Blog — Aleksandr Minkin`,
      description: post.value.summary,
      path: `/blog/${post.value.slug}`,
      type: "article" as const
    };
  })
);

watch(() => route.params.slug, () => {
  void loadPost();
}, { immediate: true });
</script>

<template>
  <section v-if="isLoading" class="article-page reveal">
    <p class="eyebrow">Post</p>
    <h1 class="page-title">Загружаю пост</h1>
    <p class="page-lead">Подтягиваю markdown и собираю страницу.</p>
  </section>

  <section v-else-if="post" class="article-page reveal">
    <p class="eyebrow">Post</p>
    <h1 class="page-title">{{ post.title }}</h1>
    <p class="page-lead">{{ post.summary }}</p>

    <div class="post-head-meta">
      <span>{{ formattedDate }}</span>
      <span v-if="post.tags.length">{{ post.tags.join(" · ") }}</span>
    </div>

    <article class="markdown-body post-content" v-html="post.html" />

    <RouterLink class="post-back-link" :to="{ name: 'blog' }">
      ← Назад к списку постов
    </RouterLink>
  </section>

  <section v-else-if="!isLoading" class="article-page reveal">
    <p class="eyebrow">404</p>
    <h1 class="page-title">Пост не найден</h1>
    <p class="page-lead">Такой записи нет или ссылка устарела.</p>
    <p class="page-lorem">Возможно, пост был перемещён, переименован или ещё не опубликован.</p>
    <div class="action-row">
      <RouterLink class="text-button" :to="{ name: 'blog' }">
        Ко всем постам
      </RouterLink>
    </div>
  </section>
</template>
