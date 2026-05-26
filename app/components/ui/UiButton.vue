<script lang="ts" setup>
import type { Component } from 'vue'

type ButtonThemes = 'pill' | 'ghost' | 'default' | 'brand' | 'accent'
type ButtonSizes = 'sm' | 'md' | 'xl'

interface Props {
  component?: string | Component
  theme?: ButtonThemes
  size?: ButtonSizes
  label?: string
  icon?: Component
  reverse?: boolean
  a11y?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  component: 'button',
  icon: undefined,
  label: '',
  theme: 'default',
  size: 'md',
  reverse: false,
  a11y: '',
  disabled: false,
  type: 'button',
})

const slots = useSlots()
const isIconBtn = computed(() => !props.label && (props.icon || slots?.icon))

const buttonClasses = computed(() => {
  const theme = `btn-${props.theme}`
  const size = `btn-${props.size}`
  const icon = isIconBtn.value ? `btn_icon` : ''
  const reversed = props.reverse ? 'btn_reversed' : ''

  return [theme, size, icon, reversed]
})
</script>

<template>
  <component
    :is="component"
    class="btn"
    :class="buttonClasses"
    :disabled="disabled"
    :type="component === 'button' ? type : undefined"
  >
    <slot v-if="$slots.default" />
    <template v-else>
      <span v-if="label" class="btn-text">
        {{ label }}
      </span>
      <slot v-if="$slots.icon" name="icon" />
      <component :is="icon" v-else-if="icon" class="size-6" />
    </template>
    <span v-if="a11y" class="sr-only">{{ a11y }}</span>
  </component>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.btn {
  @apply inline-flex items-center justify-center gap-x-2 rounded-full text-sm font-semibold transition-all duration-200;
}

/* Размеры */

.btn-sm {
  @apply min-h-8 px-3 py-1;
}

.btn-sm.btn_icon {
  @apply size-8 p-0;
}

.btn-md {
  @apply min-h-9 px-4 py-1.5;
}

.btn-md.btn_icon {
  @apply size-9 p-0;
}

.btn-xl {
  @apply min-h-11 px-4 py-2.5;
}

.btn-xl.btn_icon {
  @apply size-11 p-0;
}

.btn-sm .btn-text {
  @apply text-xs;
}

/* Размеры */

/* Темизация */
.btn-default {
  @apply bg-sm-bg-2 text-sm-text-1 hover:bg-sm-bg-3 active:bg-sm-bg-4 focus-visible:bg-sm-bg-3 disabled:bg-sm-bg-2/40 disabled:text-sm-text-3/40;
}

.btn-pill {
  @apply bg-sm-bg-invert-1 text-sm-text-invert-1 hover:bg-sm-bg-invert-2 active:bg-sm-bg-invert-3 focus-visible:bg-sm-bg-invert-2 disabled:bg-sm-bg-invert-2/40 disabled:text-sm-text-invert-3/40;
}

.btn-ghost {
  @apply border border-sm-text-4 text-sm-text-2 hover:bg-sm-bg-2/40 hover:text-sm-text-1 active:bg-sm-bg-3/50 focus-visible:bg-sm-bg-2/40 disabled:border-sm-text-4/30 disabled:text-sm-text-4/40;
}

.btn-brand {
  @apply bg-sm-brand-1 text-sm-text-1 hover:bg-sm-brand-2 active:bg-sm-brand-3 focus-visible:bg-sm-brand-2 disabled:bg-sm-brand-2/40 disabled:text-sm-text-1/50;
}

.btn-accent {
  @apply bg-sm-accent-1 text-sm-text-1 hover:bg-sm-accent-2 active:bg-sm-accent-3 focus-visible:bg-sm-accent-2 disabled:bg-sm-accent-2/40 disabled:text-sm-text-1/50;
}

/* Темизация */

.btn_reversed {
  @apply flex-row-reverse;
}
</style>
