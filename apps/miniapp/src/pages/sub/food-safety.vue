<script setup lang="ts">
import { computed, ref } from 'vue'
import TopBar from '../../components/TopBar.vue'
import IconAtom from '../../components/IconAtom.vue'
import BaseCard from '../../components/BaseCard.vue'

type SafetyLevel = 'safe' | 'caution' | 'danger'

interface FoodItem {
  name: string
  aliases: string[]
  level: SafetyLevel
  species: 'cat' | 'dog' | 'all'
  note: string
  action: string
}

const keyword = ref('')

const levelText: Record<SafetyLevel, string> = {
  safe: '通常可少量',
  caution: '谨慎',
  danger: '禁食/急症'
}

const levelColor: Record<SafetyLevel, string> = {
  safe: '#6AAA93',
  caution: '#E8B84F',
  danger: '#E87060'
}

const foods: FoodItem[] = [
  {
    name: '葡萄 / 葡萄干',
    aliases: ['葡萄', '葡萄干', '提子'],
    level: 'danger',
    species: 'dog',
    note: '犬误食后可能出现严重肾损伤，个体差异很大，少量也不能掉以轻心。',
    action: '确认误食请尽快联系宠物医院，不要自行催吐。'
  },
  {
    name: '巧克力',
    aliases: ['巧克力', '可可', '黑巧'],
    level: 'danger',
    species: 'all',
    note: '可可碱和咖啡因对猫狗有风险，黑巧和烘焙巧克力风险更高。',
    action: '记录种类、重量、误食时间，立即咨询宠物医院。'
  },
  {
    name: '洋葱 / 葱 / 蒜',
    aliases: ['洋葱', '葱', '大葱', '蒜', '韭菜'],
    level: 'danger',
    species: 'all',
    note: '可能损伤红细胞，引发贫血风险，加热后也不等于安全。',
    action: '误食后联系医院，观察精神、牙龈颜色、尿色。'
  },
  {
    name: '百合',
    aliases: ['百合', '百合花'],
    level: 'danger',
    species: 'cat',
    note: '猫接触或误食百合相关部位可能导致急性肾损伤。',
    action: '猫接触或误食后应尽快就医。'
  },
  {
    name: '牛奶',
    aliases: ['牛奶', '奶'],
    level: 'caution',
    species: 'all',
    note: '很多成年猫狗乳糖不耐，可能腹泻或呕吐。',
    action: '不建议作为日常饮品，优先提供清水。'
  },
  {
    name: '熟鸡胸肉',
    aliases: ['鸡胸', '鸡胸肉', '熟鸡肉'],
    level: 'safe',
    species: 'all',
    note: '无盐无调味、完全煮熟、去骨后可少量作为加餐。',
    action: '控制量，不替代完整主粮。'
  },
  {
    name: '南瓜',
    aliases: ['南瓜'],
    level: 'safe',
    species: 'all',
    note: '熟南瓜少量可作为膳食补充，但不能替代主粮或治疗。',
    action: '首次少量尝试，观察排便。'
  },
  {
    name: '人用止痛药',
    aliases: ['布洛芬', '对乙酰氨基酚', '感冒药', '止痛药'],
    level: 'danger',
    species: 'all',
    note: '人用药对猫狗可能高度危险，尤其止痛药和感冒药。',
    action: '误食药物请带包装立即联系宠物医院。'
  }
]

const filteredFoods = computed(() => {
  const value = keyword.value.trim()
  if (!value) return foods
  return foods.filter(item =>
    item.name.includes(value) || item.aliases.some(alias => alias.includes(value))
  )
})

function goBack() {
  uni.navigateBack()
}

function askAi(item: FoodItem) {
  uni.navigateTo({
    url: `/pages/ai/index?question=${encodeURIComponent(`${item.name} 对我的宠物安全吗？`)}`
  })
}
</script>

<template>
  <view class="page">
    <TopBar title="食物安全速查" showBack @back="goBack" />
    <view class="page-body">
      <view class="search-box">
        <IconAtom name="search" :size="30" color="#A8B5A8" />
        <input v-model="keyword" class="search-input" placeholder="搜索：葡萄、巧克力、牛奶、人药..." />
      </view>

      <view class="warning-card">
        <IconAtom name="alert" :size="34" color="#E87060" />
        <text class="warning-text">误食毒物、人药、尿不出、呼吸异常等情况，请直接联系宠物医院。</text>
      </view>

      <view class="food-list">
        <BaseCard
          v-for="item in filteredFoods"
          :key="item.name"
          padding="20rpx"
          class="food-card"
        >
          <view class="food-head">
            <view>
              <text class="food-name">{{ item.name }}</text>
              <text class="food-species">{{ item.species === 'all' ? '猫狗' : item.species === 'cat' ? '猫' : '狗' }}</text>
            </view>
            <view class="safety-pill" :style="{ background: levelColor[item.level] + '18', color: levelColor[item.level] }">
              {{ levelText[item.level] }}
            </view>
          </view>
          <text class="food-note">{{ item.note }}</text>
          <view class="food-action">
            <text class="food-action-text">{{ item.action }}</text>
          </view>
          <view class="ask-row" @tap="askAi(item)">
            <IconAtom name="chat" :size="24" color="#E8956E" />
            <text class="ask-text">带宠物档案问 AI</text>
          </view>
        </BaseCard>
      </view>

      <view v-if="filteredFoods.length === 0" class="empty">
        <text class="empty-title">暂未收录</text>
        <text class="empty-text">可以去 AI 助手咨询，并把结果反馈给知识库审核。</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FAF7F2;
}

.page-body {
  padding: 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0px));
}

.search-box {
  height: 84rpx;
  padding: 0 22rpx;
  margin-bottom: 18rpx;
  border-radius: 20rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #2D3436;
}

.warning-card {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx 20rpx;
  margin-bottom: 22rpx;
  border-radius: 18rpx;
  background: #FFF7F5;
  border: 2rpx solid #F6C9C1;
}

.warning-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 34rpx;
  color: #8E5B54;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.food-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
  margin-bottom: 12rpx;
}

.food-name {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: #2D3436;
}

.food-species {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #A8B5A8;
}

.safety-pill {
  flex-shrink: 0;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 800;
}

.food-note {
  display: block;
  font-size: 25rpx;
  line-height: 38rpx;
  color: #66756A;
}

.food-action {
  margin-top: 12rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: #F8F6F2;
}

.food-action-text {
  font-size: 24rpx;
  line-height: 34rpx;
  color: #2D3436;
}

.ask-row {
  margin-top: 14rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.ask-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #E8956E;
}

.empty {
  padding: 64rpx 24rpx;
  text-align: center;
}

.empty-title,
.empty-text {
  display: block;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #2D3436;
}

.empty-text {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7B8B7E;
}
</style>
