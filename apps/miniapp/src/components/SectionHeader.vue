<script setup lang="ts">
import BaseBadge from './BaseBadge.vue'

defineProps<{
  title: string
  kicker?: string
  action?: string
  badge?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="section-header">
    <view class="section-header-left">
      <text v-if="kicker" class="section-kicker">{{ kicker }}</text>
      <text class="section-title">{{ title }}</text>
    </view>
    <view class="section-header-right">
      <BaseBadge v-if="badge" size="sm" variant="default">{{ badge }}</BaseBadge>
      <text v-if="action" class="section-action" @tap="emit('action')">{{ action }}</text>
    </view>
  </view>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-header-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.section-kicker {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  text-transform: uppercase;
  letter-spacing: 0;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2D3436;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-action {
  font-size: 24rpx;
  color: #E8956E;
  font-weight: 500;
}
</style>
