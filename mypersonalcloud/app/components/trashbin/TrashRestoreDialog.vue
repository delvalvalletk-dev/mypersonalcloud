<script setup lang="ts">
const props = defineProps<{
  open: boolean
  success: boolean
  itemName?: string
  errorMessage?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function closeDialog() {
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
    :title="success ? 'Restauration réussie' : 'Échec de la restauration'"
    :description="success
      ? 'Votre élément a été restauré.'
      : 'Une erreur est survenue pendant la restauration.'"
  >
    <template #body>
      <div class="flex flex-col items-center gap-4 py-3 text-center">

        <div
          class="flex size-14 items-center justify-center rounded-full"
          :class="success
            ? 'bg-success/10 text-success'
            : 'bg-error/10 text-error'"
        >
          <UIcon
            :name="success
              ? 'i-lucide-check-circle'
              : 'i-lucide-circle-x'"
            class="size-8"
          />
        </div>

        <div class="space-y-1">
          <p class="font-medium">
            {{ itemName ?? 'Élément' }}
          </p>

          <p class="text-sm text-muted">
            {{ success
              ? 'L’élément est de nouveau disponible dans vos fichiers.'
              : errorMessage ?? 'Veuillez réessayer ultérieurement.' }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          label="Fermer"
          color="neutral"
          variant="outline"
          @click="closeDialog"
        />
      </div>
    </template>
  </UModal>
</template>
