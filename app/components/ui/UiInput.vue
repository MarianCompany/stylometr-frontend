<script setup lang="ts">
interface Props {
  modelValue?: string
  type?: string
  label?: string
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
  name?: string
  autocomplete?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  invalid: false,
  disabled: false,
  name: '',
  autocomplete: 'off',
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="input-field">
    <label v-if="label" class="input-label" :for="id">
      {{ label }}
    </label>
    <input
      :id="id"
      class="input"
      :class="{ input_invalid: invalid }"
      :type="type"
      :placeholder="placeholder"
      :name="name"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :value="modelValue"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
@reference 'tailwindcss';
@reference '~/assets/styles/main.css';

.input-field {
  @apply flex flex-col gap-y-2;
}

.input-label {
  @apply text-sm font-medium text-sm-text-2;
}

.input {
  @apply w-full rounded-2xl border border-sm-bg-3 bg-sm-bg-2 px-4 py-2.5 text-sm text-sm-text-1 outline-none transition-all duration-200 placeholder:text-sm-text-4 focus:border-sm-brand-1 focus:shadow-[0_0_0_3px_rgba(255,101,14,0.25)];
}

.input_invalid {
  @apply border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.35)];
}
</style>
