export interface ShortenedUrl {
  id?: string
  original_url: string
  short_code: string
  created_at?: number
  expires_at?: number | null
  has_shortened_qr: boolean
  has_original_qr: boolean
  clicks: number
  unique_clicks: number
}

export interface ShortenUrlRequest {
  url: string
  expires_in_days?: number
}

export interface ShortenUrlResponse {
  original_url: string
  short_url: string
  short_code: string
  expires_at?: number | null
}

export interface UrlAnalytics {
  short_code: string
  original_url: string
  created_at?: number
  expires_at?: number | null
  clicks: number
  unique_clicks: number
  has_shortened_qr: boolean
  has_original_qr: boolean
  shortened_qr_generated_at?: number | null
  original_qr_generated_at?: number | null
}

export interface QrCodeRequest {
  url: string
  size?: number
  force_regenerate?: boolean
}

export interface ApiError {
  error: string
  code?: string
  status?: number
}

export type QrTargetType = 'original' | 'shortened'
