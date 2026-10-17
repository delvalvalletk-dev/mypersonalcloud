
<script setup lang="ts">
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
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
        placeholder="Choisissez un mot de passe"
        autocomplete="new-password"
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
        required
        class="w-full"
      />
    </UFormField>

    <UButton type="submit" block>
      Créer mon compte
    </UButton>
  </form>
</template>
