import type { PageMeta } from "./meta";
import { siteMetadata } from "./content";
import pageMetaConfig from "../content/page-meta.json";

export type NavigationItemName = "home" | "projects" | "blog" | "talks" | "support" | "contact";
export type StaticPageKey = NavigationItemName | "not-found";

export interface NavigationItem {
  name: NavigationItemName;
  path: string;
  label: string;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const getLastPathSegment = (value: string): string => trimTrailingSlash(value).split("/").at(-1) ?? "";

const buildSectionTitle = (label: string): string => `${label} — ${siteMetadata.displayName}`;
export const getGithubAvatarUrl = (account: string, size = 96): string =>
  `https://github.com/${account.replace(/^@/, "").trim()}.png?size=${size}`;

export const GITHUB_USERNAME = siteMetadata.githubUsername;
export const GITHUB_PROFILE_URL = trimTrailingSlash(siteMetadata.social.github);
export const GITHUB_AVATAR_URL = getGithubAvatarUrl(GITHUB_USERNAME);
export const GITHUB_PROFILE_LABEL = GITHUB_PROFILE_URL.replace(/^https?:\/\//, "");
export const TELEGRAM_URL = trimTrailingSlash(siteMetadata.social.telegram);
export const TELEGRAM_HANDLE = getLastPathSegment(TELEGRAM_URL);
export const TELEGRAM_LABEL = TELEGRAM_HANDLE ? `@${TELEGRAM_HANDLE}` : TELEGRAM_URL.replace(/^https?:\/\//, "");
export const getGithubRepositoryUrl = (repository: string): string =>
  repository.includes("/")
    ? `https://github.com/${repository.replace(/^\/+|\/+$/g, "")}`
    : `${GITHUB_PROFILE_URL}/${repository.replace(/^\/+|\/+$/g, "")}`;

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { name: "home", path: "/", label: "Home" },
  { name: "projects", path: "/projects", label: "Projects" },
  { name: "blog", path: "/blog", label: "Blog" },
  { name: "talks", path: "/talks", label: "Talks" },
  { name: "support", path: "/support", label: "Support" },
  { name: "contact", path: "/contact", label: "Contact" }
];

export const HEADER_NAV_ITEMS: NavigationItem[] = PRIMARY_NAV_ITEMS.filter((item) => item.name !== "talks");

type StaticPageConfig = {
  path: string;
  title: string | null;
  description: string | null;
  indexable: boolean;
};

const staticPageConfig = pageMetaConfig as Record<StaticPageKey, StaticPageConfig>;
const STATIC_PAGE_META = Object.fromEntries(
  Object.entries(staticPageConfig).map(([key, page]) => [
    key,
    {
      title: page.title ? buildSectionTitle(page.title) : siteMetadata.defaultTitle,
      description: page.description ?? siteMetadata.defaultDescription,
      path: page.path
    }
  ])
) as Record<StaticPageKey, PageMeta>;

export const getStaticPageMeta = (page: StaticPageKey): PageMeta => STATIC_PAGE_META[page];
