import { createRouter, createWebHistory } from 'vue-router'
import ShortenView from '../components/ShortenView.vue'
import UrlsView from '../components/UrlsView.vue'
import AnalyticsView from '../components/AnalyticsView.vue'
import QrGeneratorView from '@/components/QrGeneratorView.vue'
import LoginView from '@/components/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: UrlsView,
      meta: { requiresAuth: true, superUserOnly: false },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true, superUserOnly: false },
    },
    {
      path: '/shorten',
      name: 'shorten',
      component: ShortenView,
      meta: { requiresAuth: true, superUserOnly: false },
    },
    {
      path: '/urls',
      name: 'urls',
      component: UrlsView,
      meta: { requiresAuth: true, superUserOnly: false },
    },
    {
      path: '/analytics/:code?',
      name: 'analytics',
      component: AnalyticsView,
      meta: { requiresAuth: true, superUserOnly: true },
    },
    {
      path: '/qr-generator',
      name: 'qr-generator',
      component: QrGeneratorView,
      meta: { requiresAuth: true, superUserOnly: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.checkAuth()
  const isSuperUser = authStore.isSuperUser

  // Check if route requires Super User role
  if (to.matched.some((record) => record.meta.superUserOnly)) {
    if (!isAuthenticated) {
      next({ name: 'login' })
    } else if (!isSuperUser) {
      // Redirect to home if user doesn't have Super User role
      next({ name: 'home' })
    } else {
      next()
    }
  }
  // Check if route requires authentication
  else if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  }
  // Check if route is for guests only (like login)
  else if (to.matched.some((record) => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
