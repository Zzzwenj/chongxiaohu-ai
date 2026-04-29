<script setup lang="ts">
import BaseButton from './BaseButton.vue'

defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <view v-if="visible" class="dialog-overlay" @tap.self="emit('cancel')">
    <view class="dialog-box" :class="{ 'is-danger': variant === 'danger' }">
      <text class="dialog-title">{{ title }}</text>
      <text class="dialog-message">{{ message }}</text>
      <view class="dialog-actions">
        <BaseButton class="dialog-action" variant="ghost" size="sm" @tap="emit('cancel')">
          {{ cancelText || '取消' }}
        </BaseButton>
        <BaseButton
          class="dialog-action"
          :variant="variant === 'danger' ? 'danger' : 'primary'"
          size="sm"
          @tap="emit('confirm')"
        >
          {{ confirmText || '确定' }}
        </BaseButton>
      </view>
    </view>
  </view>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 52, 54, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-box {
  width: 560rpx;
  padding: 32rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  animation: fade-in-scale 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2D3436;
  text-align: center;
}

.dialog-message {
  font-size: 28rpx;
  color: #7B8B7E;
  line-height: 1.6;
  text-align: center;
}

.dialog-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.dialog-action {
  flex: 1;
}
</style>
