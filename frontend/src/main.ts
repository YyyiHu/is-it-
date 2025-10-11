import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";

// Import global styles
import "@/assets/styles/index.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
