<template>
  <scroll-view scroll-y class="mkt">
    <view class="art hero" :style="bg(wide ? 'desk-hero-clean.png' : 'mob-hero-clean.png')">
      <view class="nav" :class="{ desk: wide }">
        <text class="logo">不如见一面</text>
        <text v-if="wide" class="ghost">「不如见一面」没回？换个号码</text>
        <view class="nav-actions">
          <button class="pill" @click="login">登录</button>
          <button v-if="wide" class="pill" @click="join">立即加入</button>
        </view>
      </view>
      <view class="hero-title" :class="{ in: lettersOn }">这周三<br />就去见一面</view>
      <view class="dove" :class="doveClass" :style="doveStyle">
        <image class="dove-shadow" src="/static/dove-shadow.webp" mode="aspectFit" />
        <view class="dove-sprite"></view>
      </view>
      <text class="match-pill nowrap" :class="{ in: lettersOn }">本周匹配 🕊️</text>
      <view class="cap" :class="{ in: lettersOn }">
        <text class="nowrap">本周约会 · {{ wide ? 'Alex' : 'Jason' }}</text>
        <text class="nowrap">同校 · 周六下午校园咖啡</text>
      </view>
      <button class="cta" :class="{ on: ctaOn }" @click="join">立即加入</button>
    </view>

    <view v-for="section in sections" :key="section.bg" class="art" :style="bg(section.bg)">
      <view class="nav" :class="{ desk: wide }">
        <text class="logo">不如见一面</text>
        <text v-if="wide" class="ghost">「不如见一面」没回？换个号码</text>
        <view class="nav-actions">
          <button class="pill dark" @click="login">登录</button>
          <button class="pill solid" @click="join">立即加入</button>
        </view>
      </view>
      <template v-if="section.kind === 'how'">
        <text class="tape">怎么<text class="pink">运作</text></text>
        <view class="step" v-for="step in howSteps" :key="step.n">
          <text class="num" :class="'n' + step.n">{{ step.n }}</text>
          <view>
            <text class="strong">{{ step.title }}</text>
            <text class="subline">{{ step.body }}</text>
          </view>
        </view>
      </template>
      <template v-else-if="section.kind === 'stats'">
        <text class="tape">真<text class="pink">约会</text>，送到手</text>
        <text class="sticker">80,000+ 场约会已安排</text>
        <text class="sticker alt">65% 成功赴约</text>
      </template>
      <template v-else-if="section.kind === 'maker'">
        <text class="tape">你的<text class="pink">专属</text>红娘</text>
        <text class="col">有最好的研究托底</text>
        <text class="col">「不如见一面」会记住你的偏好</text>
        <text class="col">扫过整个池子，找出那一个</text>
      </template>
      <template v-else-if="section.kind === 'times'">
        <text class="tape">难忘的好时光</text>
      </template>
      <template v-else-if="section.kind === 'swipe'">
        <text class="tape">划烦了？</text>
        <text class="tape pink-line">不如见一面就是为你准备的</text>
        <view class="cmp">
          <text class="kicker">不如见一面</text>
          <text class="cmp-h">一条马上能赴约的邀请</text>
        </view>
        <view class="cmp">
          <text class="kicker">其他约会软件</text>
          <text class="cmp-h">没完没了的滑动和尬聊</text>
        </view>
      </template>
      <template v-else-if="section.kind === 'safe'">
        <text class="tape">已验证 · 隐私 · <text class="pink">安全</text></text>
        <view class="safe"><text class="kicker">安全 #1</text><text class="safe-p">只匹配同校已验证学生</text></view>
        <view class="safe"><text class="kicker">安全 #2</text><text class="safe-p">只有约会对象能看到你</text></view>
        <view class="safe"><text class="kicker">安全 #3</text><text class="safe-p nowrap">校园咖啡见面</text></view>
      </template>
      <template v-else-if="section.kind === 'faq'">
        <text class="tape">常见问题</text>
        <view class="faq">
          <view v-for="(item, i) in faq" :key="item.q" class="faq-item">
            <view class="faq-q" @click="faqOpen = faqOpen === i ? -1 : i">
              <text>{{ item.q }}</text>
              <text class="chev" :class="{ open: faqOpen === i }"></text>
            </view>
            <text v-if="faqOpen === i" class="faq-a">{{ item.a }}</text>
          </view>
        </view>
      </template>
      <template v-else-if="section.kind === 'manifesto'">
        <text class="line">约会，不必滑动</text>
        <text class="script">约会，不必滑动</text>
        <button class="glass" @click="join">我们的宣言</button>
      </template>
      <template v-else>
        <text class="bubble">一个会把现成约会发到你手机上的朋友。</text>
        <text class="brand">不如见一面</text>
        <text class="legal">© 不如见一面 2026 · 条款 · 隐私</text>
      </template>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'

