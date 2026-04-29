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

function barHeight(w: number): string {
  return ((w - minVal) / (maxVal - minVal) * 60 + 20) + '%'
}

const riskHistory = [
  { date: '04/20', level: 'green', label: '日常咨询' },
  { date: '04/18', level: 'green', label: '餐食建议' },
  { date: '04/15', level: 'yellow', label: '呕吐咨询' },
  { date: '04/10', level: 'green', label: '换粮咨询' },
]
</script>

<template>
  <view class="page">
    <TopBar title="健康趋势" showBack @back="uni.navigateBack()" />
    <SectionHeader title="健康趋势" kicker="Trends" />

    <!-- Weight Trend -->
    <BaseCard padding="24rpx" class="trend-card">
      <SectionHeader title="体重变化" kicker="Weight" />
      <view class="chart">
        <view v-for="(d, i) in weightData" :key="i" class="chart-bar-col">
          <text class="chart-value">{{ d.weight }}</text>
          <view class="chart-bar-wrapper">
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
      <SectionHeader title="咨询历史" kicker="History" />

      <view class="risk-timeline">
        <view v-for="(r, i) in riskHistory" :key="i" class="risk-item">
          <view class="risk-dot-wrapper">
            <view class="risk-dot-line" v-if="i < riskHistory.length - 1" />
          </view>
          <view class="risk-content">
            <view class="risk-dot" :class="`dot-${r.level}`" />
            <view class="risk-body">
              <text class="risk-label">{{ r.label }}</text>
              <text class="risk-date">{{ r.date }}</text>
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

/* Chart */
.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200rpx;
  padding: 16rpx 0;
  gap: 16rpx;
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

.chart-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 40rpx;
  background: #F5D5C0;
  border-radius: 20rpx 20rpx 0 0;
  transition: height 350ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 20rpx;
}

.chart-bar.is-latest {
  background: #E8956E;
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
  margin-top: 12rpx;
}

/* Risk Timeline */
.risk-timeline {
  padding: 12rpx 0;
}

.risk-item {
  margin-bottom: 16rpx;
}

.risk-content {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.risk-dot-wrapper {
  display: flex;
  justify-content: center;
}

.risk-dot-line {
  width: 2rpx;
  height: 40rpx;
  background: #F0EBE4;
  margin-left: 11rpx;
}

.risk-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.dot-green { background: #7EBDA6; }
.dot-yellow { background: #E8B84F; }
.dot-red { background: #E87060; }

.risk-body {
  flex: 1;
}

.risk-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #2D3436;
  display: block;
}

.risk-date {
  font-size: 22rpx;
  color: #A8B5A8;
}

.back-link {
  margin-bottom: 24rpx;
}

.back-link-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  justify-content: center;
}

.back-link-text {
  font-size: 24rpx;
  color: #A8B5A8;
}
</style>
