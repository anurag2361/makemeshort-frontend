import { defineStore } from 'pinia'
import api from '@/services/api'
import type { QrCode } from '@/types/api'

interface QrCodeState {
  qrCodes: QrCode[]
  isLoading: boolean
  error: string | null
}

export const useQrCodeStore = defineStore('qrCode', {
  state: (): QrCodeState => ({
    qrCodes: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchQrCodes(search?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.getAllQrCodes(search)
        this.qrCodes = response.data
        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch QR codes'
        console.error('Error fetching QR codes:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteQrCode(id: string) {
      this.isLoading = true
      this.error = null

      try {
        await api.deleteQrCode(id)
        // Refresh the QR code list
        await this.fetchQrCodes()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to delete QR code'
        console.error('Error deleting QR code:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
