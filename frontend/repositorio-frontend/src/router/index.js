import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // A raiz agora joga direto para o login
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
        path: '/upload',
        name: 'upload',
        component: () => import('../views/UploadView.vue'),
        meta: { requiresAuth: true }
    },
    {
      path: '/consulta',
      name: 'consulta',
      component: () => import('../views/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/aprovacao',
      name: 'aprovacao',
      component: () => import('../views/ApproveView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/AdminUserView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// --- GUARD DE NAVEGAÇÃO (SEGURANÇA) ---
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Se a rota exige autenticação e não tem token
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  }
  // Se o usuário JÁ está logado e tenta ir para o login, manda pro dashboard
  else if (to.path === '/login' && auth.token) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
