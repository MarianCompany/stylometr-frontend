<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/vue'

type SelectOption = {
  value: string | number
  label: string
}

interface Props {
  modelValue: SelectOption['value'] | null
  label?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Выберите значение',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectOption['value'] | null): void
}>()

const wrapper = useTemplateRef('wrapper')
const reference = useTemplateRef('reference')
const floating = useTemplateRef('floating')

const open = ref(false)

const selectedOption = computed(() => {
  return props.options.find((item) => item.value === props.modelValue) ?? null
})

const toggle = () => {
  if (props.disabled) {
    return
  }
  open.value = !open.value
}

const close = () => {
  open.value = false
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  close()
}

onClickOutside(wrapper, close)

const { floatingStyles } = useFloating(reference, floating, {
  middleware: [
    offset(6),
    shift(),
    size({
      apply({ rects, elements }) {
        Object.assign(elements.floating.style, {
          minWidth: `${rects.reference.width}px`,
        })
      },
    }),
  ],
  whileElementsMounted: autoUpdate,
})
</script>

<template>
  <div ref="wrapper" class="flex w-full flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-sm-text-2">
      {{ label }}
    </label>
    <button
      ref="reference"
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-2xl border border-sm-bg-3 bg-sm-bg-2 px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sm-brand-1/40"
      :class="{
        'text-sm-text-4': !selectedOption,
        'text-sm-text-1': selectedOption,
        'cursor-not-allowed opacity-60': disabled,
        'border-sm-brand-1': open,
      }"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="truncate">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <span
        class="text-sm-text-4 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      >
        ▾
      </span>
    </button>
    <Transition name="select-fade">
      <div
        v-if="open && reference"
        ref="floating"
        class="z-40"
        :style="floatingStyles"
      >
        <div class="max-h-64 overflow-y-auto rounded-2xl border border-sm-bg-3 bg-sm-bg-2 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div v-if="options.length === 0" class="px-3 py-2 text-sm text-sm-text-4">
            Нет доступных опций
          </div>
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-sm-text-2 transition-colors hover:bg-sm-bg-3"
            :class="{
              'bg-sm-bg-3 text-sm-text-1': option.value === modelValue,
            }"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.select-fade-enter-active,
.select-fade-leave-active {
  transition: opacity 0.12s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
}
</style>
