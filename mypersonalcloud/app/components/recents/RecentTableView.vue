
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type RecentFile = {
  id: number
  name: string
  lastActivity: string
  lastActivityTimestamp: number
  size: string
  sizeBytes: number
  type: string
}

const files = ref<RecentFile[]>([
  {
    id: 1,
    name: 'CV-2026.pdf',
    lastActivity: "Aujourd'hui, 09:12",
    lastActivityTimestamp: 202610160912,
    size: '212 Ko',
    sizeBytes: 212 * 1024,
    type: 'pdf'
  },
  {
    id: 2,
    name: 'budget.xlsx',
    lastActivity: 'Hier, 18:40',
    lastActivityTimestamp: 202610151840,
    size: '48 Ko',
    sizeBytes: 48 * 1024,
    type: 'spreadsheet'
  },
  {
    id: 3,
    name: 'vacances.mp4',
    lastActivity: '14 août',
    lastActivityTimestamp: 202608141200,
    size: '1,2 Go',
    sizeBytes: 1.2 * 1024 ** 3,
    type: 'video'
  },
  {
    id: 4,
    name: 'Rapport.pdf',
    lastActivity: '11 oct., 14:25',
    lastActivityTimestamp: 202610111425,
    size: '350 Ko',
    sizeBytes: 350 * 1024,
    type: 'pdf'
  },
  {
    id: 5,
    name: 'photo.jpg',
    lastActivity: '12 sept.',
    lastActivityTimestamp: 202609121200,
    size: '2,4 Mo',
    sizeBytes: 2.4 * 1024 ** 2,
    type: 'image'
  }
])

const columns: TableColumn<RecentFile>[] = [
  { accessorKey: 'name', header: 'Nom' },
  { accessorKey: 'lastActivity', header: 'Dernière activité' },
  { accessorKey: 'size', header: 'Taille' }
]

type SortKey = 'name' | 'lastActivityTimestamp' | 'sizeBytes'

const sortKey = ref<SortKey>('lastActivityTimestamp')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedFiles = computed(() =>
  [...files.value].sort((a, b) => {
    const comparison =
      sortKey.value === 'name'
        ? a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        : sortKey.value === 'lastActivityTimestamp'
          ? a.lastActivityTimestamp - b.lastActivityTimestamp
          : a.sizeBytes - b.sizeBytes

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDirection.value =
      sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = key === 'name' ? 'asc' : 'desc'
  }
}

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
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

function openFile(file: RecentFile) {
  // À connecter à l'ouverture réelle du fichier.
  console.log('Ouverture du fichier :', file.name)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm text-muted">
        {{ sortedFiles.length }}
        fichier{{ sortedFiles.length > 1 ? 's' : '' }}
      </span>
    </div>

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

        <template #lastActivity-header>
          <button
            class="inline-flex items-center gap-2"
            @click="toggleSort('lastActivityTimestamp')"
          >
            Dernière activité
            <UIcon
              :name="getSortIcon('lastActivityTimestamp')"
              class="size-3.5"
            />
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
            @click="openFile(row.original)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"
            >
              <UIcon
                :name="getFileIcon(row.original.type)"
                class="size-5"
              />
            </span>

            <span class="truncate font-medium text-default hover:text-primary">
              {{ row.original.name }}
            </span>
          </button>
        </template>

        <template #lastActivity-cell="{ row }">
          <span class="whitespace-nowrap text-muted">
            {{ row.original.lastActivity }}
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
        class="flex flex-col items-center gap-3 px-4 py-14 text-center"
      >
        <span
          class="flex size-14 items-center justify-center rounded-2xl bg-elevated"
        >
          <UIcon name="i-lucide-clock" class="size-7 text-muted" />
        </span>

        <div class="flex flex-col gap-1">
          <p class="font-medium text-default">
            Aucun fichier récent
          </p>

          <p class="text-sm text-muted">
            Les fichiers que vous consulterez apparaîtront ici.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
