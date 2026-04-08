<script setup lang="ts">
import { computed } from 'vue'
import MovingTextLane from './MovingTextLane.vue'
import texts from "~/components/modules/landing/moving-text/texts";

type LaneDirection = 'left' | 'right'
type TextTone = 'primary' | 'secondary' | 'accent'

interface WordToken {
  value: string
  tone: TextTone
}

interface Lane {
  id: number
  words: WordToken[]
  direction: LaneDirection
  duration: number
  delay: string
  gap?: string
}

interface Props {
  primaryTextColor?: string
  secondaryTextColor?: string
  accentTextColor?: string
  texts?: string[]
  rotateDeg?: number
  animationSpeed?: number
  laneCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  primaryTextColor: '#FFFFFF',
  secondaryTextColor: '#9A9A9A',
  accentTextColor: '#FF650E',
  texts: texts,
  rotateDeg: -45,
  animationSpeed: 256,
  laneCount: 48,
})

const rootStyle = computed<Record<string, string>>(() => ({
  '--mt-primary': props.primaryTextColor,
  '--mt-secondary': props.secondaryTextColor,
  '--mt-accent': props.accentTextColor,
  '--mt-rotate': `${props.rotateDeg}deg`,
}))

const sourceTexts = computed<string[]>(() => {
  return props.texts.length ? props.texts : ['Animated text background']
})

const splitWords = (text: string): string[] => {
  return text
      .trim()
      .split(' ')
      .map((word) => word.trim())
      .filter(Boolean)
}

const tokenizeText = (text: string, laneIndex: number): WordToken[] => {
  const words = splitWords(text)

  return words.map((word, wordIndex) => {
    const primarySeed = (laneIndex * 13 + wordIndex) % 17
    const accentSeed = (laneIndex * 29 + wordIndex) % 53

    if (accentSeed === 0) {
      return {
        value: word,
        tone: 'accent',
      }
    }

    if (primarySeed === 3 || primarySeed === 11) {
      return {
        value: word,
        tone: 'primary',
      }
    }

    return {
      value: word,
      tone: 'secondary',
    }
  })
}

const lanes = computed<Lane[]>(() => {
  return Array.from({ length: props.laneCount }, (_, index) => {
    const text = sourceTexts.value[index % sourceTexts.value.length]
    const durationFactor = 0.8 + (index % 16) * 0.16

    return {
      id: index,
      words: tokenizeText(text, index),
      direction: Math.floor(Math.random() * 100) % 2 === 0 ? 'left' : 'right',
      duration: Number((props.animationSpeed * durationFactor).toFixed(2)),
      delay: `-${(index % 4) * 2.75}s`,
    }
  })
})
</script>

<template>
  <div
      class="moving-text-bg"
      :style="rootStyle"
      aria-hidden="true"
  >
    <div class="moving-text-bg__rotator">
      <MovingTextLane
          v-for="lane in lanes"
          :key="lane.id"
          :words="lane.words"
          :direction="lane.direction"
          :duration="lane.duration"
          :delay="lane.delay"
          :gap="lane.gap"
      />
    </div>
  </div>
</template>

<style scoped>
.moving-text-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.75) 75%, transparent 100%);
}

.moving-text-bg__rotator {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: calc(max(100vh, 100vw) * 1.5);
  transform: rotate(var(--mt-rotate));
  transform-origin: center;
}
</style>