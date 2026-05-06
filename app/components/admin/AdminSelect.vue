<script setup lang="ts">
interface AdminSelectOption {
  value: string | number | null
  label: string
}

interface Props {
  modelValue: string | number | null
  label?: string
  options: AdminSelectOption[]
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const onChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  if (value === '__null') {
    emit('update:modelValue', null)
    return
  }
  const numeric = Number(value)
  emit('update:modelValue', Number.isNaN(numeric) ? value : numeric)
}
</script>

<template>
  <label class="flex w-full flex-col gap-2 text-sm font-medium text-sm-text-2">
    <span v-if="label">{{ label }}</span>
    <select
      class="min-h-10 rounded-lg border border-sm-bg-3 bg-sm-bg-2 px-3 text-sm text-sm-text-1 outline-none transition-colors focus:border-sm-brand-1 focus:ring-2 focus:ring-sm-brand-1/25 disabled:cursor-not-allowed disabled:opacity-55"
      :value="modelValue ?? '__null'"
      :disabled="disabled"
      @change="onChange"
    >
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value ?? '__null'"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
