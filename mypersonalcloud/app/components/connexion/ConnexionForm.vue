
<script setup lang="ts">
  const email = ref('')
  const password = ref('')
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