import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

markdown.renderer.rules.link_open = (tokens: any[], index: number, options: unknown, _env: unknown, self: any) => {
  const href = tokens[index].attrGet("href") ?? "";
  const isExternal = /^https?:\/\//i.test(href);

  if (isExternal) {
    tokens[index].attrSet("target", "_blank");
    tokens[index].attrSet("rel", "noreferrer noopener");
  }

  return self.renderToken(tokens, index, options);
};

export type FrontmatterPrimitive = string | number | boolean | null;
export interface FrontmatterObject {
  [key: string]: FrontmatterValue;
}
export type FrontmatterValue = FrontmatterPrimitive | FrontmatterObject | FrontmatterValue[];

export interface ParsedMarkdown {
  attributes: Record<string, FrontmatterValue>;
  body: string;
  html: string;
}

const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const keyLineRegex = /^([A-Za-z0-9_-]+):(.*)$/;

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

const parseStructuredValue = (value: string): FrontmatterValue => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed) as FrontmatterValue;
    } catch {
      return trimmed;
    }
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return stripWrappingQuotes(trimmed);
};

const normalizeValue = (key: string, value: string): FrontmatterValue => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseStructuredValue(trimmed);
  }

  if (key === "tags") {
    if (trimmed.includes(",")) {
      return parseListValue(trimmed);
    }

    return stripWrappingQuotes(trimmed);
  }

  return parseStructuredValue(trimmed);
};

const parseFrontmatterBlock = (block: string): Record<string, FrontmatterValue> => {
  const attributes: Record<string, FrontmatterValue> = {};
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  const flush = (): void => {
    if (!currentKey) return;
    attributes[currentKey] = normalizeValue(currentKey, currentValue.join("\n"));
    currentKey = null;
    currentValue = [];
  };

  for (const line of block.split(/\r?\n/)) {
    const matched = line.match(keyLineRegex);
    if (matched) {
      flush();
      currentKey = matched[1];
      currentValue.push(matched[2].trimStart());
      continue;
    }

    if (currentKey) {
      currentValue.push(line);
    }
  }

  flush();
  return attributes;
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

  return {
    attributes: parseFrontmatterBlock(frontmatterBlock),
    body,
    html: markdown.render(body)
  };
};

const markdownSyntaxRegex = /[#*_`>[\]()!-]/g;

export const stripMarkdown = (content: string): string =>
  content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(markdownSyntaxRegex, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
