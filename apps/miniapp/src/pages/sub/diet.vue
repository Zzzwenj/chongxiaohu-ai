<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import LoadingSkeleton from '../../components/LoadingSkeleton.vue'
import FormField from '../../components/FormField.vue'
import ToggleGroup from '../../components/ToggleGroup.vue'
import { buildApiUrl } from '../../config/api'
import { getPetAiContext, getPetProfile } from '../../services/petStore'

interface DietForm {
  species: 'cat' | 'dog'
  age: string
  weight: string
  neutered: boolean
  activity: string
  currentFood: string
  healthIssues: string
  budget: string
}

const form = reactive<DietForm>({
  species: 'cat',
  age: '2岁',
  weight: '4.8',
  neutered: true,
  activity: '室内，活动少',
  currentFood: '干粮为主，偶尔冻干',
  healthIssues: '有点胖',
  budget: '中等'
})

const loading = ref(false)
const result = ref<string | null>(null)

const speciesOptions = ['猫', '狗']
const activityOptions = ['基本不动', '室内活动少', '正常活动', '活泼好动']
const budgetOptions = ['经济', '中等', '不限制']

const petProfile = getPetProfile()
form.species = petProfile.species
form.age = petProfile.age
form.weight = String(petProfile.weightKg)
form.neutered = petProfile.neutered
form.currentFood = petProfile.dietNote || form.currentFood
form.healthIssues = petProfile.chronicConditions && petProfile.chronicConditions !== '无'
  ? petProfile.chronicConditions
  : form.healthIssues

async function submit() {
  loading.value = true
  const question = `我${form.species === 'cat' ? '的猫' : '的狗'} ${form.age}，${form.weight}kg，${form.neutered ? '已' : '未'}绝育，${form.activity}。当前吃${form.currentFood}。${form.healthIssues ? '有健康问题：' + form.healthIssues : ''}。预算${form.budget}。请给我安全的餐食搭配建议。`
  const petContext = getPetAiContext()

  try {
    const res = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: buildApiUrl('/api/ai/ask'),
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          question,
          pet: {
            ...petContext.pet,
            species: form.species,
            age: form.age,
            weightKg: Number(form.weight),
            neutered: form.neutered,
            dietNote: form.currentFood,
            chronicConditions: form.healthIssues
          },
          context: {
            recentRecords: petContext.recentRecords,
            healthSummary: petContext.healthSummary
          },
          mode: 'diet'
        },
        success: r => resolve(r.data),
        fail: reject
      })
    })
    result.value = res.answer || '建议已生成'
  } catch {
    result.value = '无法获取建议，请稍后再试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page anim-page-enter">
    <TopBar title="餐食建议" showBack @back="uni.navigateBack()" />
    <SectionHeader title="餐食建议" kicker="AI 饮食方案" />

    <BaseCard padding="24rpx" class="form-card">
      <view class="form-field">
        <text class="form-label">宠物类型</text>
        <ToggleGroup :options="speciesOptions" :modelValue="form.species === 'cat' ? '猫' : '狗'"
          @update:modelValue="(v: string) => form.species = v === '猫' ? 'cat' : 'dog'" />
      </view>

      <view class="form-row">
        <FormField label="年龄" type="text" :modelValue="form.age"
          @update:modelValue="(v: string) => form.age = v" placeholder="如：2岁" />
        <FormField label="体重 kg" type="digit" :modelValue="form.weight"
          @update:modelValue="(v: string) => form.weight = v" placeholder="4.8" />
      </view>

      <view class="form-field">
        <text class="form-label">绝育</text>
        <ToggleGroup :options="['已绝育', '未绝育']"
          :modelValue="form.neutered ? '已绝育' : '未绝育'"
          @update:modelValue="(v: string) => form.neutered = v === '已绝育'" />
      </view>

      <view class="form-field">
        <text class="form-label">活动量</text>
        <ToggleGroup :options="activityOptions" :modelValue="form.activity"
          @update:modelValue="(v: string) => form.activity = v" />
      </view>

      <FormField label="当前喂养" type="text" :modelValue="form.currentFood"
        @update:modelValue="(v: string) => form.currentFood = v" placeholder="当前吃的什么？" />

      <FormField label="健康问题" type="text" :modelValue="form.healthIssues"
        @update:modelValue="(v: string) => form.healthIssues = v" placeholder="肥胖/肠胃敏感/泌尿问题等" />

      <view class="form-field">
        <text class="form-label">预算</text>
        <ToggleGroup :options="budgetOptions" :modelValue="form.budget"
          @update:modelValue="(v: string) => form.budget = v" />
      </view>

      <BaseButton variant="primary" block :loading="loading" @tap="submit">
        生成餐食建议
      </BaseButton>
    </BaseCard>

    <!-- Loading -->
    <view v-if="loading" class="result-section">
      <LoadingSkeleton type="card" />
      <text class="loading-text">AI 正在为你定制餐食方案...</text>
    </view>

    <!-- Result -->
    <BaseCard v-if="result" padding="0" class="result-card">
      <view class="result-card-top top-green" />
      <view class="result-card-body">
        <view class="result-header">
          <IconAtom name="food" :size="28" color="#7EBDA6" />
          <text class="result-label">餐食建议方案</text>
        </view>
        <text class="result-text">{{ result }}</text>
      </view>
      <view class="result-card-footer">
        <BaseButton variant="ghost" block size="sm" @tap="result = null">重新咨询</BaseButton>
      </view>
    </BaseCard>
  </view>
</template>

<style scoped>
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
  background: #FAF7F2;
}

.form-card {
  margin-bottom: 24rpx;
}

.form-field {
  margin-bottom: 16rpx;
}

.form-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 6rpx;
}

.form-row {
  display: flex;
  gap: 16rpx;
}

.result-section {
  margin-bottom: 24rpx;
}

.loading-text {
  text-align: center;
  font-size: 24rpx;
  color: #A8B5A8;
  display: block;
  margin-top: 16rpx;
}

.result-card {
  margin-bottom: 24rpx;
  overflow: hidden;
  animation: fade-in-up 300ms ease;
}

.result-card-top {
  height: 8rpx;
}
.top-green { background: #7EBDA6; }

.result-card-body {
  padding: 24rpx;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.result-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #2D3436;
}

.result-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #2D3436;
  white-space: pre-wrap;
  display: block;
}

.result-card-footer {
  padding: 0 24rpx 24rpx;
}
</style>
