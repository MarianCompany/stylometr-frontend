// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  components: [],
  modules: ['vue-sonner/nuxt'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: [
    '~/assets/styles/fonts.css',
    '~/assets/styles/main.css',
    'vue-final-modal/style.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})