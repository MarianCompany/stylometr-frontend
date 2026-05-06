<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { Toaster } from 'vue-sonner'

const navItems = [
  { label: 'Пользователи', to: '/admin/users', icon: 'users' },
  { label: 'Модерация', to: '/admin/moderation', icon: 'shield' },
  { label: 'Логи', to: '/admin/logs', icon: 'logs' },
]
</script>

<template>
  <div class="min-h-screen bg-sm-bg-1 text-sm-text-1">
    <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sm-bg-3 bg-sm-bg-2/95 px-4 py-5">
      <NuxtLink to="/admin/users" class="flex items-center gap-3 rounded-lg px-2 py-2">
        <span class="grid size-10 place-items-center rounded-lg bg-sm-brand-1 text-sm font-bold text-sm-text-1">
          SM
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-sm-text-1">Stylometr</span>
          <span class="block truncate text-xs text-sm-text-4">Админ-панель</span>
        </span>
      </NuxtLink>

      <nav class="mt-8 flex flex-1 flex-col gap-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-sm-text-3 transition-colors hover:bg-sm-bg-3 hover:text-sm-text-1"
          active-class="bg-sm-bg-3 text-sm-text-1"
        >
          <span class="grid size-7 place-items-center rounded-md border border-sm-bg-3 text-xs group-hover:border-sm-brand-1/60">
            <span v-if="item.icon === 'users'">U</span>
            <span v-else-if="item.icon === 'shield'">M</span>
            <span v-else>L</span>
          </span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink
        to="/"
        class="mt-6 flex min-h-11 items-center justify-center rounded-lg border border-sm-bg-3 px-3 text-sm font-semibold text-sm-text-2 transition-colors hover:bg-sm-bg-3 hover:text-sm-text-1"
      >
        Вернуться на сайт
      </NuxtLink>
    </aside>

    <main class="min-h-screen pl-64">
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-8 py-8">
        <slot />
      </div>
    </main>

    <ClientOnly>
      <ModalsContainer />
    </ClientOnly>
    <Toaster position="top-right" />
  </div>
</template>
