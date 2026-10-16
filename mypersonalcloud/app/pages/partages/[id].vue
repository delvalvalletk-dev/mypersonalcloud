<script setup lang="ts">
const route = useRoute()

const shareId = computed(() => String(route.params.id))
console.log(shareId)
</script>

<template>
  <ShareDetails :share-id="shareId" />
</template>
