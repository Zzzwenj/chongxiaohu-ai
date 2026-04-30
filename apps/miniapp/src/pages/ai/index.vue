<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
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
  typingEnd?: boolean
}

const messages = ref<Message[]>([])
const inputText = ref('')
const loading = ref(false)
const showQuick = ref(true)
const scrollViewRef = ref<any>(null)
const aiContext = ref(getPetAiContext())
const feedbackState = ref<Record<string, 'helpful' | 'wrong' | 'unsafe' | 'too_generic' | 'not_applicable'>>({})
type AskMode = 'general' | 'symptom' | 'diet' | 'visit-summary'
const activeMode = ref<AskMode>('general')

const modeOptions: Array<{ key: AskMode; label: string; icon: string }> = [
  { key: 'general', label: '日常', icon: 'chat' },
  { key: 'symptom', label: '症状', icon: 'alert' },
  { key: 'diet', label: '餐食', icon: 'food' },
]

const quickQuestions = [
  { text: '猫咪吐了两次，要不要去医院？', mode: 'symptom', label: '呕吐' },
  { text: '狗狗拉稀但精神还好', mode: 'symptom', label: '腹泻' },
  { text: '绝育后胖了怎么吃？', mode: 'diet', label: '餐食' },
  { text: '公猫蹲猫砂盆尿不出来', mode: 'symptom', label: '尿闭' },
  { text: '咳嗽打喷嚏好几天了', mode: 'symptom', label: '咳嗽' },
  { text: '今天该喂多少？', mode: 'diet', label: '喂食' },
]

const lastMessage = computed(() => messages.value[messages.value.length - 1])

/** Display the highest risk level from all AI messages */
const currentRisk = computed<RiskLevel | null>(() => {
  const aiMsgs = messages.value.filter(m => m.role === 'assistant' && !m.loading && m.riskLevel)
  if (aiMsgs.length === 0) return null
  if (aiMsgs.some(m => m.riskLevel === 'red')) return 'red'
  if (aiMsgs.some(m => m.riskLevel === 'yellow')) return 'yellow'
  return 'green'
})

const contextStatus = computed(() => {
  const { pet, recentRecords } = aiContext.value
  return `${pet.name} · ${pet.species === 'cat' ? '猫' : '狗'} · 最近 ${recentRecords.length} 条健康记录`
})

onShow(() => {
  aiContext.value = getPetAiContext()
})

onLoad((options) => {
  const question = typeof options?.question === 'string' ? decodeURIComponent(options.question) : ''
  if (question) {
    inputText.value = question
  }
})

async function scrollToBottom() {
  await nextTick()
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

function sendMessage(text?: string, mode: AskMode = activeMode.value) {
  const question = (text || inputText.value).trim()
  if (!question || loading.value) return
  const petContext = getPetAiContext()
  aiContext.value = petContext

  showQuick.value = false
  inputText.value = ''
  loading.value = true

  messages.value.push({ id: Date.now().toString(), role: 'user', content: question })

  const loadingId = (Date.now() + 1).toString()
  messages.value.push({
    id: loadingId, role: 'assistant',
    content: '',
    loading: true,
    typingEnd: false
  })

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
          citations: data.citations || [],
          typingEnd: false
        })
        // Simulate typewriter: mark as typing done after content is rendered
        setTimeout(() => {
          const msg = messages.value.find(m => m.id === (data.id || Date.now().toString()))
          if (msg) msg.typingEnd = true
        }, Math.min(data.answer?.length || 100, 300) * 15 + 200)
      }
    },
    fail() {
      messages.value = messages.value.filter(m => m.id !== loadingId)
      messages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。紧急情况请直接联系宠物医院。',
        riskLevel: 'red',
        typingEnd: true
      })
    },
    complete() {
      loading.value = false
      scrollToBottom()
    }
  })
}

function useQuick(q: { text: string; mode: string }) {
  activeMode.value = q.mode as AskMode
  sendMessage(q.text, q.mode as AskMode)
}

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}

function handleKeyboard(e: any) {
  if (!e.shiftKey) {
    sendMessage()
  }
}

