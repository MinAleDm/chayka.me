<script setup lang="ts">
import { RouterView } from "vue-router";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
</script>

<template>
  <div class="app-shell">
    <SiteHeader />

    <main class="main-content">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>
