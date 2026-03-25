<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { GithubActivity, GithubDataStatus } from "../lib/content";
import { formatAbsoluteMoscowTime, formatRelativeTime } from "../lib/dates";

const props = defineProps<{
  activity: GithubActivity | null;
  status: GithubDataStatus;
}>();

const nowMs = ref(Date.now());
let timer: number | undefined;

const absoluteMoscowTime = computed(() => {
  if (!props.activity) {
    return "";
  }

  return formatAbsoluteMoscowTime(props.activity.createdAt);
});

const relativeMoscowTime = computed(() => {
  if (!props.activity) {
    return "";
  }

  return formatRelativeTime(props.activity.createdAt, nowMs.value);
});

const syncMoscowTime = computed(() => {
  if (!props.status.generatedAt) {
    return "";
  }

  return formatAbsoluteMoscowTime(props.status.generatedAt);
});

onMounted(() => {
  timer = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 60_000);
});

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <section class="gh-activity reveal">
    <div class="gh-activity-header">
      <h2 class="section-title">Последний коммит</h2>
    </div>

    <p v-if="!activity && status.isStale" class="gh-muted">
      После смены GitHub username старый snapshot скрыт. Нужна новая синхронизация, чтобы снова показать активность.
    </p>

    <p v-else-if="!activity" class="gh-muted">
      Данные GitHub пока не синхронизированы. На следующей сборке сайта они подтянутся автоматически.
    </p>

    <div v-else class="gh-content">
      <h3 class="gh-title">{{ activity.commitMessage }}</h3>
      <p class="gh-meta">
        Репозиторий:
        <a :href="activity.repoUrl" target="_blank" rel="noreferrer noopener">
          {{ activity.repoName }}
        </a>
      </p>
      <p class="gh-meta">
        SHA:
        <code>{{ activity.commitSha }}</code>
        ·
        <a :href="activity.commitUrl" target="_blank" rel="noreferrer noopener">
          открыть на GitHub
        </a>
      </p>
      <p class="gh-description">{{ activity.projectDescription }}</p>
      <p class="gh-time">{{ relativeMoscowTime }} · {{ absoluteMoscowTime }}</p>
      <p v-if="syncMoscowTime" class="gh-muted">Снимок GitHub обновлён: {{ syncMoscowTime }}</p>
    </div>
  </section>
</template>
