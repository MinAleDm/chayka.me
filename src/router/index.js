import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import BlogPage from "../pages/BlogPage.vue";
import ProjectsPage from "../pages/ProjectsPage.vue";
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", name: "home", component: HomePage },
        { path: "/blog", name: "blog", component: BlogPage },
        { path: "/projects", name: "projects", component: ProjectsPage }
    ],
    scrollBehavior() {
        return { top: 0, behavior: "smooth" };
    }
});
