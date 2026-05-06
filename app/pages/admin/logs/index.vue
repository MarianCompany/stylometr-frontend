<script setup lang="ts">
import AdminStatusBadge from '~/components/admin/AdminStatusBadge.vue'
import {useAdminApi} from "~/composables/admin/useAdminApi";
import {useAdminFormat} from "~/composables/admin/useAdminFormat";
import {useAdminInfiniteList} from "~/composables/admin/useAdminInfiniteList";
import {useAdminInfiniteScroll} from "~/composables/admin/useAdminInfiniteScroll";

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()
const { formatDate } = useAdminFormat()
const logsList = useAdminInfiniteList(api.listLogs, {
  perPage: 20,
  errorMessage: 'Не удалось загрузить логи',
})
const sentinel = ref<HTMLElement | null>(null)

useAdminInfiniteScroll(
  sentinel,
  () => logsList.load(),
  computed(() => logsList.hasMore.value && !logsList.isLoading.value),
)

const formatMetadata = (value: Record<string, unknown> | null) => {
  if (!value || Object.keys(value).length === 0) {
    return ''
  }

  return JSON.stringify(value, null, 2)
}

onMounted(() => {
  void logsList.reset()
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand-1">Аудит</p>
        <h1 class="mt-2 text-3xl font-semibold text-sm-text-1">Логи действий</h1>
      </div>
      <div class="text-sm text-sm-text-4">
        Всего: {{ logsList.meta.value?.total ?? 0 }}
      </div>
    </header>

    <div v-if="logsList.isInitialized.value && logsList.items.value.length === 0" class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-10 text-center text-sm text-sm-text-3">
      Логи пока пусты.
    </div>

    <div class="grid grid-cols-1 gap-3">
      <article
        v-for="log in logsList.items.value"
        :key="log.id"
        class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="wrap-break-word text-base font-semibold text-sm-text-1">{{ log.action }}</h2>
              <AdminStatusBadge>ID {{ log.id }}</AdminStatusBadge>
            </div>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sm-text-4">
              <span>Администратор: {{ log.actor_user_id ?? '-' }}</span>
              <span>Цель: {{ log.target_type ?? '-' }} {{ log.target_id ?? '' }}</span>
              <span>{{ formatDate(log.created_at) }}</span>
            </div>
          </div>
        </div>

        <pre
          v-if="formatMetadata(log.metadata)"
          class="mt-4 max-h-64 overflow-auto rounded-lg border border-sm-bg-3 bg-sm-bg-1/55 p-4 text-xs leading-5 text-sm-text-3"
        >{{ formatMetadata(log.metadata) }}</pre>
      </article>
    </div>

    <div ref="sentinel" class="flex min-h-16 items-center justify-center py-4 text-sm text-sm-text-4">
      <span v-if="logsList.isLoading.value">Загрузка...</span>
      <span v-else-if="logsList.isInitialized.value && !logsList.hasMore.value && logsList.items.value.length > 0">Все логи загружены</span>
    </div>
  </section>
</template>
