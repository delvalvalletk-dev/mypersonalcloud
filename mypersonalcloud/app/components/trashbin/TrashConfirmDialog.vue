
<script setup lang="ts">
import { computed } from 'vue'

type DialogAction = 'delete' | 'empty'

const props = defineProps<{
  open: boolean
  action: DialogAction
  itemName?: string
  itemCount?: number
  loading?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const title = computed(() =>
  props.action === 'empty'
    ? 'Vider la corbeille ?'
    : 'Supprimer définitivement ?'
)

const description = computed(() => {
  if (props.action === 'empty') {
    return `Cette action supprimera définitivement les ${props.itemCount ?? 0} éléments de la corbeille. Cette opération est irréversible.`
  }

  return `« ${props.itemName ?? 'Cet élément'} » sera supprimé définitivement. Cette opération est irréversible.`
})

function cancel() {
  if (props.loading) return
  emit('update:open', false)
}

function confirm() {
  if (props.loading) return
  emit('confirm')
}
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :dismissible="!loading"
    :ui="{ footer: 'justify-end gap-2' }"
    @update:open="!loading && emit('update:open', $event)"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error"
          >
            <UIcon name="i-lucide-alert-triangle" class="size-5" />
          </div>

          <div class="min-w-0 space-y-1">
            <p class="text-sm font-medium text-default">
              {{ title }}
            </p>

            <p class="text-sm text-muted">
              {{ description }}
            </p>
          </div>
        </div>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          title="La suppression a échoué"
          :description="errorMessage"
        />
      </div>
    </template>

    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        :disabled="loading"
        @click="cancel"
      />

      <UButton
        :label="action === 'empty' ? 'Vider la corbeille' : 'Supprimer définitivement'"
        color="error"
        :loading="loading"
        :disabled="loading"
        @click="confirm"
      />
    </template>
  </UModal>
</template>
