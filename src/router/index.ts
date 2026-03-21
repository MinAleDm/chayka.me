import { createRouter, createWebHistory } from "vue-router";
import { PRIMARY_NAV_ITEMS, type NavigationItemName } from "../lib/site";

const routeComponents: Record<NavigationItemName, () => Promise<unknown>> = {
  home: () => import("../pages/HomePage.vue"),
  blog: () => import("../pages/BlogPage.vue"),
  projects: () => import("../pages/ProjectsPage.vue"),
  talks: () => import("../pages/TalksPage.vue"),
  support: () => import("../pages/SupportPage.vue"),
  contact: () => import("../pages/ContactPage.vue")
};

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...PRIMARY_NAV_ITEMS.map((item) => ({
      path: item.path,
      name: item.name,
      component: routeComponents[item.name]
    })),
    { path: "/blog/:slug", name: "blog-post", component: () => import("../pages/BlogPostPage.vue") },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../pages/NotFoundPage.vue") }
  ],
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  }
});
