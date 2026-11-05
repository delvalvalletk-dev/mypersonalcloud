<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TrashConfirmDialog from './TrashConfirmDialog.vue'

import { useTrash, type TrashItem } from '~/composables/useTrash'

const { getTrashItems, restoreItem: restoreFromTrash, permanentlyDeleteItem } = useTrash()

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

const isDeleting = ref(false)
const deleteError = ref('')

const successDialogOpen = ref(false)
const successTitle = ref('')
const successMessage = ref('')

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

async function confirmAction() {
  if (isDeleting.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    const isEmptying = dialogAction.value === 'empty'

    if (isEmptying) {
      for (const item of [...items.value]) {
        await permanentlyDeleteItem(item.id, item.type)
      }

      successTitle.value = 'Corbeille vidée'
      successMessage.value = 'Tous les éléments de la corbeille ont été supprimés définitivement.'
    } else if (selectedItem.value) {
      await permanentlyDeleteItem(
        selectedItem.value.id,
        selectedItem.value.type,
      )

      successTitle.value = 'Suppression réussie'
      successMessage.value = `« ${selectedItem.value.name} » a été supprimé définitivement.`
    } else {
      return
    }

    await loadTrash()

    dialogOpen.value = false
    selectedItem.value = null
    successDialogOpen.value = true
  } catch (error) {
    deleteError.value = error instanceof Error
      ? error.message
      : 'Impossible de supprimer définitivement cet élément.'
  } finally {
    isDeleting.value = false
  }
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
      :loading="isDeleting"
      :error-message="deleteError"
      @confirm="confirmAction"
    />

    <TrashRestoreDialog
      v-model:open="restoreDialogOpen"
      :success="restoreSuccess"
      :item-name="restoredItemName"
      :error-message="restoreError"
    />

    <UModal
      v-model:open="successDialogOpen"
      :title="successTitle"
      :description="successMessage"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <UIcon name="i-lucide-check-circle" class="size-5" />
          </div>
        
          <div class="min-w-0">
            <p class="text-sm font-medium text-default">
              {{ successTitle }}
            </p>
            <p class="text-sm text-muted">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </template>
    
      <template #footer>
        <UButton
          label="Fermer"
          color="success"
          @click="successDialogOpen = false"
        />
      </template>
    </UModal>
    
  </div>
</template>
