<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import PetAvatar from '../../components/PetAvatar.vue'
import IconAtom from '../../components/IconAtom.vue'
import EmptyState from '../../components/EmptyState.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'
import {
  buildHealthSummary, getPetProfile, getRecentHealthRecords,
  savePetProfile, type PetProfile
} from '../../services/petStore'

/* ---- Pet Data ---- */
const pet = reactive<PetProfile>(getPetProfile())

/* ---- Tasks ---- */
interface Task {
  id: string; time: string; title: string
  detail: string; icon: string; done: boolean; dogOnly?: boolean
}

const cachedTasks = uni.getStorageSync('pet-ai-tasks')
const tasks = ref<Task[]>(
  cachedTasks || [
    { id: 'feed-am', time: '08:00', title: '早餐', detail: '定量主粮，换新水', icon: 'food', done: false },
    { id: 'walk-am', time: '08:30', title: '晨间遛狗', detail: '20 分钟，记录便便和精神', icon: 'heart', done: false, dogOnly: true },
    { id: 'play', time: '12:30', title: '互动活动', detail: '逗猫/玩具 10 分钟', icon: 'pet_cat', done: false },
    { id: 'feed-pm', time: '18:30', title: '晚餐', detail: '湿粮可替代部分干粮', icon: 'food', done: false },
    { id: 'health', time: '21:00', title: '健康记录', detail: '食欲、饮水、排便排尿', icon: 'heart', done: false },
    { id: 'care', time: '本周', title: '驱虫/疫苗检查', detail: '核对下次提醒日期', icon: 'vaccine', done: false },
  ]
)

/* ---- Quick Actions ---- */
const quickActions = [
  { icon: 'pet_cat', label: '症状分诊', color: '#E8956E', url: '/pages/sub/symptom' },
  { icon: 'food', label: '餐食建议', color: '#7EBDA6', url: '/pages/sub/diet' },
  { icon: 'search', label: '食物速查', color: '#6A8FA0', url: '/pages/sub/food-safety' },
  { icon: 'edit', label: '就医摘要', color: '#8BB9D6', url: '/pages/sub/summary' },
]

const quickRecordItems = [
  { type: 'meal' as const, label: '进食', icon: 'food', color: '#E8956E' },
  { type: 'water' as const, label: '饮水', icon: 'water', color: '#7EBDA6' },
  { type: 'poop' as const, label: '便便', icon: 'poop', color: '#E8B84F' },
]

/* ---- Computed ---- */
const visibleTasks = computed(() => tasks.value.filter(t => !t.dogOnly || pet.species === 'dog'))
const doneCount = computed(() => visibleTasks.value.filter(t => t.done).length)
const progress = computed(() => Math.round((doneCount.value / Math.max(visibleTasks.value.length, 1)) * 100))
const nextTask = computed(() => visibleTasks.value.find(t => !t.done) ?? visibleTasks.value[0])
const recentRecords = computed(() => getRecentHealthRecords(6).filter(item => item.petId === pet.id))
const healthSummaryMsg = computed(() => buildHealthSummary(recentRecords.value))
const healthScore = computed(() => {
  const recordBonus = Math.min(recentRecords.value.length * 2, 10)
  const taskBonus = progress.value >= 80 ? 4 : progress.value >= 50 ? 2 : 0
  return Math.min(86 + recordBonus + taskBonus, 99)
})
const aiInsight = computed(() => {
  if (recentRecords.value.some(item => item.type === 'vomit')) {
    return `${pet.name} 最近有呕吐记录，建议留意次数、精神和饮水，必要时生成就医摘要。`
  }
  if (recentRecords.value.length === 0) {
    return `今天先为 ${pet.name} 补一条饮食或排便记录，后续 AI 会更懂它的状态。`
  }
  return `${pet.name} 最近记录正常，今天重点完成喂食、饮水和健康观察。`
})

/* ---- Greeting ---- */
const hour = new Date().getHours()
const greeting = hour < 6 ? '夜深了' : hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

/* ---- Page animation state ---- */
const pageReady = ref(false)
onMounted(() => { setTimeout(() => { pageReady.value = true }, 50) })

/* ---- Methods ---- */
function toggleTask(task: Task) {
  task.done = !task.done
  saveAll()
}

function saveAll() {
  savePetProfile({ ...pet })
  uni.setStorageSync('pet-ai-tasks', tasks.value)
}

function goTo(url: string) {
  uni.navigateTo({ url })
}

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}

const recordSheet = ref(false)
function openRecord(type: 'meal' | 'water' | 'poop') {
  recordSheet.value = false
  uni.navigateTo({ url: `/pages/health/index?record=${type}` })
}


