<script setup>
  
</script>

<template>
  <div class="flex flex-col">
    <TrashbinHeader @empty="askEmptyTrash"/>
		<TrashbinNotice />

    <TrashbinTableView
      :items="items"
      @restore="restoreItem"
      @delete="askDelete"
    />
		
  </div>
</template>