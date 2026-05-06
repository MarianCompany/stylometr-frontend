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

const usersList = useAdminInfiniteList(api.listUsers, {
  perPage: 20,
  errorMessage: 'Не удалось загрузить пользователей',
})
const sentinel = ref<HTMLElement | null>(null)

useAdminInfiniteScroll(
  sentinel,
  () => usersList.load(),
  computed(() => usersList.hasMore.value && !usersList.isLoading.value),
)

onMounted(() => {
  void usersList.reset()
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand-1">Администрирование</p>
        <h1 class="mt-2 text-3xl font-semibold text-sm-text-1">Пользователи</h1>
      </div>
      <div class="text-sm text-sm-text-4">
        Всего: {{ usersList.meta.value?.total ?? 0 }}
      </div>
    </header>

    <div class="overflow-hidden rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55">
      <div class="grid grid-cols-[minmax(220px,1.5fr)_120px_140px_170px_120px] gap-4 border-b border-sm-bg-3 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-sm-text-4">
        <span>Пользователь</span>
        <span>Роль</span>
        <span>Статус</span>
        <span>Создан</span>
        <span></span>
      </div>

      <div v-if="usersList.isInitialized.value && usersList.items.value.length === 0" class="px-5 py-10 text-center text-sm text-sm-text-3">
        Пользователи не найдены.
      </div>

      <NuxtLink
        v-for="user in usersList.items.value"
        :key="user.id"
        :to="`/admin/users/${user.id}`"
        class="grid grid-cols-[minmax(220px,1.5fr)_120px_140px_170px_120px] gap-4 border-b border-sm-bg-3/80 px-5 py-4 text-sm transition-colors last:border-b-0 hover:bg-sm-bg-3/45"
      >
        <span class="min-w-0">
          <span class="block truncate font-semibold text-sm-text-1">{{ user.nickname }}</span>
          <span class="block truncate text-xs text-sm-text-4">{{ user.email }}</span>
        </span>
        <span class="self-center text-sm-text-2">{{ user.role ?? '-' }}</span>
        <span class="self-center">
          <AdminStatusBadge :tone="user.is_blocked ? 'danger' : 'success'">
            {{ user.is_blocked ? 'Заблокирован' : 'Активен' }}
          </AdminStatusBadge>
        </span>
        <span class="self-center text-sm-text-3">{{ formatDate(user.created_at) }}</span>
        <span class="self-center justify-self-end text-sm font-semibold text-sm-brand-1">Открыть</span>
      </NuxtLink>
    </div>

    <div ref="sentinel" class="flex min-h-16 items-center justify-center py-4 text-sm text-sm-text-4">
      <span v-if="usersList.isLoading.value">Загрузка...</span>
      <span v-else-if="usersList.isInitialized.value && !usersList.hasMore.value">Все пользователи загружены</span>
    </div>
  </section>
</template>
