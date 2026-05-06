<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ProfileRead, ProfileTextListItem } from '~/types/profiles'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { getProfile, listProfileTexts, deleteProfileText } = useProfiles()
const route = useRoute()

const profile = ref<ProfileRead | null>(null)
const texts = ref<ProfileTextListItem[]>([])
const isLoading = ref(false)

const profileId = computed(() => Number(route.params.id))

const formatDate = (value: string) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const getFileName = (text: ProfileTextListItem) => {
  const seed = text.short_content?.trim()
  if (!seed) {
    return `Text-${text.id}`
  }
  const value = seed.replace(/\s+/g, ' ').slice(0, 32)
  return `${value}${seed.length > 32 ? '…' : ''}`
}

const getFileType = () => '.txt'

const getFileSize = (text: ProfileTextListItem) => {
  if (!text.char_count) {
    return '—'
  }
  if (text.char_count < 1024) {
    return `${text.char_count} B`
  }
  const kb = text.char_count / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

const loadData = async () => {
  if (!isAuthenticated.value || Number.isNaN(profileId.value)) {
    return
  }
  isLoading.value = true
  try {
    const [profileData, textsData] = await Promise.all([
      getProfile(profileId.value),
      listProfileTexts(profileId.value),
    ])
    profile.value = profileData
    texts.value = textsData
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить тексты профиля'))
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (textId: number) => {
  if (!confirm('Удалить текст? Действие нельзя отменить.')) {
    return
  }
  try {
    await deleteProfileText(profileId.value, textId)
    texts.value = texts.value.filter((item) => item.id !== textId)
    toast.success('Текст удален')
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось удалить текст'))
  }
}

watch([isAuthenticated, profileId], () => {
  if (isAuthenticated.value) {
    loadData()
  } else {
    profile.value = null
    texts.value = []
  }
}, { immediate: true })
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-sm-text-1">
          Профиль {{ profile?.name ?? '—' }} — Тексты
        </h1>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton
            v-if="isAuthenticated"
            :component="NuxtLink"
            :to="`/profiles/${profileId}/texts/new`"
            theme="brand"
            label="Добавить текст"
          />
          <UiButton :component="NuxtLink" to="/profiles" theme="ghost" label="К профилям" />
        </div>
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Нужна авторизация</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы просматривать тексты профиля.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <div
        v-else-if="isLoading"
        class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-sm-text-3"
      >
        Загружаем тексты профиля...
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-4">
          <div class="grid grid-cols-5 gap-4 text-xs font-semibold uppercase tracking-wide text-sm-text-4">
            <div>Имя файла</div>
            <div>Тип</div>
            <div>Размер</div>
            <div>Дата</div>
            <div class="text-right">Действия</div>
          </div>
        </div>

        <div
          v-if="texts.length === 0"
          class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-center text-sm-text-3"
        >
          Тексты пока не добавлены.
        </div>

        <div v-else class="max-h-[520px] space-y-3 overflow-y-auto pr-1 no-scrollbar">
          <div
            v-for="text in texts"
            :key="text.id"
            class="group flex items-center gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-4 transition-all hover:border-sm-brand-1 hover:bg-sm-bg-2"
          >
            <NuxtLink
              :to="`/profiles/${profileId}/texts/${text.id}`"
              class="grid flex-1 grid-cols-4 gap-4 text-sm text-sm-text-2"
            >
              <div class="font-semibold text-sm-text-1">
                {{ getFileName(text) }}
              </div>
              <div class="text-sm-text-3">{{ getFileType() }}</div>
              <div class="text-sm-text-3">{{ getFileSize(text) }}</div>
              <div class="text-sm-text-3">{{ formatDate(text.updated_at || text.created_at) }}</div>
            </NuxtLink>
            <UiButton
              size="sm"
              theme="ghost"
              label="Удалить"
              @click.stop="handleDelete(text.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
