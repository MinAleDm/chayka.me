<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getHomeContent } from "../lib/content";

const homeHtml = getHomeContent();
</script>

<template>
  <section class="card hero reveal">
    <span class="badge">Open to collaboration</span>
    <h1>Frontend / Fullstack Engineer, делаю аккуратные и быстрые веб-продукты.</h1>
    <p class="lead">
      Я Александр Минькин. Учусь в РТУ МИРЭА и фокусируюсь на JavaScript / TypeScript, интерфейсах,
      архитектуре и инженерной культуре в продуктовых командах.
    </p>
    <div class="actions">
      <RouterLink class="button primary" to="/projects">Смотреть проекты</RouterLink>
      <RouterLink class="button ghost" to="/blog">Читать блог</RouterLink>
    </div>
  </section>

  <section class="card panel mt-1 markdown-body reveal" v-html="homeHtml" />
</template>
