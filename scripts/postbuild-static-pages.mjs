import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BLOG_DIR,
  DIST_DIR,
  GENERATED_GITHUB_PATH,
  createSummary,
  ensureDir,
  readMarkdownEntries,
  readSiteConfig
} from "./site-utils.mjs";

const BLOG_OUTPUT_DIR = path.join(DIST_DIR, "blog");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ensureMetaTag(head, matcher, tag) {
  if (matcher.test(head)) {
    return head.replace(matcher, tag);
  }

  return `${head}${tag}\n`;
}

function buildMetaTags(meta, siteConfig) {
  const title = meta.title || siteConfig.defaultTitle;
  const description = meta.description || siteConfig.defaultDescription;
  const canonicalUrl = new URL(meta.path || "/", `${siteConfig.baseUrl}/`).toString();
  const imageUrl = new URL("/favicon.svg", `${siteConfig.baseUrl}/`).toString();

  return {
    title,
    description,
    canonicalUrl,
    tags: [
      `<meta name="description" content="${description}">`,
      `<link rel="canonical" href="${canonicalUrl}">`,
      `<meta property="og:type" content="${meta.ogType ?? "website"}">`,
      `<meta property="og:locale" content="${siteConfig.ogLocale}">`,
      `<meta property="og:site_name" content="${siteConfig.siteName}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:url" content="${canonicalUrl}">`,
      `<meta property="og:image" content="${imageUrl}">`,
      `<meta name="twitter:card" content="summary">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`,
      `<meta name="twitter:image" content="${imageUrl}">`
    ]
  };
}

function applyPageMeta(html, meta, siteConfig) {
  const prepared = buildMetaTags(meta, siteConfig);
  const escapedTitle = escapeHtml(prepared.title);
  const escapedDescription = escapeHtml(prepared.description);
  const escapedCanonicalUrl = escapeHtml(prepared.canonicalUrl);
  let next = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`);

  const headMatch = next.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) return next;

  let head = headMatch[1];
  head = ensureMetaTag(head, /<meta name="description"[\s\S]*?>/i, `  <meta name="description" content="${escapedDescription}">`);
  head = ensureMetaTag(head, /<link rel="canonical"[\s\S]*?>/i, `  <link rel="canonical" href="${escapedCanonicalUrl}">`);

  const metaMatchers = [
    [/property="og:type"/i, `<meta property="og:type" content="${escapeHtml(meta.ogType ?? "website")}">`],
    [/property="og:locale"/i, `<meta property="og:locale" content="${escapeHtml(siteConfig.ogLocale)}">`],
    [/property="og:site_name"/i, `<meta property="og:site_name" content="${escapeHtml(siteConfig.siteName)}">`],
    [/property="og:title"/i, `<meta property="og:title" content="${escapedTitle}">`],
    [/property="og:description"/i, `<meta property="og:description" content="${escapedDescription}">`],
    [/property="og:url"/i, `<meta property="og:url" content="${escapedCanonicalUrl}">`],
    [/property="og:image"/i, `<meta property="og:image" content="${escapeHtml(new URL("/favicon.svg", `${siteConfig.baseUrl}/`).toString())}">`],
    [/name="twitter:card"/i, '<meta name="twitter:card" content="summary">'],
    [/name="twitter:title"/i, `<meta name="twitter:title" content="${escapedTitle}">`],
    [/name="twitter:description"/i, `<meta name="twitter:description" content="${escapedDescription}">`],
    [/name="twitter:image"/i, `<meta name="twitter:image" content="${escapeHtml(new URL("/favicon.svg", `${siteConfig.baseUrl}/`).toString())}">`]
  ];

  for (const [matcher, tag] of metaMatchers) {
    head = ensureMetaTag(head, matcher, `  ${tag}`);
  }

  return next.replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`);
}

