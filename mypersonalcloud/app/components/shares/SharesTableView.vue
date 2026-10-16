<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type ShareItem = {
  id: string
  fileId: string
  name: string
  type: 'file' | 'folder'
  sharedWith: string[]
  permission: 'read' | 'write'
  shareType: 'people' | 'public-link'
  sharedAt: string
}

defineProps<{
  items: ShareItem[]
}>()

const columns: TableColumn<ShareItem>[] = [
  {
    id: 'name',
    header: 'Nom'
  },
  {
    id: 'sharedWith',
    header: 'Partagé avec'
  },
  {
    id: 'permission',
    header: 'Droits'
  }
]
</script>

<template>
	<div class="p-5">
  	<div class="flex flex-col gap-3">
  	  <div class="flex items-center justify-between">
  	    <h2 class="text-base font-semibold text-default">
  	      Éléments partagés
  	    </h2>

  	    <span class="text-sm text-muted">
  	      {{ items.length }} élément{{ items.length > 1 ? 's' : '' }}
  	    </span>
  	  </div>

  	  <div class="overflow-hidden rounded-xl border border-default">
  	    <UTable
  	      :data="items"
  	      :columns="columns"
  	      :empty="{
  	        icon: 'i-lucide-folder-open',
  	        label: 'Aucun élément partagé',
  	        description: 'Les fichiers et dossiers que vous partagez apparaîtront ici.'
  	      }"
  	    >
  	      <template #name-cell="{ row }">
  	        <div class="flex min-w-0 items-center gap-3">
  	          <div
  	            class="flex size-10 shrink-0 items-center justify-center rounded-lg"
  	            :class="row.original.type === 'folder'
  	              ? 'bg-warning/10 text-warning'
  	              : 'bg-primary/10 text-primary'"
  	          >
  	            <UIcon
  	              :name="row.original.type === 'folder'
  	                ? 'i-lucide-folder'
  	                : 'i-lucide-file-text'"
  	              class="size-5"
  	            />
  	          </div>

  	          <span class="truncate font-medium text-default">
  	            {{ row.original.name }}
  	          </span>
  	        </div>
  	      </template>

					<template #sharedWith-cell="{ row }">
					  <div class="flex items-center gap-2 text-sm text-muted">
					    <UIcon
					      :name="row.original.shareType === 'public-link'
					        ? 'i-lucide-link'
					        : 'i-lucide-users'"
					      class="size-4 shrink-0"
					    />
						
					    <span>
					      {{
					        row.original.shareType === 'public-link'
					          ? 'Lien public'
					          : `${row.original.sharedWith.length} personne${row.original.sharedWith.length > 1 ? 's' : ''}`
					      }}
					    </span>
					  </div>
					</template>

  	      <template #permission-cell="{ row }">
  	        <UBadge
  	          :color="row.original.permission === 'write' ? 'info' : 'neutral'"
  	          variant="subtle"
  	        >
  	          {{
  	            row.original.permission === 'write'
  	              ? 'Modification'
  	              : 'Lecture'
  	          }}
  	        </UBadge>
  	      </template>
  	    </UTable>
  	  </div>
  	</div>
	</div>
</template>
