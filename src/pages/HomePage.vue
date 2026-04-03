<script setup lang="ts">
import { RouterLink } from "vue-router";
import GithubActivityWidget from "../components/GithubActivityWidget.vue";
import { getGithubActivity, getGithubDataStatus, getHomePageContent } from "../lib/content";
import { usePageMeta } from "../lib/meta";
import { getStaticPageMeta } from "../lib/site";

const home = getHomePageContent();
const activity = getGithubActivity();
const githubStatus = getGithubDataStatus();
const offerCards = [
  {
    title: "Frontend и product engineering",
    text: "Беру продуктовые интерфейсы, сложные состояния, контентные витрины и доведение пользовательского опыта до цельной системы."
  },
  {
    title: "Архитектура и DX",
    text: "Помогаю выстроить удобную структуру проекта, снизить хрупкость кода и сделать разработку спокойнее для команды."
  },
  {
    title: "Контент и техническая подача",
    text: "Собираю инженерные идеи в понятные материалы, демо и страницы, которые можно показать пользователям, коллегам или работодателю."
  }
];

const workSignals = [
  "Нужен аккуратный frontend без ощущения временного решения",
  "Команде важно качество кода, а не только скорость релиза",
  "Хочется собрать личный продукт, контентную платформу или инженерную витрину",
  "Нужен человек, который может думать и про UX, и про структуру проекта"
];

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

  <section class="reveal home-support">
    <h2 class="section-title">Чем могу помочь</h2>
    <div class="support-card-grid home-offer-grid">
      <article v-for="card in offerCards" :key="card.title" class="support-card home-offer-card">
        <h3 class="support-card-title">{{ card.title }}</h3>
        <p class="home-status">{{ card.text }}</p>
      </article>
    </div>

    <article class="support-panel">
      <h3 class="support-panel-title">Когда особенно полезно написать</h3>
      <ul class="support-checklist">
        <li v-for="signal in workSignals" :key="signal">{{ signal }}</li>
      </ul>
    </article>
  </section>

  <hr class="divider reveal" />

  <GithubActivityWidget :activity="activity" :status="githubStatus" />

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
