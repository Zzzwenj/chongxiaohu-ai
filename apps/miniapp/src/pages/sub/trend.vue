<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import EmptyState from '../../components/EmptyState.vue'

// Mock data for trends
const weightData = [
  { date: '1月', weight: 4.6 },
  { date: '2月', weight: 4.7 },
  { date: '3月', weight: 4.8 },
  { date: '4月', weight: 4.8 },
]

const maxWeight = 5.5
const minWeight = 4.0

const maxVal = Math.max(...weightData.map(d => d.weight), maxWeight)
const minVal = Math.min(...weightData.map(d => d.weight), minWeight)
const range = maxVal - minVal || 1

/** Bar height as % of container, proportional */
function barHeight(w: number): string {
  return ((w - minVal) / range * 60 + 25) + '%'
}

const riskHistory = [
  { date: '04/20', level: 'green', label: '日常咨询' },
  { date: '04/18', level: 'green', label: '餐食建议' },
  { date: '04/15', level: 'yellow', label: '呕吐咨询' },
  { date: '04/10', level: 'green', label: '换粮咨询' },
]

const levelLabels: Record<string, string> = {
  green: '低风险',
  yellow: '中风险',
  red: '高风险'
}
</script>

<template>
  <view class="page anim-page-enter">
    <TopBar title="健康趋势" showBack @back="uni.navigateBack()" />
    <SectionHeader title="健康趋势" kicker="数据分析" />

    <!-- Weight Trend -->
    <BaseCard padding="24rpx" class="trend-card">
      <view class="trend-card-header">
        <view class="trend-card-title">
          <IconAtom name="weight" :size="28" color="#8BB9D6" />
          <text>体重变化</text>
        </view>
        <text class="trend-card-unit">单位：kg</text>
      </view>

      <view class="chart">
        <view v-for="(d, i) in weightData" :key="i" class="chart-bar-col">
          <text class="chart-value">{{ d.weight }}</text>
          <view class="chart-bar-track">
            <view
              class="chart-bar"
              :style="{ height: barHeight(d.weight) }"
              :class="{ 'is-latest': i === weightData.length - 1 }"
            />
          </view>
          <text class="chart-label">{{ d.date }}</text>
        </view>
      </view>
      <text class="chart-note">近期体重稳定，保持在 4.8kg 左右</text>
    </BaseCard>

    <!-- Risk History -->
    <BaseCard padding="24rpx" class="trend-card">
      <view class="trend-card-header">
        <view class="trend-card-title">
          <IconAtom name="heart" :size="28" color="#7EBDA6" />
          <text>咨询历史</text>
        </view>
      </view>

      <view class="risk-timeline">
        <view v-for="(r, i) in riskHistory" :key="i" class="risk-item" :style="{ animationDelay: `${i * 60}ms` }">
          <view class="risk-timeline-col">
            <view class="risk-dot" :class="`dot-${r.level}`" />
            <view v-if="i < riskHistory.length - 1" class="risk-line" />
          </view>
          <view class="risk-content">
            <text class="risk-label">{{ r.label }}</text>
            <view class="risk-meta">
              <text class="risk-date">{{ r.date }}</text>
              <view class="risk-level-tag" :class="`tag-${r.level}`">{{ levelLabels[r.level] }}</view>
            </view>
          </view>
        </view>
      </view>

      <EmptyState
        v-if="riskHistory.length === 0"
        icon="heart"
        title="还没有咨询记录"
        description="开始使用 AI 助手后，这里会显示你的咨询历史"
      />
    </BaseCard>

  </view>
</template>

<style scoped>
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
  background: #FAF7F2;
}

.trend-card {
  margin-bottom: 24rpx;
}

.trend-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.trend-card-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
}

.trend-card-unit {
  font-size: 20rpx;
  color: #A8B5A8;
}

/* ===== Chart ===== */
.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200rpx;
  padding: 12rpx 0;
  gap: 12rpx;
}

.chart-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  height: 100%;
}

.chart-value {
  font-size: 22rpx;
  font-weight: 700;
  color: #7B8B7E;
}

.chart-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.chart-bar {
  width: 60rpx;
  background: linear-gradient(180deg, #F5D5C0, #EBC4A8);
  border-radius: 30rpx 30rpx 0 0;
  transition: height 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 24rpx;
}

.chart-bar.is-latest {
  background: linear-gradient(180deg, #E8956E, #D4784E);
  box-shadow: 0 0 16rpx rgba(232, 149, 110, 0.3);
}

.chart-label {
  font-size: 22rpx;
  color: #A8B5A8;
}

.chart-note {
  font-size: 22rpx;
  color: #A8B5A8;
  text-align: center;
  display: block;
  margin-top: 16rpx;
  padding: 12rpx;
  background: #F5F0EA;
  border-radius: 10rpx;
}

/* ===== Risk Timeline ===== */
.risk-timeline {
  padding: 8rpx 0;
}

.risk-item {
  display: flex;
  gap: 16rpx;
  animation: fade-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.risk-timeline-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24rpx;
}

.risk-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green { background: #7EBDA6; }
.dot-yellow { background: #E8B84F; }
.dot-red { background: #E87060; }

.risk-line {
  width: 3rpx;
  flex: 1;
  min-height: 32rpx;
  background: #F0EBE4;
  margin-top: 4rpx;
}

.risk-content {
  flex: 1;
  padding-bottom: 24rpx;
  min-width: 0;
}

.risk-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #2D3436;
  display: block;
  margin-bottom: 4rpx;
}

.risk-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.risk-date {
  font-size: 22rpx;
  color: #A8B5A8;
}

.risk-level-tag {
  font-size: 18rpx;
  font-weight: 600;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.tag-green { background: #EEF7F2; color: #6AAA93; }
.tag-yellow { background: #FDF3D6; color: #C49B3A; }
.tag-red { background: #FDE8E5; color: #E87060; }
</style>
