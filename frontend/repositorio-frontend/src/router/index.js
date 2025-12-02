import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'), // Vamos criar já já
      meta: { requiresAuth: true }
    },
    {
        path: '/',
        name: 'home',
        component: () => import('../views/PublicoView.vue') // Área pública
    }
  ]
})

export default router
