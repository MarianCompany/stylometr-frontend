<script setup lang="ts">
import { toast } from 'vue-sonner'
import AdminButton from '~/components/admin/AdminButton.vue'
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import AdminStatusBadge from '~/components/admin/AdminStatusBadge.vue'
import type { AdminProfileRead } from '~/types/admin'
import {getAdminApiErrorMessage} from "~/composables/admin/useAdminError";
import {useAdminApi} from "~/composables/admin/useAdminApi";
import {useAdminFormat} from "~/composables/admin/useAdminFormat";
import {useAdminInfiniteList} from "~/composables/admin/useAdminInfiniteList";
import {useAdminInfiniteScroll} from "~/composables/admin/useAdminInfiniteScroll";

definePageMeta({
  layout: 'admin',
})

type ModerationAction = 'approve' | 'block'

const route = useRoute()
const profileId = computed(() => Number(route.params.id))
const api = useAdminApi()
const { formatDate, statusLabel, statusTone } = useAdminFormat()

const profile = ref<AdminProfileRead | null>(null)
const isLoading = ref(true)
const isActionPending = ref(false)
const modalOpen = ref(false)
const action = ref<ModerationAction>('approve')
const decisionComment = ref('')
const textsList = useAdminInfiniteList(
  (page, perPage) => api.listProfileTexts(profileId.value, page, perPage),
  {
    perPage: 20,
    errorMessage: 'Не удалось загрузить тексты профиля',
  },
)
const sentinel = ref<HTMLElement | null>(null)

useAdminInfiniteScroll(
  sentinel,
  () => textsList.load(),
  computed(() => textsList.hasMore.value && !textsList.isLoading.value),
)

const loadProfile = async () => {
  isLoading.value = true
  try {
    profile.value = await api.getProfile(profileId.value)
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось загрузить профиль'))
  } finally {
    isLoading.value = false
  }
}

const openDecision = (nextAction: ModerationAction) => {
  action.value = nextAction
  decisionComment.value = profile.value?.moderation_comment ?? ''
  modalOpen.value = true
}

const confirmDecision = async () => {
  if (!profile.value) {
    return
  }

  isActionPending.value = true
  try {
    const payload = { comment: decisionComment.value.trim() || null }
    profile.value =
      action.value === 'approve'
        ? await api.approveProfile(profile.value.id, payload)
        : await api.blockProfile(profile.value.id, payload)
    toast.success(action.value === 'approve' ? 'Профиль одобрен' : 'Профиль отправлен на доработку')
    modalOpen.value = false
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось выполнить модерационное действие'))
  } finally {
    isActionPending.value = false
  }
}

onMounted(async () => {
  await loadProfile()
  await textsList.reset()
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <NuxtLink to="/admin/moderation" class="text-sm font-semibold text-sm-brand-1">← К модерации</NuxtLink>

    <div v-if="isLoading" class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-8 text-sm text-sm-text-3">
      Загрузка профиля...
    </div>

    <template v-else-if="profile">
      <header class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-6">
        <div class="flex flex-wrap items-start justify-between gap-5">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="truncate text-3xl font-semibold text-sm-text-1">{{ profile.name }}</h1>
              <AdminStatusBadge :tone="statusTone(profile.moderation_status)">
                {{ statusLabel(profile.moderation_status) }}
              </AdminStatusBadge>
              <AdminStatusBadge :tone="profile.is_public ? 'success' : 'neutral'">
                {{ profile.is_public ? 'Публичный' : 'Скрыт' }}
              </AdminStatusBadge>
            </div>
            <p class="mt-2 text-sm text-sm-text-3">
              {{ profile.user_email ?? `Пользователь #${profile.user_id}` }} · {{ profile.texts_count }} текстов
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <AdminButton variant="primary" @click="openDecision('approve')">Одобрить</AdminButton>
            <AdminButton variant="danger" @click="openDecision('block')">На доработку</AdminButton>
          </div>
        </div>

        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
          <div>
            <dt class="text-xs uppercase tracking-wide text-sm-text-4">ID</dt>
            <dd class="mt-1 font-semibold text-sm-text-1">{{ profile.id }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-sm-text-4">Создан</dt>
            <dd class="mt-1 font-semibold text-sm-text-1">{{ formatDate(profile.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-sm-text-4">Модератор</dt>
            <dd class="mt-1 font-semibold text-sm-text-1">{{ profile.moderated_by ?? '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-sm-text-4">Модерирован</dt>
            <dd class="mt-1 font-semibold text-sm-text-1">{{ formatDate(profile.moderated_at) }}</dd>
          </div>
        </dl>

        <p v-if="profile.moderation_comment" class="mt-5 rounded-lg border border-sm-bg-3 bg-sm-bg-1/45 p-4 text-sm leading-6 text-sm-text-2">
          {{ profile.moderation_comment }}
        </p>
      </header>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-sm-text-1">Тексты профиля</h2>
        <div class="grid grid-cols-1 gap-3">
          <article
            v-for="text in textsList.items.value"
            :key="text.id"
            class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5"
          >
            <div class="flex flex-wrap justify-between gap-3 text-xs text-sm-text-4">
              <span>ID {{ text.id }} · пользователь #{{ text.user_id }} · {{ text.char_count }} симв.</span>
              <span>{{ formatDate(text.created_at) }}</span>
            </div>
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-sm-text-2">{{ text.short_content }}</p>
          </article>
        </div>
        <div ref="sentinel" class="flex min-h-12 items-center justify-center text-sm text-sm-text-4">
          <span v-if="textsList.isLoading.value">Загрузка...</span>
          <span v-else-if="textsList.isInitialized.value && textsList.items.value.length === 0">Текстов нет</span>
          <span v-else-if="textsList.isInitialized.value && !textsList.hasMore.value">Все тексты загружены</span>
        </div>
      </section>

      <AdminConfirmModal
        v-model="modalOpen"
        :title="action === 'approve' ? 'Одобрить профиль?' : 'Отправить профиль на доработку?'"
        :description="action === 'approve' ? 'Профиль станет публичным.' : 'Профиль будет скрыт из публичного доступа.'"
        :confirm-text="action === 'approve' ? 'Одобрить' : 'На доработку'"
        :danger="action === 'block'"
        :pending="isActionPending"
        @confirm="confirmDecision"
      >
        <label class="flex flex-col gap-2 text-sm font-medium text-sm-text-2">
          Комментарий
          <textarea
            v-model="decisionComment"
            maxlength="500"
            rows="4"
            class="resize-none rounded-lg border border-sm-bg-3 bg-sm-bg-2 px-3 py-2 text-sm text-sm-text-1 outline-none focus:border-sm-brand-1 focus:ring-2 focus:ring-sm-brand-1/25"
            placeholder="Необязательно"
          />
        </label>
      </AdminConfirmModal>
    </template>

    <div v-else class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-8 text-sm text-sm-text-3">
      Профиль не найден.
    </div>
  </section>
</template>
