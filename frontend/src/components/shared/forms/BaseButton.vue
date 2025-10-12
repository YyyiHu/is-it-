<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false
})

const emit = defineEmits<Emits>()

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 border-2 font-theme-medium transition-theme-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed rounded-theme-lg'
  
  let variant = ''
  let size = ''
  let width = props.fullWidth ? 'w-full' : ''
  
  // Variant styles using global theme classes
  switch (props.variant) {
    case 'primary':
      variant = isDisabled.value
        ? 'bg-theme-grey border-theme-grey text-theme-tertiary'
        : 'bg-theme-accent border-theme-accent text-theme-white hover:bg-theme-accent-hover hover:border-theme-accent-hover focus:ring-theme-accent'
      break
    case 'secondary':
      variant = isDisabled.value
        ? 'bg-transparent border-theme-grey text-theme-tertiary'
        : 'bg-transparent border-theme-primary text-theme-secondary hover:bg-theme-tertiary hover:border-theme-accent focus:ring-theme-accent'
      break
    case 'danger':
      variant = isDisabled.value
        ? 'bg-theme-grey border-theme-grey text-theme-tertiary'
        : 'bg-theme-error border-theme-error text-theme-white hover:bg-red-600 hover:border-red-600 focus:ring-theme-error'
      break
    case 'ghost':
      variant = isDisabled.value
        ? 'bg-transparent border-transparent text-theme-tertiary'
        : 'bg-transparent border-transparent text-theme-secondary hover:bg-theme-tertiary focus:ring-theme-accent'
      break
  }
  
  // Size styles
  switch (props.size) {
    case 'sm':
      size = 'px-3 py-1.5 text-sm'
      break
    case 'lg':
      size = 'px-6 py-3 text-lg'
      break
    default: // md
      size = 'px-4 py-2.5 text-base'
  }
  
  return `${base} ${variant} ${size} ${width}`
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    
    <!-- Button content -->
    <slot />
  </button>
</template>
