export type Species = 'cat' | 'dog'

export interface PetProfile {
  id: string
  name: string
  species: Species
  breed: string
  age: string
  weightKg: number | string
  gender: string
  neutered: boolean
  allergies: string
  chronicConditions: string
  dietNote: string
}

export type HealthRecordType =
  | 'meal'
  | 'water'
  | 'poop'
  | 'pee'
  | 'vomit'
  | 'weight'
  | 'medicine'
  | 'mood'
  | 'skin'
  | 'note'

export interface HealthRecord {
  id: string
  petId: string
  type: HealthRecordType
  value: string
  note?: string
  createdAt: string
}

export interface PetAiContext {
  pet: PetProfile
  recentRecords: HealthRecord[]
  healthSummary: string
}

const PET_KEY = 'pet-ai-profile'
const RECORDS_KEY = 'pet-ai-health-records'

export const defaultPet: PetProfile = {
  id: 'local-pet-1',
  name: '小橘',
  species: 'cat',
  breed: '橘猫',
  age: '2岁',
  weightKg: 4.8,
  gender: '公',
  neutered: true,
  allergies: '无',
  chronicConditions: '无',
  dietNote: '干粮为主，偶尔冻干'
}

export const recordLabels: Record<HealthRecordType, string> = {
  meal: '进食',
  water: '饮水',
  poop: '便便',
  pee: '排尿',
  vomit: '呕吐',
  weight: '体重',
  medicine: '用药',
  mood: '精神',
  skin: '皮肤',
  note: '备注'
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key)
    return value || fallback
  } catch {
    return fallback
  }
}

export function getPetProfile(): PetProfile {
  return {
    ...defaultPet,
    ...readStorage<Partial<PetProfile>>(PET_KEY, {})
  }
}

export function savePetProfile(pet: PetProfile) {
  uni.setStorageSync(PET_KEY, { ...pet })
}

export function getHealthRecords(): HealthRecord[] {
  return readStorage<HealthRecord[]>(RECORDS_KEY, [])
}

export function saveHealthRecords(records: HealthRecord[]) {
  uni.setStorageSync(RECORDS_KEY, records)
}

export function addHealthRecord(record: Omit<HealthRecord, 'id' | 'createdAt'>) {
  const next: HealthRecord = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toLocaleString('zh-CN')
  }
  const records = [next, ...getHealthRecords()].slice(0, 300)
  saveHealthRecords(records)
  return next
}

export function getRecentHealthRecords(limit = 12) {
  return getHealthRecords().slice(0, limit)
}

export function buildHealthSummary(records = getRecentHealthRecords(12)) {
  if (records.length === 0) return '最近还没有健康记录。'
  return records
    .slice(0, 8)
    .map(item => `${item.createdAt} ${recordLabels[item.type] || item.type}：${item.value}${item.note ? `（${item.note}）` : ''}`)
    .join('\n')
}

export function getPetAiContext(): PetAiContext {
  const pet = getPetProfile()
  const recentRecords = getRecentHealthRecords(12).filter(item => item.petId === pet.id)
  return {
    pet,
    recentRecords,
    healthSummary: buildHealthSummary(recentRecords)
  }
}
