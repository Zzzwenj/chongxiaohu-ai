<script setup lang="ts">
defineProps<{
  padding?: string
  shadow?: 'sm' | 'md' | 'lg' | 'card'
  radius?: string
  color?: string
  pressable?: boolean
}>()

const shadowMap = {
  sm: '0 4rpx 12rpx rgba(45, 52, 54, 0.06)',
  md: '0 8rpx 24rpx rgba(45, 52, 54, 0.08)',
  lg: '0 16rpx 44rpx rgba(45, 52, 54, 0.10)',
  card: '0 6rpx 20rpx rgba(45, 52, 54, 0.07)'
}
</script>

<template>
  <view
    class="base-card"
    :class="{ 'is-pressable': pressable }"
    :style="{
      padding: padding || '24rpx',
      borderRadius: radius || '18rpx',
      boxShadow: shadowMap[shadow || 'card'],
      borderColor: color || '#E8E0D8'
    }"
  >
    <slot />
  </view>
</template>

<style scoped>
.base-card {
  background: #FFFFFF;
  border: 2rpx solid #E8E0D8;
  border-radius: 18rpx;
  box-shadow: 0 6rpx 20rpx rgba(45, 52, 54, 0.07);
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.is-pressable:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(45, 52, 54, 0.06);
}
</style>
