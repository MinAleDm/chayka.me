import { parseMarkdown, stripMarkdown, type FrontmatterValue } from "./markdown";

export interface ContentEntry {
  slug: string;
  title: string;
  date?: string;
  tags: string[];
  summary: string;
  link?: string;
  order?: number;
  html: string;
}

const toStringValue = (value: FrontmatterValue | undefined): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const toNumberValue = (value: FrontmatterValue | undefined): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return undefined;
};

const toStringArray = (value: FrontmatterValue | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [String(value)];
};

const getSlug = (path: string): string => {
  const file = path.split("/").at(-1) ?? "";
  return file.replace(/\.md$/, "");
};

const parseDateToTimestamp = (value?: string): number => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const createSummary = (rawBody: string): string => {
  const plain = stripMarkdown(rawBody);
  if (plain.length <= 170) return plain;
  return `${plain.slice(0, 167)}...`;
};

const buildEntries = (modules: Record<string, string>): ContentEntry[] => {
  return Object.entries(modules).map(([path, raw]) => {
    const { attributes, body, html } = parseMarkdown(raw);
    const title = toStringValue(attributes.title) ?? getSlug(path);
    const date = toStringValue(attributes.date);
    const summary = toStringValue(attributes.summary) ?? createSummary(body);
    const link = toStringValue(attributes.link);
    const order = toNumberValue(attributes.order);

    return {
      slug: getSlug(path),
      title,
      date,
      tags: toStringArray(attributes.tags),
      summary,
      link,
      order,
      html
    };
  });
};

export const getHomeContent = (): string => {
  const modules = import.meta.glob("../content/home.md", {
    eager: true,
    query: "?raw",
    import: "default"
  }) as Record<string, string>;

  const raw = Object.values(modules)[0] ?? "# Home\n";
  return parseMarkdown(raw).html;
};

export const getBlogPosts = (): ContentEntry[] => {
  const modules = import.meta.glob("../content/blog/*.md", {
    eager: true,
    query: "?raw",
    import: "default"
  }) as Record<string, string>;

  return buildEntries(modules).sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
};

export const getBlogPostBySlug = (slug: string): ContentEntry | undefined => {
  return getBlogPosts().find((post) => post.slug === slug);
};

export const getProjects = (): ContentEntry[] => {
  const modules = import.meta.glob("../content/projects/*.md", {
    eager: true,
    query: "?raw",
    import: "default"
  }) as Record<string, string>;

  return buildEntries(modules).sort((a, b) => {
    if (typeof a.order === "number" && typeof b.order === "number") {
      return a.order - b.order;
    }

    if (typeof a.order === "number") return -1;
    if (typeof b.order === "number") return 1;
    return a.title.localeCompare(b.title);
  });
};
