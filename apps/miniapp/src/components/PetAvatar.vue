<script setup lang="ts">
defineProps<{
  name: string
  species?: 'cat' | 'dog'
  size?: number
  src?: string
}>()

function initials(name: string): string {
  return name.charAt(0)
}

const speciesColors: Record<string, string> = {
  cat: '#FDF0E8',
  dog: '#EEF7F2'
}
const speciesTextColors: Record<string, string> = {
  cat: '#E8956E',
  dog: '#6AAA93'
}
</script>

<template>
  <view
    class="pet-avatar"
    :style="{
      width: (size || 80) + 'rpx',
      height: (size || 80) + 'rpx',
      background: src ? 'transparent' : (speciesColors[species || 'cat'] || '#F5F0EA'),
    }"
  >
    <image
      v-if="src"
      :src="src"
      mode="aspectFill"
      class="avatar-img"
      :style="{ borderRadius: (size || 80) / 2 + 'rpx' }"
    />
    <text
      v-else
      class="avatar-initials"
      :style="{
        fontSize: ((size || 80) * 0.4) + 'rpx',
        color: speciesTextColors[species || 'cat'] || '#E8956E'
      }"
    >
      {{ initials(name) }}
    </text>
  </view>
</template>

<style scoped>
.pet-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-initials {
  font-weight: 900;
  line-height: 1;
}
</style>
