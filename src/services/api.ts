import axios, { type AxiosResponse } from 'axios'
import type {
  ShortenedUrl,
  ShortenUrlRequest,
  ShortenUrlResponse,
  UrlAnalytics,
  QrCodeRequest,
  QrTargetType,
} from '@/types/api'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export default {
  shortenUrl(payload: ShortenUrlRequest): Promise<AxiosResponse<ShortenUrlResponse>> {
    return apiClient.post('/shorten', payload)
  },

  getAllUrls(search?: string): Promise<AxiosResponse<ShortenedUrl[]>> {
    const params = search ? { search } : {}
    return apiClient.get('/urls', { params })
  },

  getAnalytics(code: string): Promise<AxiosResponse<UrlAnalytics>> {
    return apiClient.get(`/analytics/${code}`)
  },

  getQrCodeUrl(code: string, type: QrTargetType = 'shortened'): string {
    return `${apiClient.defaults.baseURL}/qr/${code}/info?url_type=${type}`
  },

  regenerateQr(
    code: string,
    type: QrTargetType = 'shortened',
    force: boolean = false,
  ): Promise<AxiosResponse<Blob>> {
    return apiClient.get(`/qr/${code}/regenerate`, {
      params: { url_type: type, force },
      responseType: 'blob',
    })
  },

  generateDirectQr(payload: QrCodeRequest): Promise<AxiosResponse<Blob>> {
    return apiClient.post('/qr', payload, {
      responseType: 'blob',
    })
  },
}
