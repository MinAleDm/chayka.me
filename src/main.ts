import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { applyRandomPalette } from "./lib/theme";
import "./styles.css";

applyRandomPalette();

createApp(App).use(router).mount("#app");
