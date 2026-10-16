<script setup lang="ts">
type DialogAction = 'delete' | 'empty'

const props = defineProps<{
  open: boolean
  action: DialogAction
  itemName?: string
  itemCount?: number
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
  emit('update:open', false)
}

function confirm() {
  emit('confirm')
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :ui="{ footer: 'justify-end gap-2' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
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
    </template>

    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        @click="cancel"
      />

      <UButton
        :label="action === 'empty' ? 'Vider la corbeille' : 'Supprimer définitivement'"
        color="error"
        @click="confirm"
      />
    </template>
  </UModal>
</template>
