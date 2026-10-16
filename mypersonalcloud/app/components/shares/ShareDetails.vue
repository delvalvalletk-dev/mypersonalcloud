<script setup lang="ts">
const props = defineProps<{
  shareId: string
}>()

const { items } = useShares()

const share = computed(() =>
  items.value.find(item => item.id === props.shareId)
)

const formattedDate = computed(() => {
  if (!share.value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(share.value.sharedAt))
})
</script>

<template>
	<div class="p-8">
  	<div class="flex flex-col gap-6">
  		<div
  		  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0 space-y-7"
  		>
  		  <!-- Header d'une fichier de partage -->
  		  <section class="space-y-1">
  		    <h1 class="text-2xl font-bold tracking-tight text-default md:text-3xl">
  		    	Détails du partage de '{{ share.name }}'
  		    </h1>
				
  		    <p class="text-sm text-muted">
						Consultez les informations et les accès associés  		    
					</p>
  		  </section>

				<UButton
      	  icon="i-lucide-arrow-left"
      	  color="neutral"
      	  variant="ghost"
      	  aria-label="Retour aux partages"
      	  to="/partages"
      	/>
			
  		</div>

  	  <div
  	    v-if="share"
  	    class="flex flex-col gap-6"
  	  >
  	    <UCard>
  	      <div class="flex items-center gap-4">
  	        <div
  	          class="flex size-14 shrink-0 items-center justify-center rounded-xl"
  	          :class="share.type === 'folder'
  	            ? 'bg-warning/10 text-warning'
  	            : 'bg-primary/10 text-primary'"
  	        >
  	          <UIcon
  	            :name="share.type === 'folder'
  	              ? 'i-lucide-folder'
  	              : 'i-lucide-file-text'"
  	            class="size-7"
  	          />
  	        </div>

  	        <div class="min-w-0 flex-1">
  	          <h2 class="truncate text-lg font-semibold text-default">
  	            {{ share.name }}
  	          </h2>
  	          <p class="text-sm text-muted">
  	            {{ share.type === 'folder' ? 'Dossier' : 'Fichier' }}
  	            · Partagé le {{ formattedDate }}
  	          </p>
  	        </div>

  	        <UBadge
  	          :color="share.permission === 'write' ? 'info' : 'neutral'"
  	          variant="subtle"
  	        >
  	          {{ share.permission === 'write' ? 'Modification' : 'Lecture' }}
  	        </UBadge>
  	      </div>
  	    </UCard>

  	    <UCard>
  	      <template #header>
  	        <div class="flex items-center justify-between">
  	          <h2 class="font-semibold text-default">
  	            Accès au partage
  	          </h2>
  	          <UBadge variant="subtle" color="neutral">
  	            {{ share.shareType === 'public-link'
  	              ? 'Lien public'
  	              : `${share.sharedWith.length} personne${share.sharedWith.length > 1 ? 's' : ''}` }}
  	          </UBadge>
  	        </div>
  	      </template>

  	      <div
  	        v-if="share.shareType === 'public-link'"
  	        class="flex items-start gap-3"
  	      >
  	        <UIcon
  	          name="i-lucide-link"
  	          class="mt-1 size-5 text-muted"
  	        />
  	        <div class="flex flex-col gap-1">
  	          <p class="text-sm font-medium text-default">
  	            Partage par lien
  	          </p>
  	          <p class="text-sm text-muted">
  	            Toute personne disposant du lien peut accéder à cet élément
  	            selon les permissions configurées.
  	          </p>
  	        </div>
  	      </div>

  	      <div
  	        v-else-if="share.sharedWith.length"
  	        class="flex flex-col divide-y divide-default"
  	      >
  	        <div
  	          v-for="person in share.sharedWith"
  	          :key="person"
  	          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
  	        >
  	          <div class="flex size-10 items-center justify-center rounded-full bg-elevated">
  	            <UIcon
  	              name="i-lucide-user-round"
  	              class="size-5 text-muted"
  	            />
  	          </div>

  	          <div class="flex-1">
  	            <p class="text-sm font-medium text-default">
  	              {{ person }}
  	            </p>
  	            <p class="text-xs text-muted">
  	              Accès au partage
  	            </p>
  	          </div>

  	          <UBadge
  	            :color="share.permission === 'write' ? 'info' : 'neutral'"
  	            variant="subtle"
  	          >
  	            {{ share.permission === 'write' ? 'Modification' : 'Lecture' }}
  	          </UBadge>
  	        </div>
  	      </div>
  	    </UCard>
  	  </div>

  	  <UCard v-else>
  	    <div class="flex flex-col items-center gap-3 py-8 text-center">
  	      <UIcon
  	        name="i-lucide-file-question"
  	        class="size-10 text-muted"
  	      />
  	      <h2 class="font-semibold text-default">
  	        Partage introuvable
  	      </h2>
  	      <p class="text-sm text-muted">
  	        Ce partage n'existe pas ou n'est plus disponible.
  	      </p>
  	      <UButton
  	        label="Retour aux partages"
  	        to="/partages"
  	        color="neutral"
  	        variant="outline"
  	      />
  	    </div>
  	  </UCard>
  	</div>
	</div>
</template>