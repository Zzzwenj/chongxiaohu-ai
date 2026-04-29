<script setup lang="ts">
defineProps<{
  type?: 'card' | 'text' | 'circle' | 'list'
  count?: number
  height?: number
  width?: string
  radius?: string
}>()
</script>

<template>
  <view v-if="type === 'card'" class="skeleton-card" :style="{ borderRadius: radius || '18rpx' }">
    <view class="skeleton-block" style="height: 140rpx; border-radius: 18rpx;" />
    <view class="skeleton-block" style="width: 60%; height: 28rpx; margin-top: 20rpx;" />
    <view class="skeleton-block" style="width: 80%; height: 24rpx; margin-top: 12rpx;" />
  </view>

  <view v-else-if="type === 'circle'" class="skeleton-circle" :style="{ width: (height || 80) + 'rpx', height: (height || 80) + 'rpx' }" />

  <view v-else-if="type === 'list'" class="skeleton-list">
    <view v-for="i in (count || 3)" :key="i" class="skeleton-list-item">
      <view class="skeleton-block" style="width: 44rpx; height: 44rpx; border-radius: 50%; flex-shrink: 0;" />
      <view style="flex: 1;">
        <view class="skeleton-block" style="width: 50%; height: 26rpx;" />
        <view class="skeleton-block" style="width: 70%; height: 22rpx; margin-top: 8rpx;" />
      </view>
    </view>
  </view>

  <view v-else class="skeleton-text" :style="{ width: width || '100%' }">
    <view
      class="skeleton-block"
      :style="{
        height: (height || 28) + 'rpx',
        borderRadius: radius || '8rpx'
      }"
    />
  </view>
</template>

<style scoped>
.skeleton-block {
  background: linear-gradient(90deg, #F5F0EA 25%, #F0EBE4 50%, #F5F0EA 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8rpx;
}

.skeleton-card {
  padding: 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 18rpx;
}

.skeleton-circle {
  border-radius: 50%;
  background: linear-gradient(90deg, #F5F0EA 25%, #F0EBE4 50%, #F5F0EA 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-list-item {
  display: flex;
  gap: 16rpx;
  align-items: center;
  padding: 16rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 12rpx;
}

.skeleton-text {
  display: block;
}
</style>
