type ApiDetail = string | { msg?: string }[]

export const extractApiError = (error: unknown, fallback = 'Не удалось выполнить действие') => {
  const detail = (error as { data?: { detail?: ApiDetail } })?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? 'Ошибка валидации').join('. ')
  }
  if (typeof detail === 'string') {
    return detail
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
