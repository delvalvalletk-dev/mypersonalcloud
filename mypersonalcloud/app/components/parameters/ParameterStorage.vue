<!-- Composant de la carte stockage pour les paramètres -->

<script setup lang="ts">
import { computed, ref } from 'vue'

// informations sur le stockage, passe en props dans le futur
const usedStorage = ref(38.4)
const totalStorage = ref(100)

// variable dynamique pourcentage dépendante de l'espace de stockage
const usagePercentage = computed(() => {
  if (totalStorage.value <= 0) return 0

  return Math.min(
    100,
    (usedStorage.value / totalStorage.value) * 100
  )
})

// variable dynamique du stockage restant
const availableStorage = computed(() =>
  Math.max(0, totalStorage.value - usedStorage.value)
)

/*
variable dynamique de la couleur de la barre de stockage dépendante du pourcentage
d'utilisation du stockage actuel
*/
const progressColor = computed(() => {
  if (usagePercentage.value >= 90) return 'error'
  if (usagePercentage.value >= 75) return 'warning'

  return 'primary'
})

// formattage du stockage
function formatStorage(value: number) {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 1
  })
}
</script>

<template>
  <ParameterCard title="Stockage">
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-muted">
          Espace utilisé
        </span>

        <span class="text-sm font-medium text-default">
          {{ formatStorage(usedStorage) }} Go
          <span class="font-normal text-muted">
            / {{ formatStorage(totalStorage) }} Go
          </span>
        </span>
      </div>

      <UProgress
        :model-value="usagePercentage"
        :color="progressColor"
        size="md"
        aria-label="Pourcentage de stockage utilisé"
      />

      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-muted">
          {{ formatStorage(availableStorage) }} Go disponibles
        </span>

        <span class="font-medium text-default">
          {{ Math.round(usagePercentage) }} %
        </span>
      </div>

      <p
        v-if="usagePercentage >= 90"
        class="flex items-center gap-2 text-sm text-error"
      >
        <UIcon name="i-lucide-triangle-alert" class="size-4 shrink-0" />
        Votre espace de stockage est presque plein.
      </p>
    </div>
  </ParameterCard>
</template>