</script>

<template>
  <view class="page" :class="{ 'page-ready': pageReady }">
    <TopBar title="宠小护" showEmergency @emergency="goEmergency" />
    <view class="page-content">

    <!-- Hero Card -->
    <view class="hero">
      <view class="hero-top">
        <view class="hero-brand">
          <view class="hero-avatar-row">
            <PetAvatar :name="pet.name" :species="pet.species" :size="64" />
            <view class="hero-text-group">
              <text class="hero-greeting">{{ greeting }}</text>
              <text class="hero-subtitle">{{ pet.name }} 的今日养护工作台</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Pet Stats Row -->
      <view class="hero-stats">
        <view class="hero-stat">
          <text class="hs-val">{{ pet.weightKg }}</text>
          <text class="hs-unit">kg</text>
        </view>
        <view class="hero-stat-divider" />
        <view class="hero-stat">
          <text class="hs-val">{{ pet.age }}</text>
          <text class="hs-unit">{{ pet.species === 'cat' ? '猫' : '狗' }}</text>
        </view>
        <view class="hero-stat-divider" />
        <view class="hero-stat">
          <text class="hs-val">{{ healthScore }}</text>
          <text class="hs-unit">健康分</text>
        </view>
      </view>

      <!-- Progress -->
      <view class="hero-progress">
        <view class="hero-progress-track">
          <view class="hero-progress-fill" :style="{ width: `${progress}%` }" />
        </view>
        <text class="hero-progress-text">{{ progress }}%</text>
      </view>

      <!-- Next task hint -->
      <view class="hero-next" @tap="goTo('/pages/sub/reminder')">
        <IconAtom name="arrow_up" :size="24" color="rgba(255,255,255,0.7)" />
        <text class="hero-next-text">下一项：{{ nextTask?.time }} {{ nextTask?.title }}</text>
      </view>
    </view>

    <view class="urgent-strip" @tap="goEmergency">
      <view class="urgent-icon">
        <IconAtom name="alert" :size="30" color="#E87060" />
      </view>
      <view class="urgent-body">
        <text class="urgent-title">急症红灯</text>
        <text class="urgent-text">尿不出、呼吸困难、误食毒物、抽搐昏迷，直接就医</text>
      </view>
      <IconAtom name="forward" :size="28" color="#E87060" />
    </view>

    <view class="ai-insight" @tap="goTo('/pages/ai/index')">
      <view class="insight-head">
        <IconAtom name="chat" :size="28" color="#E8956E" />
        <text class="insight-title">AI 今日洞察</text>
      </view>
      <text class="insight-text">{{ aiInsight }}</text>
    </view>

    <!-- Health Digest -->
    <BaseCard padding="20rpx 24rpx" class="health-digest" @tap="goTo('/pages/health/index')">
      <view class="digest-head">
        <view class="digest-head-left">
          <view class="digest-icon">
            <IconAtom name="heart" :size="28" color="#7EBDA6" />
          </view>
          <view>
            <text class="digest-title">健康摘要</text>
            <text class="digest-subtitle">
              {{ recentRecords.length ? `已记录 ${recentRecords.length} 条` : '还没有记录' }}
            </text>
          </view>
        </view>
        <IconAtom name="forward" :size="28" color="#A8B5A8" />
      </view>
      <text v-if="healthSummaryMsg" class="digest-text">{{ healthSummaryMsg }}</text>
    </BaseCard>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view
        v-for="action in quickActions"
        :key="action.label"
        class="qa-item"
        :style="{ background: action.color + '14', borderColor: action.color + '28' }"
        @tap="goTo(action.url)"
      >
        <view class="qa-icon-wrap" :style="{ background: action.color + '20' }">
          <IconAtom :name="action.icon" :size="36" :color="action.color" />
        </view>
        <text class="qa-label" :style="{ color: action.color }">{{ action.label }}</text>
      </view>
    </view>

    <view class="quick-record-bar">
      <view class="quick-record-head">
        <text class="quick-record-title">快速记录</text>
        <text class="quick-record-more" @tap="goTo('/pages/health/index')">更多</text>
      </view>
      <view class="quick-record-actions">
        <view
          v-for="item in quickRecordItems"
          :key="item.type"
          class="quick-record-item"
          @tap="openRecord(item.type)"
        >
          <IconAtom :name="item.icon" :size="30" :color="item.color" />
          <text class="quick-record-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- Today's Tasks -->
    <SectionHeader
      title="今日提醒"
      kicker="今日待办"
      :badge="`${doneCount}/${visibleTasks.length}`"
      action="管理"
      @action="goTo('/pages/sub/reminder')"
    />

    <view class="task-list">
      <view
        v-for="(task, idx) in visibleTasks"
        :key="task.id"
        class="task-item"
        :class="{ 'is-done': task.done }"
        :style="{ animationDelay: `${idx * 60}ms` }"
        @tap="toggleTask(task)"
      >
        <view class="task-check" :class="{ 'checked': task.done }">
          <IconAtom v-if="task.done" name="check" :size="24" color="#FFFFFF" />
        </view>
        <view class="task-icon">
          <IconAtom :name="task.icon" :size="30" :color="task.done ? '#A8B5A8' : '#E8956E'" />
        </view>
        <view class="task-body">
          <view class="task-title-row">
            <text class="task-title" :class="{ 'task-title-done': task.done }">{{ task.title }}</text>
            <text v-if="task.done" class="task-done-badge">已完成</text>
          </view>
          <text class="task-detail">{{ task.detail }}</text>
        </view>
        <text class="task-time">{{ task.time }}</text>
      </view>

      <EmptyState
        v-if="visibleTasks.length === 0"
        icon="check"
        title="今天没有待办"
        description="点击管理可以添加新的提醒"
        action-text="添加提醒"
        action-icon="add"
        @action="goTo('/pages/sub/reminder')"
      />
    </view>

    <!-- Quick Record Sheet -->
    <view v-if="recordSheet" class="sheet-overlay" @tap.self="recordSheet = false">
      <view class="sheet anim-slide-in-up">
        <view class="sheet-handle" />
        <text class="sheet-title">快速记录</text>
        <view class="sheet-grid">
          <BaseCard pressable padding="16rpx" class="sheet-btn" @tap="openRecord('meal')">
            <IconAtom name="food" :size="44" color="#E8956E" />
            <text class="sheet-btn-label">进食</text>
          </BaseCard>
          <BaseCard pressable padding="16rpx" class="sheet-btn" @tap="openRecord('water')">
            <IconAtom name="water" :size="44" color="#7EBDA6" />
            <text class="sheet-btn-label">饮水</text>
          </BaseCard>
          <BaseCard pressable padding="16rpx" class="sheet-btn" @tap="openRecord('poop')">
            <IconAtom name="poop" :size="44" color="#E8B84F" />
            <text class="sheet-btn-label">便便</text>
          </BaseCard>
          <BaseCard pressable padding="16rpx" class="sheet-btn" @tap="goTo('/pages/health/index')">
            <IconAtom name="weight" :size="44" color="#8BB9D6" />
            <text class="sheet-btn-label">更多</text>
          </BaseCard>
        </view>
        <BaseButton variant="ghost" block @tap="recordSheet = false">取消</BaseButton>
      </view>
    </view>

    </view>
    <BottomNav current="home" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(232, 149, 110, 0.10), transparent 400rpx),
    radial-gradient(ellipse at 80% 0%, rgba(126, 189, 166, 0.08), transparent 400rpx),
    #FAF7F2;
  opacity: 0;
  transform: translateY(12rpx);
  transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-ready {
  opacity: 1;
  transform: translateY(0);
}

