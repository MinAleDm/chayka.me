import MarkdownIt from "markdown-it";
const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true
});
const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
const normalizeValue = (value) => {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        return trimmed
            .slice(1, -1)
            .split(",")
            .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
            .filter(Boolean);
    }
    if (trimmed.includes(",")) {
        return trimmed
            .split(",")
            .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
            .filter(Boolean);
    }
    return trimmed.replace(/^['\"]|['\"]$/g, "");
};
export const parseMarkdown = (raw) => {
    const matched = raw.match(frontmatterRegex);
    const attributes = {};
    if (!matched) {
        return {
            attributes,
            body: raw.trim(),
            html: markdown.render(raw)
        };
    }
    const frontmatterBlock = matched[1];
    const body = raw.slice(matched[0].length).trim();
    for (const line of frontmatterBlock.split("\n")) {
        const separator = line.indexOf(":");
        if (separator < 0)
            continue;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1);
        if (!key || !value)
            continue;
        attributes[key] = normalizeValue(value);
    }
    return {
        attributes,
        body,
        html: markdown.render(body)
    };
};
const markdownSyntaxRegex = /[#*_`>[\]()!-]/g;
export const stripMarkdown = (content) => content
    .replace(markdownSyntaxRegex, " ")
    .replace(/\s+/g, " ")
    .trim();
