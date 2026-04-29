# 技术栈与系统架构

## 1. 个人低预算技术栈

推荐路线：Vue 技术栈 + 微信小程序优先 + 轻量后端 + 管理后台 + 国产云/低价云 + 大模型 API + 自建宠物知识库。

### 前端

- 微信小程序：当前第一优先级，承载宠物档案、提醒、记录、AI 问答和影像入口。
- H5：后置，用于 SEO、内容文章、分享页，不作为当前 1.0 用户端。
- 管理后台：用于知识库、用户反馈、AI 日志和成本管理。

技术选择：

- uni-app + Vue 3：先做微信小程序，未来可复用到 H5。
- Vite + Vue 3 + Element Plus：做管理后台。
- Nuxt 3：后续如果要认真做 SEO 内容站，可以单独做内容前台。

你已经倾向 Vue，所以第一版建议直接采用 uni-app + Vue 3，不再引入 React/Taro。

### 后端

推荐：

- Node.js + NestJS：结构清晰，适合长期产品。
- 或 Node.js + Fastify：更轻，适合个人快速开发。

数据库：

- PostgreSQL：宠物档案、记录、订单、内容都适合。
- Redis：会话、限流、缓存。
- 对象存储：宠物照片、报告图片。

搜索/知识库：

- 第一阶段：PostgreSQL 全文搜索 + pgvector。
- 第二阶段：独立向量库，如 Milvus、Qdrant。
- 知识库内容不直接“写死进模型”，而是通过 RAG 在每次回答时检索相关资料，再交给大模型生成答案。

### AI

国内上线建议优先接国产大模型 API，减少网络和合规麻烦：

- 通义千问。
- 豆包。
- 智谱。
- 文心。
- DeepSeek。

架构上要做模型抽象层，避免绑定单一厂商。

## 2. 推荐系统架构

```text
uni-app Vue 微信小程序
        |
API 网关 / 后端服务
        |
--------------------------------
| 用户与宠物档案 PostgreSQL       |
| 健康记录 PostgreSQL             |
| 内容知识库 PostgreSQL + pgvector |
| 用户本地档案同步接口             |
| AI 编排服务                     |
| 提醒任务队列                    |
| 管理后台                        |
--------------------------------
        |
大模型 API / 短信或公众号提醒 / 对象存储
```

## 3. 核心数据表

### users

- id
- phone/openid
- nickname
- city
- created_at

### pets

- id
- user_id
- name
- species
- breed
- gender
- birthday
- weight
- neutered
- allergies
- chronic_conditions
- diet_note

### health_records

- id
- pet_id
- type
- value
- note
- images
- happened_at

### ai_conversations

- id
- user_id
- pet_id
- question
- answer
- risk_level
- model
- tokens
- created_at

### reminders

- id
- pet_id
- type
- due_at
- status
- repeat_rule

### knowledge_articles

- id
- title
- category
- species
- content
- risk_level
- reviewer
- reviewed_at
- source_links
- embedding

### knowledge_chunks

- id
- article_id
- chunk_text
- chunk_type
- species
- disease_tags
- risk_level
- source_quality
- embedding
- created_at

### user_feedback

- id
- user_id
- pet_id
- conversation_id
- feedback_type
- feedback_text
- expected_answer
- status
- reviewer_note
- created_at

### knowledge_change_requests

- id
- feedback_id
- title
- proposed_content
- evidence_links
- risk_level
- status
- reviewer
- reviewed_at

## 4. AI 编排流程

```text
用户问题
  -> 安全分类：健康/饮食/行为/普通闲聊/越权
  -> 读取本次授权携带的宠物档案
  -> 检索知识库：关键词 + 向量 + 风险规则
  -> 判断风险等级
  -> 基于检索内容生成回答
  -> 规则校验：药物、诊断、急症、免责声明
  -> 返回用户
  -> 保存脱敏日志供后台抽检
```

## 5. 用户数据本地优先

你提出“每个用户的信息存在本地”是可行的，建议做成本地优先架构：

- 小程序/H5 本地保存宠物档案、健康记录草稿、提醒偏好。
- 每次问 AI 时，只把本次回答必须的信息发给后端，比如物种、年龄、体重、症状。
- 后端默认不永久保存完整宠物健康档案，除非用户开启云同步。
- AI 日志保存时做脱敏，只保留质量改进需要的字段。
- 用户可以一键删除本地档案和云端同步数据。

需要注意：小程序本地存储可能被清理，也不适合做唯一数据源。更稳的方案是“本地优先 + 用户可选云同步”。

## 6. 成本控制

### 模型调用

- 健康类问题用强模型。
- 普通知识、提醒、摘要用便宜模型。
- 高频固定问题用缓存。
- 内容文章先 RAG 再回答，减少幻觉。

### 云资源

起步配置：

- 1 台 2C4G 云服务器。
- 1 个 PostgreSQL 实例或同机 Docker PostgreSQL。
- 1 个对象存储桶。
- 1 个 Redis，可先同机。

低预算阶段可以用 Docker Compose 单机部署，等用户增长后再拆分。

## 7. 后台必须有

即使是个人项目，也要做后台：

- 用户列表。
- 宠物档案检索。
- AI 对话日志。
- 红色/黄色问题列表。
- 用户反馈。
- 内容库编辑。
- 知识片段管理。
- 用户反馈转知识库工单。
- 敏感词/危险药物规则。
- 模型调用成本统计。

后台是你控制质量和成本的命门。

## 8. 技术优先级

第一阶段不要做：

- 原生 iOS/Android。
- 自训练大模型。
- 自研向量数据库。
- 自研支付系统。
- 复杂社区。
- 智能硬件。

第一阶段应该做：

- 稳定的宠物档案。
- 好用的问答体验。
- 可靠的风险分级。
- 后台审核闭环。
- 微信支付会员。
- 数据备份。
- 知识库反馈闭环。
