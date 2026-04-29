<script setup lang="ts">
defineProps<{
  level: 'green' | 'yellow' | 'red'
  size?: 'sm' | 'md' | 'lg'
  pulsate?: boolean
}>()

const labels: Record<string, string> = {
  green: '居家观察',
  yellow: '尽快就医',
  red: '立即急诊'
}
</script>

<template>
  <view
    class="risk-badge"
    :class="[`level-${level}`, `size-${size || 'md'}`, { 'is-pulsating': pulsate }]"
  >
    <view class="risk-dot" />
    <text class="risk-label">{{ labels[level] }}</text>
  </view>
</template>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  border-radius: 999rpx;
  font-weight: 700;
}

.size-sm {
  padding: 4rpx 14rpx;
  font-size: 22rpx;
}
.size-sm .risk-dot {
  width: 10rpx;
  height: 10rpx;
}

.size-md {
  padding: 6rpx 18rpx;
  font-size: 24rpx;
}
.size-md .risk-dot {
  width: 14rpx;
  height: 14rpx;
}

.size-lg {
  padding: 10rpx 24rpx;
  font-size: 28rpx;
}
.size-lg .risk-dot {
  width: 16rpx;
  height: 16rpx;
}

.risk-dot {
  border-radius: 50%;
}

/* Green */
.level-green {
  background: #EEF7F2;
  color: #6AAA93;
}
.level-green .risk-dot {
  background: #7EBDA6;
}

/* Yellow */
.level-yellow {
  background: #FDF3D6;
  color: #B88A30;
}
.level-yellow .risk-dot {
  background: #E8B84F;
}

/* Red */
.level-red {
  background: #FDE8E5;
  color: #E87060;
}
.level-red .risk-dot {
  background: #E87060;
}

.is-pulsating {
  animation: ring-pulse 2s infinite;
}
</style>
