import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

interface User {
  username: string
  roles: string[]
}

// In the beginning of the file, let's add a helper function to normalize role names
function normalizeRole(role: string): string {
  // Convert roles like "Super User" to "SuperUser" for consistent checking
  return role.replace(/\s+/g, '')
}

type UserRole =
  | 'SuperUser'
  | 'SystemAdmin'
  | 'UrlCreator'
  | 'UrlViewer'
  | 'UrlManager'
  | 'QrCreator'
  | 'QrViewer'
  | 'QrManager'
  | 'AnalyticsViewer'
  | 'AnalyticsManager'
  | 'UserViewer'
  | 'UserManager'

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

    // Role-based access control getters - update these to use normalization
    isSuperUser: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) => normalizeRole(role) === 'SuperUser')
    },

    isSystemAdmin: (state) => {
      const roles = state.user?.roles || []
      return roles.some(
        (role) => normalizeRole(role) === 'SystemAdmin' || normalizeRole(role) === 'SuperUser',
      )
    },

    // URL permissions
    canCreateUrls: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'UrlCreator', 'UrlManager'].includes(normalizeRole(role)),
      )
    },

    canViewUrls: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'UrlViewer', 'UrlCreator', 'UrlManager'].includes(
          normalizeRole(role),
        ),
      )
    },

    canManageUrls: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'UrlManager'].includes(normalizeRole(role)),
      )
    },

    // QR permissions
    canCreateQr: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'QrCreator', 'QrManager'].includes(normalizeRole(role)),
      )
    },

    canViewQr: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'QrViewer', 'QrCreator', 'QrManager'].includes(
          normalizeRole(role),
        ),
      )
    },

    canManageQr: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'QrManager'].includes(normalizeRole(role)),
      )
    },

    // Analytics permissions
    canViewAnalytics: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'AnalyticsViewer', 'AnalyticsManager'].includes(
          normalizeRole(role),
        ),
      )
    },

    canManageAnalytics: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'AnalyticsManager'].includes(normalizeRole(role)),
      )
    },

    // User management permissions
    canViewUsers: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'UserViewer', 'UserManager'].includes(normalizeRole(role)),
      )
    },

    canManageUsers: (state) => {
      const roles = state.user?.roles || []
      return roles.some((role) =>
        ['SuperUser', 'SystemAdmin', 'UserManager'].includes(normalizeRole(role)),
      )
    },
  },
  actions: {
    // Check if user has a specific role
    hasRole(role: string): boolean {
      if (!this.user?.roles) return false
      return this.user.roles.some((userRole) => normalizeRole(userRole) === normalizeRole(role))
    },
    hasAnyRole(roles: UserRole[]): boolean {
      if (!this.user?.roles || this.user.roles.length === 0) return false
      return roles.some((role) =>
        this.user?.roles.some((userRole) => normalizeRole(userRole) === normalizeRole(role)),
      )
    },
    // Check if user has permission based on a specific feature
    hasPermission(
      permission:
        | 'createUrl'
        | 'viewUrl'
        | 'manageUrl'
        | 'createQr'
        | 'viewQr'
        | 'manageQr'
        | 'viewAnalytics'
        | 'manageAnalytics'
        | 'viewUsers'
        | 'manageUsers',
    ): boolean {
      switch (permission) {
        case 'createUrl':
          return this.canCreateUrls
        case 'viewUrl':
          return this.canViewUrls
        case 'manageUrl':
          return this.canManageUrls
        case 'createQr':
          return this.canCreateQr
        case 'viewQr':
          return this.canViewQr
        case 'manageQr':
          return this.canManageQr
        case 'viewAnalytics':
          return this.canViewAnalytics
        case 'manageAnalytics':
          return this.canManageAnalytics
        case 'viewUsers':
          return this.canViewUsers
        case 'manageUsers':
          return this.canManageUsers
        default:
          return false
      }
    },
    // In the login method of your auth store, update it to this:
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

        // Also store user data in localStorage for better persistence
        localStorage.setItem('user', JSON.stringify(this.user))

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
      localStorage.removeItem('user') // Add this line
      api.clearAuthToken()
      router.push('/login')
    },

    checkAuth() {
      if (this.token) {
        api.setAuthToken(this.token)

        // If we have a token but no user data, try to load from localStorage first
        if (!this.user) {
          // Try to get user data from localStorage first
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              this.user = JSON.parse(storedUser)
              return true
            } catch (error) {
              console.error('Error parsing stored user data:', error)
            }
          }

          // If no stored user data, try to parse from token
          try {
            const parts = this.token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]))
              this.user = {
                username: payload.sub, // JWT standard for subject (username)
                roles: payload.roles || [],
              }
              // Also store the parsed user data
              localStorage.setItem('user', JSON.stringify(this.user))
            }
          } catch (error) {
            console.error('Error parsing JWT token:', error)
            // If parsing fails, clear the token
            this.token = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return false
          }
        }

        return !!this.user
      }
      return false
    },
  },
})
