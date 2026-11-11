<template>
  <scroll-view scroll-y class="letter">
    <view class="topnav" :class="{ desk: wide }">
      <view class="brand">
        <view class="wax-seal mini"></view>
        <text class="logo">不如见一面</text>
      </view>
      <text v-if="wide" class="ghost">「不如见一面」没回？换个号码</text>
      <view class="nav-actions">
        <button class="text-btn" @click="login">登录</button>
        <button class="wax-btn" @click="join">立即加入</button>
      </view>
    </view>

    <view class="hero">
      <view class="letter-mark">
        <view class="letter-sheet">
          <view class="letter-flap"></view>
          <view class="wax-seal"></view>
        </view>
      </view>
      <view class="hero-title">这周三<br />就去见一面</view>
      <view class="hero-caps">
        <text class="cap">本周匹配</text>
        <text class="cap">本周约会 · {{ wide ? 'Alex' : 'Jason' }}</text>
        <text class="cap">同校 · 周六下午校园咖啡</text>
      </view>
      <button class="wax-btn cta" @click="join">立即加入</button>
    </view>

    <view class="section">
      <text class="tape">怎么<text class="wax">运作</text></text>
      <view class="step" v-for="step in howSteps" :key="step.n">
        <text class="num">{{ step.n }}</text>
        <view>
          <text class="strong">{{ step.title }}</text>
          <text class="subline">{{ step.body }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="tape">真<text class="wax">约会</text>，送到手</text>
      <text class="stamp">80,000+ 场约会已安排</text>
      <text class="stamp alt">65% 成功赴约</text>
    </view>

    <view class="section">
      <text class="tape">你的<text class="wax">专属</text>红娘</text>
      <text class="col">有最好的研究托底</text>
      <text class="col">「不如见一面」会记住你的偏好</text>
      <text class="col">扫过整个池子，找出那一个</text>
    </view>

    <view class="section">
      <text class="tape">难忘的好时光</text>
    </view>

    <view class="section">
      <text class="tape">划烦了？</text>
      <text class="tape wax-line">不如见一面就是为你准备的</text>
      <view class="cmp">
        <text class="kicker">不如见一面</text>
        <text class="cmp-h">一条马上能赴约的邀请</text>
      </view>
      <view class="cmp dim">
        <text class="kicker">其他约会软件</text>
        <text class="cmp-h">没完没了的滑动和尬聊</text>
      </view>
    </view>

    <view class="section">
      <text class="tape">已验证 · 隐私 · <text class="wax">安全</text></text>
      <view class="safe"><text class="kicker">安全 #1</text><text class="safe-p">只匹配同校已验证学生</text></view>
      <view class="safe"><text class="kicker">安全 #2</text><text class="safe-p">只有约会对象能看到你</text></view>
      <view class="safe"><text class="kicker">安全 #3</text><text class="safe-p">校园咖啡见面</text></view>
    </view>

    <view class="section">
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
    </view>

    <view class="section manifesto">
      <text class="line">约会，不必滑动</text>
      <text class="script">约会，不必滑动</text>
      <button class="wax-btn" @click="join">我们的宣言</button>
    </view>

    <view class="section foot">
      <text class="note">一个会把现成约会发到你手机上的朋友。</text>
      <text class="brand-xl">不如见一面</text>
      <text class="legal">© 不如见一面 2026 · 条款 · 隐私</text>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const wide = ref(typeof window !== 'undefined' && window.matchMedia('(min-width: 960px)').matches)
const faqOpen = ref(0)

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

function join() {
  uni.navigateTo({ url: '/pages/login/index' })
}
function login() {
  uni.navigateTo({ url: '/pages/login/index' })
}
function syncWide() {
  wide.value = window.matchMedia('(min-width: 960px)').matches
}
onMounted(() => {
  syncWide()
  window.addEventListener('resize', syncWide)
})
onBeforeUnmount(() => window.removeEventListener('resize', syncWide))
</script>

<style scoped>
.letter {
  height: 100vh;
  background: var(--color-paper);
  color: var(--color-ink);
}
.topnav {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
  background: color-mix(in srgb, var(--color-paper) 92%, transparent);
}
.topnav.desk { padding: 18px 28px; }
.brand { display: inline-flex; align-items: center; gap: 8px; }
.logo { font-size: 18px; font-weight: 700; }
.ghost {
  flex: 1;
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: center;
}
.nav-actions { display: flex; gap: 8px; }
.text-btn,
.wax-btn {
  margin: 0;
  border: none;
  border-radius: var(--radius-pill);
  font-weight: 700;
}
.text-btn {
  height: 36px;
  padding: 0 14px;
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
}
.wax-btn {
  height: 36px;
  padding: 0 16px;
  background: var(--color-wax);
  color: var(--color-on-capsule);
  font-size: 14px;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px 48px;
  text-align: center;
}
.hero-title {
  margin-top: 8px;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.15;
}
.hero-caps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
}
.cap {
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-capsule);
  color: var(--color-on-capsule);
  font-size: 13px;
  font-weight: 500;
}
.cta {
  width: min(320px, 100%);
  height: 48px;
  margin-top: 28px;
  font-size: 17px;
}
.section {
  padding: 12px 20px 36px;
}
.tape {
  display: block;
  margin: 12px auto 18px;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
}
.wax { color: var(--color-wax); }
.wax-line {
  display: block;
  color: var(--color-wax);
  font-size: 22px;
  text-align: center;
}
.step, .safe, .cmp, .col {
  margin-top: 14px;
}
.step { display: flex; gap: 12px; align-items: flex-start; }
.num {
  display: grid;
  width: 28px;
  height: 28px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: var(--color-wax);
  color: var(--color-on-capsule);
  font-size: 13px;
  font-weight: 700;
}
.strong, .safe-p, .cmp-h, .col {
  display: block;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}
