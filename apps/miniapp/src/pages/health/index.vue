<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BaseCard from '../../components/BaseCard.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import IconAtom from '../../components/IconAtom.vue'
import EmptyState from '../../components/EmptyState.vue'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'
import FormField from '../../components/FormField.vue'
import {
  addHealthRecord,
  getHealthRecords,
  getPetProfile,
  recordLabels,
  type HealthRecord,
  type HealthRecordType
} from '../../services/petStore'

const records = ref<HealthRecord[]>([])

// Quick record state
const showRecordSheet = ref(false)
const activeRecordType = ref<HealthRecordType>('meal')
const recordValue = ref('')
const recordNote = ref('')

const recordIcons: Record<string, string> = {
  meal: 'food',
  water: 'water',
  poop: 'poop',
  weight: 'weight',
  pee: 'water',
  vomit: 'alert',
  medicine: 'medicine',
  mood: 'heart',
  skin: 'edit',
  note: 'edit'
}

const recordColors: Record<string, string> = {
  meal: '#E8956E',
  water: '#7EBDA6',
  poop: '#E8B84F',
  weight: '#8BB9D6',
  pee: '#8BB9D6',
  vomit: '#E87060',
  medicine: '#E8956E',
  mood: '#7EBDA6',
  skin: '#E8956E',
  note: '#A8B5A8'
}

const placeholders: Record<string, string> = {
  meal: '吃了什么？吃了多少？',
  water: '饮水量',
  poop: '颜色、形状、频率',
  weight: '体重（kg）',
  pee: '排尿次数、颜色、是否困难',
  vomit: '次数、颜色、是否有异物',
  medicine: '药名、剂量、时间',
  mood: '精神状态',
  skin: '皮肤/耳朵/眼睛异常',
  note: '补充记录'
}

/** Health record type categories for visual grouping */
const recordGroups = [
  { title: '饮食', items: ['meal', 'water'] as HealthRecordType[] },
  { title: '排泄', items: ['poop', 'pee'] as HealthRecordType[] },
  { title: '体征', items: ['weight', 'mood'] as HealthRecordType[] },
  { title: '异常', items: ['vomit', 'medicine', 'skin', 'note'] as HealthRecordType[] },
]

function addRecord(type: HealthRecord['type'], value: string, note?: string) {
  if (!value.trim()) return
  const pet = getPetProfile()
  const next = addHealthRecord({
    petId: pet.id,
    type,
    value: value.trim(),
    note: note?.trim()
  })
  records.value = [next, ...records.value].slice(0, 300)
}

function openQuickRecord(type: HealthRecordType) {
  activeRecordType.value = type
  recordValue.value = ''
  recordNote.value = ''
  showRecordSheet.value = true
}

function isHealthRecordType(value: unknown): value is HealthRecordType {
  return typeof value === 'string' && value in recordLabels
}

function submitQuickRecord() {
  if (!recordValue.value.trim()) return
  addRecord(activeRecordType.value, recordValue.value, recordNote.value)
  showRecordSheet.value = false
}

function loadFromStorage() {
  const pet = getPetProfile()
  records.value = getHealthRecords().filter(item => item.petId === pet.id)
}

loadFromStorage()

onLoad((options) => {
  if (isHealthRecordType(options?.record)) {
    openQuickRecord(options.record)
  }
})

const petName = ref(getPetProfile().name)
const todayRecords = computed(() => {
  const today = new Date().toDateString()
  return records.value.filter(item => new Date(item.createdAt).toDateString() === today)
})
const abnormalCount = computed(() => records.value.filter(item => ['vomit', 'skin', 'medicine'].includes(item.type)).length)
const latestWeight = computed(() => records.value.find(item => item.type === 'weight')?.value || '未记录')

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}

/** Format ISO date to friendly Chinese string */
function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const time = `${h}:${m}`

  if (isToday) return `今天 ${time}`
  if (isYesterday) return `昨天 ${time}`
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}
</script>

