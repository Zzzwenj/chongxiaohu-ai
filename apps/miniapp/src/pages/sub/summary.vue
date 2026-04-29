<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import BaseBadge from '../../components/BaseBadge.vue'
import FormField from '../../components/FormField.vue'
import { buildHealthSummary, getPetProfile, getRecentHealthRecords } from '../../services/petStore'

const petProfile = getPetProfile()
const recentHealthSummary = buildHealthSummary(
  getRecentHealthRecords(12).filter(item => item.petId === petProfile.id)
)

const form = reactive({
  species: petProfile.species === 'cat' ? '猫' : '狗',
  name: petProfile.name,
  age: petProfile.age,
  weight: `${petProfile.weightKg}kg`,
  gender: petProfile.gender || '待补充',
  neutered: petProfile.neutered ? '已绝育' : '未绝育',
  symptoms: '',
  duration: '',
  spirit: '',
  appetite: '',
  water: '',
  poop: '',
  recentChanges: '',
  done: ''
})

const summaryText = ref('')
const copied = ref(false)

function generate() {
  const parts = [
    '【就诊摘要】',
    '',
    `宠物信息：${form.species}，${form.name}，${form.age}，${form.weight}，${form.gender}，${form.neutered}`,
    '',
    `主要症状：${form.symptoms || '（待补充）'}`,
    `持续时间：${form.duration || '（待补充）'}`,
    `精神状态：${form.spirit || '（待补充）'}`,
    `食欲：${form.appetite || '（待补充）'}`,
    `饮水：${form.water || '（待补充）'}`,
    `排便排尿：${form.poop || '（待补充）'}`,
    '',
    '最近健康记录：',
    recentHealthSummary,
    '',
    `近期变化：${form.recentChanges || '（待补充）'}`,
    `已做处理：${form.done || '（待补充）'}`,
    '',
    '—— 由宠小护整理 ——'
  ]
  summaryText.value = parts.join('\n')
  copied.value = false
}

function copySummary() {
  uni.setClipboardData({
    data: summaryText.value,
    success: () => { copied.value = true }
  })
}
</script>

<template>
  <view class="page">
    <TopBar title="就医摘要" showBack @back="uni.navigateBack()" />
    <SectionHeader title="就医摘要" kicker="Summary" />
    <text class="page-desc">整理宠物信息给兽医看，减少沟通遗漏</text>

    <BaseCard padding="24rpx" class="form-card">
      <view class="form-grid">
        <view class="form-col">
          <FormField label="物种" type="text" :modelValue="form.species"
            @update:modelValue="(v: string) => form.species = v" />
          <FormField label="名字" type="text" :modelValue="form.name"
            @update:modelValue="(v: string) => form.name = v" />
          <FormField label="年龄" type="text" :modelValue="form.age"
            @update:modelValue="(v: string) => form.age = v" />
          <FormField label="体重" type="text" :modelValue="form.weight"
            @update:modelValue="(v: string) => form.weight = v" />
        </view>
        <view class="form-col">
          <FormField label="性别" type="text" :modelValue="form.gender"
            @update:modelValue="(v: string) => form.gender = v" />
          <FormField label="绝育" type="text" :modelValue="form.neutered"
            @update:modelValue="(v: string) => form.neutered = v" />
        </view>
      </view>

      <FormField label="主要症状" type="textarea" :modelValue="form.symptoms"
        @update:modelValue="(v: string) => form.symptoms = v" placeholder="呕吐、腹泻、咳嗽..." />

      <FormField label="持续时间" type="text" :modelValue="form.duration"
        @update:modelValue="(v: string) => form.duration = v" placeholder="从什么时候开始的？" />

      <FormField label="精神状态" type="textarea" :modelValue="form.spirit"
        @update:modelValue="(v: string) => form.spirit = v" placeholder="精神状态" />

      <FormField label="食欲" type="textarea" :modelValue="form.appetite"
        @update:modelValue="(v: string) => form.appetite = v" placeholder="食欲情况" />

      <FormField label="饮水" type="textarea" :modelValue="form.water"
        @update:modelValue="(v: string) => form.water = v" placeholder="饮水情况" />

      <FormField label="排便排尿" type="textarea" :modelValue="form.poop"
        @update:modelValue="(v: string) => form.poop = v" placeholder="排便排尿情况" />

      <FormField label="近期变化（换粮/用药/外出/误食）" type="textarea" :modelValue="form.recentChanges"
        @update:modelValue="(v: string) => form.recentChanges = v" placeholder="近期变化" />

      <FormField label="已做处理" type="textarea" :modelValue="form.done"
        @update:modelValue="(v: string) => form.done = v" placeholder="已经做了什么？" />

      <BaseButton variant="primary" block @tap="generate">生成摘要</BaseButton>
    </BaseCard>

    <!-- Summary Result -->
    <BaseCard v-if="summaryText" padding="0" class="result-card">
      <view class="result-card-top top-primary" />
      <view class="result-card-body">
        <view class="result-header">
          <text class="result-title">就诊摘要</text>
          <BaseButton v-if="!copied" variant="ghost" size="sm" @tap="copySummary">
            <IconAtom name="copy" :size="24" /> 复制
          </BaseButton>
          <BaseBadge v-else variant="success" size="sm">已复制</BaseBadge>
        </view>
        <view class="summary-box">
          <text class="summary-text">{{ summaryText }}</text>
        </view>
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

.page-desc {
  font-size: 24rpx;
  color: #A8B5A8;
  margin-bottom: 24rpx;
  display: block;
}

.form-card {
  margin-bottom: 24rpx;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-card {
  margin-bottom: 24rpx;
  overflow: hidden;
}

.result-card-top {
  height: 8rpx;
}
.top-primary { background: #E8956E; }

.result-card-body {
  padding: 24rpx;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2D3436;
}

.summary-box {
  background: #F5F0EA;
  border-radius: 12rpx;
  padding: 16rpx;
}

.summary-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #2D3436;
  white-space: pre-wrap;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
}
</style>
