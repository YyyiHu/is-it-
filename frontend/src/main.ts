import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { queryClient } from "@/lib/query-client";
import App from "@/App.vue";

// Import global styles
import "@/assets/styles/index.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
