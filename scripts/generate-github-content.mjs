import { readFile } from "node:fs/promises";
import { GENERATED_GITHUB_PATH, readSiteConfig, writeJsonFile } from "./site-utils.mjs";

const REPOS_PER_PAGE = 100;
const SEARCH_RESULTS_PER_PAGE = 100;
const MAX_PAGES = 10;

function normalizeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "chayka.me-build-script",
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchPublicRepos(username) {
  const repositories = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const items = await fetchJson(
      `https://api.github.com/users/${username}/repos?type=all&sort=pushed&per_page=${REPOS_PER_PAGE}&page=${page}`
    );

    repositories.push(...items.filter((repo) => !repo.private));
    if (items.length < REPOS_PER_PAGE) break;
  }

  return repositories;
}

async function fetchContributedRepos(username) {
  const repositories = new Map();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const query = encodeURIComponent(`author:${username} is:public`);
    const payload = await fetchJson(
      `https://api.github.com/search/commits?q=${query}&sort=author-date&order=desc&per_page=${SEARCH_RESULTS_PER_PAGE}&page=${page}`,
      {
        Accept: "application/vnd.github.cloak-preview+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    );

    const items = payload.items ?? [];
    for (const item of items) {
      const repository = item.repository;
      if (!repository || repository.private) continue;

      const key = repository.full_name.toLowerCase();
      const commitDate = item.commit?.author?.date ?? item.commit?.committer?.date ?? null;
      const previous = repositories.get(key);
      const nextActivity = commitDate ?? repository.pushed_at ?? repository.updated_at ?? null;

      if (!previous) {
        repositories.set(key, {
          ...repository,
          activity_at: nextActivity
        });
        continue;
      }

      const previousMs = Date.parse(previous.activity_at ?? previous.pushed_at ?? previous.updated_at ?? "");
      const nextMs = Date.parse(nextActivity ?? "");

      if (!Number.isNaN(nextMs) && (Number.isNaN(previousMs) || nextMs > previousMs)) {
        repositories.set(key, {
          ...previous,
          ...repository,
          activity_at: nextActivity
        });
      }
    }

    if (items.length < SEARCH_RESULTS_PER_PAGE) break;
  }

  return Array.from(repositories.values());
}

async function fetchLatestActivity(username) {
  const events = await fetchJson(`https://api.github.com/users/${username}/events/public?per_page=30`);
  const pushEvent = events.find((event) => event.type === "PushEvent" && event.repo?.name);

  if (!pushEvent?.repo?.name) {
    return null;
  }

  const commits = pushEvent.payload?.commits ?? [];
  const headSha = pushEvent.payload?.head ?? commits.at(-1)?.sha ?? "";
  const headCommit = commits.find((commit) => commit.sha === headSha) ?? commits.at(-1);
  const repoName = pushEvent.repo.name;
  const repoUrl = `https://github.com/${repoName}`;
  const commitUrl = headSha ? `${repoUrl}/commit/${headSha}` : repoUrl;

  let commitMessage = headCommit?.message?.trim() ?? "";
  if (!commitMessage && headSha) {
    try {
      const commitData = await fetchJson(`https://api.github.com/repos/${repoName}/commits/${headSha}`);
      commitMessage = commitData.commit?.message?.trim() ?? "";
    } catch {
      commitMessage = "";
    }
  }

  let repoDescription = "";
  try {
    const repoData = await fetchJson(`https://api.github.com/repos/${repoName}`);
    repoDescription = repoData.description ?? "";
  } catch {
    repoDescription = "";
  }

  return {
    createdAt: normalizeDate(pushEvent.created_at),
    commitSha: headSha ? headSha.slice(0, 7) : "n/a",
    commitUrl,
    commitMessage: commitMessage || "Коммит без описания",
    repoName,
    repoUrl,
    projectDescription:
      repoDescription || "Описание проекта не заполнено, ориентируйся по сообщению коммита."
  };
}

async function readPreviousPayload() {
  try {
    return JSON.parse(await readFile(GENERATED_GITHUB_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  const siteConfig = await readSiteConfig();
  const previous = await readPreviousPayload();

  try {
    const [activity, contributedRepositories, publicRepositories] = await Promise.all([
      fetchLatestActivity(siteConfig.githubUsername),
      fetchContributedRepos(siteConfig.githubUsername).catch(() => []),
      fetchPublicRepos(siteConfig.githubUsername)
    ]);

    const repositoriesMap = new Map();
    for (const repository of [...contributedRepositories, ...publicRepositories]) {
      const key = repository.full_name.toLowerCase();
      if (!repositoriesMap.has(key)) {
        repositoriesMap.set(key, repository);
        continue;
      }

      const previousRepository = repositoriesMap.get(key);
      const previousMs = Date.parse(
        previousRepository.activity_at ?? previousRepository.pushed_at ?? previousRepository.updated_at ?? ""
      );
      const nextMs = Date.parse(repository.activity_at ?? repository.pushed_at ?? repository.updated_at ?? "");

      if (!Number.isNaN(nextMs) && (Number.isNaN(previousMs) || nextMs > previousMs)) {
        repositoriesMap.set(key, { ...previousRepository, ...repository });
      }
    }

    const repositories = Array.from(repositoriesMap.values())
      .filter((repository) => !repository.private)
      .map((repository) => ({
        fullName: repository.full_name,
        name: repository.name,
        owner: repository.owner?.login ?? "",
        htmlUrl: repository.html_url,
        description: repository.description ?? "",
        language: repository.language ?? "",
        topics: repository.topics ?? [],
        pushedAt: normalizeDate(repository.pushed_at),
        updatedAt: normalizeDate(repository.updated_at),
        activityAt: normalizeDate(repository.activity_at ?? repository.pushed_at ?? repository.updated_at),
        isPinned: siteConfig.pinnedRepositories.includes(repository.name)
      }))
      .sort((left, right) => {
        const leftMs = Date.parse(left.activityAt ?? left.updatedAt ?? left.pushedAt ?? "");
        const rightMs = Date.parse(right.activityAt ?? right.updatedAt ?? right.pushedAt ?? "");
        const safeLeftMs = Number.isNaN(leftMs) ? 0 : leftMs;
        const safeRightMs = Number.isNaN(rightMs) ? 0 : rightMs;
        return safeRightMs - safeLeftMs;
      });

    await writeJsonFile(GENERATED_GITHUB_PATH, {
      generatedAt: new Date().toISOString(),
      source: "github",
      activity,
      repositories
    });

    console.log(`Generated GitHub content: ${repositories.length} repositories.`);
  } catch (error) {
    if (previous) {
      console.warn("GitHub sync failed, keeping existing generated content.");
      console.warn(error instanceof Error ? error.message : String(error));
      return;
    }

    await writeJsonFile(GENERATED_GITHUB_PATH, {
      generatedAt: new Date().toISOString(),
      source: "fallback",
      activity: null,
      repositories: []
    });

    console.warn("GitHub sync failed and no previous payload was found. Wrote empty fallback payload.");
    console.warn(error instanceof Error ? error.message : String(error));
  }
}

await main();
