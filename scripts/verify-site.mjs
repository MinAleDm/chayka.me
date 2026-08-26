import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  BLOG_DIR,
  DIST_DIR,
  GENERATED_GITHUB_PATH,
  PROJECTS_DIR,
  ROOT_DIR,
  createSiteUrl,
  getBasePath,
  readPageMetaConfig,
  readSiteConfig,
  readMarkdownEntries
} from "./site-utils.mjs";

const verifyDist = process.argv.includes("--dist");

function getRoutePathFromHtmlFile(relativePath) {
  if (relativePath === "index.html") return "/";
  if (relativePath === "404.html") return "/404";
  if (relativePath.endsWith(`${path.sep}index.html`)) return `/${path.dirname(relativePath).replaceAll(path.sep, "/")}`;
  return `/${relativePath.replace(/\.html$/, "")}`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function verifyMarkdownEntries() {
  const [blogEntries, projectEntries] = await Promise.all([
    readMarkdownEntries(BLOG_DIR),
    readMarkdownEntries(PROJECTS_DIR)
  ]);

  assert(blogEntries.length > 0, "Blog content is empty.");
  assert(projectEntries.length > 0, "Project content is empty.");

  for (const entry of [...blogEntries, ...projectEntries]) {
    const title = entry.attributes.title;
    const summary = entry.attributes.summary;
    assert(typeof title === "string" && title.trim().length > 0, `Missing title in ${entry.absolutePath}`);
    assert(typeof summary === "string" && summary.trim().length > 0, `Missing summary in ${entry.absolutePath}`);
  }
}

async function verifySiteMetadata() {
  const [siteConfig, pageMetaConfig, indexHtml] = await Promise.all([
    readSiteConfig(),
    readPageMetaConfig(),
    readFile(path.join(ROOT_DIR, "index.html"), "utf8")
  ]);
  const pages = Object.values(pageMetaConfig);
  const paths = pages.map((page) => page.path);

  assert(pages.length > 0, "Static page metadata is empty.");
  assert(new Set(paths).size === paths.length, "Static page metadata contains duplicate paths.");
  assert(paths.includes("/"), "Static page metadata must include the home route.");
  assert(paths.includes("/404"), "Static page metadata must include the not-found route.");
  assert(indexHtml.includes(`<title>${siteConfig.defaultTitle}</title>`), "index.html title must match site config.");
  assert(
    indexHtml.includes(`content="${siteConfig.defaultDescription}"`),
    "index.html description must match site config."
  );

  for (const page of pages) {
    assert(typeof page.path === "string" && page.path.startsWith("/"), "Each static page needs an absolute path.");
    assert(typeof page.indexable === "boolean", `Missing indexable flag for ${page.path}.`);
  }
}

async function verifyGeneratedGithubPayload() {
  const siteConfig = await readSiteConfig();
  const payload = JSON.parse(await readFile(GENERATED_GITHUB_PATH, "utf8"));
  assert(Array.isArray(payload.repositories), "Generated GitHub payload must include repositories array.");
  assert("activity" in payload, "Generated GitHub payload must include activity key.");
  assert(typeof payload.username === "string" && payload.username.trim().length > 0, "Generated GitHub payload must include username.");
  assert(
    payload.username.toLowerCase() === siteConfig.githubUsername.toLowerCase(),
    "Generated GitHub payload username must match site config."
  );
}

async function verifyBuildOutput() {
  const [siteConfig, pageMetaConfig] = await Promise.all([readSiteConfig(), readPageMetaConfig()]);
  const basePath = getBasePath(siteConfig.baseUrl);
  const [blogEntries, projectEntries] = await Promise.all([
    readMarkdownEntries(BLOG_DIR),
    readMarkdownEntries(PROJECTS_DIR)
  ]);
  const staticPageFiles = Object.values(pageMetaConfig).map((page) =>
    page.path === "/" ? "index.html" : path.join(page.path.replace(/^\//, ""), "index.html")
  );
  const requiredFiles = [
    ...staticPageFiles,
    "404.html",
    "sitemap.xml",
    "robots.txt",
    path.join("blog", "rss.xml")
  ]
    .concat(blogEntries.map((entry) => path.join("blog", entry.slug, "index.html")))
    .concat(projectEntries.map((entry) => path.join("projects", entry.slug, "index.html")));

  await Promise.all(requiredFiles.map((relativePath) => access(path.join(DIST_DIR, relativePath))));

  const htmlFiles = requiredFiles.filter((relativePath) => relativePath.endsWith(".html"));

  for (const relativePath of htmlFiles) {
    const html = await readFile(path.join(DIST_DIR, relativePath), "utf8");

    assert(!html.includes("<meta   <meta"), `Malformed meta tags found in ${relativePath}`);
    assert(!html.includes('content="website" />'), `Broken meta content leaked into body markup in ${relativePath}`);
    assert(!html.includes("https://minaledm.github.io"), `Outdated GitHub Pages URL found in ${relativePath}`);
    assert(html.includes('property="og:title"'), `Missing Open Graph title tag in ${relativePath}`);
    assert(html.includes('name="twitter:title"'), `Missing Twitter title tag in ${relativePath}`);
    assert(
      html.includes(`href="${createSiteUrl(getRoutePathFromHtmlFile(relativePath), siteConfig.baseUrl)}"`),
      `Canonical URL must preserve configured base path in ${relativePath}`
    );

    if (relativePath === "index.html") {
      assert(html.includes(`src="${basePath}assets/`), `Script assets must use configured base path in ${relativePath}`);
      assert(html.includes(`href="${basePath}assets/`), `Style assets must use configured base path in ${relativePath}`);
    }
  }
}

async function main() {
  await verifySiteMetadata();
  await verifyMarkdownEntries();
  await verifyGeneratedGithubPayload();

  if (verifyDist) {
    await verifyBuildOutput();
  }

  console.log(verifyDist ? "Site verification passed (including dist)." : "Content verification passed.");
}

await main();
