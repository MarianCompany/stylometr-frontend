<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import UiInput from '~/components/ui/UiInput.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ProfileRead } from '~/types/profiles'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { getProfile, updateProfile } = useProfiles()
const route = useRoute()

const profile = ref<ProfileRead | null>(null)
const name = ref('')
const invalid = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)

const profileId = computed(() => Number(route.params.id))

const validate = () => {
  const trimmed = name.value.trim()
  if (trimmed.length < 2) {
    invalid.value = true
    toast.error('Название должно содержать минимум 2 символа')
    return false
  }
  if (trimmed.length > 255) {
    invalid.value = true
    toast.error('Название не должно превышать 255 символов')
    return false
  }
  invalid.value = false
  name.value = trimmed
  return true
}

const loadProfile = async () => {
  if (!isAuthenticated.value || Number.isNaN(profileId.value)) {
    return
  }
  isLoading.value = true
  try {
    profile.value = await getProfile(profileId.value)
    name.value = profile.value.name
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить профиль'))
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!validate() || Number.isNaN(profileId.value)) {
    return
  }
  isSubmitting.value = true
  try {
    profile.value = await updateProfile(profileId.value, { name: name.value })
    toast.success('Профиль обновлен')
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось обновить профиль'))
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
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-semibold text-sm-text-1">Редактировать профиль</h1>
          <p v-if="profile" class="text-sm text-sm-text-3">ID профиля: {{ profile.id }}</p>
        </div>
        <UiButton :component="NuxtLink" to="/profiles" theme="ghost" label="К списку" />
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Нужна авторизация</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы редактировать профили авторов.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <div
        v-else-if="isLoading"
        class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-sm-text-3"
      >
        Загружаем данные профиля...
      </div>

      <form
        v-else
        class="flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-lg font-semibold text-sm-text-1">Данные профиля</h2>
          <p class="text-sm text-sm-text-3">Обновите название профиля автора при необходимости.</p>
        </div>
        <UiInput
          v-model="name"
          label="Название профиля"
          placeholder="Например, Современная поэзия"
          :invalid="invalid"
          autocomplete="off"
        />
        <div class="flex flex-wrap items-center gap-3">
          <UiButton type="submit" theme="brand" :disabled="isSubmitting" label="Сохранить" />
          <UiButton :component="NuxtLink" to="/profiles" theme="ghost" label="Отмена" />
        </div>
      </form>
    </div>
  </section>
</template>
