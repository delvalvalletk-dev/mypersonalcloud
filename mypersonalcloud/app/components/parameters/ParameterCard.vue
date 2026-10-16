<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated p-5">
    <h2 class="text-lg font-semibold text-default">
      {{ title }}
    </h2>

    <div class="mt-5 space-y-4">
      <slot />
    </div>
  </section>
</template>