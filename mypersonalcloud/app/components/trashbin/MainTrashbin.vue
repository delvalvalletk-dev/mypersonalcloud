<script setup lang="ts">
import { ref } from 'vue'
import TrashConfirmDialog from './TrashConfirmDialog.vue'

// Type d'un élément de la corbeille
type TrashItem = {
  id: number
  name: string
  type: 'file' | 'folder'
  deletedAt: string
  deletedAtTimestamp: number
  size: number | null
}

// Données de démonstration
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

// État de la boîte de dialogue
const dialogOpen = ref(false)
const dialogAction = ref<'delete' | 'empty'>('empty')
const selectedItem = ref<TrashItem | null>(null)

// Demande de confirmation pour vider la corbeille
function askEmptyTrash() {
  dialogAction.value = 'empty'
  selectedItem.value = null
  dialogOpen.value = true
}

// Demande de confirmation pour supprimer un élément
function askDelete(item: TrashItem) {
  dialogAction.value = 'delete'
  selectedItem.value = item
  dialogOpen.value = true
}

// Suppression après confirmation
function confirmAction() {
  if (dialogAction.value === 'empty') {
    items.value = []
  } else if (selectedItem.value) {
    items.value = items.value.filter(
      item => item.id !== selectedItem.value?.id
    )
  }

  dialogOpen.value = false
  selectedItem.value = null
}

// Restauration simulée
function restoreItem(item: TrashItem) {
  items.value = items.value.filter(
    currentItem => currentItem.id !== item.id
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <TrashbinHeader @empty="askEmptyTrash" />

    <TrashbinNotice />

    <TrashbinTableView
      :items="items"
      @restore="restoreItem"
      @delete="askDelete"
    />

    <TrashConfirmDialog
      v-model:open="dialogOpen"
      :action="dialogAction"
      :item-name="selectedItem?.name"
      :item-count="items.length"
      @confirm="confirmAction"
    />
  </div>
</template>
