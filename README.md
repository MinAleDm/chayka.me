[![Deploy to GitHub Pages](https://github.com/MinAleDm/chayka.me/actions/workflows/pages.yml/badge.svg)](https://github.com/MinAleDm/chayka.me/actions/workflows/pages.yml)

**[chayka.me](https://chayka.me/)**

Личный сайт-портфолио на Vue 3 и Vite. Здесь собраны проекты, блог, контакты и build-time синхронизация данных из GitHub.

## Stack

- Vue 3 + Vue Router
- Vite + TypeScript
- Markdown-контент в `src/content`
- GitHub Pages deployment

## Commands

- `npm run dev` — локальная разработка
- `npm run content:sync` — синхронизация GitHub-данных в `src/content/generated/github-data.json`
- `npm run typecheck` — проверка TypeScript
- `npm run build` — синхронизация контента, сборка и postbuild генерация статических route pages
- `npm run check` — контентные проверки, сборка и проверка итогового `dist`

## Content

- `src/content/home.md` — главная страница
- `src/content/projects/*.md` — карточки проектов
- `src/content/blog/*.md` — посты блога
- `src/content/generated/github-data.json` — build-time слепок GitHub-данных

## Build notes

- Сайт использует `createWebHistory`, а после сборки создаёт HTML-файлы для известных маршрутов и постов блога.
- Дополнительно генерируются `sitemap.xml`, `robots.txt`, `blog/rss.xml` и `404.html`.
- Если GitHub API недоступен во время сборки, проект использует последний сохранённый `github-data.json` и не роняет билд.

<samp>code is licensed under <a href='./LICENSE'>MIT</a>,<br> words and images are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></samp>.
