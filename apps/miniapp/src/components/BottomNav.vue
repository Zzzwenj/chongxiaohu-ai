<script setup lang="ts">
import IconAtom from './IconAtom.vue'

interface NavItem {
  key: string
  label: string
  icon: string
  activeIcon?: string
  pagePath: string
}

const props = defineProps<{
  current: string
}>()

const items: NavItem[] = [
  { key: 'home', label: '首页', icon: 'home', pagePath: '/pages/index/index' },
  { key: 'ai', label: 'AI助手', icon: 'chat', pagePath: '/pages/ai/index' },
  { key: 'health', label: '健康', icon: 'heart', pagePath: '/pages/health/index' },
  { key: 'profile', label: '我的', icon: 'user', pagePath: '/pages/profile/index' },
]

function onTap(key: string) {
  const item = items.find(nav => nav.key === key)
  if (!item || item.key === props.current) return
  uni.redirectTo({ url: item.pagePath })
}
</script>

<template>
  <view class="bottom-nav">
    <view
      v-for="item in items"
      :key="item.key"
      class="nav-item"
      :class="{ 'is-active': current === item.key }"
      @tap="onTap(item.key)"
    >
      <IconAtom
        :name="item.icon"
        :size="44"
        :color="current === item.key ? '#E8956E' : '#A8B5A8'"
      />
      <text class="nav-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  height: 104rpx;
  padding: 8rpx 18rpx constant(safe-area-inset-bottom);
  padding: 8rpx 18rpx env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.98);
  border-top: 2rpx solid #F0EBE4;
  box-shadow: 0 -8rpx 30rpx rgba(45, 52, 54, 0.06);
  box-sizing: content-box;
}

.nav-item {
  min-width: 126rpx;
  height: 92rpx;
  border-radius: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-sizing: border-box;
}

.nav-item.is-active {
  background: #FDF0E8;
}

.nav-label {
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 600;
  color: #A8B5A8;
}

.is-active .nav-label {
  color: #E8956E;
  font-weight: 800;
}
</style>
