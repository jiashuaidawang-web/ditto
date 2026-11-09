# Ditto

校园匹配 MVP：微信小程序（H5 可预览）+ NestJS API。节奏是 **Wednesday Drop**——周二 23:59（Asia/Shanghai）截止，周三 19:00 推送匹配海报和见面建议，双方确认或改期，见面后签到并留一句反馈。

这是可运行的骨架，不是完整产品。微信登录、学信网、学生证 OCR、教育邮箱、订阅消息都是 stub。

## 技术栈

- `apps/mini`：uni-app Vue 3，微信小程序 + H5
- `apps/api`：NestJS 12、Prisma 7、PostgreSQL 16
- 时区：Drop / cron 固定 `Asia/Shanghai`
- 包管理：pnpm workspace。没有 Redis；定时任务在 API 进程内

选型和接口见 [TECH.md](./TECH.md)。

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

种子用户可以用开发登录码直接进入（仅 `WECHAT_STUB=true`）：

| 登录码 | 人 | 说明 |
| --- | --- | --- |
| `openid:seed_a` | 安安，复旦，年级 2 | 上周和陈陈配对过，本周不会再配 |
| `openid:seed_b` | 柏柏，复旦，年级 3 | 本周会和安安配对 |
| `openid:seed_c` | 陈陈，复旦，年级 2 | 被上周配对挡住 |
| `openid:seed_d` | 丁丁，南大，年级 2 | 跨校，MVP 不配 |

种子用户在库里是 `studentVerified=true`，只为了能走匹配。认证接口不会把普通账号写成已认证。

本地走一遍 Drop：

```bash
# 1. 登录安安，记下 accessToken
curl -sS -X POST http://localhost:3000/auth/wechat/login \
  -H 'content-type: application/json' \
  -d '{"code":"openid:seed_a"}'

# 2. 周二截止（开发令牌，不是用户 JWT）
curl -sS -X POST http://localhost:3000/drop/cutoff \
  -H 'content-type: application/json' \
  -H 'x-dev-token: dev-admin' \
  -d '{}'

# 3. 周三 19:00 推送。只会打日志，不会打微信
curl -sS -X POST http://localhost:3000/drop/release \
  -H 'content-type: application/json' \
  -H 'x-dev-token: dev-admin' \
  -d '{}'

# 4. 看自己的匹配
curl -sS http://localhost:3000/matches/me -H "authorization: Bearer <accessToken>"
```

柏柏再用 `openid:seed_b` 登录并 `POST /matches/:id/respond` `{"action":"accept"}`。两人都接受之后才能签到。

## 跑小程序 / H5

```bash
cp apps/mini/.env.example apps/mini/.env
pnpm dev:mini:h5
```

浏览器打开 CLI 打印的地址（默认 `http://localhost:5173`）。登录页可以改 API 地址，会记在本地存储里。

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
| `pnpm db:seed` | 四个种子用户 + 上周一对 |
| `pnpm test:api` | 时区和匹配规则的纯函数测试 |
| `pnpm build:api` | 编译 API |
| `pnpm build:mini:h5` | 编译 H5 |

## 真的 vs stub

| 能力 | 现在 |
| --- | --- |
| Postgres、Prisma 模型、JWT 会话 | 真的。JWT 密钥只放在 `.env`，示例值不能拿去部署 |
| 资料、空闲时段、Drop 周期、配对、确认 / 改期 / 签到 / 反馈 | 真的，写在数据库里 |
| 同校、年级差 ≤ 2、连续两周不重复 | 真的，贪心规则，不是最优图匹配 |
| 周二 23:59 / 周三 19:00 cron | 定时器是真的，动作是日志 + 写库。单进程，多副本会跑重 |
| `wx.login` → code2session | stub。`WECHAT_STUB=true` 时用 code 哈希出一个 openid。`openid:` 前缀可指定 openid |
| 学信网 / 学生证 OCR / .edu 邮箱 | stub。写入 `StudentVerification.status=todo`，`studentVerified` 保持 false |
| 微信订阅消息 | stub。日志里有 template payload，不请求微信 |
| 跨校、滑卡、语音引导、运营后台、支付 | 不做 |

微信相关的接入点都标了 `TODO(wechat-code2session)`、`TODO(xuexin)`、`TODO(student-card-ocr)`、`TODO(edu-email)`、`TODO(wechat-subscribe-message)`。

## 密钥

只提交 `apps/api/.env.example` 和 `apps/mini/.env.example`。不要提交 `WECHAT_APP_SECRET` 或线上 `JWT_SECRET`。
