# 宠小护 1.0

这是一个面向中国宠物主的个人宠物平台 + AI 知识库 MVP。

## 包含内容

- `apps/miniapp`：微信小程序优先版，uni-app + Vue 3。用户主要使用入口。
- `apps/admin`：管理后台，Vue 3 + Vite。管理知识库、用户反馈、AI 对话日志。
- `apps/api`：后端 API，Fastify + TypeScript。提供 RAG 检索、风险分级、AI 占位回答、反馈闭环。
- `packages/shared`：共享类型。
- `docs`：产品、市场、架构、合规和知识库文档。

## 快速开始

```bash
pnpm install
pnpm dev
```

默认地址：

- 管理后台：http://localhost:5174
- API：http://localhost:4100/health

`pnpm dev` 只启动后台和 API。小程序请用 HBuilderX 打开 `apps/miniapp`，或使用下面的小程序命令。

## 小程序开发

先补充 `apps/miniapp/src/manifest.json` 里的微信小程序 AppID，然后运行：

```bash
pnpm dev:miniapp
```

生成的小程序产物可用微信开发者工具打开。HBuilderX 报缺少编译器模块时，在 `apps/miniapp` 下执行 `npm install --install-strategy=hoisted`。

## 你需要补充的配置

复制 `.env.example` 为 `.env`，然后补充：

- 大模型服务商：`AI_PROVIDER`、`AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`
- 产品名称和主体：`APP_NAME`、`COMPANY_NAME`、`SUPPORT_EMAIL`
- 上线数据库：`DATABASE_URL`

当前已预留 DeepSeek 接入位；没有配置真实模型时，会使用本地 mock 回答，方便先验收产品流程。
