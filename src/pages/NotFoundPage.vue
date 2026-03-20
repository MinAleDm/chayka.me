<script setup lang="ts">
import { RouterLink } from "vue-router";
import { usePageMeta } from "../lib/meta";

usePageMeta({
  title: "Страница не найдена — Aleksandr Minkin",
  description: "Запрошенная страница не найдена. Вернитесь на главную или откройте список материалов.",
  path: "/404"
});
</script>

<template>
  <section class="article-page reveal">
    <p class="eyebrow">404</p>
    <h1 class="page-title">Страница не найдена</h1>
    <p class="page-lead">
      Такой страницы нет или ссылка устарела. Можно вернуться на главную или открыть блог и проекты.
    </p>
    <div class="action-row">
      <RouterLink class="text-button" to="/">На главную</RouterLink>
      <RouterLink class="text-button" to="/blog">Открыть блог</RouterLink>
      <RouterLink class="text-button" to="/projects">Посмотреть проекты</RouterLink>
    </div>
  </section>
</template>
