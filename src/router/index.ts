import { createRouter, createWebHistory } from 'vue-router'
import ShortenView from '../components/ShortenView.vue'
import UrlsView from '../components/UrlsView.vue'
import AnalyticsView from '../components/AnalyticsView.vue'
import QrGeneratorView from '@/components/QrGeneratorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: UrlsView,
    },
    {
      path: '/shorten',
      name: 'shorten',
      component: ShortenView,
    },
    {
      path: '/urls',
      name: 'urls',
      component: UrlsView,
    },
    {
      path: '/analytics/:code?',
      name: 'analytics',
      component: AnalyticsView,
    },
    {
      path: '/qr-generator',
      name: 'qr-generator',
      component: QrGeneratorView,
    },
  ],
})

export default router
