<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import RiskBadge from '../../components/RiskBadge.vue'
import IconAtom from '../../components/IconAtom.vue'
import TopBar from '../../components/TopBar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import LoadingSkeleton from '../../components/LoadingSkeleton.vue'
import FormField from '../../components/FormField.vue'
import { buildApiUrl } from '../../config/api'
import { getPetAiContext, getPetProfile } from '../../services/petStore'

type Step = 'species' | 'symptom' | 'detail' | 'result'
type RiskLevel = 'green' | 'yellow' | 'red'

const step = ref<Step>('species')
const species = ref<'cat' | 'dog'>(getPetProfile().species)
const loading = ref(false)

const selectedSymptoms = ref<string[]>([])
const symptomText = ref('')
const detailAnswers = reactive<Record<string, string>>({})

const symptoms = {
  cat: ['呕吐/反胃', '腹泻/拉稀', '不吃饭', '精神差', '咳嗽/打喷嚏', '尿频/尿不出', '皮肤痒/掉毛', '眼睛异常', '耳朵脏/甩头', '口臭/流口水'],
  dog: ['呕吐', '腹泻', '不吃饭', '精神差', '咳嗽', '尿频/尿不出', '皮肤痒/掉毛', '眼睛异常', '耳朵脏/甩头', '跛行/不愿动']
}

const baseDetailQuestions = [
  { key: 'duration', label: '持续时间', placeholder: '如：今天早上开始 / 已经 2 天', type: 'text' },
  { key: 'frequency', label: '频率或次数', placeholder: '如：今天 2 次 / 每小时一次', type: 'text' },
  { key: 'spiritAppetite', label: '精神和食欲', placeholder: '精神、食欲、饮水有没有变化？', type: 'textarea' },
  { key: 'excretion', label: '排便排尿', placeholder: '便便、排尿是否正常？有没有血、黑便或尿不出？', type: 'textarea' },
  { key: 'exposure', label: '近期变化', placeholder: '是否换粮、外出、吃药、误食、接触新环境？', type: 'textarea' }
] as const

const detailQuestions = computed(() => {
  const text = `${selectedSymptoms.value.join(' ')} ${symptomText.value}`
  const extras: Array<{ key: string; label: string; placeholder: string; type: 'text' | 'textarea' }> = []

  if (/呕吐|吐|反胃/.test(text)) {
    extras.push({
      key: 'vomitFeature',
      label: '呕吐表现',
      placeholder: '颜色、是否带血/异物、是否能喝水、吐完精神如何？',
      type: 'textarea'
    })
  }

  if (/腹泻|拉稀|便血|黑便/.test(text)) {
    extras.push({
      key: 'diarrheaFeature',
      label: '便便表现',
      placeholder: '颜色、形态、次数、是否带血/黏液/黑便？',
      type: 'textarea'
    })
  }

  if (/尿|排尿|尿不出|尿频/.test(text)) {
    extras.push({
      key: 'urinaryFeature',
      label: '排尿细节',
      placeholder: '是否完全尿不出、频繁蹲、叫痛、尿血、舔尿道口？',
      type: 'textarea'
    })
  }

  if (/咳嗽|呼吸|喘|打喷嚏/.test(text)) {
    extras.push({
      key: 'breathingFeature',
      label: '呼吸表现',
      placeholder: '是否张口呼吸、舌色发紫、呼吸急促、夜间加重？',
      type: 'textarea'
    })
  }

  return [...baseDetailQuestions, ...extras]
})

const detailLines = computed(() =>
  detailQuestions.value
    .map((item) => {
      const value = detailAnswers[item.key]?.trim()
      return value ? `${item.label}：${value}` : ''
    })
    .filter(Boolean)
)

// Result
const result = ref<{ riskLevel: RiskLevel; answer: string; summary: string } | null>(null)

function selectSpecies(s: 'cat' | 'dog') {
  species.value = s
  step.value = 'symptom'
}

