import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

interface User {
  username: string
  roles: string[]
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    // Add a specific getter for the Super User role
    isSuperUser: (state) => state.user?.roles.includes('Super User') || false,
  },

  actions: {
    // Check if user has a specific role
    hasRole(role: string): boolean {
      return this.user?.roles.includes(role) || false
    },
    async login(username: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.login({ username, password })
        this.token = response.data.token
        this.user = {
          username: response.data.username,
          roles: response.data.roles,
        }

        // Store token in localStorage for persistence
        localStorage.setItem('token', this.token)

        // Set token for all future API requests
        api.setAuthToken(this.token)

        return true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Login failed. Please check your credentials.'
        console.error('Login error:', err)
        return false
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      api.clearAuthToken()
      router.push('/login')
    },

    checkAuth() {
      if (this.token) {
        api.setAuthToken(this.token)
        return true
      }
      return false
    },
  },
})
