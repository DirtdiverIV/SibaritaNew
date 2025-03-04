// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import pb from '@/services/pocketbase.js'
import TVSelectorView from '@/views/TvSelectorView.vue'
import AdminView from '@/views/AdminView.vue'
import LoginForm from '@/components/admin/Auth/LoginForm.vue'

const routes = [
  { path: '/', name: 'home', component: TVSelectorView },
  { path: '/login', name: 'login', component: LoginForm },
  { path: '/admin', name: 'admin', component: AdminView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Aquí definimos el navigation guard
router.beforeEach((to, from, next) => {
  // Si la ruta de destino es 'admin'
  if (to.name === 'admin') {
    // Verificar si existe un usuario logueado
    if (!pb.authStore.isValid) {
      // No está autenticado, redirigimos al login
      return next('/login')
    }
  }
  // Si todo está OK, continuamos con la navegación
  next()
})

export default router
