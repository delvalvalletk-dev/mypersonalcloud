
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import ParameterCard from './ParameterCard.vue'

// Informations du profil
const name = ref('')
const email = ref('')
const profileImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const message = ref('')

// Initiales affichées en l'absence de photo
const initials = 'KV'

// Permet de choisir une photo
function selectImage() {
  fileInput.value?.click()
}

// Gère la sélection de la photo
function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    message.value = 'Veuillez sélectionner une image.'
    input.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    message.value = 'La photo ne doit pas dépasser 5 Mo.'
    input.value = ''
    return
  }

  // Libère l'ancienne image avant de la remplacer
  if (profileImage.value) {
    URL.revokeObjectURL(profileImage.value)
  }

  profileImage.value = URL.createObjectURL(file)
  message.value = ''
}

// Supprime la photo de profil
function removeImage() {
  if (profileImage.value) {
    URL.revokeObjectURL(profileImage.value)
  }

  profileImage.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  message.value = ''
}

// Libère les ressources lorsque le composant est détruit
onBeforeUnmount(() => {
  if (profileImage.value) {
    URL.revokeObjectURL(profileImage.value)
  }
})

// Permet de sauvegarder le profil
async function saveProfile() {
  message.value = ''
  isSaving.value = true

  try {
    // TODO : enregistrer le profil et la photo via Supabase.
    message.value = 'La sauvegarde du profil reste à connecter.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <ParameterCard title="Profil">
    <form class="space-y-5" @submit.prevent="saveProfile">
      <!-- Informations et photo : répartition 70/30 -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-10">
        <!-- Informations du profil : 70 % -->
        <div class="space-y-4 sm:col-span-7">
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

          <UButton
            type="submit"
            icon="i-lucide-save"
            :loading="isSaving"
          >
            Enregistrer
          </UButton>
        </div>

        <!-- Photo de profil : 30 % -->
        <div
          class="flex flex-col items-center gap-4 sm:col-span-3"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="hidden"
            @change="onImageSelected"
          />

          <!-- Avatar avec cercle extérieur -->
          <div
            class="flex size-32 items-center justify-center rounded-full border-2 border-default bg-elevated p-1"
          >
            <UAvatar
              v-if="!profileImage"
              :text="initials"
              size="3xl"
              class="size-full rounded-full text-2xl"
            />

            <img
              v-else
              :src="profileImage"
              alt="Photo de profil"
              class="size-full rounded-full object-cover"
            >
          </div>

          <!-- Actions et informations -->
          <div class="flex w-full flex-col items-center gap-2">
            <UButton
              type="button"
              icon="i-lucide-camera"
              color="neutral"
              variant="outline"
              size="sm"
              class="max-w-full justify-center"
              @click="selectImage"
            >
              Modifier la photo
            </UButton>

            <UButton
              v-if="profileImage"
              type="button"
              color="error"
              variant="ghost"
              size="xs"
              @click="removeImage"
            >
              Supprimer la photo
            </UButton>

            <p class="text-center text-xs leading-relaxed text-muted">
              JPG, PNG, WebP ou GIF
              <span class="block">5 Mo maximum</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Message et sauvegarde -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p
          v-if="message"
          class="text-sm text-muted"
          role="status"
        >
          {{ message }}
        </p>

        <div v-else />
      </div>
    </form>
  </ParameterCard>
</template>
