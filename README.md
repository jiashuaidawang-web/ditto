# 不如见一面

周五演示（2026-11-14）的主路径是 **H5**（aiditto.cn）+ **阿里云短信**。产品节奏仍是 Wednesday Drop：周二 23:59（Asia/Shanghai）截止，周三 19:00 发出见面方案。微信小程序代码还在，但不进周五验收。

没有阿里云密钥时，短信提供方是 stub：验证码会写进日志（`OTP_DEV_ECHO=true` 时也出现在响应里），**`accepted` 一直是 false**，不会假装已经送达。

## 技术栈

- `apps/mini`：uni-app Vue 3。演示用 H5，同一套工程可以出微信小程序
- `apps/api`：NestJS 12、Prisma 7、PostgreSQL 16
- 登录：手机号或邮箱 OTP。手机号走 `AliyunSmsProvider`；邮箱只打日志
- 通知：Drop 用同一条阿里云短信通道。邮箱通知是 stub
- 时区：`Asia/Shanghai`。没有 Redis，cron 在 API 进程内

细节见 [TECH.md](./TECH.md)。

## 环境

- Node.js 20.19+（本仓库在 Node 22 上跑过）
- pnpm 10
- Docker，用来起 Postgres

## 跑 API

```bash
docker compose up -d
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm --filter @ditto/api prisma:generate
pnpm --filter @ditto/api prisma:deploy
pnpm db:seed
pnpm dev:api
```

改了 `schema.prisma` 之后再用 `pnpm --filter @ditto/api exec prisma migrate dev --name <change>` 生成新迁移。

健康检查：

```bash
curl -sS http://localhost:3000/health
```

期望 `200`，正文里 `status` 为 `ok`。

房山种子（`pnpm db:seed` 会清掉旧的复旦 / 南大 openid）：

| 手机号 | 邮箱 | 人 |
| --- | --- | --- |
| `13800001001` | `linxia@demo.aiditto.cn` | 林夏，首都师范·良乡，大二 |
| `13800001002` | `zhouyu@demo.aiditto.cn` | 周予，首都师范·良乡，大三 |

两人同校、年级差 1、周六下午都有空，会被配成一对。`STUDENT_VERIFY_SKIP=true` 时 OTP 登录把账号当成已认证。

```bash
# 1. 发验证码。stub 时 accepted=false，devCode 在响应里
curl -sS -X POST http://localhost:3000/otp/send \
  -H 'content-type: application/json' \
  -d '{"channel":"sms","target":"13800001001"}'

# 2. 换 JWT
curl -sS -X POST http://localhost:3000/otp/verify \
  -H 'content-type: application/json' \
  -d '{"channel":"sms","target":"13800001001","code":"<devCode>"}'

# 3. 一键出配。没有密钥时短信 accepted=false，正文在 API 日志里，带 /m/<token>
curl -sS -X POST http://localhost:3000/drop/release \
  -H 'content-type: application/json' \
  -H 'x-dev-token: dev-admin' \
  -d '{}'

# 4. 打开报告卡（不需要登录）
curl -sS http://localhost:3000/reports/<token>
```

双方都 `POST /reports/<token>/respond` `{"action":"accept"}` 之后，状态变成 `accepted`。邮箱登录同样走 `/otp/send`，`channel` 用 `email`，但不会真发信。

## 跑小程序 / H5

```bash
cp apps/mini/.env.example apps/mini/.env
pnpm dev:mini:h5
```

浏览器打开 CLI 打印的地址（默认 `http://localhost:5173`）。周五路径是：登录 → 选学校 → 问卷 → 等待 → 报告卡。短信深链是 `http://localhost:5173/m/<token>`，开发服务器会把它送进报告页。线上把 `H5_PUBLIC_BASE_URL` 设成 `https://aiditto.cn`，并用下面的方式把任意路径回到 `index.html`：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

微信开发者工具：

```bash
pnpm dev:mini:mp-weixin
```

用微信开发者工具导入 `apps/mini/dist/dev/mp-weixin`。把 `apps/mini/src/manifest.json` 里的 `mp-weixin.appid` 换成小程序 AppID。本地请关闭 URL 校验（manifest 里已经 `urlCheck: false`）。

HBuilderX：用 HBuilderX 4+ 打开 `apps/mini`（这是 Vite 版 uni-app，源码在 `src/`）。运行到浏览器或微信开发者工具。HBuilderX 不读 `VITE_API_BASE_URL`，在登录页改 API 地址。

## 根脚本

| 脚本 | 作用 |
| --- | --- |
| `pnpm dev:api` | API watch |
| `pnpm dev:mini:h5` | H5 |
| `pnpm dev:mini:mp-weixin` | 微信小程序 |
| `pnpm db:up` / `pnpm db:down` | Postgres |
| `pnpm db:seed` | 房山林夏 / 周予，并删掉旧的复旦、南大种子 |
| `pnpm test:api` | 时区和匹配规则的纯函数测试 |
| `pnpm build:api` | 编译 API |
| `pnpm build:mini:h5` | 编译 H5 |

## 真的 vs stub

| 能力 | 现在 |
| --- | --- |
| Postgres、Prisma 模型、JWT 会话 | 真的。JWT 密钥只放在 `.env`，示例值不能拿去部署 |
| 资料、空闲时段、Drop 周期、配对、确认 / 改期 | 真的，写在数据库里 |
| 同校、年级差 ≤ 2、连续两周不重复 | 真的，贪心规则，不是最优图匹配 |
| 手机号 OTP 和匹配短信 | 同一 `AliyunSmsProvider`。`SMS_PROVIDER=aliyun` 且密钥齐全才请求 Dysmsapi；否则 stub，`accepted=false` |
| 邮箱 OTP / 邮箱通知 | stub，只打日志 |
| 学信网 / 学生证 OCR / 微信登录 / 订阅消息 | 代码还在，周五不走。`STUDENT_VERIFY_SKIP=true` 时跳过学生认证 |
| 地图、人脸 | 只有占位文案 |
| 跨校、滑卡、语音引导、运营后台、支付 | 不做 |

微信相关的接入点都标了 `TODO(wechat-code2session)`、`TODO(xuexin)`、`TODO(student-card-ocr)`、`TODO(edu-email)`、`TODO(wechat-subscribe-message)`。

## 密钥

只提交 `apps/api/.env.example` 和 `apps/mini/.env.example`。不要提交 `ALIYUN_ACCESS_KEY_SECRET`、`WECHAT_APP_SECRET` 或线上 `JWT_SECRET`。演示机以外把 `OTP_DEV_ECHO` 设为 `false`。
