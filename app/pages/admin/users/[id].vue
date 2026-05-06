<script setup lang="ts">
import { toast } from 'vue-sonner'
import AdminButton from '~/components/admin/AdminButton.vue'
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import AdminSelect from '~/components/admin/AdminSelect.vue'
import AdminStatusBadge from '~/components/admin/AdminStatusBadge.vue'
import type { AdminUserRead, AdminUserRole } from '~/types/admin'
import {useAdminFormat} from "~/composables/admin/useAdminFormat";
import {useAdminApi} from "~/composables/admin/useAdminApi";
import {useAdminInfiniteList} from "~/composables/admin/useAdminInfiniteList";
import {useAdminInfiniteScroll} from "~/composables/admin/useAdminInfiniteScroll";
import {getAdminApiErrorMessage} from "~/composables/admin/useAdminError";

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const userId = computed(() => Number(route.params.id))
const api = useAdminApi()
const { formatDate, statusLabel, statusTone } = useAdminFormat()

const user = ref<AdminUserRead | null>(null)
const roles = ref<AdminUserRole[]>([])
const selectedRoleId = ref<number | null>(null)
const roleModalOpen = ref(false)
const banModalOpen = ref(false)
const isLoading = ref(true)
const isActionPending = ref(false)
const roleReason = ref('')
const banReason = ref('')

const profileList = useAdminInfiniteList(
  (page, perPage) => api.listUserProfiles(userId.value, page, perPage),
  {
    perPage: 20,
    errorMessage: 'Не удалось загрузить профили пользователя',
  },
)
const textList = useAdminInfiniteList(
  (page, perPage) => api.listUserTexts(userId.value, page, perPage),
  {
    perPage: 20,
    errorMessage: 'Не удалось загрузить тексты пользователя',
  },
)

const profileSentinel = ref<HTMLElement | null>(null)
const textSentinel = ref<HTMLElement | null>(null)

useAdminInfiniteScroll(
  profileSentinel,
  () => profileList.load(),
  computed(() => profileList.hasMore.value && !profileList.isLoading.value),
)
useAdminInfiniteScroll(
  textSentinel,
  () => textList.load(),
  computed(() => textList.hasMore.value && !textList.isLoading.value),
)

const roleOptions = computed(() => roles.value.map((role) => ({ value: role.id, label: role.name })))

const loadUser = async () => {
  isLoading.value = true
  try {
    const [userResponse, rolesResponse] = await Promise.all([
      api.getUser(userId.value),
      api.listRoles(),
    ])
    user.value = userResponse
    roles.value = rolesResponse
    selectedRoleId.value = userResponse.role_id
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось загрузить пользователя'))
  } finally {
    isLoading.value = false
  }
}

const openRoleConfirm = () => {
  if (selectedRoleId.value === user.value?.role_id) {
    toast('Выберите новую роль')
    return
  }
  if (selectedRoleId.value === null) {
    toast.error('Выберите роль из списка')
    return
  }
  roleModalOpen.value = true
}

const confirmRoleChange = async () => {
  if (!user.value) {
    return
  }
  isActionPending.value = true
  try {
    await api.changeUserRole(user.value.id, {
      role_id: selectedRoleId.value,
      role_name: null,
      reason: roleReason.value.trim() || null,
    })
    toast.success('Роль пользователя изменена')
    roleModalOpen.value = false
    roleReason.value = ''
    await loadUser()
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось изменить роль'))
  } finally {
    isActionPending.value = false
  }
}

const confirmBan = async () => {
  if (!user.value) {
    return
  }
  isActionPending.value = true
  try {
    const response = await api.banUser(user.value.id, {
      reason: banReason.value.trim() || null,
    })
    user.value = response.user
    selectedRoleId.value = response.user.role_id
    toast.success('Пользователь заблокирован')
    banModalOpen.value = false
    banReason.value = ''
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось заблокировать пользователя'))
  } finally {
    isActionPending.value = false
  }
}

