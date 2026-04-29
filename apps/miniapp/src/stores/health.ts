import { ref, watch } from 'vue'

export type HealthRecordType = 'meal' | 'water' | 'poop' | 'weight' | 'medicine' | 'note'

export interface HealthRecord {
  id: string
  type: HealthRecordType
  value: string
  note?: string
  petName?: string
  createdAt: string
}

export const recordLabels: Record<HealthRecordType, string> = {
  meal: '进食',
  water: '饮水',
  poop: '便便',
  weight: '体重',
  medicine: '用药',
  note: '备注'
}

export const recordIcons: Record<HealthRecordType, string> = {
  meal: 'food',
  water: 'water',
  poop: 'poop',
  weight: 'weight',
  medicine: 'medicine',
  note: 'edit'
}

function loadRecords(): HealthRecord[] {
  try {
    return uni.getStorageSync('pet-ai-health-records') || []
  } catch {
    return []
  }
}

export const records = ref<HealthRecord[]>(loadRecords())

export function addRecord(type: HealthRecordType, value: string, note?: string) {
  records.value.unshift({
    id: Date.now().toString(),
    type,
    value,
    note,
    createdAt: new Date().toLocaleString('zh-CN')
  })
  saveRecords()
}

export function removeRecord(id: string) {
  records.value = records.value.filter(r => r.id !== id)
  saveRecords()
}

export function clearRecords() {
  records.value = []
  saveRecords()
}

export function getRecordsByType(type: HealthRecordType): HealthRecord[] {
  return records.value.filter(r => r.type === type)
}

function saveRecords() {
  try {
    uni.setStorageSync('pet-ai-health-records', records.value)
  } catch { /* ignore */ }
}

watch(records, saveRecords, { deep: true })
