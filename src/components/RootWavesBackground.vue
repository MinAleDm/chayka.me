<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { createRootScene, type RootPath } from "../lib/background";

type ViewportSize = {
  width: number;
  height: number;
};

const STORAGE_KEY = "minkin.tech/root-background-seed";

const viewport = ref<ViewportSize>({
  width: 1440,
  height: 900
});

const seed = ref("root-bg-static");
const prefersReducedMotion = ref(false);

let resizeFrame = 0;
let mediaQuery: MediaQueryList | null = null;

const ensureSeed = (): string => {
  if (typeof window === "undefined") return "root-bg-static";

  const existingSeed = window.sessionStorage.getItem(STORAGE_KEY);
  if (existingSeed) return existingSeed;

  const generatedSeed = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  window.sessionStorage.setItem(STORAGE_KEY, generatedSeed);
  return generatedSeed;
};

const updateViewport = (): void => {
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

const handleResize = (): void => {
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(updateViewport);
};

const updateReducedMotion = (): void => {
  prefersReducedMotion.value = mediaQuery?.matches ?? false;
};

const scene = computed(() => createRootScene(viewport.value.width, viewport.value.height, seed.value));
const viewBox = computed(() => `0 0 ${viewport.value.width} ${viewport.value.height}`);
const pathStyle = (path: RootPath, opacityScale = 1): Record<string, string> => ({
  "--path-delay": `${path.delay}s`,
  "--path-duration": `${path.duration}s`,
  "--path-opacity": `${Math.max(0, Math.min(1, path.opacity * opacityScale))}`
});

onMounted(() => {
  seed.value = ensureSeed();
  updateViewport();
  window.addEventListener("resize", handleResize, { passive: true });

  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  updateReducedMotion();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", updateReducedMotion);
  } else {
    mediaQuery.addListener(updateReducedMotion);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);

  if (!mediaQuery) return;

  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", updateReducedMotion);
  } else {
    mediaQuery.removeListener(updateReducedMotion);
  }
});
</script>

<template>
  <div
    class="root-background"
    :class="{ 'is-reduced-motion': prefersReducedMotion }"
    aria-hidden="true"
  >
    <svg class="root-background-svg" :viewBox="viewBox" preserveAspectRatio="none">
      <defs>
        <filter id="root-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      <g v-for="(cluster, clusterIndex) in scene.clusters" :key="clusterIndex" class="root-background-cluster">
        <path
          v-for="(path, pathIndex) in cluster.paths"
          :key="`${clusterIndex}-${pathIndex}-soft`"
          class="root-background-path root-background-path-soft"
          :d="path.d"
          :stroke-width="path.width"
          :style="pathStyle(path, 0.52)"
          pathLength="100"
          filter="url(#root-soft-blur)"
        />
        <path
          v-for="(path, pathIndex) in cluster.paths"
          :key="`${clusterIndex}-${pathIndex}-core`"
          class="root-background-path root-background-path-core"
          :d="path.d"
          :stroke-width="Math.max(0.6, path.width * 0.42)"
          :style="pathStyle(path)"
          pathLength="100"
        />
      </g>
    </svg>
  </div>
</template>
