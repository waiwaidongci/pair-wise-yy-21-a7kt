import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./styles.css";

// 注意：先装 Pinia 再装路由，路由守卫中会直接使用 auth store
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