.page-content {
  padding: 24rpx;
  padding-bottom: calc(140rpx + 24rpx + env(safe-area-inset-bottom, 0px));
}

/* ===== Hero ===== */
.hero {
  margin-top: 0;
  padding: 28rpx 28rpx 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #E8956E 0%, #D4A07A 100%);
  color: #FFFFFF;
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
}

/* Decorative circles */
.hero::before {
  content: '';
  position: absolute;
  top: -60rpx;
  right: -40rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -80rpx;
  left: -60rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}

.hero-top {
  position: relative;
  z-index: 1;
  margin-bottom: 24rpx;
}

.hero-brand {
  min-width: 0;
}

.hero-avatar-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-text-group {
  flex: 1;
  min-width: 0;
}

.hero-greeting {
  font-size: 40rpx;
  font-weight: 900;
  display: block;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 24rpx;
  opacity: 0.82;
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 390rpx;
}

.urgent-strip {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx 20rpx;
  margin-bottom: 20rpx;
  background: #FFF7F5;
  border: 2rpx solid #F6C9C1;
  border-radius: 20rpx;
}

.urgent-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FDE8E5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.urgent-body {
  flex: 1;
  min-width: 0;
}

.urgent-title {
  display: block;
  font-size: 26rpx;
  font-weight: 800;
  color: #E87060;
}

.urgent-text {
  display: block;
  margin-top: 2rpx;
  font-size: 22rpx;
  line-height: 30rpx;
  color: #8E5B54;
}

