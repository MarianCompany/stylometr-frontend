<script setup lang="ts">
import { toast } from 'vue-sonner'
import UiButton from '~/components/ui/UiButton.vue'
import { extractApiError } from '~/helpers/extractApiError'
import type { ProfileListItem, ProfileMetricsRead } from '~/types/profiles'
import {NuxtLink} from "#components";

const { isAuthenticated } = useAuth()
const { openLogin } = useAuthModals()
const { listProfiles, deleteProfile, getProfileMetrics, listProfileTexts } = useProfiles()

const profiles = ref<ProfileListItem[]>([])
const profileStats = ref<Record<number, { textCount: number; symbolCount: number }>>({})
const isLoading = ref(false)

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

const getNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value)
  }
  return null
}

const pickMetric = (metrics: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (key in metrics) {
      const num = getNumber(metrics[key])
      if (num !== null) {
        return num
      }
    }
  }
  return null
}

const getSymbolCount = (metrics: ProfileMetricsRead | null) => {
  if (!metrics) {
    return 0
  }
  const core = metrics.core_metrics ?? {}
  const additional = metrics.additional_metrics ?? {}
  const keys = [
    'symbols_count',
    'symbol_count',
    'chars_count',
    'char_count',
    'characters_count',
    'characters',
    'length',
  ]
  return (
    pickMetric(core, keys) ??
    pickMetric(additional, keys) ??
    0
  )
}

const loadProfiles = async () => {
  if (!isAuthenticated.value) {
    return
  }
  isLoading.value = true
  try {
    profiles.value = await listProfiles()
    const stats = await Promise.all(
      profiles.value.map(async (profile) => {
        try {
          const [metrics, texts] = await Promise.all([
            getProfileMetrics(profile.id),
            listProfileTexts(profile.id),
          ])
          return [
            profile.id,
            {
              textCount: texts.length,
              symbolCount: getSymbolCount(metrics),
            },
          ] as const
        } catch {
          return [
            profile.id,
            {
              textCount: 0,
              symbolCount: 0,
            },
          ] as const
        }
      }),
    )
    profileStats.value = Object.fromEntries(stats)
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось загрузить профили'))
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (profileId: number) => {
  if (!confirm('Удалить профиль? Действие нельзя отменить.')) {
    return
  }
  try {
    await deleteProfile(profileId)
    profiles.value = profiles.value.filter((profile) => profile.id !== profileId)
    const { [profileId]: _, ...rest } = profileStats.value
    profileStats.value = rest
    toast.success('Профиль удален')
  } catch (error) {
    toast.error(extractApiError(error, 'Не удалось удалить профиль'))
  }
}

const handleStub = (label: string) => {
  toast(label)
}

watchEffect(() => {
  if (isAuthenticated.value) {
    loadProfiles()
  } else {
    profiles.value = []
    profileStats.value = {}
  }
})
</script>

<template>
  <section class="container py-10">
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-sm-text-1">Профили</h1>
        <UiButton
          v-if="isAuthenticated"
          :component="NuxtLink"
          to="/profiles/new"
          theme="brand"
          label="Создать новый"
        />
      </div>

      <div
        v-if="!isAuthenticated"
        class="flex flex-col gap-4 rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-8 text-sm-text-2"
      >
        <div class="text-lg font-semibold text-sm-text-1">Доступно только авторизованным</div>
        <p class="text-sm text-sm-text-3">Войдите в аккаунт, чтобы управлять профилями авторов.</p>
        <div>
          <UiButton theme="brand" label="Войти" @click="openLogin" />
        </div>
      </div>

      <div v-else class="flex flex-col gap-6">
        <div class="text-sm font-semibold uppercase tracking-wide text-sm-text-4">Список профилей</div>
        <div v-if="isLoading" class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-sm-text-3">
          Загружаем профили...
        </div>

        <div
          v-else-if="profiles.length === 0"
          class="rounded-3xl border border-sm-bg-3 bg-sm-bg-2/60 p-8 text-center text-sm-text-3"
        >
          Профили пока не созданы.
        </div>

        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="profile in profiles"
            :key="profile.id"
            class="flex min-h-[300px] flex-col justify-between rounded-3xl border border-sm-bg-3 bg-sm-bg-2/70 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
          >
            <div class="flex flex-col gap-4">
              <div class="text-lg font-semibold text-sm-text-1">
                {{ profile.name }}
              </div>
              <div class="grid grid-cols-2 gap-3 text-xs text-sm-text-3">
                <div class="flex flex-col gap-1">
                  <span class="uppercase tracking-wide text-sm-text-4">Текстов</span>
                  <span class="text-sm font-semibold text-sm-text-2">
                    {{ profileStats[profile.id]?.textCount ?? 0 }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="uppercase tracking-wide text-sm-text-4">Символов</span>
                  <span class="text-sm font-semibold text-sm-text-2">
                    {{ profileStats[profile.id]?.symbolCount ?? 0 }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="uppercase tracking-wide text-sm-text-4">Создан</span>
                  <span class="text-sm font-semibold text-sm-text-2">
                    {{ formatDate(profile.created_at) }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="uppercase tracking-wide text-sm-text-4">Обновлен</span>
                  <span class="text-sm font-semibold text-sm-text-2">
                    {{ formatDate(profile.updated_at) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <UiButton             :component="NuxtLink"
                                    href="/compare" size="sm" theme="accent" label="Сравнить" />
              <UiButton
                size="sm"
                theme="default"
                label="Редактировать"
                :component="NuxtLink"
                :to="`/profiles/${profile.id}/edit`"
              />
              <UiButton
                size="sm"
                theme="ghost"
                label="Тексты"
                :component="NuxtLink"
                :to="`/profiles/${profile.id}/texts`"
              />
              <UiButton size="sm" theme="ghost" label="Удалить" @click="handleDelete(profile.id)" />
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
