
<script setup lang="ts">
import { ref } from 'vue'
import ParameterCard from './ParameterCard.vue'

// Thème sélectionné
type Theme = 'light' | 'dark' | 'system'

const selectedTheme = ref<Theme>('system')

// Options disponibles
const themes = [
  {
    value: 'light' as const,
    label: 'Clair',
    description: 'Une interface lumineuse.',
    icon: 'i-lucide-sun',
  },
  {
    value: 'dark' as const,
    label: 'Sombre',
    description: 'Une interface sombre.',
    icon: 'i-lucide-moon',
  },
  {
    value: 'system' as const,
    label: 'Système',
    description: 'Préférences de votre appareil.',
    icon: 'i-lucide-monitor',
  },
]

// Applique le thème sélectionné
function selectTheme(theme: Theme) {
  selectedTheme.value = theme

  // TODO : appliquer le thème à l'interface.
  // La persistance sera ajoutée ultérieurement.
}
</script>

<template>
  <ParameterCard title="Apparence">
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium text-default">
          Thème de l'interface
        </h3>
        <p class="mt-1 text-sm text-muted">
          Personnalisez l'apparence de votre espace personnel.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          v-for="theme in themes"
          :key="theme.value"
          type="button"
          class="flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition-colors"
          :class="
            selectedTheme === theme.value
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-default hover:bg-elevated'
          "
          :aria-pressed="selectedTheme === theme.value"
          @click="selectTheme(theme.value)"
        >
          <UIcon
            :name="theme.icon"
            class="size-6"
            :class="
              selectedTheme === theme.value
                ? 'text-primary'
                : 'text-muted'
            "
          />

          <div class="space-y-1">
            <p class="text-sm font-semibold text-default">
              {{ theme.label }}
            </p>
            <p class="text-xs text-muted">
              {{ theme.description }}
            </p>
          </div>

          <UIcon
            v-if="selectedTheme === theme.value"
            name="i-lucide-circle-check"
            class="size-5 text-primary"
          />
        </button>
      </div>
    </div>
  </ParameterCard>
</template>
