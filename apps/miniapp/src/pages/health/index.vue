<script setup lang="ts">
import { ref } from 'vue'
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

// Load saved records on mount
loadFromStorage()

onLoad((options) => {
  if (isHealthRecordType(options?.record)) {
    openQuickRecord(options.record)
  }
})

const petName = ref(getPetProfile().name)

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}
</script>

<template>
  <view class="page">
    <TopBar title="健康记录" showEmergency @emergency="goEmergency" />
    <view class="page-body">
    <SectionHeader
      title="健康记录"
      kicker="Records"
      badge="本地"
    />

    <!-- Quick record buttons -->
    <view class="quick-record-grid">
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('meal')">
        <IconAtom name="food" :size="40" color="#E8956E" />
        <text class="record-btn-label">进食</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('water')">
        <IconAtom name="water" :size="40" color="#7EBDA6" />
        <text class="record-btn-label">饮水</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('poop')">
        <IconAtom name="poop" :size="40" color="#E8B84F" />
        <text class="record-btn-label">便便</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('weight')">
        <IconAtom name="weight" :size="40" color="#8BB9D6" />
        <text class="record-btn-label">体重</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('pee')">
        <IconAtom name="water" :size="40" color="#8BB9D6" />
        <text class="record-btn-label">排尿</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('vomit')">
        <IconAtom name="alert" :size="40" color="#E87060" />
        <text class="record-btn-label">呕吐</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('mood')">
        <IconAtom name="heart" :size="40" color="#7EBDA6" />
        <text class="record-btn-label">精神</text>
      </BaseCard>
      <BaseCard pressable padding="16rpx" class="record-btn" @tap="openQuickRecord('skin')">
        <IconAtom name="edit" :size="40" color="#E8956E" />
        <text class="record-btn-label">皮肤</text>
      </BaseCard>
    </view>

    <!-- Recent records -->
    <SectionHeader
      title="最近记录"
      kicker="Timeline"
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
      <BaseCard v-for="rec in records" :key="rec.id" padding="16rpx" class="record-item">
        <view class="record-item-left">
          <IconAtom :name="recordIcons[rec.type] || 'note'" :size="36" :color="rec.type === 'weight' ? '#8BB9D6' : '#E8956E'" />
        </view>
        <view class="record-item-body">
          <text class="record-item-type">{{ recordLabels[rec.type] || rec.type }}</text>
          <text class="record-item-value">{{ rec.value }}</text>
          <text v-if="rec.note" class="record-item-note">{{ rec.note }}</text>
        </view>
        <text class="record-item-time">{{ rec.createdAt }}</text>
      </BaseCard>
    </view>

    <!-- Health trends link -->
    <BaseCard pressable padding="16rpx" class="trend-link" @tap="uni.navigateTo({ url: '/pages/sub/trend' })">
      <view class="trend-link-content">
        <view>
          <text class="trend-link-title">查看健康趋势</text>
          <text class="trend-link-desc">体重变化、风险历史、规律分析</text>
        </view>
        <IconAtom name="forward" :size="32" color="#A8B5A8" />
      </view>
    </BaseCard>
    </view>

    <!-- Quick Record Sheet -->
    <view v-if="showRecordSheet" class="sheet-overlay" @tap.self="showRecordSheet = false">
      <view class="sheet">
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
  padding-bottom: calc(140rpx + 24rpx);
}

.quick-record-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.record-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  min-height: 140rpx;
}

.record-btn-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #2D3436;
}

.empty-section {
  margin-bottom: 24rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.record-item-left {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-item-body {
  flex: 1;
  min-width: 0;
}

.record-item-type {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  text-transform: uppercase;
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
}

.record-item-time {
  font-size: 22rpx;
  color: #A8B5A8;
  flex-shrink: 0;
  max-width: 180rpx;
  text-align: right;
}

.trend-link {
  margin-top: 16rpx;
}

.trend-link-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trend-link-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
}

.trend-link-desc {
  font-size: 22rpx;
  color: #A8B5A8;
}

/* Sheet */
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
