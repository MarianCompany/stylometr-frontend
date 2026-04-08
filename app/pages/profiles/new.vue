<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import UiInput from '~/components/ui/UiInput.vue'
import { extractApiError } from '~/helpers/extractApiError'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { createProfile } = useProfiles()

const name = ref('')
const invalid = ref(false)
const isSubmitting = ref(false)

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

const handleSubmit = async () => {
  if (!validate()) {
    return
  }
  isSubmitting.value = true
  try {
    await createProfile({ name: name.value })
    toast.success('Профиль создан')
    await navigateTo('/profiles')
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось создать профиль'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-sm-text-1">Создать профиль</h1>
        <UiButton :component="NuxtLink" to="/profiles" theme="ghost" label="К списку" />
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Нужна авторизация</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы создавать профили авторов.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <form
        v-else
        class="flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-lg font-semibold text-sm-text-1">Данные профиля</h2>
          <p class="text-sm text-sm-text-3">Укажите понятное имя для набора текстов автора.</p>
        </div>
        <UiInput
          v-model="name"
          label="Название профиля"
          placeholder="Например, Русская проза XX века"
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
