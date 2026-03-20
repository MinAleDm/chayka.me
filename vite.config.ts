import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import siteConfig from "./src/content/site-config.json";

const basePath = (() => {
  const pathname = new URL(siteConfig.baseUrl).pathname || "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
})();

export default defineConfig({
  plugins: [vue()],
  base: basePath
});
