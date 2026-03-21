import type { PageMeta } from "./meta";
import { siteMetadata } from "./content";

export type NavigationItemName = "home" | "projects" | "blog" | "talks" | "support" | "contact";
export type StaticPageKey = NavigationItemName | "not-found";

export interface NavigationItem {
  name: NavigationItemName;
  path: string;
  label: string;
}

const buildSectionTitle = (label: string): string => `${label} — ${siteMetadata.displayName}`;

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { name: "home", path: "/", label: "Home" },
  { name: "projects", path: "/projects", label: "Projects" },
  { name: "blog", path: "/blog", label: "Blog" },
  { name: "talks", path: "/talks", label: "Talks" },
  { name: "support", path: "/support", label: "Support" },
  { name: "contact", path: "/contact", label: "Contact" }
];

const STATIC_PAGE_META: Record<StaticPageKey, PageMeta> = {
  home: {
    title: siteMetadata.defaultTitle,
    description: siteMetadata.defaultDescription,
    path: "/"
  },
  projects: {
    title: buildSectionTitle("Projects"),
    description: "Рабочие и pet-проекты: от идеи до реального релиза, с акцентом на продукт и инженерную практику.",
    path: "/projects"
  },
  blog: {
    title: buildSectionTitle("Blog"),
    description: "Статьи про инженерную практику, архитектуру, DX и процесс разработки.",
    path: "/blog"
  },
  talks: {
    title: buildSectionTitle("Talks"),
    description: "Раздел с лекциями, заметками и будущими выпусками podcast lab.",
    path: "/talks"
  },
  support: {
    title: buildSectionTitle("Support"),
    description: "Как поддержать автора сайта: обратная связь, репосты, сотрудничество и идеи.",
    path: "/support"
  },
  contact: {
    title: buildSectionTitle("Contact"),
    description: "Каналы связи для сотрудничества, технических вопросов и продуктовых обсуждений.",
    path: "/contact"
  },
  "not-found": {
    title: `Страница не найдена — ${siteMetadata.displayName}`,
    description: "Запрошенная страница не найдена. Вернитесь на главную или откройте список материалов.",
    path: "/404"
  }
};

export const getStaticPageMeta = (page: StaticPageKey): PageMeta => STATIC_PAGE_META[page];
