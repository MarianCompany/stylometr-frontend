import type {
  AdminActionLogRead,
  AdminModerationDecisionRequest,
  AdminPaginatedResponse,
  AdminProfileListItem,
  AdminProfileRead,
  AdminProfileTextListItem,
  AdminRoleChangeRequest,
  AdminRoleChangeResponse,
  AdminUserBanRequest,
  AdminUserBanResponse,
  AdminUserListItem,
  AdminUserProfileListItem,
  AdminUserRead,
  AdminUserRole,
  AdminUserTextListItem,
} from '~/types/admin'

type AdminFetchOptions = {
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | null | undefined>
}

const ACCESS_COOKIE = 'sm_access_token'

export const useAdminApi = () => {
  const config = useRuntimeConfig()
  const accessToken = useCookie<string | null>(ACCESS_COOKIE, {
    sameSite: 'lax',
  })

  const adminFetch = async <T>(url: string, options: AdminFetchOptions = {}) => {
    return await $fetch<T>(url, {
      baseURL: config.public?.apiBase ?? '',
      method: options.method ?? 'GET',
      body: options.body,
      query: options.query,
      headers: accessToken.value
        ? {
            Authorization: `Bearer ${accessToken.value}`,
          }
        : undefined,
    })
  }

  const pageQuery = (page: number, perPage: number) => ({
    page,
    per_page: perPage,
  })

  return {
    accessToken,
    listRoles: () => adminFetch<AdminUserRole[]>('/admin/users/roles'),
    listUsers: (page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminUserListItem>>('/admin/users', {
        query: pageQuery(page, perPage),
      }),
    getUser: (userId: number) => adminFetch<AdminUserRead>(`/admin/users/${userId}`),
    banUser: (userId: number, body: AdminUserBanRequest) =>
      adminFetch<AdminUserBanResponse>(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body,
      }),
    changeUserRole: (userId: number, body: AdminRoleChangeRequest) =>
      adminFetch<AdminRoleChangeResponse>(`/admin/users/${userId}/role-change`, {
        method: 'POST',
        body,
      }),
    listUserProfiles: (userId: number, page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminUserProfileListItem>>(
        `/admin/users/${userId}/profiles`,
        {
          query: pageQuery(page, perPage),
        },
      ),
    listUserTexts: (userId: number, page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminUserTextListItem>>(
        `/admin/users/${userId}/texts`,
        {
          query: pageQuery(page, perPage),
        },
      ),
    listPendingProfiles: (page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminProfileListItem>>(
        '/admin/moderation/profiles/pending',
        {
          query: pageQuery(page, perPage),
        },
      ),
    approveProfile: (profileId: number, body: AdminModerationDecisionRequest) =>
      adminFetch<AdminProfileRead>(`/admin/moderation/profiles/${profileId}/approve`, {
        method: 'POST',
        body,
      }),
    blockProfile: (profileId: number, body: AdminModerationDecisionRequest) =>
      adminFetch<AdminProfileRead>(`/admin/moderation/profiles/${profileId}/block`, {
        method: 'POST',
        body,
      }),
    listProfiles: (page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminProfileListItem>>('/admin/profiles/', {
        query: pageQuery(page, perPage),
      }),
    getProfile: (profileId: number) =>
      adminFetch<AdminProfileRead>(`/admin/profiles/${profileId}`),
    listProfileTexts: (profileId: number, page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminProfileTextListItem>>(
        `/admin/profiles/${profileId}/texts`,
        {
          query: pageQuery(page, perPage),
        },
      ),
    listLogs: (page: number, perPage: number) =>
      adminFetch<AdminPaginatedResponse<AdminActionLogRead>>('/admin/logs', {
        query: pageQuery(page, perPage),
      }),
  }
}
