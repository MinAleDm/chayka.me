<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <RouterLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true" />
        Alexander Minkin
      </RouterLink>

      <nav class="nav" aria-label="Main navigation">
        <RouterLink class="nav-link" to="/" exact-active-class="is-active">Home</RouterLink>
        <RouterLink class="nav-link" to="/blog" exact-active-class="is-active">Blog</RouterLink>
        <RouterLink class="nav-link" to="/projects" exact-active-class="is-active">Projects</RouterLink>
      </nav>

      <a class="cta-link" href="https://github.com/MinAleDm" target="_blank" rel="noreferrer">github.com/MinAleDm</a>
    </div>
  </header>
</template>
