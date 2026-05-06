<script setup lang="ts">
import { toast } from 'vue-sonner'
import AdminButton from '~/components/admin/AdminButton.vue'
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import AdminStatusBadge from '~/components/admin/AdminStatusBadge.vue'
import type { AdminProfileListItem } from '~/types/admin'
import {useAdminApi} from "~/composables/admin/useAdminApi";
import {useAdminFormat} from "~/composables/admin/useAdminFormat";
import {useAdminInfiniteList} from "~/composables/admin/useAdminInfiniteList";
import {useAdminInfiniteScroll} from "~/composables/admin/useAdminInfiniteScroll";
import {getAdminApiErrorMessage} from "~/composables/admin/useAdminError";

definePageMeta({
  layout: 'admin',
})

type ModerationAction = 'approve' | 'block'

const api = useAdminApi()
const { formatDate, statusLabel, statusTone } = useAdminFormat()
const profilesList = useAdminInfiniteList(api.listPendingProfiles, {
  perPage: 20,
  errorMessage: 'Не удалось загрузить очередь модерации',
})
const sentinel = ref<HTMLElement | null>(null)
const selectedProfile = ref<AdminProfileListItem | null>(null)
const action = ref<ModerationAction>('approve')
const decisionComment = ref('')
const modalOpen = ref(false)
const isActionPending = ref(false)

useAdminInfiniteScroll(
  sentinel,
  () => profilesList.load(),
  computed(() => profilesList.hasMore.value && !profilesList.isLoading.value),
)

const openDecision = (profile: AdminProfileListItem, nextAction: ModerationAction) => {
  selectedProfile.value = profile
  action.value = nextAction
  decisionComment.value = profile.moderation_comment ?? ''
  modalOpen.value = true
}

const removeProfileFromQueue = (profileId: number) => {
  profilesList.items.value = profilesList.items.value.filter((profile) => profile.id !== profileId)
}

const confirmDecision = async () => {
  if (!selectedProfile.value) {
    return
  }

  isActionPending.value = true
  try {
    if (action.value === 'approve') {
      await api.approveProfile(selectedProfile.value.id, {
        comment: decisionComment.value.trim() || null,
      })
      toast.success('Профиль одобрен')
    } else {
      await api.blockProfile(selectedProfile.value.id, {
        comment: decisionComment.value.trim() || null,
      })
      toast.success('Профиль отправлен на доработку')
    }
    removeProfileFromQueue(selectedProfile.value.id)
    modalOpen.value = false
  } catch (error) {
    toast.error(getAdminApiErrorMessage(error, 'Не удалось выполнить модерационное действие'))
  } finally {
    isActionPending.value = false
  }
}

onMounted(() => {
  void profilesList.reset()
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand-1">Очередь</p>
        <h1 class="mt-2 text-3xl font-semibold text-sm-text-1">Модерация профилей</h1>
      </div>
      <div class="text-sm text-sm-text-4">
        Ожидают решения: {{ profilesList.meta.value?.total ?? profilesList.items.value.length }}
      </div>
    </header>

    <div v-if="profilesList.isInitialized.value && profilesList.items.value.length === 0" class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-10 text-center text-sm text-sm-text-3">
      Очередь модерации пуста.
    </div>

    <div class="grid grid-cols-1 gap-4">
      <article
        v-for="profile in profilesList.items.value"
        :key="profile.id"
        class="rounded-2xl border border-sm-bg-3 bg-sm-bg-2/55 p-5"
      >
        <div class="grid grid-cols-[1fr_auto] gap-5">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <NuxtLink :to="`/admin/moderation/profiles/${profile.id}`" class="truncate text-lg font-semibold text-sm-text-1 hover:text-sm-brand-1">
                {{ profile.name }}
              </NuxtLink>
              <AdminStatusBadge :tone="statusTone(profile.moderation_status)">
                {{ statusLabel(profile.moderation_status) }}
              </AdminStatusBadge>
              <AdminStatusBadge :tone="profile.is_public ? 'success' : 'neutral'">
                {{ profile.is_public ? 'Публичный' : 'Скрыт' }}
              </AdminStatusBadge>
            </div>
            <div class="mt-2 text-sm text-sm-text-3">
              {{ profile.user_email ?? `Пользователь #${profile.user_id}` }} · {{ profile.texts_count }} текстов · {{ formatDate(profile.updated_at) }}
            </div>
            <p v-if="profile.moderation_comment" class="mt-3 text-sm leading-6 text-sm-text-3">
              {{ profile.moderation_comment }}
            </p>
          </div>

          <div class="flex min-w-52 flex-col gap-2">
            <AdminButton variant="primary" size="sm" @click="openDecision(profile, 'approve')">
              Одобрить
            </AdminButton>
            <AdminButton variant="danger" size="sm" @click="openDecision(profile, 'block')">
              На доработку
            </AdminButton>
            <NuxtLink
              :to="`/admin/moderation/profiles/${profile.id}`"
              class="inline-flex min-h-9 items-center justify-center rounded-lg border border-sm-bg-3 px-3 text-xs font-semibold text-sm-text-2 transition-colors hover:bg-sm-bg-3 hover:text-sm-text-1"
            >
              Открыть карточку
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <div ref="sentinel" class="flex min-h-16 items-center justify-center py-4 text-sm text-sm-text-4">
      <span v-if="profilesList.isLoading.value">Загрузка...</span>
      <span v-else-if="profilesList.isInitialized.value && !profilesList.hasMore.value && profilesList.items.value.length > 0">Вся очередь загружена</span>
    </div>

    <AdminConfirmModal
      v-model="modalOpen"
      :title="action === 'approve' ? 'Одобрить профиль?' : 'Отправить профиль на доработку?'"
      :description="action === 'approve' ? 'Профиль станет публичным после подтверждения.' : 'Профиль будет скрыт из публичного доступа.'"
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
  </section>
</template>
