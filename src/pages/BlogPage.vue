<script setup lang="ts">
import { getBlogPosts } from "../lib/content";

const posts = getBlogPosts();
</script>

<template>
  <section class="card hero reveal">
    <span class="badge">Notes & Engineering</span>
    <h1>Блог о разработке, инструментах и процессе.</h1>
    <p class="lead">
      Записи собираются из Markdown-файлов, так что добавлять новый пост можно без правок Vue-кода.
    </p>
  </section>

  <section class="grid mt-1">
    <article v-for="post in posts" :key="post.slug" class="card item reveal">
      <div class="item-head">
        <h2 class="item-title">{{ post.title }}</h2>
        <span class="item-meta">{{ post.date ?? "draft" }}</span>
      </div>

      <p>{{ post.summary }}</p>

      <div class="tags" v-if="post.tags.length">
        <span v-for="tag in post.tags" :key="`${post.slug}-${tag}`">{{ tag }}</span>
      </div>

      <details class="details">
        <summary>Открыть заметку</summary>
        <div class="markdown-body" v-html="post.html" />
      </details>
    </article>
  </section>
</template>
