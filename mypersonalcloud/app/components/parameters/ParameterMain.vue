
<!-- Composant principal de la page des paramètres -->

<template>
  <main class="min-w-0 flex-1 space-y-7 p-5 md:p-8">
    
    <!-- Header des paramètres -->
    <section class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-default md:text-3xl">
        Paramètres
      </h1>

      <p class="text-sm text-muted">
        Gérez votre profil, votre sécurité et votre espace de stockage.
      </p>
    </section>

    <!-- Corps des paramètres -->
    <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
      <ParameterProfile />
      <ParameterStorage />
      <ParameterSecurity />
      <ParameterSession />
    </div>
  </main>
</template>