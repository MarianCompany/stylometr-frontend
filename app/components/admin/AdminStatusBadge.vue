<script setup lang="ts">
interface Props {
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

withDefaults(defineProps<Props>(), {
  tone: 'neutral',
})
</script>

<template>
  <span
    class="inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold"
    :class="[
      tone === 'success' ? 'border-green-400/40 bg-green-400/10 text-green-100' : '',
      tone === 'warning' ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-100' : '',
      tone === 'danger' ? 'border-red-400/40 bg-red-400/10 text-red-100' : '',
      tone === 'neutral' ? 'border-sm-bg-3 bg-sm-bg-2 text-sm-text-3' : '',
    ]"
  >
    <slot />
  </span>
</template>