.ai-insight {
  padding: 20rpx 22rpx;
  margin-bottom: 20rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-left: 6rpx solid #E8956E;
  border-radius: 20rpx;
}

.insight-head {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.insight-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #2D3436;
}

.insight-text {
  display: block;
  font-size: 25rpx;
  line-height: 38rpx;
  color: #66756A;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.hero-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.hs-val {
  font-size: 36rpx;
  font-weight: 900;
}

.hs-unit {
  font-size: 22rpx;
  opacity: 0.7;
}

.hero-stat-divider {
  width: 2rpx;
  height: 32rpx;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0;
}

.hero-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 1;
}

.hero-progress-track {
  flex: 1;
  height: 10rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 999rpx;
  overflow: hidden;
}

.hero-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #F2CB7A;
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-progress-text {
  font-size: 24rpx;
  font-weight: 700;
  min-width: 60rpx;
  text-align: right;
}

.hero-next {
  display: flex;
  align-items: center;
  gap: 8rpx;
  opacity: 0.75;
  position: relative;
  z-index: 1;
}

.hero-next-text {
  font-size: 22rpx;
}

/* ===== Health Digest ===== */
.health-digest {
  margin-bottom: 24rpx;
  border-left: 6rpx solid #7EBDA6;
}

.digest-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.digest-head-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.digest-icon {
  width: 48rpx;
  height: 48rpx;
  background: #EEF7F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.digest-title {
  display: block;
  font-size: 26rpx;
  font-weight: 800;
  color: #2D3436;
}

.digest-subtitle {
  display: block;
  margin-top: 2rpx;
  font-size: 20rpx;
  color: #A8B5A8;
}

.digest-text {
  display: block;
  max-height: 120rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.5;
  color: #7B8B7E;
  white-space: pre-wrap;
  padding-left: 60rpx;
}

/* ===== Quick Actions ===== */
.quick-actions {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.qa-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 8rpx;
  border-radius: 20rpx;
  border: 2rpx solid transparent;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.qa-item:active {
  transform: scale(0.94);
}

.qa-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-label {
  font-size: 22rpx;
  font-weight: 700;
}

.quick-record-bar {
  padding: 18rpx 20rpx;
  margin-bottom: 32rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 20rpx;
}

.quick-record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.quick-record-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #2D3436;
}

.quick-record-more {
  font-size: 22rpx;
  font-weight: 700;
  color: #E8956E;
}

.quick-record-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.quick-record-item {
  height: 76rpx;
  border-radius: 16rpx;
  background: #FAF7F2;
  border: 2rpx solid #F0EBE4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.quick-record-label {
  font-size: 23rpx;
  font-weight: 700;
  color: #2D3436;
}

/* ===== Task List ===== */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx 18rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 20rpx;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  animation: fade-in-up 350ms cubic-bezier(0.4, 0, 0.2, 1) both;
  min-width: 0;
}

.task-item.is-done {
  background: #F8F6F2;
  border-color: #E8E0D8;
}

.task-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #E8E0D8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-check.checked {
  background: #6AAA93;
  border-color: #6AAA93;
  animation: check-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-body {
  flex: 1;
  min-width: 0;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.task-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
  transition: color 200ms;
}

.task-title-done {
  color: #A8B5A8;
  text-decoration: line-through;
}

.task-done-badge {
  font-size: 18rpx;
  font-weight: 600;
  color: #6AAA93;
  background: #EEF7F2;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.task-detail {
  font-size: 22rpx;
  color: #A8B5A8;
  margin-top: 2rpx;
  display: block;
}

.task-time {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  background: #F5F0EA;
  border-radius: 999rpx;
}

/* ===== FAB ===== */
.fab {
  position: fixed;
  right: 24rpx;
  bottom: calc(130rpx + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  z-index: 10;
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab:active {
  transform: scale(0.92);
}

.fab-inner {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8956E, #D4784E);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 28rpx rgba(232, 149, 110, 0.45);
}

.fab-label {
  font-size: 20rpx;
  font-weight: 600;
  color: #7B8B7E;
  background: rgba(255,255,255,0.9);
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
}

/* ===== Sheet ===== */
.sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 52, 54, 0.45);
  z-index: 200;
  animation: fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
}

.sheet-handle {
  width: 60rpx;
  height: 6rpx;
  background: #E8E0D8;
  border-radius: 99rpx;
  margin: 0 auto 24rpx;
}

.sheet-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 24rpx;
  text-align: center;
}

.sheet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.sheet-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  min-height: 120rpx;
}

.sheet-btn-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #7B8B7E;
}
</style>
