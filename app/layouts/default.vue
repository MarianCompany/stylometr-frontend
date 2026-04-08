<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { Toaster } from 'vue-sonner'
import AppHeader from '~/components/shared/AppHeader.vue'
import AppFooter from '~/components/shared/AppFooter.vue'
import LoginModal from '~/components/modules/auth/LoginModal.vue'
import RegisterModal from '~/components/modules/auth/RegisterModal.vue'

const { loginOpen, registerOpen, openLogin, openRegister } = useAuthModals()

const switchToRegister = () => {
  openRegister()
}

const switchToLogin = () => {
  openLogin()
}
</script>

<template>
  <div class="layout">
    <AppHeader />
    <main class="layout__content">
      <slot />
    </main>
    <AppFooter />
    <ClientOnly>
      <LoginModal v-model="loginOpen" @switch-to-register="switchToRegister" />
      <RegisterModal v-model="registerOpen" @switch-to-login="switchToLogin" />
      <ModalsContainer />
    </ClientOnly>
    <Toaster position="top-right" />
  </div>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.layout {
  @apply flex min-h-screen flex-col bg-sm-bg-1 text-sm-text-1;
}

.layout__content {
  @apply flex-1;
}
</style>
