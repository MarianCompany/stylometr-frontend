<script setup lang="ts">
import MovingTextBg from '~/components/modules/landing/moving-text/MovingTextBg.vue'
import UiButton from '~/components/ui/UiButton.vue'
import {NuxtLink} from "#components";
</script>

<template>
  <section class="hero">
    <ClientOnly>
      <MovingTextBg class="hero__bg" />
    </ClientOnly>
    <div class="container hero__content">
      <div class="hero__card">
        <img src="/logo.webp" alt="Logo" class="hero__logo" />
        <div class="hero__text">
          <p>Анализируйте тексты быстро и точно</p>
          <p>Получайте стилистические инсайты в пару кликов</p>
        </div>
        <UiButton :component="NuxtLink" href="/profiles" theme="brand" size="xl" label="Начать анализ" />
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.hero {
  @apply relative overflow-hidden;
  min-height: calc(100vh - 5rem);
}

.hero__bg {
  @apply absolute inset-0;
}

.hero__content {
  @apply relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center py-10;
}

.hero__card {
  @apply flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-sm-bg-2/80 px-8 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md;
}

.hero__logo {
  @apply size-[100px] rounded-3xl object-cover;
}

.hero__text {
  @apply space-y-1 text-sm text-sm-text-2;
}
</style>
