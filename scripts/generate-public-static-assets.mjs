import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BLOG_DIR,
  ROOT_DIR,
  createSummary,
  ensureDir,
  readMarkdownEntries,
  readSiteConfig
} from "./site-utils.mjs";

const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatRssDate(value) {
  if (!value) return new Date().toUTCString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

async function getBlogPosts(siteConfig) {
  const entries = await readMarkdownEntries(BLOG_DIR);

  return entries.map((entry) => {
    const title = String(entry.attributes.title ?? entry.slug);
    const summary = String(entry.attributes.summary ?? createSummary(entry.body));
    const date = typeof entry.attributes.date === "string" ? entry.attributes.date : undefined;

    return {
      slug: entry.slug,
      path: `/blog/${entry.slug}`,
      title: `${title} — Blog — ${siteConfig.displayName}`,
      description: summary,
      date
    };
  });
}

async function writeRss(siteConfig, blogPosts) {
  const outputDir = path.join(PUBLIC_DIR, "blog");
  await ensureDir(outputDir);

  const items = blogPosts
    .map((post) => {
      const url = new URL(post.path, `${siteConfig.baseUrl}/`).toString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${formatRssDate(post.date)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(`${siteConfig.displayName} — Blog`)}</title>\n    <link>${escapeXml(new URL("/blog", `${siteConfig.baseUrl}/`).toString())}</link>\n    <description>${escapeXml(siteConfig.defaultDescription)}</description>\n${items}\n  </channel>\n</rss>\n`;

  await writeFile(path.join(outputDir, "rss.xml"), xml, "utf8");
}

async function writeRobots(siteConfig) {
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", `${siteConfig.baseUrl}/`).toString()}\n`;
  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), content, "utf8");
}

async function writeSitemap(siteConfig, blogPosts) {
  const staticRoutes = ["/", "/projects", "/blog", "/talks", "/support", "/contact"];
  const items = [
    ...staticRoutes.map((routePath) => ({ path: routePath })),
    ...blogPosts
  ].map((entry) => {
    const url = new URL(entry.path || "/", `${siteConfig.baseUrl}/`).toString();
    const lastmod = entry.date ? `\n    <lastmod>${new Date(entry.date).toISOString()}</lastmod>` : "";
    return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastmod}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), xml, "utf8");
}

async function main() {
  const siteConfig = await readSiteConfig();
  const blogPosts = await getBlogPosts(siteConfig);

  await writeRss(siteConfig, blogPosts);
  await writeRobots(siteConfig);
  await writeSitemap(siteConfig, blogPosts);

  console.log("Generated public static assets for dev server.");
}

await main();
