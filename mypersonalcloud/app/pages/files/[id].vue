<script setup lang="ts">
import type { StoredFile } from '~/composables/useFiles'

const route = useRoute()
const router = useRouter()

const { getFileById } = useFiles()
const { getPreviewUrl, canPreview } = useFilePreview()
const { downloadFile } = useFileStorage()
const downloading = ref(false)

const file = ref<StoredFile | null>(null)
const previewUrl = ref<string | null>(null)
const loading = ref(true)
const errorMessage = ref<string | null>(null)

const fileId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const isPreviewable = computed(() =>
  file.value ? canPreview(file.value.mime_type) : false,
)

async function downloadCurrentFile() {
  if (!file.value || downloading.value) return

  downloading.value = true

  try {
    const blob = await downloadFile(file.value.storage_path)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = file.value.name
    link.click()

    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  } catch (error) {
    // À remplacer idéalement par un toast pour ne pas masquer l'aperçu.
    console.error('Erreur lors du téléchargement :', error)
  } finally {
    downloading.value = false
  }
}

async function loadPreview() {
  loading.value = true
  errorMessage.value = null
  file.value = null
  previewUrl.value = null

  try {
    if (!fileId.value) {
      throw new Error('Identifiant de fichier invalide.')
    }

    const result = await getFileById(fileId.value)
    file.value = result

    if (canPreview(result.mime_type)) {
      previewUrl.value = await getPreviewUrl(result.storage_path)
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Impossible de charger ce fichier.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPreview)

watch(fileId, loadPreview)

async function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    await navigateTo('/files')
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-6 p-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <UButton
        label="Retour aux fichiers"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="goBack"
      />

      <h1 class="text-xl font-semibold">
        {{ file?.name ?? 'Prévisualisation' }}
      </h1>
    </div>

    <div
      v-if="loading"
      class="flex min-h-64 items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin"
      />
    </div>

    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      title="Impossible d'ouvrir le fichier"
      :description="errorMessage"
    />

    <div v-else-if="file" class="space-y-4">
      <div
        v-if="isPreviewable && previewUrl"
        class="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
      >
        <FilePreview
          :url="previewUrl"
          :mime-type="file.mime_type"
          :file-name="file.name"
        />
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="Aperçu indisponible"
        description="Ce fichier est accessible, mais son format ne fait pas partie des formats prévisualisables."
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-gray-500">
          {{ file.mime_type ?? 'Type inconnu' }}
        </div>

        <UButton
          label="Télécharger"
          icon="i-lucide-download"
          :loading="downloading"
          :disabled="downloading"
          @click="downloadCurrentFile"
        />
      </div>
    </div>
  </div>
</template>