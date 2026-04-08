export type ProfileCreate = {
  name: string
}

export type ProfileUpdate = {
  name?: string | null
}

export type ProfileRead = {
  id: number
  name: string
  user_id: number
  is_public: boolean
  moderated_by: number | null
  moderation_status: string | null
  moderation_comment: string | null
  moderated_at: string | null
  created_at: string
  updated_at: string
}

export type ProfileListItem = {
  id: number
  name: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type ProfileMetricsRead = {
  profile_id: number
  profile_name: string
  metrics_version: number
  core_metrics: Record<string, unknown> | null
  additional_metrics: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type ProfileTextListItem = {
  id: number
  char_count: number
  short_content: string
  created_at: string
  updated_at: string
}

export type ProfileTextRead = {
  id: number
  content: string
  file_id: number | null
  char_count: number
  user_id: number
  created_at: string
  updated_at: string
}
