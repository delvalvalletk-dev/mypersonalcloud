<!-- Composant Header -->

<script setup lang="ts">
</script>

<template>
  <header
    class="flex items-center justify-between border-b border-default pb-4"
  >
    <!-- Titre du site web -->
    <div class="flex items-center gap-3">
      <UIcon
        name="i-lucide-cloud"
        class="size-10 text-primary"
      />
      <span class="text-3xl font-bold tracking-tight">
        MyPersonalCloud
      </span>
    </div>

    <!-- Placeholder bouton parametres -->
    <div class="flex items-center gap-2">
      <UButton
        icon="i-lucide-settings"
        color="neutral"
        variant="ghost"
        aria-label="Paramètres"
        to="/parametres"
      />
    </div>
  </header>
</template>
