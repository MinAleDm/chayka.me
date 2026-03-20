import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "..");
export const DIST_DIR = path.join(ROOT_DIR, "dist");
export const CONTENT_DIR = path.join(ROOT_DIR, "src", "content");
export const BLOG_DIR = path.join(CONTENT_DIR, "blog");
export const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
export const SITE_CONFIG_PATH = path.join(CONTENT_DIR, "site-config.json");
export const GENERATED_GITHUB_PATH = path.join(CONTENT_DIR, "generated", "github-data.json");

const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const keyLineRegex = /^([A-Za-z0-9_-]+):(.*)$/;

export async function readSiteConfig() {
  return JSON.parse(await readFile(SITE_CONFIG_PATH, "utf8"));
}

export async function ensureDir(target) {
  await mkdir(target, { recursive: true });
}

export async function writeJsonFile(target, value) {
  await ensureDir(path.dirname(target));
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function stripWrappingQuotes(value) {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2] : trimmed;
}

function parseListValue(value) {
  const normalized = value.trim();
  const source =
    normalized.startsWith("[") && normalized.endsWith("]")
      ? normalized.slice(1, -1)
      : normalized;

  return source
    .split(",")
    .map((item) => stripWrappingQuotes(item))
    .filter(Boolean);
}

function parseStructuredValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return stripWrappingQuotes(trimmed);
}

function normalizeValue(key, value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseStructuredValue(trimmed);
  }

  if (key === "tags" && trimmed.includes(",")) {
    return parseListValue(trimmed);
  }

  return parseStructuredValue(trimmed);
}

function parseFrontmatterBlock(block) {
  const attributes = {};
  let currentKey = null;
  let currentValue = [];

  const flush = () => {
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
}

export function parseMarkdownFile(raw) {
  const matched = raw.match(frontmatterRegex);
  if (!matched) {
    return { attributes: {}, body: raw.trim() };
  }

  return {
    attributes: parseFrontmatterBlock(matched[1]),
    body: raw.slice(matched[0].length).trim()
  };
}

export function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#*_>[\]()!-]/g, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createSummary(content, maxLength = 170) {
  const plain = stripMarkdown(content);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 3).trimEnd()}...`;
}

export async function readMarkdownEntries(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  const loaded = await Promise.all(
    markdownFiles.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      const raw = await readFile(absolutePath, "utf8");
      const parsed = parseMarkdownFile(raw);
      const slug = entry.name.replace(/\.md$/, "");

      return {
        absolutePath,
        slug,
        ...parsed
      };
    })
  );

  return loaded.sort((left, right) => left.slug.localeCompare(right.slug));
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
