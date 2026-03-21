<script setup lang="ts">
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

usePageMeta(getStaticPageMeta("talks"));
</script>

<template>
  <section class="page-header reveal home-hero">
    <p class="eyebrow">Talks</p>
    <h1 class="page-title">Podcast Lab</h1>
    <p class="page-lead">
      Здесь будут собраны лекции, выступления, наброски тем и материалы из podcast lab.
    </p>
    <p class="page-lorem">
      Пока раздел ещё собирается, но направление уже определено: инженерная практика, архитектура,
      DX и рабочие истории из продуктовой разработки.
    </p>
  </section>

  <section class="list-section reveal home-hero" aria-label="Talks status">
    <article class="support-panel">
      <h2 class="support-panel-title">Что появится здесь</h2>
      <p class="home-status">
        Выпуски и заметки по темам архитектуры frontend/fullstack-систем, аккуратного DX и эволюции личных проектов.
      </p>
    </article>
  </section>
</template>
