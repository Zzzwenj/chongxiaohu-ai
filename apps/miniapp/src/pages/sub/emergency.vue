<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import RiskBadge from '../../components/RiskBadge.vue'
import { buildApiUrl } from '../../config/api'

const emergencies = [
  { icon: 'alert', title: '呼吸困难或舌头发紫', desc: '立即就医，可能是严重呼吸道问题' },
  { icon: 'alert', title: '抽搐或昏迷', desc: '神经症状，需要紧急处理' },
  { icon: 'alert', title: '公猫尿不出', desc: '可能是尿闭，危及生命' },
  { icon: 'alert', title: '大量出血', desc: '压迫止血，立即送医' },
  { icon: 'alert', title: '误食毒物/人药', desc: '不要自行催吐，立即联系医院' },
  { icon: 'alert', title: '中暑', desc: '降温处理，立即送医' },
  { icon: 'alert', title: '严重腹胀或难产', desc: '需紧急手术评估' },
  { icon: 'alert', title: '从高处坠落或车祸', desc: '可能有内伤，不要随意移动' },
]

const selectedEmergency = ref<{ title: string; desc: string } | null>(null)
const showGuide = ref(false)

function selectEmergency(e: { title: string; desc: string }) {
  selectedEmergency.value = e
  showGuide.value = true
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.redirectTo({ url: '/pages/index/index' })
  }
}
</script>

<template>
  <view class="page anim-page-enter">
    <TopBar title="紧急求助" showBack :showEmergency="false" @back="goBack" />

    <!-- Emergency Header -->
    <view class="emergency-header">
      <view class="emergency-icon-wrap">
        <IconAtom name="emergency" :size="48" color="#FFFFFF" />
      </view>
      <text class="emergency-title">紧急求助</text>
      <text class="emergency-desc">如果宠物出现以下任何症状，请立即联系宠物医院</text>
    </view>

    <!-- Emergency list -->
    <view class="emergency-list">
      <view
        v-for="(e, idx) in emergencies"
        :key="e.title"
        class="emergency-item"
        :style="{ animationDelay: `${idx * 50}ms` }"
        @tap="selectEmergency(e)"
      >
        <view class="ei-icon-wrap">
          <IconAtom name="alert" :size="28" color="#E87060" />
        </view>
        <view class="ei-body">
          <text class="ei-title">{{ e.title }}</text>
          <text class="ei-desc">{{ e.desc }}</text>
        </view>
        <IconAtom name="forward" :size="28" color="#A8B5A8" />
      </view>
    </view>

    <!-- Guide Card (animated expand) -->
    <view v-if="showGuide && selectedEmergency" class="guide-section anim-fade-in-up">
      <BaseCard padding="28rpx" class="guide-card">
        <view class="guide-header">
          <RiskBadge level="red" size="lg" pulsate />
          <text class="guide-title">{{ selectedEmergency.title }}</text>
        </view>
        <text class="guide-text">{{ selectedEmergency.desc }}</text>

        <view class="guide-steps">
          <view class="guide-step">
            <view class="gs-num">1</view>
            <text class="gs-text">保持冷静，不要给宠物口服任何东西</text>
          </view>
          <view class="guide-step">
            <view class="gs-num">2</view>
            <text class="gs-text">找到最近的宠物医院并电话联系</text>
          </view>
          <view class="guide-step">
            <view class="gs-num">3</view>
            <text class="gs-text">记录症状开始时间和变化</text>
          </view>
          <view class="guide-step">
            <view class="gs-num">4</view>
            <text class="gs-text">拍照/录像留证，带上之前的病历</text>
          </view>
        </view>

        <BaseButton variant="danger" block @tap="uni.navigateTo({ url: '/pages/sub/summary' })">
          <IconAtom name="edit" :size="24" />
          生成就医摘要
        </BaseButton>
      </BaseCard>
    </view>

    <!-- Caution -->
    <BaseCard padding="20rpx 24rpx" class="caution-card">
      <view class="caution-content">
        <view class="caution-icon">
          <IconAtom name="alert" :size="28" color="#E8B84F" />
        </view>
        <text class="caution-text">
          本平台不提供诊断或治疗建议。以上信息仅供紧急情况参考，不能替代执业兽医的现场检查。
        </text>
      </view>
    </BaseCard>
  </view>
</template>

<style scoped>
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FDE8E5 0%, #FAF7F2 300rpx);
}

/* ===== Header ===== */
.emergency-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 0 28rpx;
  text-align: center;
}

.emergency-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #E87060;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 12rpx rgba(232, 112, 96, 0.12);
  margin-bottom: 4rpx;
}

.emergency-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #E87060;
}

.emergency-desc {
  font-size: 24rpx;
  color: #7B8B7E;
  line-height: 1.5;
  max-width: 520rpx;
}

/* ===== Emergency List ===== */
.emergency-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.emergency-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx 18rpx;
  background: #FFFFFF;
  border: 2rpx solid rgba(232, 112, 96, 0.12);
  border-radius: 18rpx;
  animation: fade-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all 150ms;
}

.emergency-item:active {
  transform: scale(0.98);
  border-color: rgba(232, 112, 96, 0.3);
}

.ei-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  background: #FDE8E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ei-body {
  flex: 1;
}

.ei-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
}

.ei-desc {
  font-size: 22rpx;
  color: #A8B5A8;
}

/* ===== Guide Card ===== */
.guide-section {
  margin-bottom: 24rpx;
}

.guide-card {
  border-color: #E87060;
  border-width: 3rpx;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 16rpx;
}

.guide-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #E87060;
  flex: 1;
}

.guide-text {
  font-size: 26rpx;
  color: #7B8B7E;
  display: block;
  margin-bottom: 24rpx;
  line-height: 1.6;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.guide-step {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.gs-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #E87060;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.gs-text {
  font-size: 24rpx;
  color: #2D3436;
  line-height: 1.5;
}

/* ===== Caution ===== */
.caution-card {
  margin-bottom: 24rpx;
  border-color: #E8B84F;
}

.caution-content {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.caution-icon {
  width: 44rpx;
  height: 44rpx;
  background: #FDF3D6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.caution-text {
  flex: 1;
  font-size: 22rpx;
  color: #7B8B7E;
  line-height: 1.6;
}
</style>
