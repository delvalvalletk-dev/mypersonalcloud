```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type FileItem = {
  id: number
  name: string
  updatedAt: string
  updatedTimestamp: number
  size: string
  sizeBytes: number
  type: string
  parentId: number | null
}

// Données de test organisées en arborescence
const files = ref<FileItem[]>([
  { id: 1, name: 'Documents', updatedAt: 'Hier', updatedTimestamp: 20261010, size: '-', sizeBytes: 0, type: 'folder', parentId: null },
  { id: 2, name: 'Photos', updatedAt: '12 sept.', updatedTimestamp: 20260912, size: '-', sizeBytes: 0, type: 'folder', parentId: null },
  { id: 3, name: 'Projets', updatedAt: '3 oct.', updatedTimestamp: 20261003, size: '-', sizeBytes: 0, type: 'folder', parentId: null },
  { id: 4, name: 'Sauvegardes', updatedAt: '28 août', updatedTimestamp: 20260828, size: '-', sizeBytes: 0, type: 'folder', parentId: null },
  { id: 5, name: 'CV-2026.pdf', updatedAt: '5 oct.', updatedTimestamp: 20261005, size: '212 Ko', sizeBytes: 212 * 1024, type: 'pdf', parentId: null },
  { id: 6, name: 'budget.xlsx', updatedAt: '1 oct.', updatedTimestamp: 20261001, size: '48 Ko', sizeBytes: 48 * 1024, type: 'spreadsheet', parentId: null },
  { id: 7, name: 'vacances.mp4', updatedAt: '14 août', updatedTimestamp: 20260814, size: '1,2 Go', sizeBytes: 1.2 * 1024 ** 3, type: 'video', parentId: null },

  // Contenu de démonstration du dossier Documents
  { id: 8, name: 'Cours', updatedAt: 'Hier', updatedTimestamp: 20261010, size: '-', sizeBytes: 0, type: 'folder', parentId: 1 },
  { id: 9, name: 'Rapport.pdf', updatedAt: 'Aujourd’hui', updatedTimestamp: 20261011, size: '350 Ko', sizeBytes: 350 * 1024, type: 'pdf', parentId: 1 },
  { id: 10, name: 'Notes.txt', updatedAt: '9 oct.', updatedTimestamp: 20261009, size: '8 Ko', sizeBytes: 8 * 1024, type: 'file', parentId: 1 },

  // Contenu du dossier Photos
  { id: 11, name: 'Anniversaire', updatedAt: '10 sept.', updatedTimestamp: 20260910, size: '-', sizeBytes: 0, type: 'folder', parentId: 2 },
  { id: 12, name: 'photo.jpg', updatedAt: '12 sept.', updatedTimestamp: 20260912, size: '2,4 Mo', sizeBytes: 2.4 * 1024 ** 2, type: 'image', parentId: 2 }
])

const columns: TableColumn<FileItem>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'updatedAt', header: 'Modifié' },
  { accessorKey: 'size', header: 'Taille' }
]

// Navigation entre dossiers
const currentFolderId = ref<number | null>(null)
const folderHistory = ref<{ id: number | null; name: string }[]>([])

const currentFolderName = computed(() => {
  if (currentFolderId.value === null) return 'Mes fichiers'

  return files.value.find(file => file.id === currentFolderId.value)?.name
    ?? 'Dossier'
})

const currentFiles = computed(() =>
  files.value.filter(file => file.parentId === currentFolderId.value)
)

// Tri
type SortKey = 'name' | 'updatedTimestamp' | 'sizeBytes'
const sortKey = ref<SortKey>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedFiles = computed(() => {
  return [...currentFiles.value].sort((a, b) => {
    // Afficher les dossiers avant les fichiers
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1

    const comparison =
      sortKey.value === 'name'
        ? a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        : sortKey.value === 'updatedTimestamp'
          ? a.updatedTimestamp - b.updatedTimestamp
          : a.sizeBytes - b.sizeBytes

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

function openFolder(folder: FileItem) {
  if (folder.type !== 'folder') return

  folderHistory.value.push({
    id: currentFolderId.value,
    name: currentFolderName.value
  })

  currentFolderId.value = folder.id
}

function goBack() {
  const previous = folderHistory.value.pop()

  if (previous) {
    currentFolderId.value = previous.id
  }
}

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
    folder: 'i-lucide-folder',
    pdf: 'i-lucide-file-text',
    spreadsheet: 'i-lucide-file-spreadsheet',
    video: 'i-lucide-file-video',
    image: 'i-lucide-file-image',
    file: 'i-lucide-file'
  }

  return icons[type] ?? 'i-lucide-file'
}

function getSortIcon(key: SortKey) {
  if (sortKey.value !== key) return 'i-lucide-arrow-up-down'

  return sortDirection.value === 'asc'
    ? 'i-lucide-arrow-up'
    : 'i-lucide-arrow-down'
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Navigation dans l'arborescence -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-if="currentFolderId !== null"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="goBack"
      >
        Retour
      </UButton>

      <UIcon name="i-lucide-folder-open" class="size-5 text-primary" />

      <span class="text-sm font-semibold text-default">
        {{ currentFolderName }}
      </span>

      <span class="text-xs text-muted">
        {{ sortedFiles.length }} élément{{ sortedFiles.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Tableau -->
    <div class="overflow-hidden rounded-xl border border-default bg-default">
      <UTable
        :data="sortedFiles"
        :columns="columns"
        :ui="{
          root: 'w-full',
          thead: 'bg-elevated/50',
          th: 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted',
          td: 'px-4 py-3.5 text-sm',
          tr: 'transition-colors hover:bg-elevated/50'
        }"
      >
        <template #name-header>
          <button
            class="inline-flex items-center gap-2"
            @click="toggleSort('name')"
          >
            Nom
            <UIcon :name="getSortIcon('name')" class="size-3.5" />
          </button>
        </template>

        <template #updatedAt-header>
          <button
            class="inline-flex items-center gap-2"
            @click="toggleSort('updatedTimestamp')"
          >
            Modifié
            <UIcon :name="getSortIcon('updatedTimestamp')" class="size-3.5" />
          </button>
        </template>

        <template #size-header>
          <button
            class="inline-flex items-center gap-2"
            @click="toggleSort('sizeBytes')"
          >
            Taille
            <UIcon :name="getSortIcon('sizeBytes')" class="size-3.5" />
          </button>
        </template>

        <template #name-cell="{ row }">
          <button
            class="flex min-w-0 items-center gap-3 text-left"
            :class="row.original.type === 'folder'
              ? 'cursor-pointer'
              : 'cursor-default'"
            :disabled="row.original.type !== 'folder'"
            @click="openFolder(row.original)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg"
              :class="row.original.type === 'folder'
                ? 'bg-primary/10 text-primary'
                : 'bg-elevated text-muted'"
            >
              <UIcon
                :name="getFileIcon(row.original.type)"
                class="size-5"
              />
            </span>

            <span
              class="truncate font-medium"
              :class="row.original.type === 'folder'
                ? 'text-primary hover:underline'
                : 'text-default'"
            >
              {{ row.original.name }}
            </span>
          </button>
        </template>

        <template #updatedAt-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.updatedAt }}
          </span>
        </template>

        <template #size-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.size }}
          </span>
        </template>
      </UTable>

      <div
        v-if="sortedFiles.length === 0"
        class="px-4 py-10 text-center text-sm text-muted"
      >
        Ce dossier est vide.
      </div>
    </div>
  </div>
</template>
```