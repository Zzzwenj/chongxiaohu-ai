<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import type { KnowledgeArticle, FeedbackItem } from '@pet-ai/shared'

/* ===== Navigation ===== */
type PageKey = 'dashboard' | 'knowledge' | 'feedback' | 'conversations' | 'rules'

const currentPage = ref<PageKey>('dashboard')

const navItems = [
  { key: 'dashboard' as PageKey, label: '概览', icon: '📊' },
  { key: 'knowledge' as PageKey, label: '知识管理', icon: '📚' },
  { key: 'feedback' as PageKey, label: '用户反馈', icon: '💬' },
  { key: 'conversations' as PageKey, label: '对话日志', icon: '📝' },
  { key: 'rules' as PageKey, label: '规则管理', icon: '⚙️' },
]

/* ===== Data ===== */
interface ConversationRecord {
  id: string
  request: { question: string; mode?: string; pet?: Record<string, unknown> }
  response: { riskLevel: string; answer: string }
  createdAt: string
}

const conversations = ref<ConversationRecord[]>([])
const knowledgeList = ref<KnowledgeArticle[]>([])
const feedbackList = ref<FeedbackItem[]>([])
const alertMessage = ref('')
const alertType = ref<'success' | 'error'>('success')

const stats = computed(() => ({
  totalConversations: conversations.value.length,
  totalKnowledge: knowledgeList.value.length,
  totalFeedback: feedbackList.value.length,
  redAlerts: conversations.value.filter(c => c.response.riskLevel === 'red').length
}))

/* ===== Knowledge Form ===== */
const draftKnowledge = reactive({
  title: '',
  category: 'symptom_triage',
  species: 'all' as 'cat' | 'dog' | 'all',
  riskLevel: 'green' as 'green' | 'yellow' | 'red',
  sourceQuality: 'B' as 'S' | 'A' | 'B',
  content: '',
  sourceLinks: ''
})

const knowledgeFilter = ref('')
const filteredKnowledge = computed(() => {
  if (!knowledgeFilter.value) return knowledgeList.value
  const q = knowledgeFilter.value.toLowerCase()
  return knowledgeList.value.filter(a =>
    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
  )
})

async function addKnowledge() {
  alertMessage.value = ''
  if (!draftKnowledge.title || !draftKnowledge.content) {
    showAlert('请填写标题和内容', 'error')
    return
  }

  try {
    const res = await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draftKnowledge,
        sourceLinks: draftKnowledge.sourceLinks.split('\n').map(s => s.trim()).filter(Boolean)
      })
    })
    if (!res.ok) throw new Error('保存失败')
    showAlert('知识已保存', 'success')
    draftKnowledge.title = ''
    draftKnowledge.content = ''
    draftKnowledge.sourceLinks = ''
    await loadData()
  } catch {
    showAlert('保存失败，请检查字段', 'error')
  }
}

function confirmDeleteKnowledge(id: string) {
  if (confirm('确定删除这条知识吗？')) {
    // Currently API doesn't support DELETE, will be added in phase 8
    showAlert('删除功能需要后端支持 DELETE 端点', 'error')
  }
}

/* ===== Feedback ===== */
const feedbackFilter = ref('')
const filteredFeedback = computed(() => {
  if (!feedbackFilter.value) return feedbackList.value
  return feedbackList.value.filter(f =>
    f.feedbackType.includes(feedbackFilter.value) || f.status.includes(feedbackFilter.value)
  )
})

async function updateFeedbackStatus(id: string, status: FeedbackItem['status']) {
  try {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error()
    showAlert('状态已更新', 'success')
    await loadData()
  } catch {
    showAlert('更新失败', 'error')
  }
}

/* ===== Conversations ===== */
const conversationFilter = ref('')
const filteredConversations = computed(() => {
  if (!conversationFilter.value) return conversations.value.slice(0, 50)
  const q = conversationFilter.value.toLowerCase()
  return conversations.value.filter(c =>
    c.request.question.toLowerCase().includes(q) ||
    c.response.riskLevel.includes(q)
  ).slice(0, 50)
})

/* ===== Data loading ===== */
async function loadData() {
  try {
    const [knowledgeRes, feedbackRes, convRes] = await Promise.all([
      fetch('/api/admin/knowledge'),
      fetch('/api/admin/feedback'),
      fetch('/api/admin/conversations')
    ])
    if (knowledgeRes.ok) knowledgeList.value = await knowledgeRes.json()
    if (feedbackRes.ok) feedbackList.value = await feedbackRes.json()
    if (convRes.ok) conversations.value = await convRes.json()
  } catch {
    showAlert('数据加载失败', 'error')
  }
}

function showAlert(msg: string, type: 'success' | 'error') {
  alertMessage.value = msg
  alertType.value = type
  setTimeout(() => { alertMessage.value = '' }, 3000)
}

onMounted(loadData)
</script>

