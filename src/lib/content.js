import { parseMarkdown, stripMarkdown } from "./markdown";
const toStringValue = (value) => {
    if (typeof value === "string")
        return value;
    if (typeof value === "number")
        return String(value);
    return undefined;
};
const toNumberValue = (value) => {
    if (typeof value === "number")
        return value;
    if (typeof value === "string" && /^\d+$/.test(value))
        return Number(value);
    return undefined;
};
const toStringArray = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.map(String);
    if (typeof value === "string")
        return [value];
    return [String(value)];
};
const getSlug = (path) => {
    const file = path.split("/").at(-1) ?? "";
    return file.replace(/\.md$/, "");
};
const createSummary = (rawBody) => {
    const plain = stripMarkdown(rawBody);
    if (plain.length <= 170)
        return plain;
    return `${plain.slice(0, 167)}...`;
};
const buildEntries = (modules) => {
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
export const getHomeContent = () => {
    const modules = import.meta.glob("../content/home.md", {
        eager: true,
        query: "?raw",
        import: "default"
    });
    const raw = Object.values(modules)[0] ?? "# Home\n";
    return parseMarkdown(raw).html;
};
export const getBlogPosts = () => {
    const modules = import.meta.glob("../content/blog/*.md", {
        eager: true,
        query: "?raw",
        import: "default"
    });
    return buildEntries(modules).sort((a, b) => {
        const left = a.date ? Date.parse(a.date) : 0;
        const right = b.date ? Date.parse(b.date) : 0;
        return right - left;
    });
};
export const getProjects = () => {
    const modules = import.meta.glob("../content/projects/*.md", {
        eager: true,
        query: "?raw",
        import: "default"
    });
    return buildEntries(modules).sort((a, b) => {
        if (typeof a.order === "number" && typeof b.order === "number") {
            return a.order - b.order;
        }
        if (typeof a.order === "number")
            return -1;
        if (typeof b.order === "number")
            return 1;
        return a.title.localeCompare(b.title);
    });
};
