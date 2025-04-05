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

export interface User {
  id: string
  username: string
  email: string | null
  full_name: string | null

  created_at: number
  updated_at: number
  last_login: number | null
  is_active: boolean
}

export interface CreateUserRequest {
  username: string
  password: string
  email?: string
  full_name?: string
}

export interface QrCode {
  id: string
  short_code: string
  original_url: string
  generated_at: number
  target_type: QrTargetType
  is_direct: boolean
  svg_content: string
}
