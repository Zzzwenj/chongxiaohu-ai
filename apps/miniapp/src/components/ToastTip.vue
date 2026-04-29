<script setup lang="ts">
import { ref, watch } from 'vue'
import IconAtom from './IconAtom.vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}>()

const visible = ref(false)

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
    }, props.duration || 2500)
  }
})
</script>

<template>
  <view v-if="visible" class="toast-overlay">
    <view class="toast-box" :class="`toast-${type || 'info'}`">
      <IconAtom
        v-if="type === 'success'"
        name="check"
        :size="36"
        color="#7EBDA6"
      />
      <IconAtom
        v-else-if="type === 'error'"
        name="close"
        :size="36"
        color="#E87060"
      />
      <IconAtom
        v-else-if="type === 'warning'"
        name="alert"
        :size="36"
        color="#E8B84F"
      />
      <text class="toast-message">{{ message }}</text>
    </view>
  </view>
</template>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 300;
}

.toast-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  background: #FFFFFF;
  border-radius: 999rpx;
  box-shadow: 0 16rpx 44rpx rgba(45, 52, 54, 0.10);
  animation: fade-in-up 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: 600rpx;
}

.toast-message {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D3436;
}

.toast-success {
  border: 2rpx solid #7EBDA6;
}
.toast-error {
  border: 2rpx solid #E87060;
}
.toast-warning {
  border: 2rpx solid #E8B84F;
}
.toast-info {
  border: 2rpx solid #7EBDA6;
}
</style>