function toggleSymptom(s: string) {
  const i = selectedSymptoms.value.indexOf(s)
  if (i >= 0) selectedSymptoms.value.splice(i, 1)
  else selectedSymptoms.value.push(s)
}

async function submit() {
  if (selectedSymptoms.value.length === 0 && !symptomText.value.trim()) return

  step.value = 'detail'
  loading.value = true

  const question = [
    species.value === 'cat' ? '猫' : '狗',
    selectedSymptoms.value.length ? `，症状：${selectedSymptoms.value.join('、')}` : '',
    symptomText.value ? `，补充：${symptomText.value}` : '',
    detailLines.value.length ? `，关键追问：${detailLines.value.join('；')}` : ''
  ].join('')
  const petContext = getPetAiContext()

  try {
    const res = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: buildApiUrl('/api/ai/ask'),
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          question,
          pet: { ...petContext.pet, species: species.value },
          context: {
            recentRecords: petContext.recentRecords,
            healthSummary: petContext.healthSummary
          },
          mode: 'symptom'
        },
        success: r => resolve(r.data),
        fail: reject
      })
    })

    step.value = 'result'
    result.value = {
      riskLevel: res.riskLevel || 'green',
      answer: res.answer || '分析完成，请根据症状评估。',
      summary: `宠物：${petContext.pet.name}（${species.value === 'cat' ? '猫' : '狗'}）\n症状：${selectedSymptoms.value.join('、')}\n${symptomText.value ? `补充：${symptomText.value}\n` : ''}${detailLines.value.length ? `关键追问：\n${detailLines.value.join('\n')}` : ''}\n\n最近记录：\n${petContext.healthSummary}`
    }
  } catch {
    step.value = 'result'
    result.value = {
      riskLevel: 'red',
      answer: '无法连接到 AI 服务。如果有紧急症状，请直接联系宠物医院。',
      summary: '（离线模式）请直接就医'
    }
  } finally {
    loading.value = false
  }
}

function reset() {
  step.value = 'species'
  selectedSymptoms.value = []
  symptomText.value = ''
  Object.keys(detailAnswers).forEach((key) => {
    detailAnswers[key] = ''
  })
  result.value = null
}

function goSummary() {
  uni.navigateTo({ url: '/pages/sub/summary' })
}
</script>