/* ---- Copy assistant message ---- */
function copyText(text: string) {
  uni.setClipboardData({ data: text })
  uni.showToast({ title: '已复制', icon: 'none' })
}

function sendFeedback(msg: Message, feedbackType: 'helpful' | 'wrong' | 'unsafe' | 'too_generic' | 'not_applicable') {
  if (!msg.id || msg.loading) return
  if (feedbackState.value[msg.id] === feedbackType) return
  feedbackState.value[msg.id] = feedbackType
  uni.request({
    url: buildApiUrl('/api/feedback'),
    method: 'POST',
    header: { 'content-type': 'application/json' },
    data: {
      conversationId: msg.id,
      feedbackType,
      feedbackText: feedbackType === 'helpful' ? '用户认为回答有帮助' : '用户认为回答需要人工复核'
    },
    success() {
      uni.showToast({
        title: feedbackType === 'helpful' ? '谢谢反馈' : '已提交复核',
        icon: 'none'
      })
    },
    fail() {
      delete feedbackState.value[msg.id]
      uni.showToast({ title: '反馈提交失败', icon: 'none' })
    }
  })
}

function chooseMedia(kind: 'image' | 'video') {
  uni.showToast({
    title: kind === 'image' ? '图片分析入口已预留' : '视频分析入口已预留',
    icon: 'none'
  })
}
</script>

