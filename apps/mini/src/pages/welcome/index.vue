<template>
  <scroll-view scroll-y class="mkt" :scroll-into-view="anchor">
    <view class="hero" id="s1">
      <view class="bg" :class="{ on: bgOn, loop: bgLoop }"></view>
      <view class="sun" :class="{ on: sunOn }"></view>
      <view class="campus" :class="{ on: campusOn }"></view>
      <view class="river" :class="{ on: riverOn }"></view>

      <view class="topnav" :class="{ on: navOn }">
        <text class="logo">不如见一面</text>
        <button class="join" @click="join">立即加入</button>
      </view>

      <view class="glass-phone" :class="{ on: phoneOn }">
        <view class="gp-head"><text class="gp-avatar">🐤</text>不如见一面</view>
        <text class="gp-ts" :class="{ pop: tsOn }">短信 · 今天 19:00</text>
        <view class="gp-thread">
          <text class="gp-bubble" :class="{ pop: b1On }">本周匹配 🕊️</text>
          <view class="gp-card" :class="{ pop: cardOn }">
            <view class="ph"></view>
            <text class="nm">{{ cardName }}</text>
            <text class="bio">{{ cardBio }}</text>
          </view>
          <view class="typing" :class="{ pop: typingOn, hide: replyOn }"><text></text><text></text><text></text></view>
          <text class="gp-bubble out" :class="{ pop: replyOn }">好，周三见</text>
        </view>
      </view>

      <view class="hero-center">
        <view class="hero-title">
          <text
            v-for="(ch, i) in letters"
            :key="i"
            class="ch"
            :class="{ in: lettersOn, br: ch === '\n' }"
            :style="{ animationDelay: i * 28 + 'ms' }"
          >{{ ch === '\n' ? '' : ch }}</text>
        </view>
      </view>

      <view class="dove" :class="doveClass">
        <image class="dove-shadow" src="/static/dove-shadow.webp" mode="aspectFit" />
        <image class="dove-img" src="/static/dove-flap-2.webp" mode="aspectFit" />
        <text class="env">💌</text>
      </view>

      <button class="mkt-cta" :class="{ on: ctaOn }" @click="join">立即加入</button>
    </view>

    <view class="screen" id="s2">
      <text class="h2">怎么运作</text>
      <view class="step" v-for="step in steps" :key="step.n">
        <text class="num">{{ step.n }}</text>
        <view>
          <text class="strong">{{ step.title }}</text>
          <text class="sub">{{ step.body }}</text>
        </view>
      </view>
    </view>

    <view class="screen">
      <text class="h2">真实见面，已送达</text>
      <text class="sub">不是无尽滑动，是安排好的一次见面。</text>
      <view class="stats">
        <view class="stat"><text class="b">80,000+</text><text>已促成约会</text></view>
        <view class="stat"><text class="b">65%</text><text>成功率</text></view>
        <view class="stat"><text class="b">92%</text><text>想二次见面</text></view>
      </view>
    </view>

    <view class="screen">
      <text class="h2">你的专属红娘</text>
      <text class="card">有研究支撑的匹配思路</text>
      <text class="card">会记住你的偏好和节奏</text>
      <text class="card">扫过池子，只推一个最合适的</text>
    </view>

    <view class="screen">
      <text class="h2">扫过整个池子</text>
      <text class="card">告诉偏好，学习你的节奏</text>
      <text class="card">全池扫描，只推一个</text>
      <text class="card">周三一条短信，准备好去见</text>
    </view>

    <view class="screen">
      <text class="h2">难忘的好时光</text>
      <view class="polaroid">
        <view class="pic"></view>
        <text class="strong">林夏 · 良乡</text>
        <text class="sub">「周三就约上了」</text>
      </view>
      <view class="polaroid">
        <view class="pic alt"></view>
        <text class="strong">周予 · 良乡</text>
        <text class="sub">「比滑动真实太多」</text>
      </view>
    </view>

    <view class="screen">
      <text class="h2">滑腻了？不如见一面适合你</text>
      <view class="cmp">
        <view class="good"><text class="strong">不如见一面</text><text>一次就绪的见面邀请</text></view>
        <view class="bad"><text class="strong">其他约会 App</text><text>无尽滑动和尬聊</text></view>
      </view>
    </view>

    <view class="screen">
      <text class="h2">已验证 · 隐私 · 安全</text>
      <text class="card">只在本校已验证的学生里匹配</text>
      <text class="card">只有这次见面的人能看到你</text>
      <text class="card">优先约在校园咖啡和公共场合</text>
    </view>

    <view class="screen">
      <text class="h2">常见问题</text>
      <text class="card">怎么配对？根据偏好与节奏，每周只推一个。</text>
      <text class="card">见面前后我能知道什么？报告卡写共同点。</text>
      <text class="card">不喜欢匹配怎么办？可以跳过本周。</text>
      <text class="card">谁在参与？本校已验证学生。</text>
    </view>

    <view class="screen">
      <text class="h2">常见问题（续）</text>
      <text class="card">临时去不了？尽早告知对方。</text>
      <text class="card">通常多久约上？多数人一两天内定时间。</text>
      <text class="card">收不到回复？检查短信过滤，也可站内重发。</text>
      <text class="card">约会出现在哪？优先校园咖啡和公共场合。</text>
    </view>

    <view class="screen">
      <text class="h2">不见面滑动，直接见面</text>
      <text class="sub">一个朋友，每周给你发一条准备好的见面邀请。</text>
      <button class="cta-final" @click="join">进入问卷 · 开始匹配</button>
    </view>

    <view class="screen">
      <text class="h2">不如见一面</text>
      <text class="sub">一个朋友，每周给你发一条准备好的见面。</text>
      <text class="fine">职业机会 · 我们的宣言 · 条款 · 隐私</text>
      <text class="fine">© 不如见一面 2026</text>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const letters = ['这', '周', '三', '\n', '就', '去', '见', '一', '面']
