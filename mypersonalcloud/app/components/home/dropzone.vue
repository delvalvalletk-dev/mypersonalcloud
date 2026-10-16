<!-- Composant Drag and Drop -->

<script setup lang="ts">
import { ref } from 'vue'

// liste des fichiers
const files = ref<File[]>([])
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

function addFiles(selectedFiles: FileList | null) {
  if (!selectedFiles) return

  const newFiles = Array.from(selectedFiles)

  // Évite les doublons de noms et de tailles
  for (const file of newFiles) {
    const alreadyExists = files.value.some(
      existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    )

    if (!alreadyExists) {
      files.value.push(file)
    }
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  addFiles(event.dataTransfer?.files ?? null)
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

function formatSize(size: number) {
  if (size < 1024) return `${size} o`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Zone de dépôt -->
    <div
      role="button"
      tabindex="0"
      class="group flex min-h-48 cursor-pointer flex-col items-center
             justify-center gap-3 rounded-xl border-2 border-dashed
             p-8 text-center transition-all duration-200"
      :class="isDragging
        ? 'border-primary bg-primary/10 scale-[1.01]'
        : 'border-default bg-elevated/30 hover:border-primary hover:bg-primary/5'"
      @click="openFilePicker"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="(event) => {
          addFiles((event.target as HTMLInputElement).files)
          ;(event.target as HTMLInputElement).value = ''
        }"
      />

      <div
        class="flex size-14 items-center justify-center rounded-2xl
               bg-primary/10 text-primary transition-transform duration-200
               group-hover:scale-105"
      >
        <UIcon
          :name="isDragging ? 'i-lucide-download' : 'i-lucide-upload-cloud'"
          class="size-8"
        />
      </div>

      <div class="flex flex-col gap-1">
        <p class="font-medium text-default">
          {{ isDragging
            ? 'Déposez vos fichiers ici'
            : 'Glissez vos fichiers ici pour les ajouter' }}
        </p>

        <p class="text-sm text-muted">
          ou sélectionnez des fichiers depuis votre ordinateur
        </p>
      </div>

      <UButton
        label="Choisir des fichiers"
        icon="i-lucide-file-up"
        color="primary"
        variant="soft"
        class="pointer-events-none mt-1"
      />
    </div>

    <!-- Fichiers selectionnés -->
    <div
      v-if="files.length > 0"
      class="overflow-hidden rounded-xl border border-default"
    >
      <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
        <h3 class="text-sm font-semibold text-default">
          Fichiers sélectionnés
        </h3>

        <span class="text-xs text-muted">
          {{ files.length }} fichier{{ files.length > 1 ? 's' : '' }}
        </span>
      </div>

      <ul class="divide-y divide-default">
        <li
          v-for="(file, index) in files"
          :key="`${file.name}-${file.size}-${file.lastModified}`"
          class="flex items-center gap-3 px-4 py-3"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
            <UIcon name="i-lucide-file" class="size-5 text-muted" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-default">
              {{ file.name }}
            </p>
            <p class="text-xs text-muted">
              {{ formatSize(file.size) }}
            </p>
          </div>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="`Retirer ${file.name}`"
            @click="removeFile(index)"
          />
        </li>
      </ul>

      <div class="flex justify-end border-t border-default p-3">
        <UButton
          label="Tout effacer"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="files = []"
        />
      </div>
    </div>
  </div>
</template>
