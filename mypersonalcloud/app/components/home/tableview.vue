
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { StoredFile } from '~/composables/useFiles'
import type { StoredFolder } from '~/composables/useFolders'

const downloadingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')
const showDeleteDialog = ref(false)
const fileToDelete = ref<FileItem | null>(null)
const deleteSuccess = ref('')

const showRenameDialog = ref(false)
const folderToRename = ref<FileItem | null>(null)
const newFolderName = ref('')
const isRenamingFolder = ref(false)
const renameError = ref('')

const showDeleteFolderDialog = ref(false)
const folderToDelete = ref<FileItem | null>(null)
const deletingFolderId = ref<string | null>(null)
const deleteFolderError = ref('')

const props = defineProps<{
  search: string
  files: StoredFile[]
  folders: StoredFolder[]
  currentFolderId: string | null
}>()

const emit = defineEmits<{
  'folder-change': [folderId: string | null]
  'file-deleted': []
  'items-changed': []
}>()

const { downloadFile } = useFileStorage()
const { deleteAndUnregister } = useFiles()
const { renameFolder: saveFolderName } = useFolders()
const { moveToTrash } = useTrash()

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
  { id: 'actions', header: '' },
]

const folderHistory = ref<{ id: string | null; name: string }[]>([])

const currentFolderName = computed(() => {
  if (props.currentFolderId === null) return 'Mes fichiers'

  return files.value.find(
    file => file.id === props.currentFolderId,
  )?.name ?? 'Dossier'
})