<template>
  <view class="page anim-page-enter">
    <TopBar title="健康记录" showEmergency @emergency="goEmergency" />
    <view class="page-body">

    <view class="record-overview">
      <view class="overview-main">
        <text class="overview-kicker">{{ petName }} 的健康时间线</text>
        <text class="overview-title">今天已记录 {{ todayRecords.length }} 条</text>
        <text class="overview-desc">记录越完整，AI 越能结合近期状态给出建议。</text>
      </view>
      <view class="overview-stats">
        <view class="overview-stat">
          <text class="overview-stat-val">{{ latestWeight }}</text>
          <text class="overview-stat-label">体重</text>
        </view>
        <view class="overview-stat">
          <text class="overview-stat-val">{{ abnormalCount }}</text>
          <text class="overview-stat-label">异常</text>
        </view>
      </view>
    </view>

    <!-- Quick record buttons - grouped -->
    <view class="record-groups">
      <view v-for="group in recordGroups" :key="group.title" class="record-group">
        <text class="record-group-title">{{ group.title }}</text>
        <view class="record-group-grid">
          <BaseCard
            v-for="type in group.items"
            :key="type"
            pressable
            padding="12rpx"
            class="record-btn"
            @tap="openQuickRecord(type)"
          >
            <view class="record-btn-icon" :style="{ background: recordColors[type] + '18' }">
              <IconAtom :name="recordIcons[type]" :size="36" :color="recordColors[type]" />
            </view>
            <text class="record-btn-label">{{ recordLabels[type] }}</text>
          </BaseCard>
        </view>
      </view>
    </view>

    <!-- Recent records -->
    <SectionHeader
      title="最近记录"
      kicker="历史"
      :badge="records.length.toString()"
    />

    <view v-if="records.length === 0" class="empty-section">
      <EmptyState
        icon="heart"
        title="还没有记录"
        :description="`点击上方按钮记录 ${petName} 的进食、饮水、便便和体重`"
      />
    </view>

    <view v-else class="record-list">
      <view
        v-for="(rec, idx) in records"
        :key="rec.id"
        class="record-item"
        :style="{ animationDelay: `${idx * 40}ms` }"
      >
        <view class="record-item-dot" :style="{ background: recordColors[rec.type] || '#A8B5A8' }" />
        <view class="record-item-left">
          <IconAtom :name="recordIcons[rec.type] || 'note'" :size="32" :color="recordColors[rec.type] || '#A8B5A8'" />
        </view>
        <view class="record-item-body">
          <view class="record-item-header">
            <text class="record-item-type">{{ recordLabels[rec.type] || rec.type }}</text>
            <text class="record-item-time">{{ formatDate(rec.createdAt) }}</text>
          </view>
          <text class="record-item-value">{{ rec.value }}</text>
          <text v-if="rec.note" class="record-item-note">{{ rec.note }}</text>
        </view>
      </view>
    </view>

    <!-- Health trends link -->
    <BaseCard pressable padding="16rpx 24rpx" class="trend-link" @tap="uni.navigateTo({ url: '/pages/sub/trend' })">
      <view class="trend-link-content">
        <view class="trend-link-left">
          <view class="trend-link-icon">
            <IconAtom name="weight" :size="28" color="#8BB9D6" />
          </view>
          <view>
            <text class="trend-link-title">查看健康趋势</text>
            <text class="trend-link-desc">体重变化、风险历史、规律分析</text>
          </view>
        </view>
        <IconAtom name="forward" :size="28" color="#A8B5A8" />
      </view>
    </BaseCard>
    </view>

    <!-- Quick Record Sheet -->
    <view v-if="showRecordSheet" class="sheet-overlay" @tap.self="showRecordSheet = false">
      <view class="sheet anim-slide-in-up">
        <view class="sheet-handle" />
        <text class="sheet-title">记录 {{ recordLabels[activeRecordType] }}</text>

        <view class="sheet-form">
          <FormField
            :label="recordLabels[activeRecordType] + '情况'"
            :type="activeRecordType === 'weight' ? 'digit' : 'textarea'"
            :placeholder="placeholders[activeRecordType]"
            v-model="recordValue"
          />
          <FormField
            label="备注（可选）"
            type="textarea"
            placeholder="补充说明..."
            v-model="recordNote"
          />
        </view>

        <view class="sheet-actions">
          <view class="sheet-btn sheet-btn-cancel" @tap="showRecordSheet = false">取消</view>
          <view
            class="sheet-btn sheet-btn-save"
            :class="{ 'is-disabled': !recordValue.trim() }"
            @tap="submitQuickRecord"
          >保存</view>
        </view>
      </view>
    </view>

    <BottomNav current="health" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FAF7F2;
}

