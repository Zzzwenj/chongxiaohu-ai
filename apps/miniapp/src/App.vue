<script setup lang="ts"></script>

<template>
  <slot />
</template>

<style>
@import "./styles/typography.css";
@import "./styles/animations.css";
@import "./styles/tokens.css";

/* ===== Global Reset & Base ===== */
page {
  margin: 0;
  padding: 0;
  background: #FAF7F2;
  color: #2D3436;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
               "Microsoft YaHei", "Helvetica Neue", sans-serif;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

button, input, textarea {
  font-family: inherit;
}

view, scroll-view, text, input, textarea, button {
  box-sizing: border-box;
}

/* Reset uni-app button defaults */
button {
  padding: 0;
  margin: 0;
  background: transparent;
  line-height: inherit;
}

button::after {
  border: none;
}

/* ===== Standard Page Container ===== */
.page {
  min-height: 100vh;
  background: #FAF7F2;
}

/* ===== Page Body (content below TopBar) ===== */
.page-body {
  padding: 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom, 20rpx));
}

/* ===== Safe Area Helpers ===== */
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ===== TopBar ===== */
.top-bar {
  width: 100%;
  flex-shrink: 0;
  border-bottom: 2rpx solid #F0EBE4;
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
  padding: 0 12rpx;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
}

.nav-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2D3436;
  max-width: 360rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.emergency-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 6rpx 14rpx;
  background: #FDE8E5;
  border-radius: 999rpx;
}

.emergency-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #E87060;
}

/* ===== BottomNav ===== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #FFFFFF;
  border-top: 2rpx solid #F0EBE4;
  z-index: 10;
  box-sizing: content-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  min-width: 120rpx;
  padding: 8rpx 0;
  box-sizing: border-box;
}

.nav-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #A8B5A8;
}

.is-active .nav-label {
  color: #E8956E;
  font-weight: 700;
}

/* ===== Debug / Dev helpers ===== */
.debug-outline view {
  /* outline: 1rpx solid rgba(232, 112, 96, 0.3); */
}
</style>