<template>
  <view class="page">
    <TopBar title="症状分诊" showBack @back="uni.navigateBack()" />
    <!-- Step indicator -->
    <view class="step-indicator">
      <view class="step-dot" :class="{ active: step === 'species', done: step !== 'species' }">1</view>
      <view class="step-line" :class="{ active: step !== 'species' }" />
      <view class="step-dot" :class="{ active: step === 'symptom', done: step === 'detail' || step === 'result' }">2</view>
      <view class="step-line" :class="{ active: step === 'detail' || step === 'result' }" />
      <view class="step-dot" :class="{ active: step === 'result' }">3</view>
    </view>

    <!-- Step 1: Species -->
    <view v-if="step === 'species'" class="step-content">
      <SectionHeader title="选择宠物类型" kicker="Step 1" />
      <view class="species-grid">
        <BaseCard pressable padding="32rpx" class="species-card" @tap="selectSpecies('cat')">
          <IconAtom name="pet_cat" :size="80" color="#E8956E" />
          <text class="species-name">猫</text>
          <text class="species-desc">猫咪健康咨询</text>
        </BaseCard>
        <BaseCard pressable padding="32rpx" class="species-card" @tap="selectSpecies('dog')">
          <IconAtom name="pet_dog" :size="80" color="#7EBDA6" />
          <text class="species-name">狗</text>
          <text class="species-desc">狗狗健康咨询</text>
        </BaseCard>
      </view>
    </view>

    <!-- Step 2: Symptom selection -->
    <view v-if="step === 'symptom'" class="step-content">
      <SectionHeader title="选择症状" kicker="Step 2" action="跳过" @action="symptomText ? submit() : null" />
      <text class="step-hint">选择 {{ species === 'cat' ? '猫咪' : '狗狗' }} 出现的症状（可多选）</text>
      <view class="symptom-grid">
        <view
          v-for="s in symptoms[species]"
          :key="s"
          class="symptom-chip"
          :class="{ selected: selectedSymptoms.includes(s) }"
          @tap="toggleSymptom(s)"
        >
          <text>{{ s }}</text>
        </view>
      </view>

      <textarea
        v-model="symptomText"
        class="symptom-textarea"
        placeholder="补充描述：什么时候开始的？频率？精神状态？..."
      />

      <view class="detail-panel">
        <view class="detail-panel-head">
          <IconAtom name="search" :size="28" color="#6A8FA0" />
          <view class="detail-panel-title-wrap">
            <text class="detail-panel-title">关键追问</text>
            <text class="detail-panel-desc">这些信息会直接影响风险判断和就医摘要</text>
          </view>
        </view>
        <view class="detail-fields">
          <FormField
            v-for="q in detailQuestions"
            :key="q.key"
            :label="q.label"
            :type="q.type"
            :placeholder="q.placeholder"
            :modelValue="detailAnswers[q.key] || ''"
            @update:modelValue="(value: string) => detailAnswers[q.key] = value"
          />
        </view>
      </view>

      <BaseButton
        variant="primary"
        block
        :disabled="selectedSymptoms.length === 0 && !symptomText.trim()"
        @tap="submit"
      >
        开始分析
      </BaseButton>
      <BaseButton variant="ghost" block @tap="step = 'species'">返回</BaseButton>
    </view>

    <!-- Step 3: Loading -->
    <view v-if="step === 'detail' && loading" class="step-content">
      <LoadingSkeleton type="card" />
      <LoadingSkeleton type="card" />
      <text class="loading-text">正在分析症状...</text>
    </view>

    <!-- Step 4: Result -->
    <view v-if="step === 'result' && result" class="step-content">
      <!-- Risk Banner -->
      <view class="result-banner" :class="`banner-${result.riskLevel}`">
        <RiskBadge :level="result.riskLevel" size="lg" :pulsate="result.riskLevel === 'red'" />
        <text class="banner-title">
          {{ result.riskLevel === 'red' ? '建议立即就医' : result.riskLevel === 'yellow' ? '建议尽快就医' : '居家观察' }}
        </text>
        <text class="banner-subtitle">
          {{ result.riskLevel === 'red' ? '请尽快联系宠物医院' : result.riskLevel === 'yellow' ? '建议预约兽医检查' : '按当前建议护理即可' }}
        </text>
      </view>

      <!-- Analysis Result Card -->
      <BaseCard padding="0" class="result-card">
        <view class="result-card-top" :class="`top-${result.riskLevel}`" />
        <view class="result-card-body">
          <text class="result-label">分析结果</text>
          <text class="result-text">{{ result.answer }}</text>
        </view>
        <view class="result-card-footer">
          <BaseButton
            variant="primary" block size="md"
            @tap="goSummary"
          >
            生成就医摘要
          </BaseButton>

          <BaseButton variant="ghost" block size="sm" @tap="reset">
            重新分诊
          </BaseButton>
        </view>
      </BaseCard>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FAF7F2;
  animation: fade-in 250ms ease;
}

/* ===== Step Indicator ===== */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8rpx 24rpx 32rpx;
}

.step-dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 800;
  background: #F5F0EA;
  color: #A8B5A8;
  border: 3rpx solid #E8E0D8;
  transition: all 250ms;
}

.step-dot.active {
  background: #E8956E;
  color: #FFFFFF;
  border-color: #E8956E;
  box-shadow: 0 0 0 6rpx rgba(232, 149, 110, 0.2);
}

