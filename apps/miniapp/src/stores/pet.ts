import { reactive, watch } from 'vue'

export interface PetProfile {
  id: string
  name: string
  species: 'cat' | 'dog'
  breed: string
  age: string
  weightKg: number
  gender: string
  neutered: boolean
  allergies: string
  chronicConditions: string
  dietNote: string
  avatar?: string
}

function loadPet(): PetProfile {
  try {
    const cached = uni.getStorageSync('pet-ai-profile')
    if (cached) return cached
  } catch { /* ignore */ }
  return {
    id: 'local-pet-1',
    name: '小橘',
    species: 'cat',
    breed: '橘猫',
    age: '2岁',
    weightKg: 4.8,
    gender: '公',
    neutered: true,
    allergies: '',
    chronicConditions: '',
    dietNote: '干粮为主，偶尔冻干'
  }
}

export const pet = reactive<PetProfile>(loadPet())

export function savePet() {
  try {
    uni.setStorageSync('pet-ai-profile', { ...pet })
  } catch { /* ignore */ }
}

export function getSpeciesLabel(): string {
  return pet.species === 'cat' ? '猫' : '狗'
}

export function getPetSummary(): string {
  const parts = [
    `${getSpeciesLabel()} ${pet.name}`,
    pet.age ? `，${pet.age}` : '',
    pet.weightKg ? `，${pet.weightKg}kg` : '',
    pet.gender ? `，${pet.gender}` : '',
    pet.neutered ? '，已绝育' : '，未绝育'
  ]
  return parts.join('')
}

// Auto-save on changes
watch(pet, savePet, { deep: true })
