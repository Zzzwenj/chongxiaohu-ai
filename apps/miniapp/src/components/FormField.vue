<script setup lang="ts">
defineProps<{
  label: string
  type?: 'text' | 'digit' | 'textarea' | 'picker'
  placeholder?: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: any) {
  emit('update:modelValue', e.detail?.value ?? e.target?.value ?? e)
}
</script>

<template>
  <view class="form-field">
    <text class="form-label">{{ label }}</text>
    <input
      v-if="type === 'text' || !type"
      :value="modelValue"
      class="form-input"
      :placeholder="placeholder"
      @input="onInput"
    />
    <input
      v-else-if="type === 'digit'"
      :value="modelValue"
      class="form-input"
      type="digit"
      :placeholder="placeholder"
      @input="onInput"
    />
    <textarea
      v-else-if="type === 'textarea'"
      :value="modelValue"
      class="form-textarea"
      :placeholder="placeholder"
      @input="onInput"
    />
  </view>
</template>

<style scoped>
.form-field {
  margin-bottom: 16rpx;
}

.form-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 6rpx;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2D3436;
  border: 2rpx solid #F0EBE4;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2D3436;
  border: 2rpx solid #F0EBE4;
  box-sizing: border-box;
}
</style>
