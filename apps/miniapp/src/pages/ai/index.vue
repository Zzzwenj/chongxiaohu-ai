<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { buildApiUrl } from '../../config/api'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import RiskBadge from '../../components/RiskBadge.vue'
import IconAtom from '../../components/IconAtom.vue'
import EmptyState from '../../components/EmptyState.vue'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'
import { getPetAiContext } from '../../services/petStore'

type RiskLevel = 'green' | 'yellow' | 'red'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  riskLevel?: RiskLevel
  citations?: Array<{ id: string; title: string }>
  loading?: boolean
}

const messages = ref<Message[]>([])
const inputText = ref('')
const loading = ref(false)
const showQuick = ref(true)
const scrollViewRef = ref<any>(null)
const aiContext = ref(getPetAiContext())

const quickQuestions = [
  { text: '猫咪吐了两次，要不要去医院？', mode: 'symptom', label: '呕吐' },
  { text: '狗狗拉稀但精神还好', mode: 'symptom', label: '腹泻' },
  { text: '绝育后胖了怎么吃？', mode: 'diet', label: '餐食' },
  { text: '公猫蹲猫砂盆尿不出来', mode: 'symptom', label: '尿闭' },
  { text: '咳嗽打喷嚏好几天了', mode: 'symptom', label: '咳嗽' },
  { text: '今天该喂多少？', mode: 'diet', label: '喂食' },
]

const lastMessage = computed(() => messages.value[messages.value.length - 1])
const contextStatus = computed(() => {
  const { pet, recentRecords } = aiContext.value
  return `${pet.name} · ${pet.species === 'cat' ? '猫' : '狗'} · 最近 ${recentRecords.length} 条健康记录`
})

onShow(() => {
  aiContext.value = getPetAiContext()
})

// Auto-scroll to bottom
async function scrollToBottom() {
  await nextTick()
  // Use a query to find the last message element and scroll into view
  const query = uni.createSelectorQuery()
  query.select('.msg-wrapper:last-child').boundingClientRect()
  query.selectViewport().scrollOffset()
  query.exec((res) => {
    if (res && res[0]) {
      uni.pageScrollTo({
        duration: 200,
        scrollTop: res[1].scrollTop + res[0].top + res[0].height
      })
    }
  })
}

type AskMode = 'general' | 'symptom' | 'diet' | 'visit-summary'

function sendMessage(text?: string, mode: AskMode = 'general') {
  const question = (text || inputText.value).trim()
  if (!question || loading.value) return
  const petContext = getPetAiContext()
  aiContext.value = petContext

  showQuick.value = false
  inputText.value = ''
  loading.value = true

  messages.value.push({ id: Date.now().toString(), role: 'user', content: question })

  // Add loading message
  const loadingId = (Date.now() + 1).toString()
  messages.value.push({ id: loadingId, role: 'assistant', content: '', loading: true })

  scrollToBottom()

  uni.request({
    url: buildApiUrl('/api/ai/ask'),
    method: 'POST',
    header: { 'content-type': 'application/json' },
    data: {
      question,
      mode,
      pet: petContext.pet,
      context: {
        recentRecords: petContext.recentRecords,
        healthSummary: petContext.healthSummary
      }
    },
    success(result: any) {
      const data = result.data
      if (data) {
        messages.value = messages.value.filter(m => m.id !== loadingId)
        messages.value.push({
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.answer || '',
          riskLevel: data.riskLevel || 'green',
          citations: data.citations || []
        })
      }
    },
    fail() {
      messages.value = messages.value.filter(m => m.id !== loadingId)
      messages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。紧急情况请直接联系宠物医院。',
        riskLevel: 'red'
      })
    },
    complete() {
      loading.value = false
      scrollToBottom()
    }
  })
}

function useQuick(q: { text: string; mode: string }) {
  sendMessage(q.text, q.mode as AskMode)
}

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}

function handleKeyboard(e: any) {
  // uni-app textarea @confirm doesn't give us Shift key info,
  // so we use the uni-app keyboard height adjustment approach
  // For sending: Enter sends, Shift+Enter adds newline
  if (!e.shiftKey) {
    sendMessage()
  }
}
</script>

