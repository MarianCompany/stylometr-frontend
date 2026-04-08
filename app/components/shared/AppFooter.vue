<template>
  <footer class="app-footer">
    <div class="container app-footer__inner">
      <img src="/logo.png" alt="Logo" class="app-footer__logo" />
    </div>
  </footer>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.app-footer {
  @apply bg-sm-bg-2 py-8;
}

.app-footer__inner {
  @apply flex items-center justify-center;
}

.app-footer__logo {
  @apply size-[60px] rounded-2xl object-cover;
}
</style>
