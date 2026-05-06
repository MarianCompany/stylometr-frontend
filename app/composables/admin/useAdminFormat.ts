export const useAdminFormat = () => {
  const formatDate = (value: string | null | undefined) => {
    if (!value) {
      return '-'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const statusLabel = (status: string | null | undefined) => {
    if (status === 'pending') {
      return 'На модерации'
    }
    if (status === 'approved') {
      return 'Одобрен'
    }
    if (status === 'revision_required') {
      return 'Нужна доработка'
    }
    return 'Без статуса'
  }

  const statusTone = (status: string | null | undefined) => {
    if (status === 'approved') {
      return 'success' as const
    }
    if (status === 'pending') {
      return 'warning' as const
    }
    if (status === 'revision_required') {
      return 'danger' as const
    }
    return 'neutral' as const
  }

  return {
    formatDate,
    statusLabel,
    statusTone,
  }
}
