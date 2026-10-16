<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type TrashItem = {
  id: number
  name: string
  type: 'file' | 'folder'
  deletedAt: string
  deletedAtTimestamp: number
  size: number | null
}

const emit = defineEmits<{
  restore: [item: TrashItem]
  delete: [item: TrashItem]
}>()

const items = ref<TrashItem[]>([
  {
    id: 1,
    name: 'ancien-devis.pdf',
    type: 'file',
    deletedAt: '6 oct.',
    deletedAtTimestamp: new Date(2026, 9, 6).getTime(),
    size: 96 * 1024
  },
  {
    id: 2,
    name: 'Brouillons',
    type: 'folder',
    deletedAt: '2 oct.',
    deletedAtTimestamp: new Date(2026, 9, 2).getTime(),
    size: null
  },
  {
    id: 3,
    name: 'scan-001.jpg',
    type: 'file',
    deletedAt: '20 sept.',
    deletedAtTimestamp: new Date(2026, 8, 20).getTime(),
    size: 3.4 * 1024 * 1024
  }
])

const sorting = ref([{
  id: 'deletedAtTimestamp',
  desc: true
}])

const columns: TableColumn<TrashItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nom'
  },
  {
    accessorKey: 'deletedAtTimestamp',
    header: 'Supprimé le'
  },
  {
    accessorKey: 'size',
    header: 'Taille'
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false
  }
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

function restoreItem(item: TrashItem) {
  emit('restore', item)
}

function deleteItem(item: TrashItem) {
  emit('delete', item)
}

const tableRows = computed(() => items.value)

defineExpose({
  items,
  tableRows
})
</script>

<template>
	<div class="p-5">
  	<div class="overflow-hidden rounded-xl border border-default">
  	  <UTable
  	    v-if="items.length > 0"
  	    v-model:sorting="sorting"
  	    :data="items"
  	    :columns="columns"
  	    :ui="{
  	      th: 'text-xs font-medium text-muted',
  	      td: 'py-3'
  	    }"
  	  >
  	    <template #name-cell="{ row }">
  	      <div class="flex min-w-0 items-center gap-3">
  	        <div
  	          class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated"
  	        >
  	          <UIcon
  	            :name="
  	              row.original.type === 'folder'
  	                ? 'i-lucide-folder'
  	                : 'i-lucide-file'
  	            "
  	            class="size-5 text-muted"
  	          />
  	        </div>

  	        <span class="truncate text-sm font-medium text-default">
  	          {{ row.original.name }}
  	        </span>
  	      </div>
  	    </template>

  	    <template #deletedAtTimestamp-cell="{ row }">
  	      <span class="text-sm text-muted">
  	        {{ row.original.deletedAt }}
  	      </span>
  	    </template>

  	    <template #size-cell="{ row }">
  	      <span class="text-sm text-muted">
  	        {{ formatSize(row.original.size) }}
  	      </span>
  	    </template>

  	    <template #actions-cell="{ row }">
  	      <div class="flex items-center justify-end gap-1">
  	        <UButton
  	          icon="i-lucide-rotate-ccw"
  	          color="neutral"
  	          variant="ghost"
  	          size="sm"
  	          aria-label="Restaurer"
  	          title="Restaurer"
  	          @click="restoreItem(row.original)"
  	        />

  	        <UButton
  	          icon="i-lucide-trash-2"
  	          color="error"
  	          variant="ghost"
  	          size="sm"
  	          aria-label="Supprimer définitivement"
  	          title="Supprimer définitivement"
  	          @click="deleteItem(row.original)"
  	        />
  	      </div>
  	    </template>
  	  </UTable>

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
