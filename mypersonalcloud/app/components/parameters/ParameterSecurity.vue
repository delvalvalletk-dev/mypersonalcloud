
<script setup lang="ts">
import { ref } from 'vue'

const twoFactorEnabled = ref(false)
const showPasswordModal = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isChangingPassword = ref(false)

function toggleTwoFactor(enabled: boolean) {
  twoFactorEnabled.value = enabled

  // TODO : enregistrer le paramètre via le service d'authentification.
}

async function changePassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value =
      'Le nouveau mot de passe doit contenir au moins 8 caractères.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  isChangingPassword.value = true

  try {
    // TODO : effectuer le changement via Supabase Auth.
    errorMessage.value =
      'Le changement de mot de passe nécessite la connexion à Supabase Auth.'
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <ParameterCard title="Sécurité">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-medium text-default">
          Double authentification
        </p>

        <p class="text-sm text-muted">
          {{ twoFactorEnabled ? 'Activée' : 'Désactivée' }}
        </p>
      </div>

      <USwitch
        :model-value="twoFactorEnabled"
        aria-label="Double authentification"
        @update:model-value="toggleTwoFactor"
      />
    </div>

    <div class="border-t border-default pt-4">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-key-round"
        @click="showPasswordModal = true"
      >
        Changer le mot de passe
      </UButton>
    </div>

    <UModal v-model:open="showPasswordModal">
      <template #content>
        <div class="space-y-5 p-6">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-default">
              Changer le mot de passe
            </h2>

            <p class="text-sm text-muted">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="changePassword">
            <UFormField label="Mot de passe actuel">
              <UInput
                v-model="currentPassword"
                type="password"
                autocomplete="current-password"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Nouveau mot de passe">
              <UInput
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Confirmer le nouveau mot de passe">
              <UInput
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>

            <p v-if="errorMessage" class="text-sm text-error">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="text-sm text-success">
              {{ successMessage }}
            </p>

            <div class="flex justify-end gap-3">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                @click="showPasswordModal = false"
              >
                Annuler
              </UButton>

              <UButton
                type="submit"
                icon="i-lucide-check"
                :loading="isChangingPassword"
              >
                Confirmer
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </ParameterCard>
</template>
