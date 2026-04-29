<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <view class="base-badge" :class="[`v-${variant || 'default'}`, `s-${size || 'md'}`]">
    <slot />
  </view>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  font-weight: 700;
  white-space: nowrap;
}

.s-sm {
  padding: 4rpx 14rpx;
  font-size: 22rpx;
  height: 36rpx;
}

.s-md {
  padding: 8rpx 18rpx;
  font-size: 24rpx;
  height: 44rpx;
}

.v-default {
  background: #F5F0EA;
  color: #7B8B7E;
}

.v-primary {
  background: #FDF0E8;
  color: #E8956E;
}

.v-success {
  background: #EEF7F2;
  color: #6AAA93;
}

.v-warning {
  background: #FDF3D6;
  color: #B88A30;
}

.v-danger {
  background: #FDE8E5;
  color: #E87060;
}

.v-info {
  background: #E8F0F6;
  color: #6A8FA0;
}
</style>
