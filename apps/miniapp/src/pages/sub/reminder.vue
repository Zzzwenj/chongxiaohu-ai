<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import BaseBadge from '../../components/BaseBadge.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

interface Reminder {
  id: string
  type: 'vaccine' | 'deworm' | 'checkup' | 'medicine' | 'bath' | 'weigh' | 'custom'
  title: string
  nextDate: string
  cycle: string
  note?: string
  done: boolean
}

const reminders = ref<Reminder[]>([
  { id: 'r1', type: 'vaccine', title: '猫三联疫苗', nextDate: '2026-05-15', cycle: '每年', done: false },
  { id: 'r2', type: 'deworm', title: '体内驱虫', nextDate: '2026-05-01', cycle: '每3个月', done: false },
  { id: 'r3', type: 'deworm', title: '体外驱虫', nextDate: '2026-05-01', cycle: '每月', done: false },
  { id: 'r4', type: 'weigh', title: '称重记录', nextDate: '2026-04-30', cycle: '每周', done: false },
])

const showForm = ref(false)
const editing = reactive({
  type: 'custom' as Reminder['type'],
  title: '',
  nextDate: '',
  cycle: '',
  note: ''
})
const editingId = ref<string | null>(null)

const typeLabels: Record<string, string> = {
  vaccine: '疫苗', deworm: '驱虫', checkup: '体检',
  medicine: '用药', bath: '洗澡', weigh: '称重', custom: '自定义'
}
const typeIcons: Record<string, string> = {
  vaccine: 'vaccine', deworm: 'medicine', checkup: 'heart',
  medicine: 'medicine', bath: 'water', weigh: 'weight', custom: 'edit'
}
const typeColors: Record<string, string> = {
  vaccine: '#7EBDA6', deworm: '#E8B84F', checkup: '#8BB9D6',
  medicine: '#E87060', bath: '#8BB9D6', weigh: '#E8956E', custom: '#A8B5A8'
}

const savedReminders = uni.getStorageSync('pet-ai-reminders')
if (Array.isArray(savedReminders)) {
  reminders.value = savedReminders
}

const todayStr = new Date().toISOString().slice(0, 10)

function addNew() {
  editing.type = 'custom'
  editing.title = ''
  editing.nextDate = ''
  editing.cycle = ''
  editing.note = ''
  editingId.value = null
  showForm.value = true
}

function editItem(r: Reminder) {
  editing.type = r.type
  editing.title = r.title
  editing.nextDate = r.nextDate
  editing.cycle = r.cycle
  editing.note = r.note || ''
  editingId.value = r.id
  showForm.value = true
}

function save() {
  if (!editing.title.trim()) return
  if (editingId.value) {
    const r = reminders.value.find(r => r.id === editingId.value)
    if (r) {
      r.type = editing.type
      r.title = editing.title
      r.nextDate = editing.nextDate
      r.cycle = editing.cycle
      r.note = editing.note
    }
  } else {
    reminders.value.push({
      id: Date.now().toString(),
      type: editing.type,
      title: editing.title,
      nextDate: editing.nextDate,
      cycle: editing.cycle,
      note: editing.note,
      done: false
    })
  }
  showForm.value = false
  saveToStorage()
}

function remove(id: string) {
  reminders.value = reminders.value.filter(r => r.id !== id)
  saveToStorage()
}

function toggleDone(r: Reminder) {
  r.done = !r.done
  saveToStorage()
}

function saveToStorage() {
  uni.setStorageSync('pet-ai-reminders', reminders.value)
}

const confirmDelete = ref<string | null>(null)

function onDateChange(e: any) {
  editing.nextDate = e.detail.value
}

function onTypeChange(e: any) {
  const types = Object.keys(typeLabels) as Reminder['type'][]
  editing.type = types[Number(e.detail.value)]
}

const sortedReminders = computed(() => {
  return [...reminders.value].sort((a, b) => a.nextDate.localeCompare(b.nextDate))
})

function isOverdue(date: string): boolean {
  return date < todayStr
}
</script>