const wide = ref(false)
const lettersOn = ref(false)
const ctaOn = ref(false)
const faqOpen = ref(0)
const DOVE_SCALE = 0.42
const DOVE_W = 358 * DOVE_SCALE
const DOVE_VISUAL_BOTTOM = 298 * DOVE_SCALE
const doveClass = ref('')
const doveLeft = ref(-DOVE_W - 40)
const doveTop = ref(24)
const settle = { left: 120, top: 80 }
const page = getCurrentInstance()
let timers: ReturnType<typeof setTimeout>[] = []

const howSteps = [
  { n: '1', title: '告诉「不如见一面」你的类型', body: '周二 23:59 前交完偏好' },
  { n: '2', title: '周三投递', body: '晚上 7 点一条个性化匹配，约会也帮你安排好。' },
  { n: '3', title: '约好见面时间', body: '双方找个都合得来的时间见面' },
  { n: '4', title: '好好玩！', body: '好好享受这次为你安排的约会' },
]
const faq = [
  { q: '「不如见一面」怎么配对？', a: '根据你的偏好与节奏，每周只推一个最合适的人，并帮你把见面安排好。' },
  { q: '见面之前我会知道对方什么？', a: '报告卡会写明共同点与推荐理由；见面后你们可以继续聊。' },
  { q: '要是我不喜欢这次匹配或约会呢？', a: '可以跳过本周，我们会记住你的反馈，下周再配。' },
  { q: '都有谁在参加？', a: '本校已验证的学生。不会把它做成对所有人开放的广场。' },
  { q: '万一临时去不了怎么办？', a: '尽早告知对方和我们，别放鸽子。' },
  { q: '一般要等多久？', a: '多数人会在一到两天内把时间定下来。' },
  { q: '如果「不如见一面」没回我怎么办？', a: '检查短信过滤，或在站内申请一个新号码。' },
  { q: '约会一般在哪进行？', a: '优先校园咖啡和公共、好找的见面点。' },
]
const mobSections = [
  { bg: 'mob-s02-bg.png', kind: 'how' },
  { bg: 'mob-s03-bg.png', kind: 'how' },
  { bg: 'mob-s04-bg.png', kind: 'stats' },
  { bg: 'mob-s05-bg.png', kind: 'maker' },
  { bg: 'mob-s06-bg.png', kind: 'times' },
  { bg: 'mob-s07-bg.png', kind: 'swipe' },
  { bg: 'mob-s08-bg.png', kind: 'safe' },
  { bg: 'mob-s09-bg.png', kind: 'faq' },
  { bg: 'mob-s10-bg.png', kind: 'faq' },
  { bg: 'mob-s11-bg.png', kind: 'manifesto' },
  { bg: 'mob-s12-bg.png', kind: 'footer' },
]
const deskSections = [
  { bg: 'desk-s01-bg.png', kind: 'how' },
  { bg: 'desk-s02-bg.png', kind: 'how' },
  { bg: 'desk-s03-bg.png', kind: 'stats' },
  { bg: 'desk-s04-bg.png', kind: 'stats' },
  { bg: 'desk-s05-bg.png', kind: 'maker' },
  { bg: 'desk-s06-bg.png', kind: 'times' },
  { bg: 'desk-s07-bg.png', kind: 'swipe' },
  { bg: 'desk-s08-bg.png', kind: 'safe' },
  { bg: 'desk-s09-bg.png', kind: 'faq' },
  { bg: 'desk-s10-bg.png', kind: 'manifesto' },
  { bg: 'desk-s11-bg.png', kind: 'manifesto' },
  { bg: 'desk-s12-bg.png', kind: 'footer' },
]
const sections = computed(() => (wide.value ? deskSections : mobSections))
const doveStyle = computed(() => ({
  left: `${doveLeft.value}px`,
  top: `${doveTop.value}px`,
  transition: doveClass.value === 'fly'
    ? 'left 0.5s cubic-bezier(0.22, 0.8, 0.28, 1), top 0.5s cubic-bezier(0.22, 0.8, 0.28, 1)'
    : 'none',
}))

