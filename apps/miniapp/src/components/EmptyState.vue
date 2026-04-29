<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import IconAtom from './IconAtom.vue'

defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="empty-state">
    <view class="empty-icon">
      <IconAtom v-if="icon" :name="icon" :size="80" color="#A8B5A8" />
      <text v-else class="empty-emoji">🐾</text>
    </view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <BaseButton v-if="actionText" variant="outline" size="sm" @tap="emit('action')">
      <IconAtom v-if="actionIcon" :name="actionIcon" :size="32" />
      {{ actionText }}
    </BaseButton>
  </view>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 24rpx;
  text-align: center;
  gap: 12rpx;
}

.empty-icon {
  margin-bottom: 8rpx;
}

.empty-emoji {
  font-size: 80rpx;
  line-height: 1;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #7B8B7E;
}

.empty-desc {
  font-size: 24rpx;
  color: #A8B5A8;
  line-height: 1.5;
}
</style>