<template>
  <view class="page anim-page-enter">
    <TopBar title="提醒管理" showBack @back="uni.navigateBack()" />
    <SectionHeader
      title="提醒管理"
      kicker="日程"
      :badge="reminders.length.toString()"
      action="新增"
      @action="addNew"
    />

    <view v-if="reminders.length === 0" class="empty-section">
      <EmptyState
        icon="heart"
        title="还没有提醒"
        description="添加疫苗、驱虫、复诊等提醒，不再错过重要日期"
        action-text="添加提醒"
        action-icon="add"
        @action="addNew"
      />
    </view>

    <view v-else class="reminder-list">
      <BaseCard
        v-for="(r, idx) in sortedReminders"
        :key="r.id"
        padding="16rpx 20rpx"
        class="reminder-item"
        :class="{
          'is-overdue': !r.done && isOverdue(r.nextDate),
          'is-done': r.done
        }"
        :style="{ animationDelay: `${idx * 40}ms` }"
        @tap="toggleDone(r)"
      >
        <view class="ri-left" :style="{ background: typeColors[r.type] + '15' }">
          <IconAtom :name="typeIcons[r.type] || 'edit'" :size="30" :color="typeColors[r.type] || '#E8956E'" />
        </view>
        <view class="ri-body">
          <view class="ri-top">
            <text class="ri-title" :class="{ 'ri-title-done': r.done }">{{ r.title }}</text>
            <BaseBadge size="sm" variant="default">{{ typeLabels[r.type] }}</BaseBadge>
            <view v-if="!r.done && isOverdue(r.nextDate)" class="overdue-badge">已过期</view>
          </view>
          <text class="ri-date">
            {{ r.done ? '已完成' : `下次：${r.nextDate} · ${r.cycle}` }}
          </text>
          <text v-if="r.note" class="ri-note">{{ r.note }}</text>
        </view>
        <view class="ri-actions">
          <IconAtom name="edit" :size="28" color="#A8B5A8" @tap.stop="editItem(r)" />
          <IconAtom name="delete" :size="28" color="#E87060" @tap.stop="confirmDelete = r.id" />
        </view>
      </BaseCard>
    </view>

    <!-- Add/Edit Form Sheet -->
    <view v-if="showForm" class="sheet-overlay" @tap.self="showForm = false">
      <view class="sheet anim-slide-in-up">
        <view class="sheet-handle" />
        <text class="sheet-title">{{ editingId ? '编辑提醒' : '新增提醒' }}</text>

        <view class="sheet-form">
          <view class="sf-field">
            <text class="sf-label">类型</text>
            <picker :range="Object.values(typeLabels)" @change="onTypeChange">
              <view class="sf-input sf-picker">{{ typeLabels[editing.type] }} <IconAtom name="arrow_down" :size="20" color="#A8B5A8" /></view>
            </picker>
          </view>
          <view class="sf-field">
            <text class="sf-label">标题</text>
            <input v-model="editing.title" class="sf-input" placeholder="如：猫三联疫苗" />
          </view>
          <view class="sf-row">
            <view class="sf-field flex-1">
              <text class="sf-label">下次日期</text>
              <picker mode="date" :value="editing.nextDate" @change="onDateChange">
                <view class="sf-input sf-picker">{{ editing.nextDate || '请选择日期' }}</view>
              </picker>
            </view>
            <view class="sf-field flex-1">
              <text class="sf-label">周期</text>
              <input v-model="editing.cycle" class="sf-input" placeholder="每年/每月/每周" />
            </view>
          </view>
          <view class="sf-field">
            <text class="sf-label">备注</text>
            <input v-model="editing.note" class="sf-input" placeholder="备注信息" />
          </view>
        </view>

        <BaseButton variant="primary" block :disabled="!editing.title" @tap="save">保存</BaseButton>
        <BaseButton variant="ghost" block @tap="showForm = false">取消</BaseButton>
      </view>
    </view>

    <!-- Confirm Delete -->
    <ConfirmDialog
      :visible="!!confirmDelete"
      title="删除提醒"
      message="确定要删除这个提醒吗？"
      variant="danger"
      confirm-text="删除"
      @confirm="confirmDelete ? remove(confirmDelete) : null; confirmDelete = null"
      @cancel="confirmDelete = null"
    />
  </view>
</template>

<style scoped>
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
  background: #FAF7F2;
}

.empty-section {
  margin-top: 32rpx;
}

/* ===== Reminder List ===== */
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reminder-item {
  display: flex;
  gap: 14rpx;
  align-items: center;
  animation: fade-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.reminder-item.is-overdue {
  border-color: #E87060;
  border-width: 3rpx;
  background: #FFF9F8;
}

.reminder-item.is-done {
  opacity: 0.7;
  background: #F8F6F2;
}

.ri-left {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ri-body {
  flex: 1;
}

.ri-top {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
  flex-wrap: wrap;
}

.ri-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
}

.ri-title-done {
  color: #A8B5A8;
  text-decoration: line-through;
}

.overdue-badge {
  font-size: 18rpx;
  font-weight: 700;
  color: #FFFFFF;
  background: #E87060;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.ri-date {
  font-size: 22rpx;
  color: #A8B5A8;
  display: block;
}

.ri-note {
  font-size: 22rpx;
  color: #A8B5A8;
  display: block;
}

.ri-actions {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}

/* ===== Sheet ===== */
.sheet-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(45, 52, 54, 0.45);
  z-index: 200;
  animation: fade-in 150ms ease;
}

.sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.sheet-handle {
  width: 60rpx; height: 6rpx;
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
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.sf-field { margin-bottom: 0; }
.sf-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 6rpx;
}
.sf-input {
  width: 100%;
  height: 72rpx;
  padding: 0 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2D3436;
  border: 2rpx solid #F0EBE4;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
.sf-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sf-row { display: flex; gap: 16rpx; }
.flex-1 { flex: 1; }
</style>
