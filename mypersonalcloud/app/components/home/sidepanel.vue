<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>({ default: true })

const route = useRoute()

const sections = [
  { route: '/', label: 'Mes fichiers', icon: 'i-lucide-folder' },
  { route: '/recents', label: 'Récents', icon: 'i-lucide-clock' },
  { route: '/partages', label: 'Partagés', icon: 'i-lucide-users' },
  { route: '/corbeille', label: 'Corbeille', icon: 'i-lucide-trash-2' },
  { route: '/parametres', label: 'Paramètres', icon: 'i-lucide-settings' }
]

const items = computed<NavigationMenuItem[]>(() =>
  sections.map(section => ({
    to: section.route,
    label: section.label,
    icon: section.icon,
    active: route.path === section.route
  }))
)
</script>

<template>
  <div class="flex min-h-0 flex-1">
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
      <template #header>
        <div class="flex w-full min-w-0 items-center gap-2">
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

          <span
            v-if="open"
            class="min-w-0 flex-1 truncate text-base font-bold tracking-tight"
          >
            Mon espace
          </span>
        </div>
      </template>

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

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <main class="min-h-0 flex-1 overflow-auto p-4">
        <Header />

        <slot />

        <Footer />
      </main>
    </div>
  </div>
</template>
