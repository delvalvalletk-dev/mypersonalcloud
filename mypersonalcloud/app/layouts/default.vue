<script setup lang="ts">
// état d'ouverture de la sidebar
const sidebarOpen = ref(true)
</script>

<template>
  <!-- barre de navigation latérale -->
  <Sidepanel v-model:open="sidebarOpen">

  <!-- conteneur global de l'application -->
    <div class="flex min-h-screen overflow-hidden">
    
        <!-- contenu principal de l'application -->
        <div class="flex min-w-0 flex-1 flex-col transition-all duration-300">        
          
          <main class="flex-1 min-w-0">
            <slot />
          </main>

        </div>     
    </div>
  </Sidepanel>
</template>