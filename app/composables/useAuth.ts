import type {
  AccessTokenResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  TokenPair,
  UserRead,
} from '~/types/auth'

type FetchOptions = {
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

const ACCESS_COOKIE = 'sm_access_token'
const REFRESH_COOKIE = 'sm_refresh_token'

const fetchJson = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.public?.apiBase ?? ''

  return await $fetch<T>(url, {
    baseURL,
    method: options.method ?? 'GET',
    body: options.body,
    headers: options.headers,
  })
}

export const useAuth = () => {
  const accessToken = useCookie<string | null>(ACCESS_COOKIE, {
    sameSite: 'lax',
  })
  const refreshToken = useCookie<string | null>(REFRESH_COOKIE, {
    sameSite: 'lax',
  })
  const user = useState<UserRead | null>('auth.user', () => null)
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const setTokens = (pair: TokenPair) => {
    accessToken.value = pair.access_token
    refreshToken.value = pair.refresh_token
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
  }

  const register = async (payload: RegisterRequest) => {
    return await fetchJson<UserRead>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  }

  const login = async (payload: LoginRequest) => {
    const pair = await fetchJson<TokenPair>('/auth/login', {
      method: 'POST',
      body: payload,
    })
    setTokens(pair)
    await fetchMe()
    return pair
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('Missing refresh token')
    }
    const payload: RefreshRequest = { refresh_token: refreshToken.value }
    const response = await fetchJson<AccessTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: payload,
    })
    accessToken.value = response.access_token
    return response
  }

  const fetchMe = async () => {
    if (!accessToken.value) {
      user.value = null
      return null
    }
    const data = await fetchJson<UserRead>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })
    user.value = data
    return data
  }

  const logout = async () => {
    if (refreshToken.value) {
      const payload: RefreshRequest = { refresh_token: refreshToken.value }
      await fetchJson<{ status: string }>('/auth/logout', {
        method: 'POST',
        body: payload,
      }).catch(() => undefined)
    }
    clearTokens()
    user.value = null
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    register,
    login,
    refreshAccessToken,
    fetchMe,
    logout,
    clearTokens,
  }
}
