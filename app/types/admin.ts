export interface AdminPaginationMeta {
  current_page: number
  per_page: number
  last_page: number
  total: number
}

export interface AdminPaginatedResponse<T> {
  data: T[]
  meta: AdminPaginationMeta
}

export interface AdminUserRole {
  id: number
  name: string
}

export interface AdminUserListItem {
  id: number
  email: string
  nickname: string
  role_id: number | null
  role: string | null
  is_active: boolean
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface AdminUserRead extends AdminUserListItem {
  profiles_count: number
  texts_count: number
  internal_notes: string | null
}

export interface AdminUserBanRequest {
  reason: string | null
}

export interface AdminUserBanResponse {
  user: AdminUserRead
  reason: string | null
}

export interface AdminRoleChangeRequest {
  role_id: number | null
  role_name: string | null
  reason: string | null
}

export interface AdminRoleChangeResponse {
  user_id: number
  role_id: number
}

export interface AdminUserProfileListItem {
  id: number
  name: string
  user_id: number
  is_public: boolean
  moderation_status: string | null
  moderation_comment: string | null
  moderated_by: number | null
  moderated_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminUserTextListItem {
  id: number
  user_id: number
  file_id: number | null
  char_count: number
  short_content: string
  created_at: string
  updated_at: string
}

export interface AdminProfileListItem {
  id: number
  name: string
  user_id: number
  user_email: string | null
  is_public: boolean
  moderation_status: string | null
  moderation_comment: string | null
  moderated_by: number | null
  moderated_at: string | null
  texts_count: number
  created_at: string
  updated_at: string
}

export interface AdminProfileRead extends AdminProfileListItem {
  internal_notes: string | null
}

export interface AdminProfileTextListItem {
  id: number
  user_id: number
  file_id: number | null
  char_count: number
  short_content: string
  created_at: string
  updated_at: string
}

export interface AdminModerationDecisionRequest {
  comment: string | null
}

export interface AdminActionLogRead {
  id: number
  actor_user_id: number | null
  action: string
  target_type: string | null
  target_id: number | null
  metadata: Record<string, unknown> | null
  created_at: string
  [key: string]: unknown
}