.subline, .kicker, .faq-a, .legal {
  display: block;
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}
.stamp {
  display: inline-block;
  margin: 8px 8px 0 0;
  padding: 12px 14px;
  border-radius: 4px 14px 14px 4px;
  background: var(--color-wax-soft);
  color: var(--color-wax);
  font-weight: 700;
}
.stamp.alt { background: var(--color-track); color: var(--color-ink); }
.cmp {
  padding: 16px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-track);
}
.cmp.dim { background: transparent; }
.safe {
  padding: 14px 0;
  border-bottom: 1px solid var(--color-track);
}
.faq {
  overflow: hidden;
  border: 1px solid var(--color-track);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}
.faq-item { border-bottom: 1px solid var(--color-track); }
.faq-item:last-child { border-bottom: none; }
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  font-weight: 700;
}
.faq-a { padding: 0 16px 14px; }
.chev {
  width: 8px;
  height: 8px;
  flex: none;
  border-right: 2px solid var(--color-wax);
  border-bottom: 2px solid var(--color-wax);
  transform: rotate(45deg);
}
.chev.open { transform: rotate(225deg); }
.manifesto { text-align: center; }
.line, .script {
  display: block;
  font-size: 28px;
  font-weight: 700;
}
.script {
  margin-top: 8px;
  color: var(--color-wax);
}
.manifesto .wax-btn { margin-top: 18px; }
.note {
  display: block;
  max-width: 360px;
  margin: 0 auto;
  padding: 16px 18px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-track);
  font-weight: 700;
  text-align: center;
}
.brand-xl {
  display: block;
  margin-top: 22px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
}
.legal { margin-top: 12px; text-align: center; }
@media (min-width: 960px) {
  .hero-title { font-size: 64px; }
  .tape { font-size: 40px; }
  .section { max-width: 880px; margin-right: auto; margin-left: auto; }
  .step, .cmp { display: inline-flex; width: calc(50% - 10px); margin-right: 10px; vertical-align: top; }
  .step { display: inline-flex; }
}
</style>
