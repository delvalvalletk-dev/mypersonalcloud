
<script setup lang="ts">
import { ref } from 'vue'
import ParameterCard from './ParameterCard.vue'

// informations
const name = ref('')
const email = ref('')
const isSaving = ref(false)
const message = ref('')

// permet de sauvegarder le profil
async function saveProfile() {
  message.value = ''
  isSaving.value = true

  try {
    // TODO : enregistrer le profil via Supabase pour plus tard.
    message.value = 'La sauvegarde du profil reste à connecter.'
  } finally {
    // Fin de la sauvegarde
    isSaving.value = false
  }
}
</script>

<template>
  <ParameterCard title="Profil">
    <form class="space-y-4" @submit.prevent="saveProfile">
      <UFormField label="Nom" name="name">
        <UInput
          v-model="name"
          autocomplete="name"
          placeholder="Votre nom"
          class="w-full"
        />
      </UFormField>

      <UFormField label="E-mail" name="email">
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="vous@exemple.fr"
          class="w-full"
        />
      </UFormField>

      <div class="flex items-center justify-between gap-3">
        <p v-if="message" class="text-sm text-muted">
          {{ message }}
        </p>

        <UButton
          type="submit"
          icon="i-lucide-save"
          :loading="isSaving"
        >
          Enregistrer
        </UButton>
      </div>
    </form>
  </ParameterCard>
</template>
