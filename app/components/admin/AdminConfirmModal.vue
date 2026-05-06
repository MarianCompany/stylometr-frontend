<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import AdminButton from '~/components/admin/AdminButton.vue'

interface Props {
  modelValue: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  danger: false,
  pending: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-class="bg-black/65 backdrop-blur-[3px]"
    content-class="flex min-h-full items-center justify-center p-4"
    :click-to-close="!pending"
    :esc-to-close="!pending"
    :lock-scroll="true"
  >
    <div class="w-full max-w-md rounded-2xl border border-sm-bg-3 bg-sm-bg-1 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)]">
      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-sm-text-1">{{ title }}</h2>
        <p v-if="description" class="text-sm leading-6 text-sm-text-3">{{ description }}</p>
      </div>

      <div v-if="$slots.default" class="mt-5">
        <slot />
      </div>

      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <AdminButton variant="ghost" :disabled="pending" @click="isOpen = false">
          {{ cancelText }}
        </AdminButton>
        <AdminButton
          :variant="danger ? 'danger' : 'primary'"
          :disabled="pending"
          @click="emit('confirm')"
        >
          {{ pending ? 'Выполняется...' : confirmText }}
        </AdminButton>
      </div>
    </div>
  </VueFinalModal>
</template>
