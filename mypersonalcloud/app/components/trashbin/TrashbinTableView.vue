
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { TrashItem, TrashChild } from '~/composables/useTrash'

const emit = defineEmits<{
  restore: [item: TrashItem]
  delete: [item: TrashItem]
}>()

const props = defineProps<{
  items: TrashItem[]
}>()

// Dossiers actuellement dépliés.
const expandedFolders = ref(new Set<string>())

const sorting = ref([
  {
    id: 'deletedAtTimestamp',
    desc: true,
  },
])

type DisplayItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  size: number | null
  deletedAt: string
  deletedAtTimestamp: number
  depth: number
  expandable: boolean
  isRoot: boolean
  original?: TrashItem
}

const columns: TableColumn<DisplayItem>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'deletedAt', header: 'Supprimé le' },
  { accessorKey: 'size', header: 'Taille' },
  { id: 'actions', header: '', enableSorting: false },
]

function formatSize(size: number | null): string {
  if (size === null) return '—'
  if (size < 1024) return `${size} o`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`
}

function toggleFolder(id: string) {
  const expanded = new Set(expandedFolders.value)

  if (expanded.has(id)) {
    expanded.delete(id)
  } else {
    expanded.add(id)
  }

  expandedFolders.value = expanded
}

function restoreItem(item: TrashItem) {
  emit('restore', item)
}

function deleteItem(item: TrashItem) {
  emit('delete', item)
}

// Aplatir l'arborescence pour permettre son affichage dans UTable.
const displayItems = computed<DisplayItem[]>(() => {
  const result: DisplayItem[] = []

  function addChildren(
    children: TrashChild[],
    depth: number,
  ) {
    for (const child of children) {
      result.push({
        id: child.id,
        name: child.name,
        type: child.type,
        size: child.size,
        deletedAt: '',
        deletedAtTimestamp: 0,
        depth,
        expandable: child.type === 'folder' && child.children.length > 0,
        isRoot: false,
      })

      if (
        child.type === 'folder'
        && expandedFolders.value.has(child.id)
      ) {
        addChildren(child.children, depth + 1)
      }
    }
  }

  for (const item of props.items) {
    result.push({
      id: item.id,
      name: item.name,
      type: item.type,
      size: item.size,
      deletedAt: item.deletedAt,
      deletedAtTimestamp: item.deletedAtTimestamp,
      depth: 0,
      expandable: item.type === 'folder' && item.children.length > 0,
      isRoot: true,
      original: item,
    })

    if (
      item.type === 'folder'
      && expandedFolders.value.has(item.id)
    ) {
      addChildren(item.children, 1)
    }
  }

  return result
})
</script>

<template>
  <div class="p-5">
    <div class="overflow-hidden rounded-xl border border-default">
      <UTable
        v-if="props.items.length > 0"
        v-model:sorting="sorting"
        :data="displayItems"
        :columns="columns"
        :ui="{
          th: 'text-xs font-medium text-muted',
          td: 'py-3',
        }"
      >
        <!-- Nom et arborescence -->
        <template #name-cell="{ row }">
          <div
            class="flex min-w-0 items-center gap-2"
            :style="{ paddingLeft: `${row.original.depth * 24}px` }"
          >
            <!-- Flèche de dépliage -->
            <UButton
              v-if="row.original.expandable"
              :icon="expandedFolders.has(row.original.id)
                ? 'i-lucide-chevron-down'
                : 'i-lucide-chevron-right'"
              color="neutral"
              variant="ghost"
              size="xs"
              class="shrink-0"
              :aria-label="expandedFolders.has(row.original.id)
                ? 'Replier le dossier'
                : 'Déplier le dossier'"
              @click="toggleFolder(row.original.id)"
            />

            <span
              v-else
              class="size-6 shrink-0"
            />

            <!-- Icône -->
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg"
              :class="row.original.type === 'folder'
                ? 'bg-primary/10 text-primary'
                : 'bg-elevated text-muted'"
            >
              <UIcon
                :name="row.original.type === 'folder'
                  ? 'i-lucide-folder'
                  : 'i-lucide-file'"
                class="size-5"
              />
            </div>

            <!-- Nom -->
            <span class="truncate text-sm font-medium text-default">
              {{ row.original.name }}
            </span>

            <!-- Indication du contenu -->
            <span
              v-if="row.original.expandable"
              class="text-xs text-muted"
            >
              ({{ row.original.type === 'folder' ? 'dossier' : '' }})
            </span>
          </div>
        </template>

        <!-- Date de suppression -->
        <template #deletedAt-cell="{ row }">
          <span class="text-sm text-muted">
            {{ row.original.isRoot ? row.original.deletedAt : '—' }}
          </span>
        </template>

        <!-- Taille -->
        <template #size-cell="{ row }">
          <span class="text-sm text-muted">
            {{ formatSize(row.original.size) }}
          </span>
        </template>

        <!-- Actions disponibles uniquement sur les éléments principaux -->
        <template #actions-cell="{ row }">
          <div
            v-if="row.original.isRoot && row.original.original"
            class="flex items-center justify-end gap-1"
          >
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Restaurer"
              title="Restaurer"
              @click="restoreItem(row.original.original)"
            />

            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Supprimer définitivement"
              title="Supprimer définitivement"
              @click="deleteItem(row.original.original)"
            />
          </div>
        </template>
      </UTable>

      <!-- Corbeille vide -->
      <div
        v-else
        class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
      >
        <div
          class="flex size-14 items-center justify-center rounded-2xl bg-elevated"
        >
          <UIcon
            name="i-lucide-trash-2"
            class="size-7 text-muted"
          />
        </div>

        <div class="space-y-1">
          <h3 class="font-semibold text-default">
            La corbeille est vide
          </h3>

          <p class="text-sm text-muted">
            Les fichiers et dossiers supprimés apparaîtront ici.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
