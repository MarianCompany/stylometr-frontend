<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import UiButton from '~/components/ui/UiButton.vue'
import UiInput from '~/components/ui/UiInput.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'switch-to-register'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive({
  email: '',
  password: '',
})

const invalid = reactive({
  email: false,
  password: false,
})

const { login } = useAuth()
const { $toast } = useNuxtApp()

const resetInvalid = () => {
  invalid.email = false
  invalid.password = false
}

const extractError = (error: unknown) => {
  const detail = (error as { data?: { detail?: string | { msg?: string }[] } })?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? 'Ошибка валидации').join('. ')
  }
  if (typeof detail === 'string') {
    return detail
  }
  return 'Не удалось выполнить вход'
}

const validate = () => {
  resetInvalid()
  const errors: string[] = []
  if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
    invalid.email = true
    errors.push('Введите корректный email')
  }
  if (!form.password || form.password.length < 1) {
    invalid.password = true
    errors.push('Введите пароль')
  }
  return errors
}

const submit = async () => {
  const errors = validate()
  if (errors.length) {
    $toast.error(errors.join('. '))
    return
  }
  try {
    await login({
      email: form.email.trim(),
      password: form.password,
    })
    $toast.success('Вход выполнен')
    isOpen.value = false
  } catch (error) {
    $toast.error(extractError(error))
  }
}
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-class="bg-black/60 backdrop-blur-[4px]"
    content-class="overflow-auto h-full flex items-center justify-center py-8"
    :click-to-close="true"
    :esc-to-close="true"
    :lock-scroll="true"
  >
    <div class="w-100 max-w-[calc(100vw-2rem)] rounded-3xl bg-sm-bg-1 px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div class="flex flex-col items-center gap-y-5">
        <img src="/logo.png" alt="Logo" class="size-20 rounded-2xl object-cover" />
        <h2 class="text-lg font-semibold text-sm-text-1">Вход</h2>

        <div class="w-full space-y-4">
          <UiInput
              id="login-email"
              v-model="form.email"
              label="Email"
              placeholder="email@example.com"
              :invalid="invalid.email"
              autocomplete="email"
          />
          <UiInput
              id="login-password"
              v-model="form.password"
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              :invalid="invalid.password"
              autocomplete="current-password"
          />
        </div>

        <div class="w-full">
          <UiButton
              size="sm"
              theme="ghost"
              label="У меня нет аккаунта"
              @click="emit('switch-to-register')"
          />
        </div>

        <div class="flex w-full gap-3">
          <UiButton
              theme="brand"
              label="Войти"
              type="submit"
              class="flex-1"
              @click="submit"
          />
          <UiButton
              theme="ghost"
              label="Отмена"
              class="flex-1"
              @click="isOpen = false"
          />
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
