<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>()

const emit = defineEmits<{
  tap: [e: any]
}>()

function onClick(e: any) {
  emit('tap', e)
}
</script>

<template>
  <button
    class="base-btn"
    :class="[
      `variant-${variant || 'primary'}`,
      `size-${size || 'md'}`,
      { 'is-block': block, 'is-loading': loading, 'is-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    :loading="loading"
    @tap="onClick"
  >
    <view v-if="loading" class="btn-spinner" />
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: 2rpx solid transparent;
  border-radius: 999rpx;
  font-weight: 700;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 0 24rpx;
}

/* Sizes */
.size-sm {
  height: 60rpx;
  font-size: 24rpx;
  padding: 0 16rpx;
}

.size-md {
  height: 76rpx;
  font-size: 28rpx;
}

.size-lg {
  height: 88rpx;
  font-size: 30rpx;
}

/* Primary */
.variant-primary {
  background: #E8956E;
  color: #FFFFFF;
  border-color: #E8956E;
}

.variant-primary:active {
  background: #D4784E;
  border-color: #D4784E;
}

/* Secondary */
.variant-secondary {
  background: #7EBDA6;
  color: #FFFFFF;
  border-color: #7EBDA6;
}

.variant-secondary:active {
  background: #6AAA93;
  border-color: #6AAA93;
}

/* Ghost */
.variant-ghost {
  background: transparent;
  color: #7B8B7E;
  border-color: transparent;
}

.variant-ghost:active {
  background: #F5F0EA;
}

/* Danger */
.variant-danger {
  background: #E87060;
  color: #FFFFFF;
  border-color: #E87060;
}

.variant-danger:active {
  background: #D45A4A;
  border-color: #D45A4A;
}

/* Outline */
.variant-outline {
  background: transparent;
  color: #E8956E;
  border-color: #E8956E;
}

.variant-outline:active {
  background: #FDF0E8;
}

/* States */
.is-block {
  width: 100%;
}

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.is-disabled:active {
  transform: none;
}

.is-loading {
  opacity: 0.8;
}

/* Spinner */
.btn-spinner {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
