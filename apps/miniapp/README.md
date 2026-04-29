# 宠小护小程序运行说明

## HBuilderX 报“node_modules缺少编译器模块”

原因：这个仓库根目录使用 pnpm workspace 管理依赖，`apps/miniapp/node_modules` 可能是 pnpm 符号链接结构。HBuilderX 对这种结构识别不稳定，会认为缺少 uni-app 编译器模块。

解决方式：在 `apps/miniapp` 目录单独安装一份 npm 依赖。

```bash
cd D:\AI\chongwu\apps\miniapp
npm install --install-strategy=hoisted
```

安装后再在 HBuilderX 里运行小程序。

## 推荐运行方式

### HBuilderX

1. 打开目录：`D:\AI\chongwu\apps\miniapp`
2. 确认已执行 `npm install --install-strategy=hoisted`
3. 运行到微信开发者工具

## 接口环境

小程序接口地址已经改成环境配置，不再写死 `localhost`。

- 开发环境：`apps/miniapp/.env.development`
- 测试环境：`apps/miniapp/.env.test`
- 正式环境：`apps/miniapp/.env.production`

当前占位值：

- `dev`：`http://localhost:4100`
- `test`：`https://pet-api-test.example.com`
- `prod`：`https://pet-api.example.com`

小程序页面顶部会显示当前环境和接口地址，方便排查“为什么请求不到接口”。

如果你想临时切到某个测试地址，也可以在运行时往本地存一个覆盖值：

```js
uni.setStorageSync('pet-api-base-url', 'https://your-test-api.example.com')
```

清除覆盖：

```js
uni.removeStorageSync('pet-api-base-url')
```

### 命令行

```bash
cd D:\AI\chongwu\apps\miniapp
npm run build:mp-weixin
```

构建产物在：

```text
D:\AI\chongwu\apps\miniapp\dist\build\mp-weixin
```

## 还需要你补充

- `src/manifest.json` 里的微信小程序 AppID。
- 真机调试需要把测试或正式 API 域名配置到微信小程序后台合法请求域名。

## 微信开发者工具本地调试

本地开发时（`localhost`），微信开发者工具会拦截所有请求，控制台报 `socket 合法域名` / `url 不在合法域名列表中` 错误。

**解决方式**：在微信开发者工具中，点击右上角「详情」→「本地设置」→ 勾选 **「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**。

> 注意：这个设置仅本地开发有效，提交体验版/线上版前，必须把正式 API 域名配置到小程序后台的服务器域名白名单中。
