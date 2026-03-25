<script setup lang="ts">
import { usePageMeta } from "../lib/meta";
import { GITHUB_PROFILE_LABEL, GITHUB_PROFILE_URL, TELEGRAM_LABEL, TELEGRAM_URL, getStaticPageMeta } from "../lib/site";

type ContactChannel = {
  title: string;
  description: string;
  bestFor: string;
  href: string;
  label: string;
  icon: "telegram" | "github";
};

const channels: ContactChannel[] = [
  {
    title: "Telegram",
    description: "Быстрый канал для вопросов по сотрудничеству, консультациям и обратной связи по сайту.",
    bestFor: "оперативные обсуждения и первичный контакт",
    href: TELEGRAM_URL,
    label: TELEGRAM_LABEL,
    icon: "telegram"
  },
  {
    title: "GitHub",
    description: "Подходит для технических вопросов, задач по проектам, issue и предложений по улучшению.",
    bestFor: "технические детали, задачи и публичный трекинг",
    href: GITHUB_PROFILE_URL,
    label: GITHUB_PROFILE_LABEL,
    icon: "github"
  }
];

const collaborationTopics: string[] = [
  "Frontend / Fullstack разработка",
  "Технические консультации и архитектура",
  "Ревью кода и улучшение DX в проекте",
  "Контент и совместные технические материалы"
];

const firstMessageTips: string[] = [
  "Коротко опишите задачу и ожидаемый результат",
  "Если есть сроки, укажите дедлайн сразу",
  "Для техвопросов приложите ссылку на репозиторий или пример"
];

usePageMeta(getStaticPageMeta("contact"));
</script>

<template>
  <section class="page-header reveal home-hero contact-hero">
    <p class="eyebrow">Contact</p>
    <h1 class="page-title">Связаться со мной</h1>
    <p class="page-lead">
      Для вопросов по проектам, коллаборациям и любым рабочим предложениям
      используйте один из каналов ниже.
    </p>
    <p class="contact-note">
      Обычно отвечаю в порядке очереди. Чем точнее первый запрос, тем быстрее получится
      перейти к конкретным шагам.
    </p>
  </section>

  <section class="list-section reveal home-hero" aria-label="Contact channels">
    <h2 class="section-title">Каналы связи</h2>

    <div class="contact-card-grid">
      <article v-for="channel in channels" :key="channel.title" class="contact-card">
        <div class="contact-card-head">
          <h3 class="contact-card-title">{{ channel.title }}</h3>
          <span class="contact-card-badge">direct</span>
        </div>

        <p class="home-status">{{ channel.description }}</p>
        <p class="contact-card-bestfor">Лучше всего для: {{ channel.bestFor }}</p>

        <a :href="channel.href" target="_blank" rel="noreferrer noopener" class="stack-chip contact-card-link">
          <svg
            v-if="channel.icon === 'github'"
            class="stack-chip-logo social-logo social-logo-github"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.22.72-.5v-1.72c-2.94.64-3.56-1.24-3.56-1.24-.48-1.2-1.17-1.52-1.17-1.52-.95-.65.08-.64.08-.64 1.06.08 1.62 1.08 1.62 1.08.93 1.58 2.45 1.12 3.05.86.1-.67.36-1.13.65-1.39-2.35-.27-4.82-1.17-4.82-5.2 0-1.14.41-2.08 1.08-2.82-.1-.27-.47-1.36.11-2.84 0 0 .88-.28 2.88 1.07a9.9 9.9 0 0 1 5.24 0c2-1.35 2.88-1.07 2.88-1.07.58 1.48.21 2.57.1 2.84.68.74 1.09 1.68 1.09 2.82 0 4.04-2.48 4.92-4.84 5.18.37.32.7.95.7 1.92v2.85c0 .28.2.6.73.5A10.5 10.5 0 0 0 12 1.5z"
            />
          </svg>
          <svg
            v-else
            class="stack-chip-logo social-logo social-logo-telegram"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M16 8.049c0-.713-.258-1.248-.777-1.397-.53-.153-1.29.051-2.136.39C10.095 8.297 3.45 11.01 1.94 11.684c-.358.159-.697.39-.644.88.043.403.274.58.702.715.472.148 1.658.535 2.535.809.845.264 1.607.403 2.199-.445.445-.64 2.508-3.25 2.866-3.59.359-.339.63-.074.442.223-.201.318-2.577 3.803-2.798 4.143-.252.387-.13.886.463 1.222.675.382 1.191.693 1.907 1.199.716.506.896.726 1.726.649.83-.078 1.42-.71 1.627-1.988.49-3.048 1.454-8.212 1.454-8.212z"
            />
          </svg>
          {{ channel.label }}
        </a>
      </article>
    </div>
  </section>

  <section class="list-section reveal home-hero">
    <h2 class="section-title">Темы для обращения</h2>

    <div class="contact-topic-grid">
      <p v-for="topic in collaborationTopics" :key="topic" class="contact-topic-chip">
        {{ topic }}
      </p>
    </div>

    <div class="contact-tip-panel">
      <h3 class="support-panel-title">Что написать в первом сообщении</h3>
      <ul class="support-checklist">
        <li v-for="tip in firstMessageTips" :key="tip">{{ tip }}</li>
      </ul>
    </div>
  </section>
</template>
