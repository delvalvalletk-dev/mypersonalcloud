<template>
  <UCard
    class="w-full max-w-lg"
    title="Connexion"
  		icon=""
    description="Veuillez vous authentifier à l'aide de votre adresse e-mail et de votre mot de passe"
  >

	<slot />

	<template #footer>
		<p class="text-sm text-center text-muted">
			Aucun compte ?
			<NuxtLink
				to="/inscription"
				class="text-primary font-medium hover:underline"
			>
				S'inscrire
			</NuxtLink>
		</p>
	</template>


  </UCard>
</template>
