/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { User, CreateUserRequest } from '@/types/api'

interface UserState {
  users: User[]
  isLoading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.getUsers()
        this.users = response.data
        return response.data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch users'
        console.error('Error fetching users:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async createUser(userData: CreateUserRequest) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.createUser(userData)
        // Refresh the user list
        await this.fetchUsers()
        return response.data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to create user'
        console.error('Error creating user:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(userId: string, userData: Partial<CreateUserRequest>) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.updateUser(userId, userData)
        // Refresh the user list
        await this.fetchUsers()
        return response.data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to update user'
        console.error('Error updating user:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteUser(userId: string) {
      this.isLoading = true
      this.error = null

      try {
        await api.deleteUser(userId)
        // Refresh the user list
        await this.fetchUsers()
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to delete user'
        console.error('Error deleting user:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async toggleUserStatus(userId: string, activate: boolean) {
      this.isLoading = true
      this.error = null

      try {
        if (activate) {
          await api.activateUser(userId)
        } else {
          await api.deactivateUser(userId)
        }
        // Refresh the user list
        await this.fetchUsers()
      } catch (err: any) {
        this.error =
          err.response?.data?.error || `Failed to ${activate ? 'activate' : 'deactivate'} user`
        console.error(`Error ${activate ? 'activating' : 'deactivating'} user:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