<template>
  <view class="page">
    <TopBar title="AI 专家助手" showEmergency @emergency="goEmergency">
      <template #right>
        <RiskBadge v-if="currentRisk" :level="currentRisk" size="sm" />
      </template>
    </TopBar>

    <!-- Messages -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="'msg-' + (messages.length - 1)" scroll-with-animation>
      <!-- Quick questions (shown when no messages) -->
      <view v-if="showQuick" class="quick-section">
        <BaseCard padding="20rpx" class="context-card">
          <view class="context-strip">
            <view class="context-icon">
              <IconAtom name="heart" :size="24" color="#7EBDA6" />
            </view>
            <text class="context-strip-text">参考档案：{{ contextStatus }}</text>
          </view>

          <view class="mode-tabs">
            <view
              v-for="mode in modeOptions"
              :key="mode.key"
              class="mode-tab"
              :class="{ 'is-active': activeMode === mode.key }"
              @tap="activeMode = mode.key"
            >
              <IconAtom :name="mode.icon" :size="26" :color="activeMode === mode.key ? '#FFFFFF' : '#7B8B7E'" />
              <text class="mode-tab-text">{{ mode.label }}</text>
            </view>
          </view>

          <text class="quick-hint">试试这些常见问题：</text>
          <view class="quick-grid">
            <view
              v-for="q in quickQuestions"
              :key="q.label"
              class="quick-chip"
              @tap="useQuick(q)"
            >
              <text class="quick-chip-text">{{ q.text }}</text>
            </view>
          </view>
        </BaseCard>

        <view class="media-entry">
          <view class="media-item" @tap="chooseMedia('image')">
            <IconAtom name="search" :size="30" color="#6A8FA0" />
            <text class="media-title">图片辅助分析</text>
            <text class="media-desc">皮肤、便便、呕吐物、伤口</text>
          </view>
          <view class="media-item" @tap="chooseMedia('video')">
            <IconAtom name="heart" :size="30" color="#7EBDA6" />
            <text class="media-title">视频辅助分析</text>
            <text class="media-desc">步态、咳嗽、呼吸、抽搐</text>
          </view>
        </view>

        <EmptyState
          icon="chat"
          title="开始咨询"
          description="描述你的宠物情况，AI 助手会帮你分析风险等级并给出建议。紧急情况请直接就医。"
        />
      </view>

      <!-- Message list -->
      <view v-for="(msg, idx) in messages" :key="msg.id" :id="'msg-' + idx" class="msg-wrapper" :class="`role-${msg.role}`">
        <!-- AI Avatar -->
        <view v-if="msg.role === 'assistant'" class="msg-avatar">
          <IconAtom name="chat" :size="28" color="#E8956E" />
        </view>

        <view class="msg-content">
          <!-- User message -->
          <view v-if="msg.role === 'user'" class="msg-bubble msg-user-bubble">
            <text class="msg-text msg-text-user">{{ msg.content }}</text>
          </view>

          <!-- AI message -->
          <template v-else>
            <!-- Risk badge inline -->
            <view v-if="msg.riskLevel && !msg.loading" class="msg-risk-row">
              <RiskBadge :level="msg.riskLevel" size="sm" />
            </view>

            <!-- Loading state -->
            <view v-if="msg.loading" class="loading-bubble">
              <view class="loading-dots">
                <view class="dot" />
                <view class="dot" />
                <view class="dot" />
              </view>
              <text class="loading-text">AI 正在分析...</text>
            </view>

            <!-- Content bubble -->
            <view v-else class="msg-bubble msg-ai-bubble" :class="[`risk-${msg.riskLevel || 'green'}`]">
              <view class="msg-bubble-strip" :class="`strip-${msg.riskLevel || 'green'}`" />
              <view class="msg-bubble-inner">
                <text class="msg-text msg-text-ai" :class="{ 'is-typing': !msg.typingEnd }">
                  {{ msg.content }}
                </text>
              </view>
            </view>

            <!-- Citations -->
            <view v-if="msg.citations && msg.citations.length > 0" class="msg-citations">
              <view class="citation-header">
                <IconAtom name="search" :size="20" color="#A8B5A8" />
                <text class="citation-label">参考来源</text>
              </view>
              <text v-for="c in msg.citations" :key="c.id" class="citation-item">{{ c.title }}</text>
            </view>

            <!-- Action buttons -->
            <view v-if="!msg.loading" class="msg-actions">
              <view class="action-btn" aria-role="button" aria-label="复制回答" @tap="copyText(msg.content)">
                <IconAtom name="copy" :size="24" color="#A8B5A8" />
              </view>
              <view
                class="action-btn"
                :class="{ selected: feedbackState[msg.id] === 'helpful' }"
                aria-role="button"
                aria-label="回答有帮助"
                @tap="sendFeedback(msg, 'helpful')"
              >
                <IconAtom name="thumb_up" :size="24" :color="feedbackState[msg.id] === 'helpful' ? '#6AAA93' : '#A8B5A8'" />
              </view>
              <view
                class="action-btn"
                :class="{ selected: feedbackState[msg.id] === 'wrong' }"
                aria-role="button"
                aria-label="回答不准确"
                @tap="sendFeedback(msg, 'wrong')"
              >
                <IconAtom name="thumb_down" :size="24" :color="feedbackState[msg.id] === 'wrong' ? '#E87060' : '#A8B5A8'" />
              </view>
            </view>
          </template>
        </view>
      </view>
    </scroll-view>

    <!-- Input area -->
    <view class="input-area">
      <view class="input-wrapper">
        <textarea
          v-model="inputText"
          class="chat-input"
          placeholder="描述宠物的情况…"
          :disabled="loading"
          @confirm="sendMessage()"
          auto-height
          :adjust-position="true"
          confirm-type="send"
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

/* ===== Message List ===== */
.message-list {
  flex: 1;
  padding: 24rpx 16rpx 16rpx;
  padding-bottom: 24rpx;
}

/* ===== Quick Section ===== */
.quick-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.context-card {
  border-left: 6rpx solid #7EBDA6;
}

.context-strip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 16rpx;
  margin-bottom: 16rpx;
  border-radius: 14rpx;
  background: #F2F7F3;
}

.context-icon {
  width: 40rpx;
  height: 40rpx;
  background: #EEF7F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.context-strip-text {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  line-height: 30rpx;
  color: #5F7464;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.mode-tab {
  height: 68rpx;
  border-radius: 16rpx;
  background: #F8F6F2;
  border: 2rpx solid #F0EBE4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.mode-tab.is-active {
  background: #E8956E;
  border-color: #E8956E;
}

.mode-tab-text {
  font-size: 23rpx;
  font-weight: 800;
  color: #7B8B7E;
}

.is-active .mode-tab-text {
  color: #FFFFFF;
}

