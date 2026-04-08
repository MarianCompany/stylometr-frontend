export interface UserRead {
  id: number
  email: string
  nickname: string
  role_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AccessTokenResponse {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  nickname: string
  password: string
}

export interface RefreshRequest {
  refresh_token: string
}
