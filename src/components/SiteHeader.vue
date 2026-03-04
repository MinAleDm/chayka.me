<script setup lang="ts">
import { RouterLink } from "vue-router";
import personalLogo from "../assets/images/logos/mylogo.png";
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <RouterLink class="brand" to="/" aria-label="Alexander Minkin home">
        <img :src="personalLogo" alt="Alexander Minkin logo" class="brand-logo" />
      </RouterLink>

      <nav class="nav" aria-label="Main navigation">
        <RouterLink class="nav-link" to="/" exact-active-class="is-active">Home</RouterLink>
        <RouterLink class="nav-link" to="/projects" exact-active-class="is-active">Projects</RouterLink>
        <RouterLink class="nav-link" to="/blog" exact-active-class="is-active">Blog</RouterLink>
      </nav>

      <a
        class="github-link"
        href="https://github.com/MinAleDm"
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
  </header>
</template>
