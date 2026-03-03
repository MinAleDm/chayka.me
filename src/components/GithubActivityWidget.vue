<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type GithubCommit = {
  sha: string;
  message: string;
};

type GithubPushPayload = {
  head?: string;
  commits?: GithubCommit[];
};

type GithubEvent = {
  type: string;
  created_at: string;
  repo?: {
    name: string;
  };
  payload?: GithubPushPayload;
};

type GithubRepo = {
  description: string | null;
};

type GithubCommitDetails = {
  commit?: {
    message?: string;
  };
};

type ActivityView = {
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  repoName: string;
  repoUrl: string;
  projectDescription: string;
  createdAt: string;
};

const GITHUB_USERNAME = "MinAleDm";
const MOSCOW_TIMEZONE = "Europe/Moscow";
const CACHE_KEY = "github-activity-cache-v2";
const CACHE_TTL_MS = 5 * 60 * 1000;

const isLoading = ref(true);
const errorText = ref("");
const activity = ref<ActivityView | null>(null);
const nowMs = ref(Date.now());
let timer: number | undefined;

const absoluteMoscowTime = computed(() => {
  if (!activity.value) {
    return "";
  }

  const date = new Date(activity.value.createdAt);
  return `${new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)} МСК`;
});

const relativeMoscowTime = computed(() => {
  if (!activity.value) {
    return "";
  }

  return formatRelativeTime(activity.value.createdAt, nowMs.value);
});

async function loadActivity() {
  isLoading.value = true;
  errorText.value = "";

  const cached = readFromCache();
  if (cached) {
    activity.value = cached;
    isLoading.value = false;
    return;
  }

  try {
    const fresh = await fetchLatestPushActivity();
    activity.value = fresh;
    writeToCache(fresh);
  } catch {
    if (!activity.value) {
      errorText.value = "Не удалось загрузить активность GitHub. Попробуй обновить страницу.";
    }
  } finally {
    isLoading.value = false;
  }
}

async function fetchLatestPushActivity(): Promise<ActivityView> {
  const eventsResponse = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`,
    {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!eventsResponse.ok) {
    throw new Error(`GitHub events request failed: ${eventsResponse.status}`);
  }

  const events = (await eventsResponse.json()) as GithubEvent[];
  const pushEvent = events.find((event) => {
    return event.type === "PushEvent" && Boolean(event.repo?.name);
  });

  if (!pushEvent || !pushEvent.repo?.name) {
    throw new Error("Push events not found");
  }

  const commits = pushEvent.payload?.commits ?? [];
  const headSha = pushEvent.payload?.head ?? commits[commits.length - 1]?.sha ?? "";
  const headCommit =
    commits.find((commit) => commit.sha === headSha) ?? commits[commits.length - 1];

  const repoName = pushEvent.repo.name;
  const repoUrl = `https://github.com/${repoName}`;
  const rawCommitSha = headSha || headCommit?.sha || "";
  const commitSha = rawCommitSha.slice(0, 7);
  const commitUrl = commitSha ? `${repoUrl}/commit/${rawCommitSha}` : repoUrl;

  let commitMessage = headCommit?.message?.trim() || "";
  if (!commitMessage && rawCommitSha) {
    commitMessage = await fetchCommitMessage(repoName, rawCommitSha);
  }
  if (!commitMessage) {
    commitMessage = "Коммит без описания";
  }

  const repoDescription = await fetchRepositoryDescription(repoName);
  const projectDescription =
    repoDescription || "Описание проекта не заполнено, ориентируйся по сообщению коммита.";

  return {
    commitSha: commitSha || "n/a",
    commitUrl,
    commitMessage,
    repoName,
    repoUrl,
    projectDescription,
    createdAt: pushEvent.created_at
  };
}

async function fetchRepositoryDescription(repoFullName: string): Promise<string> {
  const repoResponse = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!repoResponse.ok) {
    return "";
  }

  const repoData = (await repoResponse.json()) as GithubRepo;
  return repoData.description ?? "";
}

async function fetchCommitMessage(repoFullName: string, sha: string): Promise<string> {
  const commitResponse = await fetch(`https://api.github.com/repos/${repoFullName}/commits/${sha}`, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!commitResponse.ok) {
    return "";
  }

  const commitData = (await commitResponse.json()) as GithubCommitDetails;
  return commitData.commit?.message?.trim() ?? "";
}

function formatRelativeTime(createdAtIso: string, now: number): string {
  const createdAtMs = new Date(createdAtIso).getTime();
  const deltaSeconds = Math.max(0, Math.floor((now - createdAtMs) / 1000));

  if (deltaSeconds < 60) {
    return "только что";
  }

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (deltaSeconds < hour) {
    const amount = Math.floor(deltaSeconds / minute);
    return `${amount} ${plural(amount, ["минута", "минуты", "минут"])} назад`;
  }

  if (deltaSeconds < day) {
    const amount = Math.floor(deltaSeconds / hour);
    return `${amount} ${plural(amount, ["час", "часа", "часов"])} назад`;
  }

  if (deltaSeconds < month) {
    const amount = Math.floor(deltaSeconds / day);
    return `${amount} ${plural(amount, ["день", "дня", "дней"])} назад`;
  }

  if (deltaSeconds < year) {
    const amount = Math.floor(deltaSeconds / month);
    return `${amount} ${plural(amount, ["месяц", "месяца", "месяцев"])} назад`;
  }

  const amount = Math.floor(deltaSeconds / year);
  return `${amount} ${plural(amount, ["год", "года", "лет"])} назад`;
}

function plural(amount: number, forms: [string, string, string]): string {
  const mod10 = amount % 10;
  const mod100 = amount % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1];
  }

  return forms[2];
}

function readFromCache(): ActivityView | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { savedAt?: number; data?: ActivityView };
    if (!parsed.savedAt || !parsed.data) {
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeToCache(data: ActivityView) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Ignore storage errors for private mode / quota limits.
  }
}

onMounted(() => {
  void loadActivity();

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
  <section class="card panel mt-1 reveal gh-activity">
    <div class="gh-activity-header">
      <span class="badge">GitHub activity</span>
      <a
        class="gh-link"
        href="https://github.com/MinAleDm"
        target="_blank"
        rel="noreferrer noopener"
      >
        Профиль
      </a>
    </div>

    <p v-if="isLoading && !activity" class="gh-muted">Загружаю последнюю активность...</p>
    <p v-else-if="errorText" class="gh-error">{{ errorText }}</p>

    <div v-else-if="activity" class="gh-content">
      <h2 class="gh-title">Последний коммит: {{ activity.commitSha }}</h2>
      <p class="gh-meta">
        Репозиторий:
        <a :href="activity.repoUrl" target="_blank" rel="noreferrer noopener">
          {{ activity.repoName }}
        </a>
      </p>
      <p class="gh-meta">
        Коммит:
        <a :href="activity.commitUrl" target="_blank" rel="noreferrer noopener">
          открыть на GitHub
        </a>
      </p>
      <p class="gh-message">{{ activity.commitMessage }}</p>
      <p class="gh-description">{{ activity.projectDescription }}</p>
      <p class="gh-time">{{ relativeMoscowTime }} · {{ absoluteMoscowTime }}</p>
    </div>
  </section>
</template>
