
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { StoredFile } from '~/composables/useFiles'
import type { StoredFolder } from '~/composables/useFolders'

const props = defineProps<{
  search: string
  files: StoredFile[]
  folders: StoredFolder[]
}>()

const emit = defineEmits<{
  'folder-change': [folderId: string | null]
}>()

type FileItem = {
  id: string
  name: string
  updatedAt: string
  updatedTimestamp: number
  size: string
  sizeBytes: number
  type: string
  parentId: string | null
  storagePath?: string
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Ko`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`

  return `${(bytes / 1024 ** 3).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Go`
}

function getFileType(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase()

  const types: Record<string, string> = {
    pdf: 'pdf',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    ods: 'spreadsheet',
    csv: 'spreadsheet',
    mp4: 'video',
    webm: 'video',
    mov: 'video',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
  }

  return extension ? types[extension] ?? 'file' : 'file'
}

const files = computed<FileItem[]>(() => [
  ...props.folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    updatedAt: formatDate(folder.created_at),
    updatedTimestamp: new Date(folder.created_at).getTime(),
    size: '-',
    sizeBytes: 0,
    type: 'folder',
    parentId: folder.parent_id,
  })),
  ...props.files.map(file => ({
    id: file.id,
    name: file.name,
    updatedAt: formatDate(file.created_at),
    updatedTimestamp: new Date(file.created_at).getTime(),
    size: formatSize(Number(file.size_bytes)),
    sizeBytes: Number(file.size_bytes),
    type: getFileType(file.name),
    parentId: file.folder_id,
    storagePath: file.storage_path,
  })),
])

const columns: TableColumn<FileItem>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'updatedAt', header: 'Modifié' },
  { accessorKey: 'size', header: 'Taille' },
]

// Navigation dans l'arborescence
const currentFolderId = ref<string | null>(null)
const folderHistory = ref<{ id: string | null; name: string }[]>([])

const currentFolderName = computed(() => {
  if (currentFolderId.value === null) return 'Mes fichiers'

  return files.value.find(file => file.id === currentFolderId.value)?.name
    ?? 'Dossier'
})

const currentFiles = computed(() => {
  const query = props.search.trim().toLocaleLowerCase('fr')

  return files.value.filter(file => {
    const isInCurrentFolder = file.parentId === currentFolderId.value
    const matchesSearch = !query
      || file.name.toLocaleLowerCase('fr').includes(query)

    return isInCurrentFolder && matchesSearch
  })
})

// Tri
type SortKey = 'name' | 'updatedTimestamp' | 'sizeBytes'
const sortKey = ref<SortKey>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedFiles = computed(() => {
  return [...currentFiles.value].sort((a, b) => {
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
    name: currentFolderName.value,
  })

  currentFolderId.value = folder.id
  emit('folder-change', currentFolderId.value)
}

function goBack() {
  const previous = folderHistory.value.pop()

  if (previous) {
    currentFolderId.value = previous.id
    emit('folder-change', currentFolderId.value)
  }
}

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
    folder: 'i-lucide-folder',
    pdf: 'i-lucide-file-text',
    spreadsheet: 'i-lucide-file-spreadsheet',
    video: 'i-lucide-file-video',
    image: 'i-lucide-file-image',
    file: 'i-lucide-file',
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