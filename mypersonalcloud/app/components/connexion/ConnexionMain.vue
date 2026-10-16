
<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
</script>

<template>
  <main class="min-h-screen flex items-center justify-center">
    <UCard
      class="w-full max-w-lg"
      title="Connexion"
			icon=""
      description="Veuillez vous authentifier à l'aide de votre adresse e-mail et de votre mot de passe"
    >
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
    </UCard>
  </main>
</template>
