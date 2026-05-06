import { toast } from 'vue-sonner'
import type { AdminPaginatedResponse, AdminPaginationMeta } from '~/types/admin'

type Loader<T> = (page: number, perPage: number) => Promise<AdminPaginatedResponse<T>>

export const useAdminInfiniteList = <T>(
  loader: Loader<T>,
  options: { perPage?: number; errorMessage?: string } = {},
) => {
  const items = ref<T[]>([])
  const meta = ref<AdminPaginationMeta | null>(null)
  const page = ref(1)
  const perPage = options.perPage ?? 20
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const hasMore = computed(() => !meta.value || meta.value.current_page < meta.value.last_page)

  const load = async (reset = false) => {
    if (isLoading.value) {
      return
    }

    if (!reset && meta.value && !hasMore.value) {
      return
    }

    isLoading.value = true
    try {
      const nextPage = reset ? 1 : page.value
      const response = await loader(nextPage, perPage)
      items.value = reset ? response.data : [...items.value, ...response.data]
      meta.value = response.meta
      page.value = response.meta.current_page + 1
      isInitialized.value = true
    } catch (error) {
      toast.error(getAdminApiErrorMessage(error, options.errorMessage ?? 'Не удалось загрузить данные'))
    } finally {
      isLoading.value = false
    }
  }

  const reset = async () => {
    items.value = []
    meta.value = null
    page.value = 1
    isInitialized.value = false
    await load(true)
  }

  return {
    items,
    meta,
    isLoading,
    isInitialized,
    hasMore,
    load,
    reset,
  }
}