const bgOn = ref(false)
const sunOn = ref(false)
const navOn = ref(false)
const campusOn = ref(false)
const riverOn = ref(false)
const lettersOn = ref(false)
const phoneOn = ref(false)
const tsOn = ref(false)
const b1On = ref(false)
const cardOn = ref(false)
const doveClass = ref('')
const ctaOn = ref(false)
const bgLoop = ref(false)
const typingOn = ref(false)
const replyOn = ref(false)
const cards = [
  { name: '本周约会 · 林夏', bio: '喜欢做饭 · 校园咖啡' },
  { name: '本周约会 · 周予', bio: '同校 · 周六下午校内咖啡' },
]
const cardName = ref(cards[0].name)
const cardBio = ref(cards[0].bio)
const anchor = ref('')
let timers: ReturnType<typeof setTimeout>[] = []
let loop: ReturnType<typeof setInterval> | null = null
let cardIx = 0

const steps = [
  { n: '1', title: '告诉「不如见一面」你的类型', body: '周二 23:59 前交完偏好' },
  { n: '2', title: '周三投递', body: '晚上 7 点一条个性化匹配' },
  { n: '3', title: '约好见面时间', body: '双方填空档，我们帮你排' },
  { n: '4', title: '好好玩！', body: '校园附近真实见面' },
]

function later(ms: number, fn: () => void) {
  timers.push(setTimeout(fn, ms))
}

function reset() {
  timers.forEach(clearTimeout)
  timers = []
  if (loop) clearInterval(loop)
  loop = null
  cardIx = 0
  cardName.value = cards[0].name
  cardBio.value = cards[0].bio
  bgOn.value = sunOn.value = navOn.value = campusOn.value = riverOn.value = false
  lettersOn.value = phoneOn.value = tsOn.value = b1On.value = cardOn.value = false
  ctaOn.value = bgLoop.value = typingOn.value = replyOn.value = false
  doveClass.value = ''
}

