<script setup lang="ts">
import {toast} from "vue-sonner";
import UiButton from "~/components/ui/UiButton.vue";

const { user, isAuthenticated, logout } = useAuth()
const { openLogin, openRegister } = useAuthModals()

const extractError = (error: unknown) => {
  const detail = (error as { data?: { detail?: string | { msg?: string }[] } })?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? 'Ошибка валидации').join('. ')
  }
  if (typeof detail === 'string') {
    return detail
  }
  return 'Не удалось выполнить выход'
}

const tryLogout = async () => {
  try {
    await logout()
    toast.success('Выход выполнен')
  } catch (error) {
    toast.error(extractError(error))
  }
}
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <div class="app-header__logo">
        <NuxtLink to="/">
          <img src="/logo.png" alt="Logo" class="app-header__logo-img" />
        </NuxtLink>
      </div>
      <nav class="flex items-center gap-6">
        <ClientOnly>
          <NuxtLink
            v-if="isAuthenticated"
            to="/profiles"
            class="text-sm font-semibold text-sm-text-2 transition-colors hover:text-sm-text-1"
          >
            Профили
          </NuxtLink>
        </ClientOnly>
      </nav>
      <div class="app-header__actions">
        <ClientOnly>
          <template v-if="isAuthenticated">
            <div  class="app-header__greeting">
              Привет, {{ user?.nickname || 'пользователь' }}
            </div>
            <UiButton theme="ghost" label="Выйти" class="cursor-pointer" @click="tryLogout" />
          </template>
          <template v-else>
            <UiButton theme="ghost" label="Вход" class="cursor-pointer" @click="openLogin" />
            <UiButton theme="brand" label="Регистрация" class="cursor-pointer" @click="openRegister" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.app-header {
  @apply bg-sm-bg-1/85 backdrop-blur-md;
}

.app-header__inner {
  @apply flex h-20 items-center justify-between gap-4;
}

.app-header__logo {
  @apply flex items-center;
}

.app-header__logo-img {
  @apply size-[60px] rounded-2xl object-cover;
}

.app-header__actions {
  @apply flex items-center gap-3;
}

.app-header__greeting {
  @apply text-sm font-semibold text-sm-text-2;
}
</style>
