<!-- Composant principal de la page Accueil / Home -->

<script setup lang="ts">
import DropZone from './dropzone.vue'
import TableView from './tableview.vue'
import { computed, onMounted, ref } from 'vue'
import { useFiles } from '~/composables/useFiles'
import { useFolders } from '~/composables/useFolders'
import type { StoredFile } from '~/composables/useFiles'
import type { StoredFolder } from '~/composables/useFolders'

const search = ref('')
const showCreateFolder = ref(false)
const folderName = ref('')

const files = ref<StoredFile[]>([])
const folders = ref<StoredFolder[]>([])

const isLoading = ref(true)
const loadError = ref('')
const isCreatingFolder = ref(false)
const createFolderError = ref('')

const currentFolderId = ref<string | null>(null)

const { getFiles } = useFiles()
const { getFolders, createFolder: saveFolder } = useFolders()

const totalItems = computed(() => files.value.length + folders.value.length)
const hasSearch = computed(() => search.value.trim().length > 0)

async function loadItems() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [loadedFiles, loadedFolders] = await Promise.all([
      getFiles(),
      getFolders(),
    ])

    files.value = loadedFiles
    folders.value = loadedFolders
  } catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : 'Une erreur est survenue pendant le chargement.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadItems)

function openCreateFolder() {
  folderName.value = ''
  createFolderError.value = ''
  showCreateFolder.value = true
}

async function createFolder() {
  const name = folderName.value.trim()

  if (!name || isCreatingFolder.value) return

  isCreatingFolder.value = true
  createFolderError.value = ''

  try {
    await saveFolder(name, currentFolderId.value)

    // Recharger les données depuis Supabase pour garder
    // le tableau synchronisé avec la base de données.
    await loadItems()

    if (loadError.value) {
      throw new Error(loadError.value)
    }

    showCreateFolder.value = false
    folderName.value = ''
  } catch (error) {
    createFolderError.value = error instanceof Error
      ? error.message
      : 'Impossible de créer le dossier.'
  } finally {
    isCreatingFolder.value = false
  }
}
</script>

<template>
  <main class="min-w-0 flex-1 space-y-8 p-5 md:p-8">
    <!-- En-tête de la page -->
    <section
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight text-default md:text-3xl">
          Mes fichiers
        </h1>

        <p class="text-sm text-muted">
          Retrouvez et organisez vos fichiers et dossiers.
        </p>
      </div>

      <UButton
        icon="i-lucide-folder-plus"
        color="primary"
        size="lg"
        class="shrink-0 justify-center rounded-xl"
        @click="openCreateFolder"
      >
        Nouveau dossier
      </UButton>
    </section>

    <!-- Téléversement -->
    <section aria-label="Ajouter des fichiers">
      <DropZone
        :folder-id="currentFolderId"
        @uploaded="loadItems"
      />
    </section>

    <!-- Recherche -->
    <section aria-label="Rechercher dans les fichiers">
      <UInput
        v-model="search"
        size="lg"
        variant="outline"
        placeholder="Rechercher un fichier ou un dossier..."
        aria-label="Rechercher un fichier ou un dossier"
        class="w-full max-w-xl"
        :ui="{
          root: 'w-full',
          base: 'rounded-xl',
        }"
      >
        <template #leading>
          <UIcon name="i-lucide-search" class="size-5 text-muted" />
        </template>

        <template #trailing>
          <UButton
            v-if="hasSearch"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-x"
            aria-label="Effacer la recherche"
            @click="search = ''"
          />
        </template>
      </UInput>
    </section>

    <!-- Liste des fichiers -->
    <section class="space-y-4">
      <div
        class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-default">
            {{ hasSearch ? 'Résultats de recherche' : 'Tous les fichiers' }}
          </h2>

          <p class="text-sm text-muted">
            {{ hasSearch
              ? `Recherche : « ${search.trim()} »`
              : 'Consultez vos fichiers et dossiers.' }}
          </p>
        </div>

        <span class="text-sm text-muted">
          {{ totalItems }} élément{{ totalItems > 1 ? 's' : '' }}
        </span>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-2 py-10"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin"
        />
        <span class="text-sm text-muted">
          Chargement de vos fichiers...
        </span>
      </div>

      <UAlert
        v-else-if="loadError"
        color="error"
        variant="subtle"
        title="Impossible de charger vos fichiers"
        :description="loadError"
      >
        <template #footer>
          <UButton
            size="sm"
            color="error"
            variant="outline"
            @click="loadItems"
          >
            Réessayer
          </UButton>
        </template>
      </UAlert>

      <TableView
        v-else
        :search="search"
        :files="files"
        :folders="folders"
        @folder-change="currentFolderId = $event"
      />
    </section>

    <!-- Création d'un dossier -->
    <UModal v-model:open="showCreateFolder">
      <template #content>
        <div class="space-y-5 p-6">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-default">
              Créer un dossier
            </h2>

            <p class="text-sm text-muted">
              Choisissez un nom pour votre nouveau dossier.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="createFolder">
            <UFormField label="Nom du dossier" name="folderName">
              <UInput
                v-model="folderName"
                autofocus
                placeholder="Ex. : Mes documents"
                class="w-full"
                :ui="{ base: 'rounded-xl' }"
                :disabled="isCreatingFolder"
              />
            </UFormField>

            <UAlert
              v-if="createFolderError"
              color="error"
              variant="subtle"
              title="Création impossible"
              :description="createFolderError"
            />

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                type="button"
                :disabled="isCreatingFolder"
                @click="showCreateFolder = false"
              >
                Annuler
              </UButton>

              <UButton
                type="submit"
                icon="i-lucide-folder-plus"
                :loading="isCreatingFolder"
                :disabled="!folderName.trim() || isCreatingFolder"
              >
                Créer le dossier
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </main>
</template>