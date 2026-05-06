type AdminApiDetail = string | { msg?: string; loc?: unknown[]; type?: string }[]

export const getAdminApiErrorMessage = (
  error: unknown,
  fallback = 'Не удалось выполнить действие',
) => {
  const detail = (error as { data?: { detail?: AdminApiDetail } })?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? 'Ошибка валидации').join('. ')
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  const statusMessage = (error as { statusMessage?: string })?.statusMessage
  if (statusMessage) {
    return statusMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
