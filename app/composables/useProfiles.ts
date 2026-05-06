import type {
  ProfileCreate,
  ProfileListItem,
  ProfileMetricsRead,
  ProfileRead,
  ProfileTextListItem,
  ProfileTextRead,
  ProfileUpdate,
} from '~/types/profiles'
import type { ComparisonResponse } from '~/types/comparisons'

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
}

const fetchJson = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.public?.apiBase ?? ''
  const { accessToken } = useAuth()

  return await $fetch<T>(url, {
    baseURL,
    method: options.method ?? 'GET',
    body: options.body,
    headers: accessToken.value
      ? {
          Authorization: `Bearer ${accessToken.value}`,
        }
      : undefined,
  })
}

export const useProfiles = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public?.apiBase ?? ''
  const { accessToken } = useAuth()

  const listProfiles = async () => {
    return await fetchJson<ProfileListItem[]>('/profiles')
  }

  const getProfile = async (profileId: number) => {
    return await fetchJson<ProfileRead>(`/profiles/${profileId}`)
  }

  const createProfile = async (payload: ProfileCreate) => {
    return await fetchJson<ProfileRead>('/profiles', {
      method: 'POST',
      body: payload,
    })
  }

  const updateProfile = async (profileId: number, payload: ProfileUpdate) => {
    return await fetchJson<ProfileRead>(`/profiles/${profileId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  const deleteProfile = async (profileId: number) => {
    return await fetchJson<void>(`/profiles/${profileId}`, {
      method: 'DELETE',
    })
  }

  const getProfileMetrics = async (profileId: number) => {
    return await fetchJson<ProfileMetricsRead>(`/profiles/${profileId}/metrics`)
  }

  const listProfileTexts = async (profileId: number) => {
    return await fetchJson<ProfileTextListItem[]>(`/profiles/${profileId}/texts`)
  }

  const getProfileText = async (profileId: number, textId: number) => {
    return await fetchJson<ProfileTextRead>(`/profiles/${profileId}/texts/${textId}`)
  }

  const createProfileText = async (profileId: number, content: string) => {
    return await fetchJson<ProfileTextRead>(`/profiles/${profileId}/texts`, {
      method: 'POST',
      body: { content },
    })
  }

  const deleteProfileText = async (profileId: number, textId: number) => {
    return await fetchJson<void>(`/profiles/${profileId}/texts/${textId}`, {
      method: 'DELETE',
    })
  }

  const compareProfileText = async (profileId: number, text: string) => {
    const form = new FormData()
    form.append('text', text)

    return await $fetch<ComparisonResponse>(`/profiles/${profileId}/compare`, {
      baseURL,
      method: 'POST',
      body: form,
      headers: accessToken.value
        ? {
            Authorization: `Bearer ${accessToken.value}`,
          }
        : undefined,
    })
  }

  return {
    listProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileMetrics,
    listProfileTexts,
    getProfileText,
    createProfileText,
    deleteProfileText,
    compareProfileText,
  }
}