function bg(file: string) {
  return { backgroundImage: `url(/static/mkt/${file})` }
}
function later(ms: number, fn: () => void) {
  timers.push(setTimeout(fn, ms))
}
function measureDove() {
  const proxy = page?.proxy
  if (!proxy) return
  uni.createSelectorQuery()
    .in(proxy)
    .select('.hero')
    .boundingClientRect()
    .select('.hero-title')
    .boundingClientRect()
    .exec((rects) => {
      const hero = rects?.[0] as { top: number; width: number } | null
      const title = rects?.[1] as { top: number; left: number; width: number } | null
      const heroBox = rects?.[0] as { top: number; left: number; width: number } | null
      if (!heroBox || !title || title.width < 8 || heroBox.width < 8) return
      settle.top = title.top - heroBox.top - DOVE_VISUAL_BOTTOM + 26
      settle.left = title.left - heroBox.left + title.width / 2 - DOVE_W / 2
      if (doveClass.value === 'bob' || doveClass.value === 'fly') {
        doveLeft.value = settle.left
        doveTop.value = settle.top
      }
      void hero
    })
}
function play() {
  timers.forEach(clearTimeout)
  timers = []
  lettersOn.value = false
  ctaOn.value = true
  doveClass.value = ''
  doveLeft.value = -DOVE_W - 40
  doveTop.value = 24
  later(500, () => {
    lettersOn.value = true
    measureDove()
  })
  later(900, measureDove)
  later(1600, measureDove)
  later(1700, () => {
    doveClass.value = 'spawn'
    doveLeft.value = -DOVE_W - 28
    doveTop.value = Math.max(8, settle.top - 46)
  })
  later(1900, () => {
    doveClass.value = 'fly'
    requestAnimationFrame(() => {
      doveLeft.value = settle.left
      doveTop.value = settle.top
    })
  })
  later(2500, () => {
    doveClass.value = 'bob'
    doveLeft.value = settle.left
    doveTop.value = settle.top
  })
}
function join() {
  uni.navigateTo({ url: '/pages/login/index' })
}
function login() {
  uni.navigateTo({ url: '/pages/login/index' })
}
onMounted(() => {
  wide.value = typeof window !== 'undefined' && window.innerWidth >= 960
  play()
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.mkt { height: 100vh; background: #0b1c33; }
.art {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-color: #1e4f9e;
  background-size: cover;
  background-position: center top;
  color: #fff;
}
.nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 8px;
}
.nav.desk { padding: 18px 28px 10px; }
.logo { font-family: Georgia, "Songti SC", serif; font-size: 22px; font-weight: 800; }
.nav.desk .logo { font-size: 26px; }
.ghost { flex: 1; color: #fff; font-size: 13px; text-align: center; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4); white-space: nowrap; }
.nav-actions { display: flex; flex: none; gap: 10px; }
.pill, .cta, .glass, .icon {
  width: auto;
  margin: 0;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.55);
}
.pill { display: inline-flex; height: 32px; padding: 0 12px; font-size: 12px; line-height: 32px; }
.pill::after, .cta::after, .glass::after { border: none; }
.pill.dark { background: rgba(30, 30, 40, 0.55); }
.pill.solid { background: #fff; color: #e40089; border: none; font-weight: 800; }
.hero-title {
  position: absolute;
  top: 188px;
  left: 16px;
  right: 16px;
  z-index: 6;
  color: #fff;
  font-family: Georgia, "Songti SC", serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.12;
  text-align: center;
  text-shadow: 0 3px 18px rgba(10, 40, 80, 0.45);
  opacity: 0;
}
.nav.desk + .hero-title, .art.hero .hero-title { }
.hero-title.in { animation: fadeIn 0.6s ease-out forwards; }
.match-pill, .cap {
  position: absolute;
  z-index: 6;
  opacity: 0;
  white-space: nowrap;
}
.match-pill {
  left: 50%;
  top: 53%;
  padding: 8px 12px;
  border-radius: 16px;
  background: #fff;
  color: #1a2744;
  font-size: 13px;
  font-weight: 700;
  transform: translateX(-50%);
}
.cap {
  left: 50%;
  top: 70%;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #1a2744;
  font-size: 12px;
  font-weight: 700;
  transform: translateX(-50%);
}
.cap.in, .match-pill.in { opacity: 1; }
.nowrap { white-space: nowrap; }
.cta {
  position: absolute;
  left: 50%;
  bottom: 28px;
  z-index: 7;
  width: 310px;
  height: 48px;
  transform: translateX(-50%);
  background: #fff;
  color: #111;
  border: none;
  font-size: 17px;
  font-weight: 800;
  opacity: 0;
}
.cta.on { opacity: 1; }
.dove {
  position: absolute;
  z-index: 8;
  width: 168px;
  height: 186px;
  opacity: 0;
  pointer-events: none;
}
.dove.spawn { opacity: 1; transform: rotate(-16deg); }
.dove.fly { opacity: 1; transform: rotate(0deg); }
.dove.bob { opacity: 1; animation: doveBob 2.2s ease-in-out infinite; }
.dove-shadow { position: absolute; left: 22px; top: 108px; width: 116px; height: 16px; opacity: 0.28; }
.dove-sprite {
  position: absolute;
  top: 0;
  left: 0;
  width: 358px;
  height: 364px;
  background-image: url('/static/dove-flap-2.webp');
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 6086px 364px;
  animation: flap 0.72s steps(17) infinite;
  transform: scale(0.42);
  transform-origin: top left;
}
.dove.fly .dove-sprite { animation-duration: 0.45s; }
.tape, .line, .script, .brand {
  display: block;
  position: relative;
  z-index: 2;
  margin: 72px auto 0;
  font-family: Georgia, "Songti SC", serif;
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}
.pink, .pink-line { color: #e40089; }
.pink-line { display: block; text-align: center; font-family: Georgia, "Songti SC", serif; font-size: 22px; font-weight: 800; }
.step, .safe, .cmp, .col, .sticker, .bubble, .faq, .legal {
  position: relative;
  z-index: 2;
  margin: 16px 20px 0;
}
.step { display: flex; gap: 10px; max-width: 520px; }
.num {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #f2c94c;
  color: #111;
  font-weight: 800;
}
.num.n2 { background: #e40089; color: #fff; }
.num.n4 { background: #7ec8ff; }
.strong, .safe-p, .cmp-h, .col { display: block; font-family: Georgia, "Songti SC", serif; font-size: 22px; font-weight: 700; }
.subline, .kicker, .faq-a, .legal { display: block; font-size: 13px; opacity: 0.92; }
.sticker {
  display: inline-block;
  margin-left: 24px;
  padding: 12px 14px;
  background: #f3b6c8;
  color: #111;
  font-weight: 800;
  transform: rotate(-4deg);
}
.sticker.alt { background: #e8d14a; transform: rotate(3deg); }
.faq {
  max-width: 920px;
  margin-right: auto;
  margin-left: auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  background: rgba(8, 28, 70, 0.78);
}
.faq-item { border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
.faq-q { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; font-weight: 700; }
.faq-a { padding: 0 20px 14px; }
.chev {
  width: 10px;
  height: 10px;
  border-right: 2px solid #e40089;
  border-bottom: 2px solid #e40089;
  transform: rotate(45deg);
}
.chev.open { transform: rotate(225deg); }
.script { color: #e40089; font-style: italic; transform: rotate(-3deg); }
.glass { display: block; height: 44px; margin: 18px auto 0; padding: 0 28px; }
.bubble {
  max-width: 360px;
  padding: 16px 20px;
  border-radius: 18px;
  background: #fff;
  color: #111;
  font-weight: 700;
}
.brand { font-size: 36px; }
.legal { opacity: 0.7; }
@media (min-width: 960px) {
  .hero-title { top: 18vh; font-size: 64px; }
  .match-pill { top: 58%; }
  .cap { top: 68%; }
  .cta { width: 350px; height: 52px; bottom: 42px; font-size: 18px; }
  .tape { font-size: 42px; }
  .step, .cmp { display: inline-flex; width: 44%; vertical-align: top; }
}
@keyframes fadeIn { to { opacity: 1; } }
@keyframes flap { to { background-position: -6086px 0; } }
@keyframes doveBob {
  0%, 100% { transform: translateY(0) rotate(-1.5deg); }
  50% { transform: translateY(-10px) rotate(1.5deg); }
}
</style>
