<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ProfileRead } from '~/types/profiles'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { getProfile, createProfileText } = useProfiles()
const route = useRoute()

const profile = ref<ProfileRead | null>(null)
const content = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const invalid = ref(false)

const profileId = computed(() => Number(route.params.id))

const loadProfile = async () => {
  if (!isAuthenticated.value || Number.isNaN(profileId.value)) {
    return
  }
  isLoading.value = true
  try {
    profile.value = await getProfile(profileId.value)
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить профиль'))
  } finally {
    isLoading.value = false
  }
}

const validate = () => {
  if (!content.value.trim()) {
    invalid.value = true
    toast.error('Текст не может быть пустым')
    return false
  }
  invalid.value = false
  return true
}

const handleSubmit = async () => {
  if (!validate() || Number.isNaN(profileId.value)) {
    return
  }
  isSubmitting.value = true
  try {
    await createProfileText(profileId.value, content.value.trim())
    toast.success('Текст добавлен')
    await navigateTo(`/profiles/${profileId.value}/texts`)
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось добавить текст'))
  } finally {
    isSubmitting.value = false
  }
}

watch([isAuthenticated, profileId], () => {
  if (isAuthenticated.value) {
    loadProfile()
  } else {
    profile.value = null
  }
}, { immediate: true })
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-sm-text-1">
          Профиль {{ profile?.name ?? '—' }} — Новый текст
        </h1>
        <UiButton :component="NuxtLink" :to="`/profiles/${profileId}/texts`" theme="ghost" label="К текстам" />
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Нужна авторизация</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы добавлять тексты.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <div
        v-else-if="isLoading"
        class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-sm-text-3"
      >
        Загружаем профиль...
      </div>

      <form
        v-else
        class="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-lg font-semibold text-sm-text-1">Текст автора</h2>
          <p class="text-sm text-sm-text-3">Вставьте полный текст или его фрагмент.</p>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-sm-text-2">Содержимое</label>
          <textarea
            v-model="content"
            rows="12"
            class="w-full rounded-2xl border border-sm-bg-3 bg-sm-bg-2 px-4 py-3 text-sm text-sm-text-1 outline-none transition-all duration-200 placeholder:text-sm-text-4 focus:border-sm-brand-1 focus:shadow-[0_0_0_3px_rgba(255,101,14,0.25)]"
            :class="{ 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]': invalid }"
            placeholder="Введите текст"
          />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton type="submit" theme="brand" :disabled="isSubmitting" label="Отправить" />
          <UiButton :component="NuxtLink" :to="`/profiles/${profileId}/texts`" theme="ghost" label="Отмена" />
        </div>
      </form>
    </div>
  </section>
</template>
