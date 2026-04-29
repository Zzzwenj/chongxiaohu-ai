<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconAtom from './IconAtom.vue'

const props = defineProps<{
  title?: string
  showBack?: boolean
  showEmergency?: boolean
  bgColor?: string
}>()

const emit = defineEmits<{
  back: []
  emergency: []
}>()

// ===== 微信导航栏标准计算公式 =====
// 总高度 = statusBarHeight + navBarHeight
// navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
// 参考: https://developers.weixin.qq.com/miniprogram/dev/api/ui/menu/wx.getMenuButtonBoundingClientRect.html

const navBarHeight = ref(44)       // 导航栏自身高度（不含状态栏）
const statusBarHeight = ref(44)    // 状态栏高度
const totalHeight = ref(88)        // 总高度 = statusBar + navBar
const rightInset = ref(16)         // 右侧预留给微信胶囊按钮的空间

onMounted(() => {
  try {
    const sys = uni.getSystemInfoSync()

    // 1. 获取状态栏高度（单位：px）
    // iOS 刘海屏 ~44px, 灵动岛 ~54px, 普通 ~20px
    // Android 一般 24-48px
    if (sys.statusBarHeight && sys.statusBarHeight > 0) {
      statusBarHeight.value = sys.statusBarHeight
    } else {
      statusBarHeight.value = sys.ios ? 44 : 24
    }

    // 2. 通过菜单按钮计算导航栏高度
    try {
      const menu = uni.getMenuButtonBoundingClientRect()
      if (menu && menu.top > 0 && menu.height > 0) {
        // 标准公式：navBarHeight = (menu.top - statusBar) * 2 + menu.height
        navBarHeight.value = (menu.top - statusBarHeight.value) * 2 + menu.height
        rightInset.value = Math.max((sys.windowWidth || 375) - menu.left + 10, 16)
      }
    } catch {
      // 兜底：44px
      navBarHeight.value = 44
    }

    totalHeight.value = statusBarHeight.value + navBarHeight.value
  } catch {
    statusBarHeight.value = 44
    navBarHeight.value = 44
    totalHeight.value = 88
    rightInset.value = 16
  }
})

function goBack() {
  emit('back')
}

function goEmergency() {
  emit('emergency')
}
</script>

<template>
  <!--
    微信 navigationStyle: "custom" 时 page 从屏幕最顶部开始。
    TopBar 占据总高度 = statusBarHeight + navBarHeight，
    用 position: relative 正常流布局自然将后续内容推下。
  -->
  <view
    class="top-bar"
    :style="{
      height: totalHeight + 'px',
      paddingRight: rightInset + 'px',
      background: bgColor || '#FAF7F2'
    }"
  >
    <!-- 状态栏区域（占位） -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 导航栏区域 -->
    <view class="nav-bar" :style="{ height: navBarHeight + 'px' }">
      <view class="nav-left">
        <view v-if="showBack" class="nav-btn" @tap="goBack">
          <IconAtom name="back" :size="40" color="#2D3436" />
        </view>
        <text v-if="title" class="nav-title">{{ title }}</text>
        <slot name="left" />
      </view>
      <view class="nav-right">
        <slot name="right" />
        <view v-if="showEmergency" class="emergency-btn" @tap="goEmergency">
          <IconAtom name="alert" :size="32" color="#E87060" />
          <text class="emergency-text">急症</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 80;
  padding-left: 24rpx;
  border-bottom: 2rpx solid rgba(240, 235, 228, 0.88);
  box-sizing: border-box;
}

.status-bar {
  width: 100%;
  flex-shrink: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  gap: 16rpx;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.nav-left {
  flex: 1;
  gap: 12rpx;
}

.nav-right {
  flex-shrink: 0;
  gap: 10rpx;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.72);
}

.nav-title {
  display: block;
  max-width: 390rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 800;
  color: #2D3436;
}

.emergency-btn {
  height: 60rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FDE8E5;
  flex-shrink: 0;
}

.emergency-text {
  font-size: 22rpx;
  font-weight: 800;
  color: #E87060;
}
</style>
