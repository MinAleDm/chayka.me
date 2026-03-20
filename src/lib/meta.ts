import { computed, onBeforeUnmount, watchEffect, type MaybeRefOrGetter, toValue } from "vue";
import siteConfig from "../content/site-config.json";

export interface PageMeta {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
}

const defaultMeta: Required<PageMeta> = {
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  path: "/",
  type: "website"
};

const ensureMetaTag = (selector: string, attribute: "name" | "property", value: string): HTMLMetaElement => {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, value);
    document.head.append(tag);
  }
  return tag;
};

const ensureCanonical = (): HTMLLinkElement => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.append(link);
  }
  return link;
};

const ensureDescriptionTag = (): HTMLMetaElement => ensureMetaTag('meta[name="description"]', "name", "description");

const applyMeta = (meta: Required<PageMeta>): void => {
  const title = meta.title || defaultMeta.title;
  const description = meta.description || defaultMeta.description;
  const canonicalUrl = new URL(meta.path || "/", `${siteConfig.baseUrl}/`).toString();
  const imageUrl = new URL("/favicon.svg", `${siteConfig.baseUrl}/`).toString();

  document.title = title;
  ensureDescriptionTag().content = description;

  ensureCanonical().href = canonicalUrl;
  ensureMetaTag('meta[property="og:type"]', "property", "og:type").content = meta.type;
  ensureMetaTag('meta[property="og:locale"]', "property", "og:locale").content = siteConfig.ogLocale;
  ensureMetaTag('meta[property="og:site_name"]', "property", "og:site_name").content = siteConfig.siteName;
  ensureMetaTag('meta[property="og:title"]', "property", "og:title").content = title;
  ensureMetaTag('meta[property="og:description"]', "property", "og:description").content = description;
  ensureMetaTag('meta[property="og:url"]', "property", "og:url").content = canonicalUrl;
  ensureMetaTag('meta[property="og:image"]', "property", "og:image").content = imageUrl;
  ensureMetaTag('meta[name="twitter:card"]', "name", "twitter:card").content = "summary";
  ensureMetaTag('meta[name="twitter:title"]', "name", "twitter:title").content = title;
  ensureMetaTag('meta[name="twitter:description"]', "name", "twitter:description").content = description;
  ensureMetaTag('meta[name="twitter:image"]', "name", "twitter:image").content = imageUrl;
};

export const usePageMeta = (source: MaybeRefOrGetter<PageMeta>): void => {
  const resolved = computed(() => ({
    ...defaultMeta,
    ...toValue(source)
  }));

  watchEffect(() => {
    applyMeta(resolved.value);
  });

  onBeforeUnmount(() => {
    applyMeta(defaultMeta);
  });
};
