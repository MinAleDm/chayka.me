<script setup lang="ts">
import { RouterLink } from "vue-router";
import GithubActivityWidget from "../components/GithubActivityWidget.vue";
import { getGithubActivity, getHomePageContent } from "../lib/content";
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

const home = getHomePageContent();
const activity = getGithubActivity();

usePageMeta({
  ...getStaticPageMeta("home"),
  description: home.lead,
  path: "/"
});
</script>

<template>
  <section class="page-header reveal home-hero">
    <p class="eyebrow">{{ home.eyebrow }}</p>
    <h1 class="page-title">{{ home.title }}</h1>
    <p class="page-lead">{{ home.lead }}</p>
    <p class="home-line">{{ home.subtitle }}</p>

    <div v-if="home.stackGroups.length" class="stack-lines" aria-label="Affiliations">
      <div v-for="group in home.stackGroups" :key="group.title" class="stack-line">
        <span class="stack-title">{{ group.title }}</span>
        <div class="stack-items">
          <template v-for="(item, index) in group.items" :key="`${group.title}-${item.name}`">
            <component
              :is="item.href ? 'a' : 'span'"
              class="stack-chip"
              :href="item.href"
              :target="item.href ? '_blank' : undefined"
              :rel="item.href ? 'noreferrer noopener' : undefined"
            >
              {{ item.name }}
            </component>
            <span v-if="group.separator && index < group.items.length - 1" class="stack-separator">
              {{ group.separator }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <article v-if="home.html" class="markdown-body home-copy" v-html="home.html" />
  </section>

  <hr class="divider reveal" />

  <GithubActivityWidget :activity="activity" />

  <hr class="divider reveal" />

  <section class="reveal home-support">
    <h2 class="section-title">{{ home.supportTitle }}</h2>
    <p class="home-status">{{ home.supportText }}</p>
    <div class="action-row">
      <RouterLink class="text-button" to="/projects">Посмотреть проекты</RouterLink>
      <RouterLink class="text-button" to="/contact">Связаться</RouterLink>
      <RouterLink class="text-button" to="/support">Поддержать автора</RouterLink>
    </div>
  </section>
</template>
