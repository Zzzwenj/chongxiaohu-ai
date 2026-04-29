<script setup lang="ts">
defineProps<{
  options: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function select(val: string) {
  emit('update:modelValue', val)
}
</script>

<template>
  <view class="toggle-row">
    <view
      v-for="opt in options"
      :key="opt"
      class="toggle-btn"
      :class="{ 'is-active': modelValue === opt }"
      @tap="select(opt)"
    >
      <text class="toggle-text">{{ opt }}</text>
    </view>
  </view>
</template>

<style scoped>
.toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.toggle-btn {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #7B8B7E;
  background: #F5F0EA;
  border: 2rpx solid #F0EBE4;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn.is-active {
  color: #FFFFFF;
  background: #E8956E;
  border-color: #E8956E;
  font-weight: 700;
}

.toggle-btn:active {
  transform: scale(0.96);
}
</style>
