<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'secondary',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sm-brand-1/40 disabled:cursor-not-allowed disabled:opacity-55"
    :class="[
      size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-10 px-4 text-sm',
      variant === 'primary'
        ? 'border-sm-brand-1 bg-sm-brand-1 text-sm-text-1 hover:bg-sm-brand-2'
        : '',
      variant === 'secondary'
        ? 'border-sm-bg-3 bg-sm-bg-2 text-sm-text-1 hover:border-sm-bg-4 hover:bg-sm-bg-3'
        : '',
      variant === 'danger'
        ? 'border-red-500/70 bg-red-500/12 text-red-100 hover:bg-red-500/20'
        : '',
      variant === 'ghost'
        ? 'border-transparent bg-transparent text-sm-text-3 hover:bg-sm-bg-2 hover:text-sm-text-1'
        : '',
    ]"
  >
    <slot />
  </button>
</template>
