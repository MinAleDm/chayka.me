import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: () => import("../pages/HomePage.vue") },
    { path: "/blog", name: "blog", component: () => import("../pages/BlogPage.vue") },
    { path: "/blog/:slug", name: "blog-post", component: () => import("../pages/BlogPostPage.vue") },
    { path: "/projects", name: "projects", component: () => import("../pages/ProjectsPage.vue") },
    { path: "/talks", name: "talks", component: () => import("../pages/TalksPage.vue") },
    { path: "/support", name: "support", component: () => import("../pages/SupportPage.vue") },
    { path: "/contact", name: "contact", component: () => import("../pages/ContactPage.vue") },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../pages/NotFoundPage.vue") }
  ],
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  }
});
