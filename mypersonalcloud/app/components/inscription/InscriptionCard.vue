<template>
  <UCard
    class="w-full max-w-lg"
    title="Créer un compte"
    description="Rejoignez MyPersonalCloud et gardez vos fichiers accessibles partout."
  >
    <div class="flex flex-col gap-5">
      <InscriptionForm />

      <AuthSocialButtons />
    </div>

    <template #footer>
      <p class="text-sm text-center text-muted">
        Déjà un compte ?
        <NuxtLink
          to="/connexion"
          class="text-primary font-medium hover:underline"
        >
          Se connecter
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
