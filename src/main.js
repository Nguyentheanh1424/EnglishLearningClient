import 'bootstrap/dist/css/bootstrap.min.css'
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')