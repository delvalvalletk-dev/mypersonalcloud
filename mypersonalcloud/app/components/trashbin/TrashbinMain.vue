<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TrashConfirmDialog from './TrashConfirmDialog.vue'

import { useTrash, type TrashItem } from '~/composables/useTrash'

const { getTrashItems, restoreItem: restoreFromTrash } = useTrash()

const items = ref<TrashItem[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

// État de la boîte de dialogue
const dialogOpen = ref(false)
const dialogAction = ref<'delete' | 'empty'>('empty')
const selectedItem = ref<TrashItem | null>(null)

const restoreDialogOpen = ref(false)
const restoreSuccess = ref(false)
const restoredItemName = ref('')
const restoreError = ref('')

async function loadTrash() {
  isLoading.value = true
  loadError.value = null

  try {
    items.value = await getTrashItems()
  } catch (error) {
    loadError.value =
      error instanceof Error
        ? error.message
        : 'Impossible de charger la corbeille.'
  } finally {
    isLoading.value = false
  }
}

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

async function restoreItem(item: TrashItem) {
  restoreSuccess.value = false
  restoreError.value = ''
  restoredItemName.value = item.name

  try {
    await restoreFromTrash(item.id, item.type)

    restoreSuccess.value = true

    items.value = items.value.filter(
      currentItem => currentItem.id !== item.id
    )
  } catch (error) {
    restoreSuccess.value = false
    restoreError.value = error instanceof Error
      ? error.message
      : 'Impossible de restaurer cet élément.'
  } finally {
    restoreDialogOpen.value = true
  }
}

onMounted(loadTrash)

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

    <TrashRestoreDialog
      v-model:open="restoreDialogOpen"
      :success="restoreSuccess"
      :item-name="restoredItemName"
      :error-message="restoreError"
    />
  </div>
</template>
