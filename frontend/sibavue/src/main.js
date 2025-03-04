// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// Importar estilos globales
import './assets/styles/global.css'

createApp(App)
  .use(router)
  .mount('#app')