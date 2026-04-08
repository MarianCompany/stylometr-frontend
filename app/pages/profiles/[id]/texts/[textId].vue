<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ProfileRead, ProfileTextRead } from '~/types/profiles'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { getProfile, getProfileText } = useProfiles()
const route = useRoute()

const profile = ref<ProfileRead | null>(null)
const text = ref<ProfileTextRead | null>(null)
const isLoading = ref(false)
const isModalOpen = ref(false)

const profileId = computed(() => Number(route.params.id))
const textId = computed(() => Number(route.params.textId))

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

const getFileName = () => {
  if (!text.value) {
    return '—'
  }
  const seed = text.value.content.trim()
  if (!seed) {
    return `Text-${text.value.id}`
  }
  const value = seed.replace(/\s+/g, ' ').slice(0, 32)
  return `${value}${seed.length > 32 ? '…' : ''}`
}

const getFileType = () => '.txt'

const getFileSize = () => {
  if (!text.value?.char_count) {
    return '—'
  }
  if (text.value.char_count < 1024) {
    return `${text.value.char_count} B`
  }
  const kb = text.value.char_count / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

const getPreview = () => {
  if (!text.value) {
    return '—'
  }
  const content = text.value.content.trim()
  if (!content) {
    return '—'
  }
  if (content.length <= 400) {
    return content
  }
  return `${content.slice(0, 400)}…`
}

const loadData = async () => {
  if (!isAuthenticated.value || Number.isNaN(profileId.value) || Number.isNaN(textId.value)) {
    return
  }
  isLoading.value = true
  try {
    const [profileData, textData] = await Promise.all([
      getProfile(profileId.value),
      getProfileText(profileId.value, textId.value),
    ])
    profile.value = profileData
    text.value = textData
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить текст'))
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

watch([isAuthenticated, profileId, textId], () => {
  if (isAuthenticated.value) {
    loadData()
  } else {
    profile.value = null
    text.value = null
  }
}, { immediate: true })
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-sm-text-1">
          Профиль {{ profile?.name ?? '—' }} — Тексты — {{ getFileName() }}
        </h1>
        <UiButton :component="NuxtLink" :to="`/profiles/${profileId}/texts`" theme="ghost" label="К текстам" />
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Нужна авторизация</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы просматривать текст.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <div
        v-else-if="isLoading"
        class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-sm-text-3"
      >
        Загружаем данные текста...
      </div>

      <div v-else class="flex flex-col gap-6">
        <div class="grid gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6 text-sm text-sm-text-2">
          <div class="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Тип файла</span>
              <span class="text-sm font-semibold text-sm-text-1">{{ getFileType() }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Имя файла</span>
              <span class="text-sm font-semibold text-sm-text-1">{{ getFileName() }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Размер</span>
              <span class="text-sm font-semibold text-sm-text-1">{{ getFileSize() }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Дата создания</span>
              <span class="text-sm font-semibold text-sm-text-1">{{ formatDate(text?.created_at ?? '') }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Дата обновления</span>
              <span class="text-sm font-semibold text-sm-text-1">{{ formatDate(text?.updated_at ?? '') }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UiButton theme="accent" label="Текст полностью" @click="isModalOpen = true" />
        </div>

        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-semibold text-sm-text-1">Короткое содержимое</h2>
          <p class="whitespace-pre-line rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6 text-sm leading-relaxed text-sm-text-2">
            {{ getPreview() }}
          </p>
          <p class="text-xs text-sm-text-4">Показан только фрагмент текста.</p>
        </div>
      </div>
    </div>
    <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-sm-bg-1/80 px-4 py-10 backdrop-blur"
        @click.self="closeModal"
    >
      <div class="flex w-full max-w-3xl flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/95 p-6 shadow-[0_28px_60px_rgba(0,0,0,0.45)]">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-lg font-semibold text-sm-text-1">Полный текст {{ getFileName() }}</h3>
          <UiButton theme="ghost" label="Закрыть" @click="closeModal" />
        </div>
        <div class="max-h-[60vh] overflow-y-auto whitespace-pre-line rounded-2xl border border-sm-bg-3 bg-sm-bg-1/60 p-5 text-sm leading-relaxed text-sm-text-2">
          {{ text?.content ?? '' }}
        </div>
      </div>
    </div>
  </section>
</template>
