export type ComparisonResponse = {
  profile_id: number
  profile_name: string
  is_public_profile: boolean
  candidate_source_type: string
  candidate_text_id: number | null
  candidate_text_length: number
  comparison_metrics: Record<string, number>
  burrows_delta: number
  cosine_similarity: number
  authorship_probability: number
  used_features: Record<string, number>
  analysis_meta: Record<string, unknown> | null
  warnings: string[] | null
  analyzed_at: string
}
