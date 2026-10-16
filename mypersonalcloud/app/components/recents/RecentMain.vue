<template>
  <main class="min-w-0 flex-1 space-y-7 p-5 md:p-8">
    
    <!-- Header des fichiers recents -->
    <section class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-default md:text-3xl">
        Récents
      </h1>

      <p class="text-sm text-muted">
        Retrouvez rapidement vos fichiers récemment consultés ou modifiés.        
      </p>
    </section>

    <RecentTableView />
    
  </main>
</template>