<template>
  <view class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img src="/logo.svg" alt="logo" />
        <span>宠小护管理</span>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: currentPage === item.key }"
          @click="currentPage = item.key"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        v0.1.0 · 数据存储于内存
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Alert -->
      <div v-if="alertMessage" :class="['alert', alertType === 'success' ? 'alert-success' : 'alert-error']">
        {{ alertMessage }}
      </div>

      <!-- ===== Dashboard ===== -->
      <div v-if="currentPage === 'dashboard'" class="anim-enter">
        <div class="page-header">
          <h1>概览</h1>
          <p>宠小护平台运营数据总览</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats.totalConversations }}</span>
            <span class="stat-label">总对话数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" style="color: var(--color-risk-red)">{{ stats.redAlerts }}</span>
            <span class="stat-label">红色急症</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.totalKnowledge }}</span>
            <span class="stat-label">知识条目</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.totalFeedback }}</span>
            <span class="stat-label">用户反馈</span>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h2>最近对话</h2>
              <span class="badge">最新 5 条</span>
            </div>
            <div v-if="conversations.length === 0" class="empty-state">暂无对话数据</div>
            <div v-else>
              <div v-for="c in conversations.slice(0, 5)" :key="c.id" style="padding: 8px 0; border-bottom: 1px solid var(--color-border-light);">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                  <span :class="['risk-tag', c.response.riskLevel]">{{ c.response.riskLevel }}</span>
                  <span style="font-size: 12px; color: var(--color-text-muted);">{{ c.createdAt }}</span>
                </div>
                <div style="font-size: 13px; color: var(--color-text-primary);">{{ c.request.question.slice(0, 60) }}{{ c.request.question.length > 60 ? '...' : '' }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>待处理反馈</h2>
              <span class="badge">{{ feedbackList.filter(f => f.status === 'pending').length }}</span>
            </div>
            <div v-if="feedbackList.filter(f => f.status === 'pending').length === 0" class="empty-state">暂无待处理反馈</div>
            <div v-else>
              <div v-for="f in feedbackList.filter(f => f.status === 'pending').slice(0, 5)" :key="f.id" style="padding: 8px 0; border-bottom: 1px solid var(--color-border-light);">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                  <span class="status-badge pending">pending</span>
                  <span style="font-size: 12px; color: var(--color-text-muted);">{{ f.feedbackType }}</span>
                </div>
                <div style="font-size: 13px;">{{ f.feedbackText || '未填写说明' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Knowledge Management ===== -->
      <div v-if="currentPage === 'knowledge'" class="anim-enter">
        <div class="page-header">
          <h1>知识管理</h1>
          <p>管理知识库内容，支持新增和筛选</p>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h2>新增知识</h2>
            </div>
            <div class="form-group">
              <label>标题</label>
              <input v-model="draftKnowledge.title" class="form-input" placeholder="知识标题" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>分类</label>
                <select v-model="draftKnowledge.category" class="form-input">
                  <option value="symptom_triage">症状分诊</option>
                  <option value="diet">餐食</option>
                  <option value="safety">安全禁忌</option>
                  <option value="care">日常护理</option>
                </select>
              </div>
              <div class="form-group">
                <label>适用物种</label>
                <select v-model="draftKnowledge.species" class="form-input">
                  <option value="all">通用</option>
                  <option value="cat">猫</option>
                  <option value="dog">狗</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>风险等级</label>
                <select v-model="draftKnowledge.riskLevel" class="form-input">
                  <option value="green">绿色</option>
                  <option value="yellow">黄色</option>
                  <option value="red">红色</option>
                </select>
              </div>
              <div class="form-group">
                <label>来源质量</label>
                <select v-model="draftKnowledge.sourceQuality" class="form-input">
                  <option value="S">S 级</option>
                  <option value="A">A 级</option>
                  <option value="B">B 级</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>内容</label>
              <textarea v-model="draftKnowledge.content" class="form-input" placeholder="知识内容，高风险内容需兽医审核" />
            </div>
            <div class="form-group">
              <label>来源链接（每行一个）</label>
              <textarea v-model="draftKnowledge.sourceLinks" class="form-input" placeholder="https://..." />
            </div>
            <button class="btn btn-primary" @click="addKnowledge">保存到知识库</button>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>知识列表</h2>
              <input v-model="knowledgeFilter" class="form-input" placeholder="搜索知识..." style="width: 200px;" />
            </div>
            <div v-if="filteredKnowledge.length === 0" class="empty-state">暂无知识条目</div>
            <div class="table-wrap" v-else>
              <table>
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>分类</th>
                    <th>风险</th>
                    <th>来源</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredKnowledge" :key="item.id">
                    <td><strong>{{ item.title }}</strong></td>
                    <td><span style="font-size: 12px; color: var(--color-text-muted);">{{ item.category }}</span></td>
                    <td><span :class="['risk-tag', item.riskLevel]">{{ item.riskLevel }}</span></td>
                    <td><span :class="['risk-tag', item.sourceQuality === 'S' ? 'red' : item.sourceQuality === 'A' ? 'yellow' : 'green']">{{ item.sourceQuality }}</span></td>
                    <td>
                      <button class="btn btn-sm btn-secondary">编辑</button>
                      <button class="btn btn-sm btn-danger" style="margin-left: 4px;" @click="confirmDeleteKnowledge(item.id)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Feedback ===== -->
      <div v-if="currentPage === 'feedback'" class="anim-enter">
        <div class="page-header">
          <h1>用户反馈</h1>
          <p>管理用户对 AI 回答的反馈</p>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>反馈列表</h2>
            <div class="filter-bar">
              <input v-model="feedbackFilter" class="form-input" placeholder="筛选类型或状态..." style="width: 200px;" />
            </div>
          </div>

          <div v-if="filteredFeedback.length === 0" class="empty-state">暂无反馈</div>
          <div class="table-wrap" v-else>
            <table>
              <thead>
                <tr>
                  <th>类型</th>
                  <th>状态</th>
                  <th>说明</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredFeedback" :key="item.id">
                  <td><span style="font-weight: 600;">{{ item.feedbackType }}</span></td>
                  <td><span :class="['status-badge', item.status]">{{ item.status }}</span></td>
                  <td><span class="table-cell-content">{{ item.feedbackText || '—' }}</span></td>
                  <td style="font-size: 12px; color: var(--color-text-muted);">{{ item.createdAt }}</td>
                  <td>
                    <div class="btn-group">
                      <button v-if="item.status === 'pending'" class="btn btn-sm btn-primary" @click="updateFeedbackStatus(item.id, 'triaged')">处理中</button>
                      <button v-if="item.status === 'triaged'" class="btn btn-sm btn-primary" @click="updateFeedbackStatus(item.id, 'approved')">通过</button>
                      <button v-if="item.status !== 'rejected' && item.status !== 'published'" class="btn btn-sm btn-secondary" @click="updateFeedbackStatus(item.id, 'rejected')">驳回</button>
                      <button v-if="item.status === 'approved'" class="btn btn-sm btn-secondary" @click="updateFeedbackStatus(item.id, 'published')">发布</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== Conversations ===== -->
      <div v-if="currentPage === 'conversations'" class="anim-enter">
        <div class="page-header">
          <h1>对话日志</h1>
          <p>查看 AI 对话记录，筛选高风险对话</p>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>对话列表</h2>
            <input v-model="conversationFilter" class="form-input" placeholder="搜索问题或风险等级..." style="width: 240px;" />
          </div>

          <div v-if="filteredConversations.length === 0" class="empty-state">暂无对话</div>
          <div class="table-wrap" v-else>
            <table>
              <thead>
                <tr>
                  <th>风险</th>
                  <th>模式</th>
                  <th>问题</th>
                  <th>回答摘要</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in filteredConversations" :key="c.id">
                  <td><span :class="['risk-tag', c.response.riskLevel]">{{ c.response.riskLevel }}</span></td>
                  <td style="font-size: 12px; color: var(--color-text-muted);">{{ c.request.mode || 'general' }}</td>
                  <td><span class="table-cell-content">{{ c.request.question }}</span></td>
                  <td><span class="table-cell-content">{{ c.response.answer.slice(0, 80) }}{{ c.response.answer.length > 80 ? '...' : '' }}</span></td>
                  <td style="font-size: 12px; color: var(--color-text-muted); white-space: nowrap;">{{ c.createdAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== Rules ===== -->
      <div v-if="currentPage === 'rules'" class="anim-enter">
        <div class="page-header">
          <h1>规则管理</h1>
          <p>管理红色急症和危险药物/食物规则</p>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h2>红色急症触发词</h2>
              <span class="badge">20 条生效</span>
            </div>
            <p style="font-size: 13px; color: var(--color-text-muted);">编辑危险关键词请修改 apps/api/src/services/risk.ts</p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span v-for="word in ['尿不出', '尿闭', '呼吸困难', '舌头发紫', '抽搐', '昏迷', '误食', '巧克力', '葡萄', '老鼠药', '百合', '布洛芬', '对乙酰氨基酚', '大量出血', '中暑', '难产', '中毒', '休克', '骨折', '烧伤']" :key="word" class="risk-tag red">{{ word }}</span>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>黄色症状关键词</h2>
              <span class="badge">14 条生效</span>
            </div>
            <p style="font-size: 13px; color: var(--color-text-muted);">编辑症状关键词请修改 apps/api/src/services/risk.ts</p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span v-for="word in ['呕吐', '吐', '腹泻', '拉稀', '咳嗽', '打喷嚏', '不吃', '精神差', '便血', '皮肤痒', '掉毛', '耳朵', '眼睛红']" :key="word" class="risk-tag yellow">{{ word }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </view>
</template>

<style scoped>
/* All styles moved to styles.css */
</style>
