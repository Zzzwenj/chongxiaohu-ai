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
  { key: 'home', label: '今日', icon: 'home', pagePath: '/pages/index/index' },
  { key: 'ai', label: 'AI', icon: 'chat', pagePath: '/pages/ai/index' },
  { key: 'health', label: '记录', icon: 'heart', pagePath: '/pages/health/index' },
  { key: 'profile', label: '我的', icon: 'user', pagePath: '/pages/profile/index' },
]

function onTap(key: string) {
  const item = items.find(nav => nav.key === key)
  if (!item || item.key === props.current) return
  uni.reLaunch({ url: item.pagePath })
}
</script>

<template>
  <view class="bottom-nav">
    <view
      v-for="item in items"
      :key="item.key"
      class="nav-item"
      :class="{ 'is-active': current === item.key }"
      :aria-label="`${item.label}${current === item.key ? '，当前页' : ''}`"
      aria-role="button"
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
  min-height: 108rpx;
  padding: 8rpx 18rpx;
  padding-bottom: calc(8rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(8rpx + env(safe-area-inset-bottom, 0px));
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
  min-height: 92rpx;
  border-radius: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-sizing: border-box;
  transition: background 160ms ease, transform 160ms ease;
}

.nav-item:active {
  transform: scale(0.96);
}

.nav-item.is-active {
  background: #FDF0E8;
  box-shadow: inset 0 0 0 2rpx rgba(232, 149, 110, 0.18);
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
