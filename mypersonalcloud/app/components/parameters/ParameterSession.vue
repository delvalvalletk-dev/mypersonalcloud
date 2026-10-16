
<script setup lang="ts">
import { ref } from 'vue'

const showConfirmation = ref(false)
const isLoggingOut = ref(false)
const errorMessage = ref('')

async function logout() {
  errorMessage.value = ''
  isLoggingOut.value = true

  try {
    // TODO : déconnecter l'utilisateur via Supabase Auth.
    errorMessage.value =
      'La déconnexion sera disponible après la configuration de Supabase Auth.'
  } finally {
    isLoggingOut.value = false
    showConfirmation.value = false
  }
}
</script>

<template>
  <ParameterCard title="Session">
    <div class="flex items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-elevated">
        <UIcon
          name="i-lucide-monitor-smartphone"
          class="size-5 text-muted"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="text-sm font-medium text-default">
          Session actuelle
        </p>

        <p class="text-sm text-muted">
          Gérez la connexion à votre compte sur cet appareil.
        </p>
      </div>
    </div>

    <div class="border-t border-default pt-4">
      <UButton
        color="error"
        variant="outline"
        icon="i-lucide-log-out"
        @click="showConfirmation = true"
      >
        Se déconnecter
      </UButton>
    </div>

    <UModal v-model:open="showConfirmation">
      <template #content>
        <div class="space-y-5 p-6">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-default">
              Se déconnecter ?
            </h2>

            <p class="text-sm text-muted">
              Vous devrez vous reconnecter pour accéder à vos fichiers.
            </p>
          </div>

          <p v-if="errorMessage" class="text-sm text-error">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="showConfirmation = false"
            >
              Annuler
            </UButton>

            <UButton
              color="error"
              icon="i-lucide-log-out"
              :loading="isLoggingOut"
              @click="logout"
            >
              Confirmer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </ParameterCard>
</template>
