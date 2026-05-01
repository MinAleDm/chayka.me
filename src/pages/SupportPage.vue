<script setup lang="ts">
import { usePageMeta } from "../lib/meta";
import { GITHUB_PROFILE_URL, TELEGRAM_URL, getGithubRepositoryUrl, getStaticPageMeta } from "../lib/site";

type SupportCard = {
  title: string;
  kicker: string;
  text: string;
  linkLabel: string;
  linkHref: string;
};

const supportCards: SupportCard[] = [
  {
    title: "Личная обратная связь",
    kicker: "Feedback",
    text: "Если проект оказался полезным, напишите пару слов в Telegram. Живой фидбек помогает держать темп и развивать новые идеи.",
    linkLabel: "Написать в Telegram",
    linkHref: TELEGRAM_URL
  },
  {
    title: "Поделиться проектом",
    kicker: "Share",
    text: "Репост, ссылка в чате или рекомендация коллегам сильно помогают росту аудитории и поддерживают мотивацию автора.",
    linkLabel: "Репозиторий проекта",
    linkHref: getGithubRepositoryUrl("minkin.tech")
  },
  {
    title: "Поддержать как автора",
    kicker: "Support",
    text: "Если хотите поддержать меня как разработчика и автора контента, можно написать напрямую и обсудить формат поддержки или сотрудничества.",
    linkLabel: "Профиль автора на GitHub",
    linkHref: GITHUB_PROFILE_URL
  }
];

const supportChecklist: string[] = [
  "Коротко: что именно вам было полезно",
  "На какой странице или материале это сработало",
  "Что стоит улучшить в первую очередь",
  "Если есть идея сотрудничества, укажите контекст и формат"
];

const supportFlow: string[] = [
  "Получаю сообщение и фиксирую приоритет",
  "Возвращаюсь с ответом и уточняю детали",
  "Добавляю правки в контент или план развития"
];

usePageMeta(getStaticPageMeta("support"));
</script>

<template>
  <section class="page-header reveal home-hero support-hero">
    <p class="eyebrow">Support</p>
    <h1 class="page-title">Поддержка автора проекта</h1>
    <p class="page-lead">
      Поддержка меня как автора:
      обратная связь, рекомендации проекта и предложения по сотрудничеству.
    </p>

    <div class="support-quick-grid" aria-label="Support summary">
      <article class="support-quick-item">
        <p class="support-quick-title">Куда писать</p>
        <p class="home-status">Telegram</p>
      </article>
      <article class="support-quick-item">
        <p class="support-quick-title">Лучшая поддержка</p>
        <p class="home-status">Фидбек и предложения сотрудничества</p>
      </article>
      <article class="support-quick-item">
        <p class="support-quick-title">Формат</p>
        <p class="home-status">Коротко и по делу</p>
      </article>
    </div>
  </section>

  <section class="list-section reveal home-hero" aria-label="Support author options">
    <h2 class="section-title">Как поддержать автора</h2>

    <div class="support-card-grid">
      <article v-for="card in supportCards" :key="card.title" class="support-card">
        <p class="support-card-kicker">{{ card.kicker }}</p>
        <h3 class="support-card-title">{{ card.title }}</h3>
        <p class="home-status">{{ card.text }}</p>
        <a :href="card.linkHref" target="_blank" rel="noreferrer noopener" class="text-button support-card-link">
          {{ card.linkLabel }}
        </a>
      </article>
    </div>
  </section>

  <section class="list-section reveal home-hero" aria-label="Support details">
    <h2 class="section-title">Что особенно ценно в поддержке</h2>

    <div class="support-layout">
      <article class="support-panel">
        <h3 class="support-panel-title">Что можно написать</h3>
        <ul class="support-checklist">
          <li v-for="item in supportChecklist" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="support-panel">
        <h3 class="support-panel-title">Как я обрабатываю обращения</h3>
        <ol class="support-steps">
          <li v-for="step in supportFlow" :key="step">{{ step }}</li>
        </ol>
      </article>
    </div>
  </section>
</template>
