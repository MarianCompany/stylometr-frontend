<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ComparisonResponse } from '~/types/comparisons'
import type { ProfileListItem } from '~/types/profiles'

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { listProfiles, compareProfileText } = useProfiles()

const profiles = ref<ProfileListItem[]>([])
const selectedProfileId = ref<number | null>(null)
const inputText = ref('')
const result = ref<ComparisonResponse | null>(null)
const errorMessage = ref('')
const isLoadingProfiles = ref(false)
const isComparing = ref(false)

const profileOptions = computed(() => {
  return profiles.value.map((profile) => ({
    value: profile.id,
    label: profile.name,
  }))
})

const selectedProfile = computed(() => {
  return profiles.value.find((profile) => profile.id === selectedProfileId.value) ?? null
})

const canCompare = computed(() => {
  return Boolean(selectedProfileId.value) && Boolean(inputText.value.trim()) && !isComparing.value
})

const formatLabel = (value: string) => value.replace(/_/g, ' ')

const formatNumber = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString()
  }
  return value.toFixed(4)
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'number') {
    return formatNumber(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет'
  }
  if (typeof value === 'string') {
    return value
  }
  return '—'
}

const formatDate = (value: string) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const analysisMetaEntries = computed(() => {
  const meta = result.value?.analysis_meta
  if (!meta || !isPlainObject(meta)) {
    return []
  }
  return Object.entries(meta)
})

const loadProfiles = async () => {
  if (!isAuthenticated.value) {
    profiles.value = []
    return
  }
  isLoadingProfiles.value = true
  try {
    profiles.value = await listProfiles()
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить профили'))
  } finally {
    isLoadingProfiles.value = false
  }
}

const runComparison = async () => {
  if (!canCompare.value || selectedProfileId.value === null) {
    return
  }
  errorMessage.value = ''
  result.value = null
  isComparing.value = true
  try {
    result.value = await compareProfileText(selectedProfileId.value, inputText.value.trim())
    toast.success('Сравнение завершено')
  } catch (error) {
    errorMessage.value = extractApiError(error, 'Не удалось выполнить сравнение')
    toast.error(errorMessage.value)
  } finally {
    isComparing.value = false
  }
}

watch(isAuthenticated, () => {
  selectedProfileId.value = null
  loadProfiles()
}, { immediate: true })
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold text-sm-text-1">Атрибуция авторства текста</h1>
        <p class="text-sm text-sm-text-3">
          Выберите профиль автора, вставьте текст и запустите сравнение.
        </p>
      </div>

      <div class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6">
        <div class="text-sm font-semibold uppercase tracking-wide text-sm-text-4">Профиль автора</div>
        <UiSelect
            v-model="selectedProfileId"
            label="Выберите профиль"
            :options="profileOptions"
            placeholder="Выберите профиль для сравнения"
            :disabled="!isAuthenticated || isLoadingProfiles"
        />
        <div v-if="!isAuthenticated" class="flex flex-wrap items-center gap-3 text-sm text-sm-text-3">
          <span>Для выбора профиля нужна авторизация.</span>
          <UiButton theme="brand" size="sm" label="Войти" @click="openLogin" />
        </div>
        <div v-else-if="isLoadingProfiles" class="text-sm text-sm-text-4">
          Загрузка списка профилей...
        </div>
        <div v-else-if="profiles.length === 0" class="text-sm text-sm-text-4">
          У вас пока нет профилей для сравнения.
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6">
        <div class="text-sm font-semibold uppercase tracking-wide text-sm-text-4">Текст для анализа</div>
        <label class="text-sm font-medium text-sm-text-2">Фрагмент текста</label>
        <textarea
            v-model="inputText"
            rows="10"
            class="w-full rounded-2xl border border-sm-bg-3 bg-sm-bg-2 px-4 py-3 text-sm text-sm-text-1 outline-none transition-all duration-200 placeholder:text-sm-text-4 focus:border-sm-brand-1 focus:shadow-[0_0_0_3px_rgba(255,101,14,0.25)]"
            placeholder="Вставьте или введите текст для сравнения. Желательно несколько абзацев."
            :disabled="!selectedProfileId"
        />
        <div class="flex flex-wrap items-center gap-3">
          <UiButton
              theme="brand"
              label="Сравнить"
              :disabled="!canCompare"
              @click="runComparison"
          />
          <span v-if="isComparing" class="text-sm text-sm-text-3">Анализ текста...</span>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-3xl border border-red-500/50 bg-red-500/10 p-6 text-sm text-red-200">
        {{ errorMessage }}
      </div>

      <div v-if="result" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-xl font-semibold text-sm-text-1">Результаты сравнения</h2>
          <p class="text-sm text-sm-text-3">Основные метрики и детали вычислений.</p>
        </div>

        <div class="grid gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <div class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Профиль</div>
            <div class="text-sm text-sm-text-2">Имя: <span class="font-semibold text-sm-text-1">{{ result.profile_name }}</span></div>
            <div class="text-sm text-sm-text-2">ID: <span class="font-semibold text-sm-text-1">{{ result.profile_id }}</span></div>
            <div class="text-sm text-sm-text-2">Публичный: <span class="font-semibold text-sm-text-1">{{ result.is_public_profile ? 'Да' : 'Нет' }}</span></div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Кандидат</div>
            <div class="text-sm text-sm-text-2">Источник: <span class="font-semibold text-sm-text-1">{{ result.candidate_source_type }}</span></div>
            <div class="text-sm text-sm-text-2">ID текста: <span class="font-semibold text-sm-text-1">{{ result.candidate_text_id ?? '—' }}</span></div>
            <div class="text-sm text-sm-text-2">Длина: <span class="font-semibold text-sm-text-1">{{ result.candidate_text_length }}</span></div>
            <div class="text-sm text-sm-text-2">Анализ выполнен: <span class="font-semibold text-sm-text-1">{{ formatDate(result.analyzed_at) }}</span></div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-2 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6">
            <div class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Дельта Берроуза</div>
            <div class="text-2xl font-semibold text-sm-text-1">{{ formatNumber(result.burrows_delta) }}</div>
          </div>
          <div class="flex flex-col gap-2 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6">
            <div class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Косинусное сходство</div>
            <div class="text-2xl font-semibold text-sm-text-1">{{ formatNumber(result.cosine_similarity) * 100 }}%</div>
          </div>
          <div class="flex flex-col gap-2 rounded-3xl border border-sm-brand-1/60 bg-sm-brand-1/15 p-6">
            <div class="text-xs font-semibold uppercase tracking-wide text-sm-text-4">Вероятность авторства</div>
            <div class="text-3xl font-semibold text-sm-text-1">{{ formatNumber(result.authorship_probability) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
