// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// Importar Bulma CSS directamente
import 'bulma/css/bulma.css'

// Importar estilos personalizados
import './assets/styles/main.scss'

import './assets/fonts.css'

createApp(App)
  .use(router)
  .mount('#app')