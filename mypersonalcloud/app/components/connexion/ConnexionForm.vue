
<script setup lang="ts">
const email = ref('')
const password = ref('')

const supabase = useSupabaseClient()

const errorMessage = ref('')
const isLoading = ref(false)

async function signIn() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMessage.value = 'Adresse e-mail ou mot de passe incorrect.'
      return
    }

    await navigateTo('/')
  } catch {
    errorMessage.value =
      'Une erreur inattendue est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent>
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
      placeholder="Votre mot de passe"
      autocomplete="current-password"
      required
      class="w-full"
      />
    </UFormField>

    <UButton type="submit" block>
      Se connecter
    </UButton>
  </form>
</template>