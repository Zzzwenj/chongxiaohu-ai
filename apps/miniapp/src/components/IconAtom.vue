<script setup lang="ts">
import IconSvg from './icons/IconSvg.vue'

defineProps<{
  name: string
  size?: number
  color?: string
}>()
</script>

<template>
  <IconSvg :name="name" :size="size" :color="color" />
</template>
