import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

export type FrontmatterValue = string | number | string[];

export interface ParsedMarkdown {
  attributes: Record<string, FrontmatterValue>;
  body: string;
  html: string;
}

const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

const stripWrappingQuotes = (value: string): string => {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2] : trimmed;
};

const parseListValue = (value: string): string[] => {
  const normalized = value.trim();
  const source =
    normalized.startsWith("[") && normalized.endsWith("]")
      ? normalized.slice(1, -1)
      : normalized;

  return source
    .split(",")
    .map((item) => stripWrappingQuotes(item))
    .filter(Boolean);
};

const normalizeValue = (key: string, value: string): FrontmatterValue => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (key === "tags") {
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return parseListValue(trimmed);
    }

    if (trimmed.includes(",")) {
      return parseListValue(trimmed);
    }

    return stripWrappingQuotes(trimmed);
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return stripWrappingQuotes(trimmed);
};

export const parseMarkdown = (raw: string): ParsedMarkdown => {
  const matched = raw.match(frontmatterRegex);
  const attributes: Record<string, FrontmatterValue> = {};

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
    if (separator < 0) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    if (!key || !value) continue;

    attributes[key] = normalizeValue(key, value);
  }

  return {
    attributes,
    body,
    html: markdown.render(body)
  };
};

const markdownSyntaxRegex = /[#*_`>[\]()!-]/g;

export const stripMarkdown = (content: string): string =>
  content
    .replace(markdownSyntaxRegex, " ")
    .replace(/\s+/g, " ")
    .trim();