onMounted(async () => {
  await loadUser()
  await Promise.all([profileList.reset(), textList.reset()])
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <NuxtLink to="/admin/users" class="text-sm font-semibold text-sm-brand-1">← К пользователям</NuxtLink>

    <div v-if="isLoading" class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-8 text-sm text-sm-text-3">
      Загрузка пользователя...
    </div>

    <template v-else-if="user">
      <header class="grid grid-cols-[1fr_auto] gap-6 rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-6">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="truncate text-3xl font-semibold text-sm-text-1">{{ user.nickname }}</h1>
            <AdminStatusBadge :tone="user.is_blocked ? 'danger' : 'success'">
              {{ user.is_blocked ? 'Заблокирован' : 'Активен' }}
            </AdminStatusBadge>
          </div>
          <p class="mt-2 text-sm text-sm-text-3">{{ user.email }}</p>
          <dl class="mt-6 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
            <div>
              <dt class="text-xs uppercase tracking-wide text-sm-text-4">ID</dt>
              <dd class="mt-1 font-semibold text-sm-text-1">{{ user.id }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-sm-text-4">Роль</dt>
              <dd class="mt-1 font-semibold text-sm-text-1">{{ user.role ?? '-' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-sm-text-4">Профилей</dt>
              <dd class="mt-1 font-semibold text-sm-text-1">{{ user.profiles_count }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-sm-text-4">Текстов</dt>
              <dd class="mt-1 font-semibold text-sm-text-1">{{ user.texts_count }}</dd>
            </div>
          </dl>
        </div>

        <div class="flex w-72 flex-col gap-3">
          <AdminSelect v-model="selectedRoleId" label="Роль пользователя" :options="roleOptions" />
          <AdminButton variant="primary" :disabled="isActionPending" @click="openRoleConfirm">
            Сменить роль
          </AdminButton>
          <AdminButton
            variant="danger"
            :disabled="isActionPending || user.is_blocked"
            @click="banModalOpen = true"
          >
            Заблокировать
          </AdminButton>
        </div>
      </header>

      <div class="grid grid-cols-2 gap-6 text-sm">
        <div class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5">
          <div class="text-xs uppercase tracking-wide text-sm-text-4">Создан</div>
          <div class="mt-1 font-semibold text-sm-text-1">{{ formatDate(user.created_at) }}</div>
        </div>
        <div class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5">
          <div class="text-xs uppercase tracking-wide text-sm-text-4">Обновлен</div>
          <div class="mt-1 font-semibold text-sm-text-1">{{ formatDate(user.updated_at) }}</div>
        </div>
      </div>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-sm-text-1">Профили пользователя</h2>
        <div class="grid grid-cols-1 gap-3">
          <NuxtLink
            v-for="profile in profileList.items.value"
            :key="profile.id"
            :to="`/admin/moderation/profiles/${profile.id}`"
            class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5 transition-colors hover:bg-sm-bg-3/45"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="font-semibold text-sm-text-1">{{ profile.name }}</div>
                <div class="mt-1 text-xs text-sm-text-4">ID {{ profile.id }} · обновлен {{ formatDate(profile.updated_at) }}</div>
              </div>
              <AdminStatusBadge :tone="statusTone(profile.moderation_status)">
                {{ statusLabel(profile.moderation_status) }}
              </AdminStatusBadge>
            </div>
            <p v-if="profile.moderation_comment" class="mt-3 text-sm text-sm-text-3">
              {{ profile.moderation_comment }}
            </p>
          </NuxtLink>
        </div>
        <div ref="profileSentinel" class="flex min-h-12 items-center justify-center text-sm text-sm-text-4">
          <span v-if="profileList.isLoading.value">Загрузка...</span>
          <span v-else-if="profileList.isInitialized.value && profileList.items.value.length === 0">Профилей нет</span>
          <span v-else-if="profileList.isInitialized.value && !profileList.hasMore.value">Все профили загружены</span>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-sm-text-1">Тексты пользователя</h2>
        <div class="grid grid-cols-1 gap-3">
          <article
            v-for="text in textList.items.value"
            :key="text.id"
            class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5"
          >
            <div class="flex flex-wrap justify-between gap-3 text-xs text-sm-text-4">
              <span>ID {{ text.id }} · {{ text.char_count }} симв.</span>
              <span>{{ formatDate(text.created_at) }}</span>
            </div>
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-sm-text-2">{{ text.short_content }}</p>
          </article>
        </div>
        <div ref="textSentinel" class="flex min-h-12 items-center justify-center text-sm text-sm-text-4">
          <span v-if="textList.isLoading.value">Загрузка...</span>
          <span v-else-if="textList.isInitialized.value && textList.items.value.length === 0">Текстов нет</span>
          <span v-else-if="textList.isInitialized.value && !textList.hasMore.value">Все тексты загружены</span>
        </div>
      </section>

      <AdminConfirmModal
        v-model="roleModalOpen"
        title="Сменить роль пользователя?"
        description="После подтверждения новая роль будет отправлена в админское API."
        confirm-text="Сменить роль"
        :pending="isActionPending"
        @confirm="confirmRoleChange"
      >
        <label class="flex flex-col gap-2 text-sm font-medium text-sm-text-2">
          Причина
          <textarea
            v-model="roleReason"
            maxlength="500"
            rows="3"
            class="resize-none rounded-lg border border-sm-bg-3 bg-sm-bg-2 px-3 py-2 text-sm text-sm-text-1 outline-none focus:border-sm-brand-1 focus:ring-2 focus:ring-sm-brand-1/25"
            placeholder="Необязательно"
          />
        </label>
      </AdminConfirmModal>

      <AdminConfirmModal
        v-model="banModalOpen"
        title="Заблокировать пользователя?"
        description="Пользователь будет деактивирован. Это критическое действие требует подтверждения."
        confirm-text="Заблокировать"
        :danger="true"
        :pending="isActionPending"
        @confirm="confirmBan"
      >
        <label class="flex flex-col gap-2 text-sm font-medium text-sm-text-2">
          Причина блокировки
          <textarea
            v-model="banReason"
            maxlength="500"
            rows="3"
            class="resize-none rounded-lg border border-sm-bg-3 bg-sm-bg-2 px-3 py-2 text-sm text-sm-text-1 outline-none focus:border-sm-brand-1 focus:ring-2 focus:ring-sm-brand-1/25"
            placeholder="Необязательно"
          />
        </label>
      </AdminConfirmModal>
    </template>

    <div v-else class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-8 text-sm text-sm-text-3">
      Пользователь не найден.
    </div>
  </section>
</template>
