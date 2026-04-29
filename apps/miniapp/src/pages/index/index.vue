<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import PetAvatar from '../../components/PetAvatar.vue'
import IconAtom from '../../components/IconAtom.vue'
import EmptyState from '../../components/EmptyState.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'
import { buildHealthSummary, getPetProfile, getRecentHealthRecords, savePetProfile, type PetProfile } from '../../services/petStore'

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
  { icon: 'alert', label: '紧急', color: '#E87060', url: '/pages/sub/emergency' },
  { icon: 'pet_cat', label: '分诊', color: '#E8956E', url: '/pages/sub/symptom' },
  { icon: 'food', label: '餐食', color: '#7EBDA6', url: '/pages/sub/diet' },
  { icon: 'edit', label: '摘要', color: '#8BB9D6', url: '/pages/sub/summary' },
]

/* ---- Computed ---- */
const visibleTasks = computed(() => tasks.value.filter(t => !t.dogOnly || pet.species === 'dog'))
const doneCount = computed(() => visibleTasks.value.filter(t => t.done).length)
const progress = computed(() => Math.round((doneCount.value / Math.max(visibleTasks.value.length, 1)) * 100))
const nextTask = computed(() => visibleTasks.value.find(t => !t.done) ?? visibleTasks.value[0])
const recentRecords = computed(() => getRecentHealthRecords(6).filter(item => item.petId === pet.id))
const healthSummary = computed(() => buildHealthSummary(recentRecords.value))

/* ---- Greeting ---- */
const hour = new Date().getHours()
const greeting = hour < 6 ? '夜深了' : hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

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
  <view class="page">
    <TopBar title="宠小护" showEmergency @emergency="goEmergency" />
    <!-- Hero Card -->
    <view class="hero">
      <view class="hero-top">
        <view class="hero-brand">
          <image class="hero-logo" src="/static/logo.svg" mode="aspectFit" />
          <view>
            <text class="hero-greeting">{{ greeting }} 👋</text>
            <text class="hero-subtitle">今天也要照顾好 {{ pet.name }} 哦~</text>
          </view>
        </view>
        <PetAvatar :name="pet.name" :species="pet.species" :size="72" />
      </view>

      <!-- Pet Stats Row -->
      <view class="hero-stats">
        <view class="hero-stat">
          <text class="hs-val">{{ pet.weightKg }}</text>
          <text class="hs-unit">kg</text>
        </view>
        <view class="hero-stat">
          <text class="hs-val">{{ pet.age }}</text>
          <text class="hs-unit">{{ pet.species === 'cat' ? '猫' : '狗' }}</text>
        </view>
        <view class="hero-stat">
          <text class="hs-val">{{ doneCount }}/{{ visibleTasks.length }}</text>
          <text class="hs-unit">今日</text>
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

    <BaseCard padding="20rpx" class="health-digest" @tap="goTo('/pages/health/index')">
      <view class="digest-head">
        <view>
          <text class="digest-title">最近健康摘要</text>
          <text class="digest-subtitle">{{ recentRecords.length ? `已记录 ${recentRecords.length} 条` : '还没有记录，先补一条日常状态' }}</text>
        </view>
        <IconAtom name="forward" :size="28" color="#A8B5A8" />
      </view>
      <text class="digest-text">{{ healthSummary }}</text>
    </BaseCard>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view
        v-for="action in quickActions"
        :key="action.label"
        class="qa-item"
        :style="{ background: action.color + '18' }"
        @tap="goTo(action.url)"
      >
        <IconAtom :name="action.icon" :size="40" :color="action.color" />
        <text class="qa-label" :style="{ color: action.color }">{{ action.label }}</text>
      </view>
    </view>

    <!-- Today's Tasks -->
    <SectionHeader
      title="今日提醒"
      kicker="Timeline"
      :badge="`${doneCount}/${visibleTasks.length}`"
      action="管理"
      @action="goTo('/pages/sub/reminder')"
    />

    <view class="task-list">
      <view
        v-for="task in visibleTasks"
        :key="task.id"
        class="task-item"
        :class="{ 'is-done': task.done }"
        @tap="toggleTask(task)"
      >
        <view class="task-check" :class="{ 'checked': task.done }">
          <IconAtom v-if="task.done" name="check" :size="24" color="#FFFFFF" />
        </view>
        <view class="task-icon">
          <IconAtom :name="task.icon" :size="32" color="#E8956E" />
        </view>
        <view class="task-body">
          <text class="task-title">{{ task.title }}</text>
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

    <!-- Quick Record FAB -->
    <view class="fab" @tap="recordSheet = true">
      <IconAtom name="add" :size="36" color="#FFFFFF" />
    </view>

    <!-- Quick Record Sheet -->
    <view v-if="recordSheet" class="sheet-overlay" @tap.self="recordSheet = false">
      <view class="sheet">
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

    <BottomNav current="home" />
  </view>
