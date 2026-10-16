
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>({ default: true })

type Section = 'files' | 'recent' | 'shared' | 'trash' | 'settings'

const activeSection = ref<Section>('files')

const sections: {
  label: string
  icon: string
  value: Section
}[] = [
  { label: 'Mes fichiers', icon: 'i-lucide-folder', value: 'files' },
  { label: 'Récents', icon: 'i-lucide-clock', value: 'recent' },
  { label: 'Partagés', icon: 'i-lucide-users', value: 'shared' },
  { label: 'Corbeille', icon: 'i-lucide-trash-2', value: 'trash' },
  { label: 'Paramètres', icon: 'i-lucide-settings', value: 'settings' }
]

const items = computed<NavigationMenuItem[]>(() =>
  sections.map(section => ({
    label: section.label,
    icon: section.icon,
    active: activeSection.value === section.value,
    onSelect: () => {
      activeSection.value = section.value
    }
  }))
)

const pageTitle = computed(() =>
  sections.find(section => section.value === activeSection.value)?.label
  ?? 'Mes fichiers'
)
</script>

<template>
  <div class="flex min-h-0 flex-1">
    
    <!-- Composant SideBar de nuxtUI -->
    <USidebar
      v-model:open="open"
      collapsible="icon"
      title="MyPersonalCloud"
      description="Gérez vos fichiers et dossiers"
      :ui="{
        container: 'border-r border-default bg-default',
        header: 'px-3 py-4',
        body: 'px-2 py-3'
      }"
    >
      <!-- Contenu de la SideBar - Header -->
      <template #header>
        <div class="flex w-full min-w-0 items-center gap-2">
          
          <!-- Au clic, open prend la valeur opposée et l'icone change -->
          <UButton
            :icon="open ? 'i-lucide-cloud' : 'i-lucide-cloudy'"
            color="neutral"
            variant="ghost"
            size="lg"
            class="shrink-0"
            :ui="{ leadingIcon: 'size-6' }"
            :aria-label="
              open
                ? 'Réduire la barre latérale'
                : 'Développer la barre latérale'
            "
            @click="open = !open"
          />

          <!-- Le titre d'affiche selon la valeur de open -->
          <span
            v-if="open"
            class="min-w-0 flex-1 truncate text-base font-bold tracking-tight"
          >
            Mon espace
          </span>
        </div>
      </template>

      <!-- Contenu de la SideBar - Menu de navigation -->
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="w-full"
        :ui="{
          list: 'gap-1',
          link: 'rounded-lg px-3 py-2.5 text-sm transition-colors',
          linkLeadingIcon: 'size-5 shrink-0'
        }"
      />
    </USidebar>

    <!-- Contenu principal - futur -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <main class="min-h-0 flex-1 overflow-auto p-4">
        
          <Header />
          <template v-if="activeSection === 'files'">
              <slot />
          </template>
        
          <div
              v-else-if="activeSection === 'recent'"
              class="rounded-xl border border-default p-6 text-muted"
          >
              <UIcon name="i-lucide-clock" class="mb-3 size-8" />
              <p>Les fichiers récemment consultés apparaîtront ici.</p>
          </div>
        
          <div
              v-else-if="activeSection === 'shared'"
              class="rounded-xl border border-default p-6 text-muted"
          >
              <UIcon name="i-lucide-users" class="mb-3 size-8" />
              <p>Les fichiers partagés apparaîtront ici.</p>
          </div>
        
          <div
              v-else-if="activeSection === 'trash'"
              class="rounded-xl border border-default p-6 text-muted"
          >
              <UIcon name="i-lucide-trash-2" class="mb-3 size-8" />
              <p>Les fichiers supprimés apparaîtront ici.</p>
          </div>
        
          <div
              v-else-if="activeSection === 'settings'"
              class="rounded-xl border border-default p-6 text-muted"
          >
              <UIcon name="i-lucide-settings" class="mb-3 size-8" />
              <p>Les paramètres de ton espace seront disponibles ici.</p>
          </div>
          <Footer />
      </main>

    </div>
  </div>
</template>
