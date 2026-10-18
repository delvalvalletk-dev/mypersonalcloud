<script setup lang="ts">
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const supabase = useSupabaseClient()

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

async function signUp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  isLoading.value = true

  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value =
      'Inscription effectuée ! Consultez votre boîte mail pour confirmer votre adresse si nécessaire.'
  } catch {
    errorMessage.value =
      'Une erreur inattendue est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="signUp">
    <UFormField label="Adresse e-mail" name="email">
      <UInput
        v-model="email"
        type="email"
        placeholder="vous@exemple.fr"
        autocomplete="email"
        required
        class="w-full"
      />
    </UFormField>

    <UFormField label="Mot de passe" name="password">
      <UInput
        v-model="password"
        type="password"
        placeholder="Choisissez un mot de passe"
        autocomplete="new-password"
        minlength="8"
        required
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Confirmer le mot de passe"
      name="confirmPassword"
    >
      <UInput
        v-model="confirmPassword"
        type="password"
        placeholder="Confirmez votre mot de passe"
        autocomplete="new-password"
        minlength="8"
        required
      />
    </UFormField>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      title="Inscription impossible"
      :description="errorMessage"
    />

    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      title="Inscription réussie"
      :description="successMessage"
    />

    <UButton
      type="submit"
      block
      :loading="isLoading"
      :disabled="isLoading"
    >
      Créer mon compte
    </UButton>
  </form>
</template>
