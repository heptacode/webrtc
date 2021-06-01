import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@iconify/iconify";

createApp(App)
  .use(router)
  .mount("#app");