function play() {
  reset()
  bgOn.value = true
  sunOn.value = true
  navOn.value = true
  later(420, () => {
    campusOn.value = true
    riverOn.value = true
  })
  later(500, () => {
    lettersOn.value = true
  })
  later(1500, () => {
    phoneOn.value = true
  })
  later(1600, () => {
    tsOn.value = true
  })
  later(1700, () => {
    b1On.value = true
    doveClass.value = 'spawn'
  })
  later(1800, () => {
    cardOn.value = true
  })
  later(1900, () => {
    doveClass.value = 'fly'
  })
  later(2500, () => {
    doveClass.value = 'bob'
    ctaOn.value = true
    bgLoop.value = true
  })
  later(3200, () => {
    typingOn.value = true
  })
  later(4200, () => {
    replyOn.value = true
    loop = setInterval(() => {
      typingOn.value = true
      replyOn.value = false
      later(900, () => {
        cardIx = (cardIx + 1) % cards.length
        cardName.value = cards[cardIx].name
        cardBio.value = cards[cardIx].bio
        typingOn.value = false
        replyOn.value = true
      })
    }, 4200)
  })
}

function join() {
  uni.navigateTo({ url: '/pages/login/index' })
}

onMounted(play)
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  if (loop) clearInterval(loop)
})
</script>

