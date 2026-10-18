<!-- Composant Drag and Drop -->


<script setup lang="ts">
import { ref } from 'vue'

const files = ref<File[]>([])
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadErrors = ref<string[]>([])
const successMessage = ref('')

const { uploadAndRegister } = useFiles()
const { validateFile } = useFileStorage()

function openFilePicker() {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

function addFiles(selectedFiles: FileList | null) {
  if (!selectedFiles || isUploading.value) return

  for (const file of Array.from(selectedFiles)) {
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
  if (isUploading.value) return
  files.value.splice(index, 1)
}

function clearFiles() {
  if (isUploading.value) return
  files.value = []
  uploadErrors.value = []
  successMessage.value = ''
}


async function uploadSelectedFiles() {
  if (isUploading.value || files.value.length === 0) return

  isUploading.value = true
  uploadErrors.value = []
  successMessage.value = ''

  const successfulFiles: File[] = []
  const errors: string[] = []

  try {
    for (const file of files.value) {
      try {
        validateFile(file)

        const storedFile = await uploadAndRegister(file)

        console.log('Fichier enregistré :', storedFile)
        successfulFiles.push(file)
      } catch (error: unknown) {
        console.error(`Échec de l'upload de ${file.name}:`, error)

        const message = error instanceof Error
          ? error.message
          : JSON.stringify(error)

        errors.push(`${file.name} : ${message || 'Erreur inconnue'}`)
      }
    }

    files.value = files.value.filter(
      file => !successfulFiles.includes(file)
    )

    uploadErrors.value = errors

    if (successfulFiles.length > 0) {
      successMessage.value =
        `${successfulFiles.length} fichier(s) envoyé(s) et enregistré(s) avec succès.`
    }
  } catch (error: unknown) {
    console.error('Erreur inattendue pendant l’upload :', error)
    uploadErrors.value.push(
      error instanceof Error ? error.message : 'Erreur inattendue.'
    )
  } finally {
    isUploading.value = false
  }
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

      <div class="flex flex-wrap justify-end gap-2 border-t border-default p-3">
        <UButton
          label="Tout effacer"
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="isUploading"
          @click="clearFiles"
        />
      
        <UButton
          :label="isUploading ? 'Envoi en cours…' : 'Envoyer les fichiers'"
          :icon="isUploading ? 'i-lucide-loader-circle' : 'i-lucide-upload'"
          :loading="isUploading"
          :disabled="files.length === 0 || isUploading"
          @click="uploadSelectedFiles"
        />
      </div>
    </div>

    <!-- Résultat de l'upload -->
    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      title="Upload réussi"
      :description="successMessage"
      icon="i-lucide-check-circle"
    />

    <UAlert
      v-if="uploadErrors.length > 0"
      color="error"
      variant="subtle"
      title="Échec de l'envoi"
      icon="i-lucide-alert-circle"
    >
      <template #description>
        <ul class="list-disc space-y-1 pl-4">
          <li v-for="(error, index) in uploadErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </template>
    </UAlert>

  </div>
</template>