const currentFiles = computed(() => {
  const query = props.search.trim().toLocaleLowerCase('fr')

  return files.value.filter(file => {
    const isInCurrentFolder = file.parentId === props.currentFolderId
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
    id: props.currentFolderId,
    name: currentFolderName.value,
  })

  emit('folder-change', folder.id)
}

function goBack() {
  if (props.currentFolderId === null) return

  const currentFolder = props.folders.find(
    folder => folder.id === props.currentFolderId,
  )

  if (currentFolder) {
    emit('folder-change', currentFolder.parent_id)
  } else {
    emit('folder-change', null)
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

async function downloadRowFile(row: FileItem) {
  if (!row.storagePath || downloadingId.value !== null) return

  downloadingId.value = row.id

  try {
    const blob = await downloadFile(row.storagePath)
    const url = URL.createObjectURL(blob)

    try {
      const link = document.createElement('a')
      link.href = url
      link.download = row.name
      link.click()
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    }
  } catch (error) {
    console.error('Échec du téléchargement :', error)
  } finally {
    downloadingId.value = null
  }
}

function getSortIcon(key: SortKey) {
  if (sortKey.value !== key) return 'i-lucide-arrow-up-down'

  return sortDirection.value === 'asc'
    ? 'i-lucide-arrow-up'
    : 'i-lucide-arrow-down'
}

async function openItem(item: FileItem) {
  if (item.type === 'folder') {
    openFolder(item)
    return
  }

  await navigateTo(`/files/${item.id}`)
}

function requestDelete(row: FileItem) {
  deleteError.value = ''
  deleteSuccess.value = ''
  fileToDelete.value = row
  showDeleteDialog.value = true
}

function cancelDelete() {
  if (deletingId.value !== null) return

  showDeleteDialog.value = false
  fileToDelete.value = null
}

async function confirmDelete() {
  const row = fileToDelete.value

  if (!row || deletingId.value !== null || downloadingId.value !== null) {
    return
  }

  const file = props.files.find(item => item.id === row.id)

  if (!file) {
    deleteError.value = 'Fichier introuvable.'
    showDeleteDialog.value = false
    return
  }

  deletingId.value = row.id
  deleteError.value = ''

  try {
    await moveToTrash(file.id, 'file')

    deleteSuccess.value = `« ${row.name} » a été déplacé dans la corbeille.`
    showDeleteDialog.value = false
    fileToDelete.value = null

    emit('file-deleted')
  } catch (error) {
    deleteError.value = error instanceof Error
      ? error.message
      : 'Impossible de déplacer ce fichier vers la corbeille.'

    showDeleteDialog.value = false
  } finally {
    deletingId.value = null
  }
}

function requestRename(folder: FileItem) {
  renameError.value = ''
  folderToRename.value = folder
  newFolderName.value = folder.name
  showRenameDialog.value = true
}

async function renameFolder() {
  const folder = folderToRename.value
  const name = newFolderName.value.trim()

  if (!folder || !name || isRenamingFolder.value) return

  isRenamingFolder.value = true
  renameError.value = ''

  try {
    await saveFolderName(folder.id, name)

    showRenameDialog.value = false
    folderToRename.value = null

    emit('items-changed')
  } catch (error) {
    renameError.value = error instanceof Error
      ? error.message
      : 'Impossible de renommer le dossier.'
  } finally {
    isRenamingFolder.value = false
  }
}

function requestDeleteFolder(folder: FileItem) {
  deleteFolderError.value = ''
  folderToDelete.value = folder
  showDeleteFolderDialog.value = true
}

function cancelDeleteFolder() {
  if (deletingFolderId.value !== null) return

  showDeleteFolderDialog.value = false
  folderToDelete.value = null
}

async function confirmDeleteFolder() {
  const folder = folderToDelete.value

  if (!folder || deletingFolderId.value !== null) return

  deletingFolderId.value = folder.id
  deleteFolderError.value = ''

  try {
    await deleteFolder(folder.id)

    showDeleteFolderDialog.value = false
    folderToDelete.value = null

    emit('items-changed')
  } catch (error) {
    deleteFolderError.value = error instanceof Error
      ? error.message
      : 'Impossible de supprimer le dossier.'
  } finally {
    deletingFolderId.value = null
  }
}

</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Navigation dans l'arborescence -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-if="props.currentFolderId !== null"
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
      
      <div v-if="deleteSuccess || deleteError" class="p-3">
        <UAlert
          v-if="deleteSuccess"
          color="success"
          variant="subtle"
          icon="i-lucide-check-circle"
          title="Fichier supprimé"
          :description="deleteSuccess"
          close
          @update:open="deleteSuccess = ''"
        />
      
        <UAlert
          v-else
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          title="Échec de la suppression"
          :description="deleteError"
          close
          @update:open="deleteError = ''"
        />
      </div>
      
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
        empty="Ce dossier est vide."
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
            class="flex min-w-0 items-center gap-3 text-left cursor-pointer"
            @click="openItem(row.original)"
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
              class="truncate font-medium hover:underline"
              :class="row.original.type === 'folder'
                ? 'text-primary'
                : ''"
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

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              v-if="row.original.type !== 'folder'"
              icon="i-lucide-download"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Télécharger le fichier"
              title="Télécharger"
              :loading="downloadingId === row.original.id"
              :disabled="downloadingId !== null"
              @click.stop="downloadRowFile(row.original)"
            />
            <UButton
              v-if="row.original.type !== 'folder'"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Supprimer le fichier"
              title="Supprimer"
              :loading="deletingId === row.original.id"
              :disabled="downloadingId !== null || deletingId !== null"
              @click.stop="requestDelete(row.original)"
            />
            <UButton
              v-if="row.original.type === 'folder'"
              icon="i-lucide-pencil"
              variant="ghost"
              color="neutral"
              aria-label="Renommer le dossier"
              @click="requestRename(row.original)"
            />
            <UButton
              v-if="row.original.type === 'folder'"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              aria-label="Supprimer le dossier"
              :disabled="deletingFolderId !== null"
              @click="requestDeleteFolder(row.original)"
            />
          </div>
        </template>
      </UTable>

      <UModal v-model:open="showDeleteDialog">
        <template #content>
          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-3">
              <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                <UIcon name="i-lucide-trash-2" class="size-5" />
              </div>
            
              <div class="min-w-0 flex-1">
                <h2 class="text-base font-semibold text-highlighted">
                  Supprimer ce fichier ?
                </h2>
                <p class="mt-1 break-words text-sm text-muted">
                  {{ fileToDelete?.name }}
                </p>
              </div>
            </div>
          
            <p class="mt-4 text-sm text-muted">
              Cette action est définitive. Le fichier et ses données associées seront supprimés.
            </p>
          
            <div class="mt-6 flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="deletingId !== null"
                @click="cancelDelete"
              >
                Annuler
              </UButton>
            
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                :loading="deletingId === fileToDelete?.id"
                :disabled="deletingId !== null"
                @click="confirmDelete"
              >
                Supprimer définitivement
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <UModal v-model:open="showRenameDialog">
        <template #content>
          <div class="space-y-4 p-4">
            <h2 class="text-lg font-semibold">Renommer le dossier</h2>
          
            <UFormField label="Nouveau nom" name="folderName">
              <UInput
                v-model="newFolderName"
                autofocus
                class="w-full"
                placeholder="Nom du dossier"
                @keydown.enter="renameFolder"
              />
            </UFormField>
          
            <UAlert
              v-if="renameError"
              color="error"
              variant="soft"
              :description="renameError"
            />
          
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="isRenamingFolder"
                @click="showRenameDialog = false"
              >
                Annuler
              </UButton>
            
              <UButton
                :loading="isRenamingFolder"
                :disabled="!newFolderName.trim()"
                @click="renameFolder"
              >
                Renommer
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
      <UModal v-model:open="showDeleteFolderDialog">
        <template #content>
          <div class="space-y-4 p-4">
            <h2 class="text-lg font-semibold">
              Supprimer le dossier
            </h2>
          
            <p class="text-sm text-muted">
              Voulez-vous vraiment supprimer le dossier
              <strong>{{ folderToDelete?.name }}</strong> ?
              Cette action est définitive. Le dossier doit être vide.
            </p>
          
            <UAlert
              v-if="deleteFolderError"
              color="error"
              variant="soft"
              :description="deleteFolderError"
            />
          
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="deletingFolderId !== null"
                @click="cancelDeleteFolder"
              >
                Annuler
              </UButton>
            
              <UButton
                color="error"
                :loading="deletingFolderId === folderToDelete?.id"
                :disabled="deletingFolderId !== null"
                @click="confirmDeleteFolder"
              >
                Supprimer définitivement
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>