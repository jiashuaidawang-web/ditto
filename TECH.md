# Ditto 技术说明

骨架阶段的选型、模块和契约。产品范围以本次冻结为准，不在这里展开 PRD。

## 技术选型

| 层 | 选择 | 原因 |
| --- | --- | --- |
| 仓库 | pnpm workspace：`apps/api`、`apps/mini` | 小程序和 API 分开发，暂时不抽 `packages/`。契约以本文和 Nest DTO 为准 |
| 小程序 | uni-app Vue 3（`@dcloudio/vite-plugin-uni`，版本钉死） | 同一套页面出微信小程序和 H5。Vite 5.2.8 是该插件声明的 peer |
| API | NestJS 12 | 模块边界清楚：auth、认证、资料、空闲、匹配、Drop、通知 |
| 数据 | Prisma 7 + PostgreSQL 16 | Prisma 7 用 driver adapter（`@prisma/adapter-pg`），连接串在 `apps/api/prisma7.config.ts`。CLI 钉在 7.10.1，因为 npm `latest` 目前指向 Prisma 8 预发布 |
| 会话 | JWT（`@nestjs/jwt`） | 占位会话。不把微信 `session_key` 放进 token，也不在响应里返回 |
| 时间 | `Asia/Shanghai` | 中国无夏令时，按 UTC+8 计算周二 23:59 和周三 19:00。cron 同样指定该时区 |
| 任务 | `@nestjs/schedule`，进程内 | MVP 只有两件定时事。不上 Redis。多实例会各跑一遍，上线前要换成单实例或加锁 |

没有改推荐栈。Prisma 用 7 而不是 8，是为了留在带 `migrate` / `generate` 的稳定 CLI 上。

## 模块地图

```
apps/api/src
  health            GET /health
  auth              微信 code → 用户 → JWT
  student-verify    学信网 / 学生证 OCR / 教育邮箱，三条 stub
  profiles          基础资料 + 偏好
  availability      每周空闲，整表覆盖
  matching          Matcher 接口 + 同校贪心
  drop              周二截止、周三 19:00、日期建议
  notify            订阅消息 stub
  matches           确认、改期、签到、反馈、风险提示
  prisma            全局 PrismaService
  common            上海时间、JWT、开发令牌

apps/mini/src/pages
  login verify profile match confirm
```

匹配算法和 Drop 分开：`Matcher.propose()` 是纯函数，Drop 负责读写周期和调用通知。以后换成图匹配只换 `Matcher` 的实现。

## 数据

- `User`：openid、是否学生认证、session_key（仅 stub）
- `Profile`：称呼、性别、年级序号、专业、学校、偏好 JSON
- `AvailabilitySlot`：ISO 星期 1–7（上海），`startMin` / `endMin`
- `StudentVerification`：策略 + `todo` 说明，默认状态 `todo`
- `DropCycle`：`2026-W46` 这种周键，截止时间、推送时间、阶段、日志
- `MatchPair`：两人、理由、建议时间、各自回复、签到
- `Feedback`：评分、是否爽约、一句评论

硬规则（已在 `SameSchoolGradeGapMatcher` 里）：

1. 只配同一 `schoolId`。跨校跳过。
2. 年级差 ≤ 2。缺学校或缺年级的人不进池子。
3. 上一周没有 `declined` / `cancelled` 的一对，本周不再配。

实现是按学校分组后的贪心，不是最大权匹配。一个人剩余就空着。

见面时间：两人空闲重叠且不少于 60 分钟就用那段；否则周六 14:00（上海），并标 `TODO(availability-intersect)`。

## P0 登录和学生认证

### `POST /auth/wechat/login`

