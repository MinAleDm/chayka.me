<script setup lang="ts">
import { RouterView } from "vue-router";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
</script>

<template>
  <div class="app-shell">
    <div class="bg-grid" aria-hidden="true" />
    <div class="orb orb-a" aria-hidden="true" />
    <div class="orb orb-b" aria-hidden="true" />

    <SiteHeader />

    <main class="container main-content">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>
