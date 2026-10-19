<script setup lang="ts">
defineProps<{
  url: string
  mimeType: string | null
  fileName: string
}>()
</script>

<template>
  <div class="w-full">
    <img
      v-if="mimeType?.startsWith('image/')"
      :src="url"
      :alt="fileName"
      class="mx-auto max-h-[75vh] max-w-full rounded-lg object-contain"
    />

    <iframe
      v-else-if="mimeType === 'application/pdf'"
      :src="url"
      :title="fileName"
      class="h-[75vh] w-full rounded-lg border"
    />

    <video
      v-else-if="mimeType?.startsWith('video/')"
      :src="url"
      controls
      class="mx-auto max-h-[75vh] max-w-full rounded-lg"
    />

    <audio
      v-else-if="mimeType?.startsWith('audio/')"
      :src="url"
      controls
      class="w-full"
    />

    <div v-else class="py-12 text-center">
      <UIcon
        name="i-lucide-file-question"
        class="mb-4 size-12 text-gray-400"
      />

      <p class="font-medium">
        Aperçu indisponible
      </p>

      <p class="mt-2 text-sm text-gray-500">
        Ce format ne peut pas être affiché directement.
      </p>
    </div>
  </div>
</template>