.step-dot.done {
  background: #7EBDA6;
  color: #FFFFFF;
  border-color: #7EBDA6;
}

.step-line {
  width: 72rpx;
  height: 4rpx;
  background: #E8E0D8;
  border-radius: 4rpx;
  transition: background 250ms;
}

.step-line.active {
  background: #7EBDA6;
}

/* ===== Species ===== */
.species-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 24rpx;
}

.species-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  min-height: 240rpx;
  justify-content: center;
  border-color: #F0EBE4;
}

.species-card:active {
  transform: scale(0.96);
}

.species-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #2D3436;
}

.species-desc {
  font-size: 22rpx;
  color: #A8B5A8;
}

/* ===== Symptom Selection ===== */
.step-hint {
  font-size: 24rpx;
  color: #7B8B7E;
  margin-bottom: 16rpx;
  display: block;
}

.symptom-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.symptom-chip {
  padding: 12rpx 28rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #7B8B7E;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.symptom-chip:active {
  transform: scale(0.94);
}

.symptom-chip.selected {
  background: #FFFFFF;
  border-color: #E8956E;
  color: #D4784E;
  font-weight: 700;
  box-shadow: 0 0 0 3rpx rgba(232, 149, 110, 0.15);
}

.symptom-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 16rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  border-radius: 18rpx;
  font-size: 28rpx;
  color: #2D3436;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.symptom-textarea:focus {
  border-color: #E8956E;
}

/* ===== Result Banner ===== */
.result-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 32rpx 24rpx;
  border-radius: 22rpx;
  margin-bottom: 24rpx;
  text-align: center;
  animation: fade-in-up 300ms ease;
}

.banner-red {
  background: linear-gradient(135deg, #FDE8E5, #FDF0EE);
  border: 2rpx solid #E87060;
}
.banner-yellow {
  background: linear-gradient(135deg, #FDF3D6, #FDF8E8);
  border: 2rpx solid #E8B84F;
}
.banner-green {
  background: linear-gradient(135deg, #EEF7F2, #F5FAF7);
  border: 2rpx solid #7EBDA6;
}

.banner-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #2D3436;
}
.banner-subtitle {
  font-size: 24rpx;
  color: #7B8B7E;
}

/* ===== Result Card ===== */
.result-card {
  margin-bottom: 24rpx;
  overflow: hidden;
  animation: fade-in-up 350ms ease;
}

.result-card-top {
  height: 8rpx;
}
.top-red { background: #E87060; }
.top-yellow { background: #E8B84F; }
.top-green { background: #7EBDA6; }

.result-card-body {
  padding: 24rpx;
}

.result-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 12rpx;
}

.result-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #2D3436;
  white-space: pre-wrap;
}

.result-card-footer {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 0 24rpx 24rpx;
}

.loading-text {
  text-align: center;
  font-size: 24rpx;
  color: #A8B5A8;
  display: block;
  margin-top: 24rpx;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 0 24rpx 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom, 0px));
}

/* ===== Detail Questions ===== */
.detail-panel {
  padding: 20rpx;
  margin-bottom: 12rpx;
  border-radius: 20rpx;
  background: #FFFFFF;
  border: 2rpx solid #E8E0D8;
}

.detail-panel-head {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  padding-bottom: 16rpx;
  margin-bottom: 16rpx;
  border-bottom: 2rpx solid #F0EBE4;
}

.detail-panel-title-wrap {
  flex: 1;
  min-width: 0;
}

.detail-panel-title {
  display: block;
  font-size: 28rpx;
  line-height: 38rpx;
  font-weight: 800;
  color: #2D3436;
}

.detail-panel-desc {
  display: block;
  margin-top: 2rpx;
  font-size: 22rpx;
  line-height: 30rpx;
  color: #7B8B7E;
}

.detail-fields {
  display: flex;
  flex-direction: column;
}
</style>