```json
{ "code": "wx.login 的 code，或 stub 下的 openid:seed_a" }
```

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "stub": true,
  "todo": "TODO(wechat-code2session): GET https://api.weixin.qq.com/sns/jscode2session?...",
  "user": { "id": "...", "openid": "stub_...", "studentVerified": false }
}
```

`WECHAT_STUB` 不是 `false`，或 AppID / AppSecret 为空：不请求微信。`WECHAT_STUB=false` 且密钥都在时，当前实现直接 501，不会假装换到了 openid。

`GET /auth/me` 需要 `Authorization: Bearer`。

### `GET /student-verify/strategies`

返回三条策略的 `todo` 文案。

### `POST /student-verify/xuexin`

```json
{ "chsiCode": "学信网在线验证码" }
```

接入点：学信网 / CHSI 在线验证报告。现在只落库 `status=todo`，`verified=false`。

### `POST /student-verify/student-card`

```json
{ "imageRef": "上传后的文件 id 或临时 URL" }
```

接入点：对象存储 + 腾讯云或阿里云 OCR，再人工看学校和姓名。

### `POST /student-verify/edu-email`

```json
{ "email": "name@university.edu.cn" }
```

只接受 `.edu` / `.edu.cn` 形状，仍然不发信。接入点：一次性链接。

三条都不会把 `User.studentVerified` 写成 true。MVP 只要最终接通其中一条。

## P1 资料和空闲

### `PUT /profiles/me`

```json
{
  "displayName": "安安",
  "gender": "unspecified",
  "grade": 2,
  "major": "新闻",
  "bio": "",
  "schoolId": "fudan",
  "schoolName": "复旦大学",
  "preferences": { "intent": "friends", "interests": ["散步"], "pace": "slow" }
}
```

`GET /profiles/me` 没有资料时返回 `null`。

### `PUT /availability`

整表替换。

```json
{
  "slots": [
    { "weekday": 3, "startMin": 1140, "endMin": 1260, "note": "周三晚" }
  ]
}
```

`weekday` 1=周一 … 7=周日。`endMin` 必须大于 `startMin`。

## P2 Wednesday Drop 和通知

时间都是 Asia/Shanghai：

- 截止：周二 23:59，cron `59 23 * * 2`
- 推送：周三 19:00，cron `0 19 * * 3`

### `GET /drop/current`

登录用户可见。只返回周键、阶段、截止和推送时间，不返回别人的配对。

### `POST /drop/cutoff`、`POST /drop/release`、`GET /drop/admin`、`GET /matching/preview`

请求头 `x-dev-token: dev-admin`（`DEV_ADMIN_TOKEN`）。这是骨架用的开发令牌，不是运营鉴权。

截止会：冻结本周 → 读池子 → 排除上周一对 → 写入 `proposed` 配对和建议时间。

推送会：若还没截止就先补一次截止；对每一对的两个 openid 调用通知 stub，场景是 `match_poster` 和 `date_suggestion`。

通知接入点：

`POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send`

小程序用订阅消息，用户得先 `wx.requestSubscribeMessage`。模板 id 放 `WECHAT_TEMPLATE_MATCH_POSTER`。不是 iMessage，也不是公众号旧模板消息。

## P3 匹配、确认、风险

`GET /matching/preview` 是干跑，不写库，给半人工看池子。算法名 `same-school-grade-gap-greedy`。

`GET /matches/me` 返回当前用户最近一条配对（含对方称呼、学校、年级），没有则 `null`。

`POST /matches/:id/respond`

```json
{ "action": "accept" | "decline" | "reschedule", "meetupAt": "2026-11-14T06:00:00.000Z" }
```

`reschedule` 必须带 `meetupAt`，并清掉对方的回复，让对方重新确认。两人都 `accept`（或一方改期、另一方接受）后状态变成 `accepted`。任一方 `decline` 则 `declined`。

`POST /matches/:id/check-in`：双方接受之后。

`POST /matches/:id/feedback`

```json
{ "rating": 4, "noShow": false, "comment": "到了" }
```

两人都反馈后状态 `feedback_done`。

`GET /matches/:id/risk`

```json
{
  "sameSchool": true,
  "gradeGap": 1,
  "gradeGapOk": true,
  "noShowHints": [
    { "userId": "...", "noShowCount": 0 },
    { "userId": "...", "noShowCount": 1 }
  ]
}
```

只有配对里的人能看。爽约次数来自历史 `Feedback.noShow`。

## 风险

- **学信网**：没有稳定的公开个人 API。验证码核验可能要协议、爬虫或人工，都还没做。学生证 OCR 会认错学校，不能当唯一闸门。
- **微信类目审核**：匹配 / 交友类目可能被拒或要求资质。骨架没有绕过审核的方案，上线前先确认类目。
- **订阅消息额度**：一次 `wx.requestSubscribeMessage` 通常只能发一条。周三晚上同时发「海报」和「改期」会超限。要合并模板，或只发一条带页面参数的消息。用户没订阅时微信直接拒绝。
- **周三 19:00 峰值**：截止如果堆在 23:59 一次配对，19:00 再扇出通知。现在是单进程串行日志。真人推送要限速，并保证 cron 只在一个实例跑。
- **session_key**：换成真 code2session 之后不要打日志，也不要放进 JWT。
- **开发令牌**：`x-dev-token` 能触发全站配对。部署到别人能访问的环境之前换成真正的运营鉴权。
- **隐私**：preview 给开发令牌看全池。普通用户接口只返回自己的那一对。

## 明确不做

跨校匹配、滑卡信息流、语音引导、运营后台、支付。
