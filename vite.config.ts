import siteConfig from "./src/content/site-config.json";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const getBasePathFromUrl = (baseUrl: string): string => {
  const pathname = new URL(baseUrl).pathname || "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

export default defineConfig({
  plugins: [vue()],
  base: getBasePathFromUrl(siteConfig.baseUrl)
});
