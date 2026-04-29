import { ref, computed, watch } from 'vue'

export interface Task {
  id: string
  time: string
  title: string
  detail: string
  icon: string
  done: boolean
  dogOnly?: boolean
}

export interface Reminder {
  id: string
  type: 'vaccine' | 'deworm' | 'checkup' | 'medicine' | 'bath' | 'weigh' | 'custom'
  title: string
  nextDate: string
  cycle: string
  note?: string
  done: boolean
}

const defaultTasks: Task[] = [
  { id: 'feed-am', time: '08:00', title: '早餐', detail: '定量主粮，换新水', icon: 'food', done: false },
  { id: 'walk-am', time: '08:30', title: '晨间遛狗', detail: '20 分钟，记录便便和精神', icon: 'heart', done: false, dogOnly: true },
  { id: 'play', time: '12:30', title: '互动活动', detail: '逗猫/玩具 10 分钟', icon: 'pet_cat', done: false },
  { id: 'feed-pm', time: '18:30', title: '晚餐', detail: '湿粮可替代部分干粮', icon: 'food', done: false },
  { id: 'health', time: '21:00', title: '健康记录', detail: '食欲、饮水、排便排尿', icon: 'heart', done: false },
  { id: 'care', time: '本周', title: '驱虫/疫苗检查', detail: '核对下次提醒日期', icon: 'vaccine', done: false },
]

function loadTasks(): Task[] {
  try {
    return uni.getStorageSync('pet-ai-tasks') || defaultTasks
  } catch {
    return defaultTasks
  }
}

function loadReminders(): Reminder[] {
  try {
    return uni.getStorageSync('pet-ai-reminders') || []
  } catch {
    return []
  }
}

export const tasks = ref<Task[]>(loadTasks())
export const reminders = ref<Reminder[]>(loadReminders())

export function saveTasks() {
  uni.setStorageSync('pet-ai-tasks', tasks.value)
}

export function saveReminders() {
  uni.setStorageSync('pet-ai-reminders', reminders.value)
}

export function toggleTask(id: string) {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.done = !task.done
    saveTasks()
  }
}

export function visibleTasks(species: 'cat' | 'dog') {
  return computed(() => tasks.value.filter(t => !t.dogOnly || species === 'dog'))
}

export function doneCount(species: 'cat' | 'dog') {
  return computed(() => visibleTasks(species).value.filter(t => t.done).length)
}

export function progress(species: 'cat' | 'dog') {
  const vis = visibleTasks(species).value
  return Math.round((doneCount(species).value / Math.max(vis.length, 1)) * 100)
}

export function nextTask(species: 'cat' | 'dog') {
  return computed(() => visibleTasks(species).value.find(t => !t.done))
}

watch(tasks, saveTasks, { deep: true })
watch(reminders, saveReminders, { deep: true })