<style scoped>
.mkt {
  height: 100vh;
  background: #1e4f9e;
}
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  max-width: 390px;
  margin: 0 auto;
  overflow: hidden;
  background: #2a5070;
}
.bg, .sun, .campus, .river, .topnav, .glass-phone, .mkt-cta {
  position: absolute;
}
.bg {
  inset: 0;
  opacity: 0;
  background: linear-gradient(180deg, #6a9eb8 0%, #4a7a92 35%, #3a6278 65%, #2f5268 100%);
}
.bg.on { animation: fadeIn 0.35s ease-out forwards; }
.bg.loop { opacity: 1; }
.sun {
  top: -40px;
  left: -30px;
  width: 240px;
  height: 240px;
  opacity: 0;
  background: radial-gradient(circle, rgba(255, 236, 200, 0.5), transparent 70%);
}
.sun.on { animation: fadeIn 0.4s ease-out forwards; }
.campus {
  left: -10%;
  right: -10%;
  bottom: 18%;
  height: 160px;
  opacity: 0;
  background: linear-gradient(180deg, #4a7a9a, #1e3d52);
  clip-path: polygon(0% 60%, 8% 40%, 22% 30%, 38% 25%, 55% 20%, 70% 28%, 86% 35%, 100% 40%, 100% 100%, 0% 100%);
}
.campus.on, .river.on { animation: fadeIn 0.6s ease-out forwards; }
.river {
  left: 0;
  right: 0;
  bottom: 0;
  height: 22%;
  opacity: 0;
  background: linear-gradient(180deg, #3d6a88, #1a3344);
}
.topnav {
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  opacity: 0;
  color: #fff;
}
.topnav.on { animation: fadeIn 0.3s ease-out forwards; }
.logo {
  font-family: Georgia, "Songti SC", "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 700;
}
.join, .mkt-cta, .cta-final {
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-size: 12px;
}
.mkt-cta {
  left: 24px;
  right: 24px;
  bottom: 28px;
  z-index: 8;
  height: 48px;
  opacity: 0;
  background: rgba(255, 255, 255, 0.95);
  color: #0b1f44;
  font-size: 16px;
  font-weight: 700;
}
.mkt-cta.on { animation: fadeIn 0.4s ease-out forwards; }
.glass-phone {
  left: 50%;
  bottom: 26%;
  z-index: 4;
  display: flex;
  width: 210px;
  height: 340px;
  flex-direction: column;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(47, 98, 187, 0.55), rgba(0, 61, 114, 0.75));
  opacity: 0;
  transform: translateX(-50%) translateY(28px);
}
.glass-phone.on { animation: phoneIn 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.1) forwards; }
.gp-head, .nm, .bio, .gp-ts { color: #fff; font-size: 12px; }
.gp-head { display: flex; gap: 8px; padding: 14px 12px 4px; }
.gp-avatar {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #ffe08a, #e89030);
}
.gp-ts { opacity: 0; color: rgba(255, 255, 255, 0.55); text-align: center; font-size: 10px; }
.gp-thread { display: flex; flex: 1; flex-direction: column; justify-content: flex-end; gap: 8px; padding: 8px; }
.gp-bubble, .gp-card, .typing {
  align-self: flex-start;
  max-width: 88%;
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}
.gp-bubble {
  padding: 8px 11px;
  border-radius: 14px;
  background: #fff;
  color: #1a2744;
  font-size: 11px;
}
.gp-bubble.out { align-self: flex-end; background: #0b84fe; color: #fff; }
.gp-card { width: 88%; padding: 8px; border-radius: 14px; background: rgba(255, 255, 255, 0.95); }
.ph { height: 72px; border-radius: 10px; background: linear-gradient(135deg, #7eb6e8, #2f62bb 60%, #003d72); }
.nm, .bio { display: block; color: #1a2744; }
.pop { animation: bubblePop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.25) forwards; }
.typing { display: flex; gap: 4px; padding: 8px 12px; border-radius: 14px; background: rgba(255, 255, 255, 0.85); }
.typing text {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #667;
}
.typing.hide { opacity: 0; }
.hero-center {
  position: absolute;
  top: 12%;
  right: 16px;
  left: 16px;
  z-index: 6;
  text-align: center;
}
.hero-title {
  color: #fff;
  font-family: Georgia, "Songti SC", "Noto Serif SC", serif;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 18px rgba(10, 40, 80, 0.35);
}
.ch {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.35em);
}
.ch.in {
  animation: chIn 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.25) forwards;
}
.ch.br { display: block; height: 0; }
.dove {
  position: absolute;
  top: 36%;
  left: 0;
  z-index: 7;
  width: 110px;
  height: 110px;
  opacity: 0;
  transform: translate(-140%, -50%) rotate(-16deg);
}
.dove-img, .dove-shadow { position: absolute; inset: 0; width: 110px; height: 110px; }
.dove .env { position: absolute; right: 0; bottom: 8px; font-size: 18px; }
.dove.spawn { opacity: 0.85; }
.dove.fly { animation: doveFly 0.5s cubic-bezier(0.22, 0.8, 0.28, 1) forwards; }
.dove.bob {
  top: 36%;
  left: 50%;
  opacity: 1;
  animation: doveBob 2.2s ease-in-out infinite;
}
.screen {
  max-width: 390px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 48px 22px;
  background: linear-gradient(180deg, #2f62bb 0%, #1e4f9e 50%, #003d72 100%);
  color: #fff;
}
.h2 { display: block; margin-bottom: 12px; font-family: Georgia, "Songti SC", serif; font-size: 26px; }
.sub, .fine, .bio { display: block; opacity: 0.85; font-size: 14px; }
.step, .card, .stat, .good, .bad {
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(12, 36, 82, 0.42);
}
.step { display: flex; gap: 12px; }
.num {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 50%;
  background: #e40089;
  font-size: 12px;
}
.strong { display: block; font-weight: 700; }
.stats, .cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.good { background: rgba(228, 0, 137, 0.22); }
.cta-final {
  width: 100%;
  height: 52px;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  background: #e40089;
  color: #fff;
  font-weight: 700;
}
@keyframes fadeIn { to { opacity: 1; } }
@keyframes phoneIn { to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes bubblePop { to { opacity: 1; transform: none; } }
@keyframes chIn { to { opacity: 1; transform: none; } }
.polaroid { margin-top: 12px; padding: 10px; border-radius: 8px; background: #fff; color: #1a2744; }
.pic { height: 120px; border-radius: 4px; background: linear-gradient(135deg, #7eb6e8, #2f62bb 60%, #003d72); }
.pic.alt { background: linear-gradient(135deg, #5a9fd4, #003d72); }
@keyframes doveFly {
  0% { opacity: 0.9; transform: translate(-140%, -55%) rotate(-16deg) scale(0.9); }
  55% { opacity: 1; transform: translate(-70%, -62%) rotate(4deg) scale(1.04); }
  100% { opacity: 1; transform: translate(-50%, -50%) rotate(0deg) scale(1); }
}
@keyframes doveBob {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-2deg); }
  50% { transform: translate(-50%, -50%) translateY(-10px) rotate(2deg); }
}
</style>