</template>

<style scoped>
.page {
  padding: 0 24rpx 24rpx;
  padding-bottom: calc(140rpx + 24rpx);
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(232, 149, 110, 0.12), transparent 400rpx),
    radial-gradient(ellipse at 80% 0%, rgba(126, 189, 166, 0.10), transparent 400rpx),
    #FAF7F2;
}

/* ===== Hero ===== */
.hero {
  margin-top: 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #E8956E 0%, #D4A07A 50%, #7EBDA6 100%);
  color: #FFFFFF;
  margin-bottom: 24rpx;
  box-shadow: 0 16rpx 44rpx rgba(232, 149, 110, 0.25);
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.hero-brand {
  display: flex;
  gap: 16rpx;
  align-items: center;
  min-width: 0;
}

.hero-logo {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: rgba(255,255,255,0.2);
}

.hero-greeting {
  font-size: 34rpx;
  font-weight: 900;
  display: block;
}

.hero-subtitle {
  font-size: 24rpx;
  opacity: 0.85;
  display: block;
  max-width: 430rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hero-stats {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.hero-stat {
  flex: 1;
  padding: 12rpx;
  background: rgba(255,255,255,0.12);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hs-val {
  font-size: 34rpx;
  font-weight: 900;
}

.hs-unit {
  font-size: 22rpx;
  opacity: 0.75;
}

.hero-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.hero-progress-track {
  flex: 1;
  height: 12rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 999rpx;
  overflow: hidden;
}

.hero-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #F2CB7A;
  transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
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
  opacity: 0.8;
}

.hero-next-text {
  font-size: 22rpx;
}

.health-digest {
  margin-bottom: 24rpx;
}

.digest-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.digest-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #2D3436;
}

.digest-subtitle {
  display: block;
  margin-top: 2rpx;
  font-size: 22rpx;
  color: #A8B5A8;
}

.digest-text {
  display: block;
  max-height: 144rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.5;
  color: #7B8B7E;
  white-space: pre-wrap;
}

/* ===== Quick Actions ===== */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.qa-item {
  flex: 1 0 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 0;
  border-radius: 18rpx;
  min-height: 100rpx;
}

.qa-label {
  font-size: 22rpx;
  font-weight: 700;
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
  gap: 16rpx;
  padding: 16rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 18rpx;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  animation: fade-in-up 250ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

.task-item.is-done {
  opacity: 0.65;
  background: #F5F0EA;
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
  transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-check.checked {
  background: #7EBDA6;
  border-color: #7EBDA6;
}

.task-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-body {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
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
}

/* ===== FAB ===== */
.fab {
  position: fixed;
  right: 24rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom, 0));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #E8956E;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(232, 149, 110, 0.4);
  z-index: 10;
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab:active {
  transform: scale(0.92);
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
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0));
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  animation: slide-in-up 250ms cubic-bezier(0.4, 0, 0.2, 1);
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