<template>
  <view class="page">
    <!-- Top Bar -->
    <TopBar title="AI 专家助手" showEmergency @emergency="goEmergency">
      <template #right>
        <RiskBadge v-if="lastMessage?.riskLevel" :level="lastMessage.riskLevel" size="sm" />
      </template>
    </TopBar>

    <!-- Messages -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="'msg-' + (messages.length - 1)" scroll-with-animation>
      <!-- Quick questions (shown when no messages) -->
      <view v-if="showQuick" class="quick-section">
        <BaseCard padding="16rpx">
          <view class="context-strip">
            <IconAtom name="heart" :size="28" color="#7EBDA6" />
            <text class="context-strip-text">本次会参考：{{ contextStatus }}</text>
          </view>
          <text class="quick-hint">试试这些常见问题：</text>
          <view class="quick-grid">
            <view
              v-for="q in quickQuestions"
              :key="q.label"
              class="quick-chip"
              @tap="useQuick(q)"
            >
              <IconAtom :name="q.label === '尿闭' ? 'alert' : 'chat'" :size="28" color="#E8956E" />
              <text class="quick-chip-text">{{ q.text.slice(0, 14) }}{{ q.text.length > 14 ? '...' : '' }}</text>
            </view>
          </view>
        </BaseCard>

        <EmptyState
          icon="chat"
          title="开始咨询"
          description="描述你的宠物情况，AI 助手会帮你分析风险等级并给出建议。紧急情况请直接就医。"
        />
      </view>

      <!-- Message list -->
      <view v-for="(msg, idx) in messages" :key="msg.id" :id="'msg-' + idx" class="msg-wrapper" :class="`role-${msg.role}`">
        <view v-if="msg.role === 'assistant' && !msg.loading" class="msg-avatar">
          <IconAtom name="chat" :size="32" color="#E8956E" />
        </view>
        <view class="msg-content">
          <view v-if="msg.role === 'assistant' && msg.riskLevel && !msg.loading" class="msg-risk-row">
            <RiskBadge :level="msg.riskLevel" size="sm" />
          </view>

          <view v-if="msg.loading" class="loading-dots">
            <view class="dot" />
            <view class="dot" />
            <view class="dot" />
          </view>

          <view v-if="msg.role === 'user'" class="msg-bubble msg-user">
            <text class="msg-text msg-text-user">{{ msg.content }}</text>
          </view>
          <view v-else class="msg-bubble" :class="[`risk-${msg.riskLevel || 'green'}`]">
            <view class="msg-bubble-strip" :class="`strip-${msg.riskLevel || 'green'}`" />
            <view class="msg-bubble-inner">
              <text class="msg-text">{{ msg.content }}</text>
            </view>
          </view>

          <view v-if="msg.role === 'assistant' && msg.citations && msg.citations.length > 0" class="msg-citations">
            <text class="citation-label">参考来源</text>
            <text v-for="c in msg.citations" :key="c.id" class="citation-item">{{ c.title }}</text>
          </view>

          <view v-if="msg.role === 'assistant' && !msg.loading" class="msg-actions">
            <view class="action-btn">
              <IconAtom name="thumb_up" :size="28" color="#A8B5A8" />
            </view>
            <view class="action-btn">
              <IconAtom name="thumb_down" :size="28" color="#A8B5A8" />
            </view>
            <view class="action-btn">
              <IconAtom name="copy" :size="28" color="#A8B5A8" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Input area -->
    <view class="input-area">
      <view class="input-wrapper">
        <textarea
          v-model="inputText"
          class="chat-input"
          placeholder="描述宠物的情况...（Enter 发送，Shift+Enter 换行）"
          :disabled="loading"
          @confirm="sendMessage()"
          auto-height
          :adjust-position="true"
        />
      </view>
      <BaseButton
        variant="primary"
        size="sm"
        :loading="loading"
        :disabled="!inputText.trim()"
        @tap="sendMessage()"
      >
        发送
      </BaseButton>
    </view>
    <BottomNav current="ai" />
  </view>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FAF7F2;
}

.message-list {
  flex: 1;
  padding: 24rpx 16rpx 16rpx;
  padding-bottom: 24rpx;
}

.quick-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.quick-hint {
  display: block;
  font-size: 24rpx;
  color: #7B8B7E;
  margin-bottom: 12rpx;
}

.context-strip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 14rpx;
  margin-bottom: 14rpx;
  border-radius: 14rpx;
  background: #F2F7F3;
  border: 2rpx solid #DDECE2;
}

.context-strip-text {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  line-height: 30rpx;
  color: #5F7464;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.quick-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #FDF0E8;
  border-radius: 999rpx;
  border: 2rpx solid #F5D5C0;
}

.quick-chip-text {
  font-size: 22rpx;
  color: #D4784E;
  font-weight: 500;
}

.msg-wrapper {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  animation: fade-in-up 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.msg-wrapper.role-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #FDF0E8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-content {
  max-width: 80%;
}

.msg-risk-row {
  margin-bottom: 8rpx;
}

/* User message bubble */
.msg-user {
  padding: 16rpx 20rpx;
  border-radius: 18rpx 6rpx 18rpx 18rpx;
  background: #E8956E;
  border: 2rpx solid #E8956E;
}

.msg-text-user {
  color: #FFFFFF;
}

/* AI message bubble with risk strip */
.msg-bubble {
  overflow: hidden;
  border-radius: 18rpx;
  background: #FFFFFF;
  border: 2rpx solid #E8E0D8;
  display: flex;
}

.msg-bubble.risk-yellow {
  border-color: #E8B84F;
}

.msg-bubble.risk-red {
  border-color: #E87060;
}

.msg-bubble-strip {
  width: 8rpx;
  flex-shrink: 0;
}
.strip-red { background: #E87060; }
.strip-yellow { background: #E8B84F; }
.strip-green { background: #7EBDA6; }

.msg-bubble-inner {
  padding: 16rpx;
  flex: 1;
}

.msg-text {
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
}

.msg-citations {
  margin-top: 8rpx;
  padding: 12rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
}

.citation-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  display: block;
  margin-bottom: 4rpx;
}

.citation-item {
  font-size: 22rpx;
  color: #E8956E;
  display: block;
}

.msg-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
  padding-left: 4rpx;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Loading dots */
.loading-dots {
  display: flex;
  gap: 8rpx;
  padding: 16rpx;
  align-items: center;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #E8956E;
  animation: pulse-dot 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* Input */
.input-area {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom, 0));
  margin-bottom: calc(100rpx + env(safe-area-inset-bottom, 0));
  background: #FFFFFF;
  border-top: 2rpx solid #F0EBE4;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  background: #F5F0EA;
  border-radius: 18rpx;
  padding: 12rpx 16rpx;
}

.chat-input {
  width: 100%;
  min-height: 44rpx;
  max-height: 200rpx;
  font-size: 28rpx;
  color: #2D3436;
  background: transparent;
}
</style>
