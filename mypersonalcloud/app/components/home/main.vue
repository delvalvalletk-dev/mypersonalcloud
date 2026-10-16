<!-- Composant principal de la page Accueil / Home -->

<script setup lang="ts">
import { computed, ref } from 'vue'
import DropZone from './dropzone.vue'
import FileTable from './tableview.vue'

const search = ref('')
const showCreateFolder = ref(false)
const folderName = ref('')

// À remplacer par les données réelles du tableau
const totalItems = 7

const hasSearch = computed(() => search.value.trim().length > 0)

function openCreateFolder() {
  folderName.value = ''
  showCreateFolder.value = true
}

function createFolder() {
  const name = folderName.value.trim()

  if (!name) return

  // TODO : ajouter le dossier aux données de FileTable
  // puis, plus tard, l'enregistrer dans Supabase.

  console.log('Création du dossier :', name)
  showCreateFolder.value = false
  folderName.value = ''
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
      <DropZone />
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
          base: 'rounded-xl'
        }"
      >
        <template #leading>
          <UIcon
            name="i-lucide-search"
            class="size-5 text-muted"
          />
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
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
          {{ totalItems }} éléments
        </span>
      </div>

      <FileTable :search="search" />
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
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                type="button"
                @click="showCreateFolder = false"
              >
                Annuler
              </UButton>

              <UButton
                type="submit"
                icon="i-lucide-folder-plus"
                :disabled="!folderName.trim()"
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
