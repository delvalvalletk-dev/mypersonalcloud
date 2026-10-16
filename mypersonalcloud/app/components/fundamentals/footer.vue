<!-- Composant Footer -->

<script setup lang="ts">
import { computed, ref } from 'vue'

// Valeurs de démonstration, à remplacer par les données réelles
const usedStorage = ref(38.4)
const totalStorage = ref(100)

const usagePercentage = computed(() => {
  if (totalStorage.value <= 0) return 0

  return Math.min(
    100,
    (usedStorage.value / totalStorage.value) * 100
  )
})

const storageColor = computed(() => {
  if (usagePercentage.value >= 90) return 'error'
  if (usagePercentage.value >= 75) return 'warning'

  return 'primary'
})

const formattedUsage = computed(() =>
  usedStorage.value.toLocaleString('fr-FR', {
    maximumFractionDigits: 1
  })
)
</script>

<template>
  <footer
    class="flex flex-col gap-5 border-t border-default pt-5
           text-sm text-muted
           md:flex-row md:items-center md:justify-between"
  >
    <!-- Jauge de stockage -->
    <div class="flex w-full max-w-xs flex-col gap-2">
      <div class="flex items-center justify-between gap-3">
        <span>Stockage utilisé</span>

        <span class="font-medium text-default">
          {{ formattedUsage }}
          <span class="font-normal text-muted">
            / {{ totalStorage }} Go
          </span>
        </span>
      </div>

      <UProgress
        :model-value="usagePercentage"
        :color="storageColor"
        size="sm"
        aria-label="Pourcentage de stockage utilisé"
      />

      <p
        v-if="usagePercentage >= 90"
        class="text-xs text-error"
      >
        Attention, votre espace de stockage est presque plein.
      </p>
    </div>

    <!-- Mentions légales et GitHub -->
    <div
      class="flex flex-col gap-3
             sm:flex-row sm:items-center sm:gap-6"
    >
      <span class="text-xs">
        © 2026 MyPersonalCloud. Tous droits réservés.
      </span>

      <a
        href="https://github.com/delvalvalletk-dev/mypersonalcloud"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex w-fit items-center gap-2
               transition-colors hover:text-default"
      >
        <UIcon
          name="i-simple-icons-github"
          class="size-4"
        />

        <span>GitHub</span>

        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-3.5 opacity-60"
        />
      </a>
    </div>
  </footer>
</template>