.page-body {
  padding: 32rpx 24rpx 24rpx;
  padding-bottom: calc(152rpx + env(safe-area-inset-bottom, 0px));
}

.record-overview {
  display: flex;
  gap: 18rpx;
  padding: 24rpx;
  margin-bottom: 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #FFFFFF 0%, #F2F7F3 100%);
  border: 2rpx solid #E3EFE7;
}

.overview-main {
  flex: 1;
  min-width: 0;
}

.overview-kicker,
.overview-title,
.overview-desc {
  display: block;
}

.overview-kicker {
  font-size: 22rpx;
  font-weight: 800;
  color: #6AAA93;
}

.overview-title {
  margin-top: 6rpx;
  font-size: 36rpx;
  line-height: 46rpx;
  font-weight: 900;
  color: #2D3436;
}

.overview-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 34rpx;
  color: #66756A;
}

.overview-stats {
  width: 150rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.overview-stat {
  padding: 12rpx;
  border-radius: 16rpx;
  background: rgba(255,255,255,0.78);
  border: 2rpx solid #E3EFE7;
  text-align: center;
}

.overview-stat-val {
  display: block;
  font-size: 26rpx;
  font-weight: 900;
  color: #2D3436;
}

.overview-stat-label {
  display: block;
  margin-top: 2rpx;
  font-size: 20rpx;
  color: #A8B5A8;
}

/* ===== Record Groups ===== */
.record-groups {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.record-group-title {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 10rpx;
  padding-left: 4rpx;
}

.record-group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140rpx, 1fr));
  gap: 12rpx;
}

.record-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  min-height: 120rpx;
  justify-content: center;
  border-color: #F0EBE4;
}

.record-btn-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-btn-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #2D3436;
}

/* ===== Empty State ===== */
.empty-section {
  margin-bottom: 24rpx;
}

/* ===== Record List ===== */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.record-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding: 14rpx 18rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  border: 2rpx solid #F0EBE4;
  animation: fade-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.record-item-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.record-item-left {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-item-body {
  flex: 1;
  min-width: 0;
}

.record-item-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 2rpx;
}

.record-item-type {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
}

.record-item-time {
  font-size: 20rpx;
  color: #C5C5C5;
}

.record-item-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D3436;
  display: block;
}

.record-item-note {
  font-size: 22rpx;
  color: #A8B5A8;
  margin-top: 2rpx;
  display: block;
}

/* ===== Trend Link ===== */
.trend-link {
  margin-top: 8rpx;
}

.trend-link-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trend-link-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.trend-link-icon {
  width: 48rpx;
  height: 48rpx;
  background: #F0F6FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-link-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
}

.trend-link-desc {
  font-size: 22rpx;
  color: #A8B5A8;
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

.sheet-form {
  margin-bottom: 24rpx;
}

.sheet-actions {
  display: flex;
  gap: 16rpx;
}

.sheet-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.sheet-btn-cancel {
  background: #F5F0EA;
  color: #7B8B7E;
}

.sheet-btn-save {
  background: #E8956E;
  color: #FFFFFF;
}

.sheet-btn-save.is-disabled {
  opacity: 0.5;
}

.sheet-btn:active {
  transform: scale(0.97);
}
</style>
