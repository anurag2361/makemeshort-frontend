/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouter, createWebHistory } from 'vue-router'
import ShortenView from '../components/ShortenView.vue'
import UrlsView from '../components/UrlsView.vue'
import AnalyticsView from '../components/AnalyticsView.vue'
import QrGeneratorView from '@/components/QrGeneratorView.vue'
import LoginView from '@/components/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
import UserManagementView from '@/components/UserManagementView.vue'
import QrCodesView from '@/components/QrCodesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: UrlsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/shorten',
      name: 'shorten',
      component: ShortenView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/urls',
      name: 'urls',
      component: UrlsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/analytics/:code?',
      name: 'analytics',
      component: AnalyticsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/qr-generator',
      name: 'qr-generator',
      component: QrGeneratorView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagementView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/qr-codes',
      name: 'qr-codes',
      component: QrCodesView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.checkAuth()

  // If the route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // If trying to access login page but already authenticated
  if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // For authenticated routes that require specific permissions
  if (isAuthenticated && to.meta.requiresAuth && to.meta.permissions && !authStore.isSuperUser) {
    const requiredPermissions = to.meta.permissions as string[]
    const hasPermission = requiredPermissions.some((permission) =>
      authStore.hasPermission(permission as any),
    )

    if (!hasPermission) {
      // If user lacks permissions, redirect to home
      next({ name: 'home' })
      return
    }
  }

  // For all other cases
  next()
})

export default router
