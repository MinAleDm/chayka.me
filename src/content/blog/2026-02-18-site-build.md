---
title: Как я собрал личный сайт на Vue + Markdown
date: 2026-02-18
tags: [Vue, TypeScript, Markdown, GitHub Pages]
summary: Коротко про структуру проекта, роутинг и хранение контента в markdown-файлах.
---

Cайт собран на **Vite + Vue + TypeScript**.

Основной контент хранится в Markdown:

- `src/content/home.md`
- `src/content/blog/*.md`
- `src/content/projects/*.md`

Для GitHub Pages используется hash-router, чтобы прямые переходы не ломали сайт.