async function writeRouteHtml(routePath, html) {
  if (!routePath || routePath === "/") {
    await writeFile(path.join(DIST_DIR, "index.html"), html, "utf8");
    return;
  }

  const outputDir = path.join(DIST_DIR, routePath.replace(/^\//, ""));
  await ensureDir(outputDir);
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

function formatRssDate(value) {
  if (!value) return new Date().toUTCString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

async function createBlogPages(indexHtml, siteConfig) {
  const entries = await readMarkdownEntries(BLOG_DIR);

  const posts = entries.map((entry) => {
    const title = String(entry.attributes.title ?? entry.slug);
    const summary = String(entry.attributes.summary ?? createSummary(entry.body));
    const date = typeof entry.attributes.date === "string" ? entry.attributes.date : undefined;

    return {
      slug: entry.slug,
      path: `/blog/${entry.slug}`,
      title: `${title} — Blog — ${siteConfig.displayName}`,
      description: summary,
      ogType: "article",
      date
    };
  });

  for (const post of posts) {
    await writeRouteHtml(post.path, applyPageMeta(indexHtml, post, siteConfig));
  }

  return posts;
}

async function writeSitemap(siteConfig, staticRoutes, blogPosts) {
  const items = [...staticRoutes, ...blogPosts].map((entry) => {
      const url = new URL(entry.path || "/", `${siteConfig.baseUrl}/`).toString();
      const lastmod = entry.date ? `\n    <lastmod>${new Date(entry.date).toISOString()}</lastmod>` : "";
    return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastmod}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
  await writeFile(path.join(DIST_DIR, "sitemap.xml"), xml, "utf8");
}

async function writeRss(siteConfig, blogPosts) {
  await ensureDir(BLOG_OUTPUT_DIR);

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

  await writeFile(path.join(BLOG_OUTPUT_DIR, "rss.xml"), xml, "utf8");
}

async function writeRobots(siteConfig) {
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", `${siteConfig.baseUrl}/`).toString()}\n`;
  await writeFile(path.join(DIST_DIR, "robots.txt"), content, "utf8");
}

async function main() {
  const siteConfig = await readSiteConfig();
  const indexHtmlPath = path.join(DIST_DIR, "index.html");
  const indexHtml = await readFile(indexHtmlPath, "utf8");
  const githubPayload = JSON.parse(await readFile(GENERATED_GITHUB_PATH, "utf8"));
  const homeDescription =
    githubPayload.activity?.projectDescription || siteConfig.defaultDescription;

  const staticRoutes = [
    {
      path: "/",
      title: siteConfig.defaultTitle,
      description: homeDescription
    },
    {
      path: "/projects",
      title: `Projects — ${siteConfig.displayName}`,
      description: "Рабочие и pet-проекты: продуктовые интерфейсы, fullstack-системы и инженерные эксперименты."
    },
    {
      path: "/blog",
      title: `Blog — ${siteConfig.displayName}`,
      description: "Статьи про инженерную практику, архитектуру, DX и процесс разработки."
    },
    {
      path: "/talks",
      title: `Talks — ${siteConfig.displayName}`,
      description: "Раздел с лекциями, выпусками и заметками о публичных выступлениях."
    },
    {
      path: "/support",
      title: `Support — ${siteConfig.displayName}`,
      description: "Как поддержать автора сайта, дать обратную связь или предложить сотрудничество."
    },
    {
      path: "/contact",
      title: `Contact — ${siteConfig.displayName}`,
      description: "Каналы связи для сотрудничества, технических вопросов и продуктовых обсуждений."
    },
    {
      path: "/404",
      title: `Страница не найдена — ${siteConfig.displayName}`,
      description: siteConfig.defaultDescription
    }
  ];

  for (const route of staticRoutes) {
    await writeRouteHtml(route.path, applyPageMeta(indexHtml, route, siteConfig));
  }

  const blogPosts = await createBlogPages(indexHtml, siteConfig);
  await writeSitemap(siteConfig, staticRoutes.filter((route) => route.path !== "/404"), blogPosts);
  await writeRss(siteConfig, blogPosts);
  await writeRobots(siteConfig);
  await copyFile(path.join(DIST_DIR, "404", "index.html"), path.join(DIST_DIR, "404.html"));
}

await main();
