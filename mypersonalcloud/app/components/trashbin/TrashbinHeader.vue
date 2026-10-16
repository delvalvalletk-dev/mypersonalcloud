<script setup lang="ts">
const emit = defineEmits<{
  empty: []
}>()
</script>

<template>
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0 space-y-7 p-5 md:p-8"
  >
    <!-- Header de la corbeille -->
    <section class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-default md:text-3xl">
        Corbeille
      </h1>

      <p class="text-sm text-muted">
        Consultez et gérez vos fichiers et dossiers supprimés.
      </p>
    </section>

    <!-- Actions -->
    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <UButton
        label="Téléverser"
        icon="i-lucide-upload-cloud"
        color="primary"
        variant="soft"
        @click="navigateTo('/')"
      />

      <UButton
        label="Vider la corbeille"
        icon="i-lucide-trash-2"
        color="error"
        variant="outline"
        @click="emit('empty')"
      />
    </div>
  </div>
</template>
