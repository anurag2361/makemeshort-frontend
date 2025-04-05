/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'
import type { User } from '@/types/api'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    // Simple permission getters - all return true for authenticated users
    canCreateUrls: (state) => !!state.token,
    canViewUrls: (state) => !!state.token,
    canManageUrls: (state) => !!state.token,
    canCreateQr: (state) => !!state.token,
    canViewQr: (state) => !!state.token,
    canManageQr: (state) => !!state.token,
    canViewAnalytics: (state) => !!state.token,
    canManageAnalytics: (state) => !!state.token,
    canViewUsers: (state) => !!state.token,
    canManageUsers: (state) => !!state.token,
  },

  actions: {
    // Simple permission check that returns true if authenticated
    hasPermission(): boolean {
      return this.isAuthenticated
    },

    async login(username: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.login({ username, password })
        // Update to use the new response format
        this.token = response.data.token
        this.user = response.data.user

        // Store token in localStorage for persistence
        localStorage.setItem('token', this.token as string)

        // Also store user data in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))

        // Set token for all future API requests
        api.setAuthToken(this.token as string)

        return true
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
      localStorage.removeItem('user')
      api.clearAuthToken()
      router.push('/login')
    },

    checkAuth() {
      if (this.token) {
        api.setAuthToken(this.token)

        // If we have a token but no user data, try to load from localStorage
        if (!this.user) {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              this.user = JSON.parse(storedUser)
              return true
            } catch (error) {
              console.error('Error parsing stored user data:', error)
              // If parsing fails, clear the token
              this.token = null
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              return false
            }
          } else {
            // If no stored user data, token might be invalid
            console.error('Token exists but no user data found')
            this.token = null
            localStorage.removeItem('token')
            return false
          }
        }

        return !!this.user
      }
      return false
    },

    async signup(username: string, password: string, email?: string, fullName?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.signup({
          username,
          password,
          email,
          full_name: fullName,
        })

        // Handle successful signup the same way as login
        this.token = response.data.token
        this.user = response.data.user

        // Store token in localStorage for persistence
        localStorage.setItem('token', this.token as string)

        // Also store user data in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))

        // Set token for all future API requests
        api.setAuthToken(this.token as string)

        return true
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Signup failed. Please try again.'
        console.error('Signup error:', err)
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})
