<script setup lang="ts">
import { computed } from 'vue'

type TextTone = 'primary' | 'secondary' | 'accent'
type LaneDirection = 'left' | 'right'

interface WordToken {
  value: string
  tone: TextTone
}

interface Props {
  words: WordToken[]
  direction?: LaneDirection
  duration?: number
  delay?: string
  gap?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left',
  duration: 24,
  delay: '0s',
})

const laneStyle = computed<Record<string, string>>(() => ({
  '--lane-duration': `${props.duration}s`,
  '--lane-delay': props.delay,
  '--lane-gap': '8px',
}))
</script>

<template>
  <div
      class="moving-text-lane"
      :class="`moving-text-lane--${direction}`"
      :style="laneStyle"
  >
    <div class="moving-text-lane__marquee">
      <div
          v-for="copyIndex in 2"
          :key="copyIndex"
          class="moving-text-lane__copy"
          :aria-hidden="copyIndex === 2"
      >
        <span
            v-for="(word, index) in words"
            :key="`${copyIndex}-${word.value}-${index}`"
            class="moving-text-lane__word"
            :class="`is-${word.tone}`"
        >
          {{ word.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moving-text-lane {
  position: relative;
  width: 100%;
  overflow: hidden;
  opacity: 0.25;

  transition: 0.15s opacity;
  user-select: none;
}

.moving-text-lane:hover {
  opacity: 1
}

.moving-text-lane__marquee {
  display: flex;
  width: max-content;
  will-change: transform;
}

.moving-text-lane--left .moving-text-lane__marquee {
  animation: lane-left var(--lane-duration) linear infinite;
  animation-delay: var(--lane-delay);
}

.moving-text-lane--right .moving-text-lane__marquee {
  animation: lane-right var(--lane-duration) linear infinite;
  animation-delay: var(--lane-delay);
}

.moving-text-lane__copy {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  padding-right: var(--lane-gap);
}

.moving-text-lane__word {
  font-size: clamp(1.25rem, 2vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: 0.03em;
  white-space: nowrap;
  text-transform: uppercase;
  color: var(--mt-secondary);
  font-weight: 400;
}

.moving-text-lane__word.is-primary {
  color: var(--mt-primary);
  font-weight: 500;
}

.moving-text-lane__word.is-accent {
  color: var(--mt-accent);
  font-weight: 700;
}

@keyframes lane-left {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@keyframes lane-right {
  from {
    transform: translateX(-50%);
  }

  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .moving-text-lane--left .moving-text-lane__marquee,
  .moving-text-lane--right .moving-text-lane__marquee {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }
}
</style>