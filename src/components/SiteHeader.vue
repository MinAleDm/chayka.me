<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import brandMark from "../assets/brand-mark.svg";
import { getActiveTheme, toggleTheme, type SiteTheme } from "../lib/theme";
import { GITHUB_PROFILE_URL, HEADER_NAV_ITEMS, TELEGRAM_URL } from "../lib/site";

const theme = ref<SiteTheme>(getActiveTheme());

const handleThemeToggle = async (event: MouseEvent): Promise<void> => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLElement)) return;

  const rect = button.getBoundingClientRect();
  theme.value = await toggleTheme({
    origin: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  });
};
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <RouterLink class="brand" to="/" aria-label="Alexander Minkin home">
        <img :src="brandMark" alt="minkin.tech brand mark" class="brand-logo" />
      </RouterLink>

      <nav class="nav" aria-label="Main navigation">
        <RouterLink
          v-for="item in HEADER_NAV_ITEMS"
          :key="item.name"
          class="nav-link"
          :to="item.path"
          exact-active-class="is-active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="topbar-actions">
        <button
          type="button"
          class="theme-toggle"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          :title="theme === 'dark' ? 'Light theme' : 'Dark theme'"
          @click="handleThemeToggle"
        >
          <svg v-if="theme === 'dark'" class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 .75-.75Zm0 13a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 1.5a5.75 5.75 0 1 1 0-11.5 5.75 5.75 0 0 1 0 11.5ZM5.99 5.99a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L5.99 7.05a.75.75 0 0 1 0-1.06Zm12.96 0a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM3.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H4A.75.75 0 0 1 3.25 12Zm15.25 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 18.5 12ZM7.05 16.89a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06Zm9.84 0a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM12 18.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 18.5Z" />
          </svg>
          <svg v-else class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14.5 2.5a.75.75 0 0 1 .6 1.2A7.75 7.75 0 1 0 20.3 15.1a.75.75 0 0 1 1.2.6 9.25 9.25 0 1 1-8.2-13.2c.43 0 .84 0 1.2 0Z" />
          </svg>
        </button>

        <a
          class="github-link"
          :href="TELEGRAM_URL"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Telegram profile"
          title="Telegram"
        >
          <svg class="telegram-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h7.5" />
          </svg>
        </a>

        <a
          class="github-link"
          :href="GITHUB_PROFILE_URL"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub profile"
        >
          <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.22.72-.5v-1.72c-2.94.64-3.56-1.24-3.56-1.24-.48-1.2-1.17-1.52-1.17-1.52-.95-.65.08-.64.08-.64 1.06.08 1.62 1.08 1.62 1.08.93 1.58 2.45 1.12 3.05.86.1-.67.36-1.13.65-1.39-2.35-.27-4.82-1.17-4.82-5.2 0-1.14.41-2.08 1.08-2.82-.1-.27-.47-1.36.11-2.84 0 0 .88-.28 2.88 1.07a9.9 9.9 0 0 1 5.24 0c2-1.35 2.88-1.07 2.88-1.07.58 1.48.21 2.57.1 2.84.68.74 1.09 1.68 1.09 2.82 0 4.04-2.48 4.92-4.84 5.18.37.32.7.95.7 1.92v2.85c0 .28.2.6.73.5A10.5 10.5 0 0 0 12 1.5z" />
          </svg>
        </a>
      </div>
    </div>
  </header>
</template>