.quick-hint {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #7B8B7E;
  margin-bottom: 12rpx;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.quick-chip {
  padding: 10rpx 22rpx;
  background: #FDF0E8;
  border-radius: 999rpx;
  border: 2rpx solid #F5D5C0;
  transition: all 150ms;
}

.quick-chip:active {
  transform: scale(0.96);
  background: #F5D5C0;
}

.quick-chip-text {
  font-size: 22rpx;
  color: #D4784E;
  font-weight: 500;
}

.media-entry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.media-item {
  min-height: 132rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0EBE4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6rpx;
}

.media-title {
  font-size: 25rpx;
  font-weight: 800;
  color: #2D3436;
}

.media-desc {
  font-size: 21rpx;
  line-height: 30rpx;
  color: #A8B5A8;
}

/* ===== Messages ===== */
.msg-wrapper {
  display: flex;
  gap: 12rpx;
  margin-bottom: 28rpx;
  animation: fade-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.msg-wrapper.role-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #FDF0E8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.msg-content {
  max-width: 82%;
}

.msg-risk-row {
  margin-bottom: 8rpx;
}

/* ===== User Bubble ===== */
.msg-user-bubble {
  display: inline-block;
  padding: 16rpx 22rpx;
  border-radius: 22rpx 6rpx 22rpx 22rpx;
  background: linear-gradient(135deg, #E8956E, #D4784E);
  color: #FFFFFF;
  max-width: 100%;
  align-self: flex-end;
}

.msg-text-user {
  color: #FFFFFF;
  font-size: 28rpx;
  line-height: 1.6;
}

/* ===== AI Bubble ===== */
.msg-ai-bubble {
  overflow: hidden;
  border-radius: 18rpx;
  background: #FFFFFF;
  border: 2rpx solid #E8E0D8;
  display: flex;
}

.msg-ai-bubble.risk-green {
  border-color: #E8E0D8;
}
.msg-ai-bubble.risk-yellow {
  border-color: #E8B84F;
}
.msg-ai-bubble.risk-red {
  border-color: #E87060;
}

.msg-bubble-strip {
  width: 8rpx;
  flex-shrink: 0;
  border-radius: 4rpx 0 0 4rpx;
}
.strip-red { background: #E87060; }
.strip-yellow { background: #E8B84F; }
.strip-green { background: #7EBDA6; }

.msg-bubble-inner {
  padding: 16rpx 18rpx;
  flex: 1;
}

.msg-text {
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  color: #2D3436;
}

.msg-text-ai.is-typing::after {
  content: '▍';
  animation: blink-cursor 0.8s step-end infinite;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ===== Citations ===== */
.msg-citations {
  margin-top: 8rpx;
  padding: 14rpx;
  background: #F5F0EA;
  border-radius: 14rpx;
  border: 2rpx solid #F0EBE4;
}

.citation-header {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 6rpx;
}

.citation-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
}

.citation-item {
  font-size: 22rpx;
  color: #E8956E;
  display: block;
  padding: 4rpx 0;
  padding-left: 26rpx;
}

/* ===== Action Buttons ===== */
.msg-actions {
  display: flex;
  gap: 4rpx;
  margin-top: 8rpx;
  padding-left: 4rpx;
}

.action-btn {
  min-width: 72rpx;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 150ms;
}

.action-btn.selected {
  background: #F5F0EA;
}

.action-btn:active {
  background: #F0EBE4;
}

/* ===== Loading ===== */
.loading-bubble {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  border-radius: 18rpx;
  border: 2rpx solid #F0EBE4;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #E8956E;
  animation: pulse-dot 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

.loading-text {
  font-size: 22rpx;
  color: #A8B5A8;
  font-weight: 500;
}

/* ===== Input Area ===== */
.input-area {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom, 0px));
  margin-bottom: calc(100rpx + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
  border-top: 2rpx solid #F0EBE4;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  background: #F5F0EA;
  border-radius: 20rpx;
  padding: 12rpx 18rpx;
  transition: box-shadow 200ms;
}

.input-wrapper:focus-within {
  box-shadow: 0 0 0 3rpx rgba(232, 149, 110, 0.15);
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
