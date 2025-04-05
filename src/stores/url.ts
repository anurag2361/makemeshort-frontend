import { defineStore } from 'pinia'
import api from '@/services/api'
import type { ShortenedUrl, ShortenUrlResponse, UrlAnalytics, ApiError } from '@/types/api'

interface UrlState {
  urls: ShortenedUrl[]
  currentUrl: ShortenUrlResponse | null
  analytics: UrlAnalytics | null
  isLoading: boolean
  error: string | null
}

export const useUrlStore = defineStore('url', {
  state: (): UrlState => ({
    urls: [],
    currentUrl: null,
    analytics: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchUrls(search?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.getAllUrls(search)
        this.urls = response.data.filter((url) => url.owned_by_current_user)
        console.log('Fetched URLs:', this.urls)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch URLs'
        console.error('Error fetching URLs:', err)
      } finally {
        this.isLoading = false
      }
    },

    async shortenUrl(url: string, expiresInDays?: number) {
      this.isLoading = true
      this.error = null
      this.currentUrl = null

      try {
        const payload = { url }
        if (expiresInDays) {
          Object.assign(payload, { expires_in_days: expiresInDays })
        }

        const response = await api.shortenUrl(payload)
        this.currentUrl = response.data

        // Refresh the URL list
        this.fetchUrls()

        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to shorten URL'
        console.error('Error shortening URL:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async getAnalytics(code: string) {
      this.isLoading = true
      this.error = null
      this.analytics = null

      try {
        const response = await api.getAnalytics(code)
        this.analytics = response.data
        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch analytics'
        console.error('Error fetching analytics:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    clearCurrentUrl() {
      this.currentUrl = null
    },
  },
})
