<template>
  <view class="phone">
    <view class="q-top">
      <button class="q-back" @click="goWaiting">←</button>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <button class="q-lock" @click="showLock">锁</button>
    </view>

    <view class="rc-scroll">
      <view v-if="!card" class="empty-card">
        <view class="h2">本周暂未配对</view>
        <view class="lead">下周期见。建档后可在等待页触发出配。</view>
      </view>

      <view v-else-if="!opened" class="envelope" :class="{ opening }" @click="openEnvelope">
        <view class="flap"></view>
        <view class="wax-seal seal"></view>
        <view class="envelope-copy">
          <text class="h2">本周见面方案</text>
          <text class="lead">点一下拆开</text>
        </view>
      </view>

      <template v-else>
        <view class="report-card">
          <view class="rc-brand">
            <text class="zh">不如见一面</text>
            <text class="en">Better meet IRL</text>
          </view>
          <view class="rc-kicker">本周见面方案</view>
          <view class="rc-illu">
            <view class="letter-sheet">
              <view class="letter-flap"></view>
              <view class="wax-seal"></view>
            </view>
          </view>
          <view class="rc-identity">
            <view class="rc-name">{{ card.peerName }}</view>
            <view class="rc-meta">
              <text class="pill">{{ card.schoolName }}</text>
              <text class="pill">{{ card.gradeLabel }}</text>
            </view>
          </view>
          <view class="rc-reason">{{ card.reason }}</view>
          <view class="rc-suggest">
            <view class="suggest-label">建议见面</view>
            <view class="suggest-main">{{ card.suggestion }}</view>
            <view class="rc-tags">
              <text>公共场合</text>
              <text>轻松聊天</text>
            </view>
          </view>
          <view class="rc-footer">
            <text class="rc-cta-hint">打开方案，确认赴约\n不展示任何联系方式</text>
            <image v-if="qr" class="qr-slot" :src="qr" mode="aspectFit" />
          </view>
        </view>

        <view class="share-section">
          <view class="h3">分享图预览 · 仅 1:1</view>
          <view class="share-hint">导出 1080×1080 · 不提供 3:4</view>
          <view class="share-frame">
            <view class="share-canvas">
              <text class="s-brand">不如见一面</text>
              <text class="s-en">Better meet IRL</text>
              <text class="s-kicker">本周见面方案</text>
              <view class="s-illu"><view class="wax-seal mini"></view></view>
              <text class="s-name">{{ card.peerName }}</text>
              <text class="s-meta">{{ card.schoolName }} · {{ card.gradeLabel }}</text>
              <text class="s-reason">「{{ card.reason }}」</text>
              <text class="s-suggest">{{ card.suggestion }}</text>
              <view class="s-foot">
                <text class="share-hint">扫码打开本周见面方案</text>
                <image v-if="qr" class="s-qr" :src="qr" mode="aspectFit" />
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view v-if="opened && card" class="bottom-cta stack">
      <button class="btn-primary" :disabled="saving" @click="saveSquare">{{ saving ? '生成中…' : '保存分享（1:1）' }}</button>
      <button class="btn-secondary" @click="respond('accept')">确认赴约</button>
    </view>
    <view v-if="toast" class="toast">{{ toast }}</view>
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import QRCode from 'qrcode'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { LOCK_LINE } from '../../copy'
import { renderSharePng, type ShareRatio } from '../../share/poster'
import { tokenColor } from '../../styles/palette'

interface Card {
  token: string
  url: string
  kicker: string
  peerName: string
  schoolName: string
  gradeLabel: string
  reason: string
  suggestion: string
  status: string
  map: { label: string; todo: string; ready: boolean }
  face: { todo: string; ready: boolean }
}

const card = ref<Card | null>(null)
const token = ref('')
const opened = ref(false)
const opening = ref(false)
const qr = ref('')
const saving = ref(false)
const toast = ref('')
const error = ref('')

onLoad((query) => {
  token.value = typeof query?.token === 'string' ? query.token : ''
  void load()
})

async function load() {
  error.value = ''
  try {
    card.value = token.value
      ? await request<Card>(`/reports/${token.value}`, { auth: false })
      : await request<Card | null>('/reports/me')
    if (card.value?.token) token.value = card.value.token
    if (card.value?.url) {
      qr.value = await QRCode.toDataURL(card.value.url, {
        margin: 0,
        width: 216,
        color: { dark: tokenColor('ink'), light: tokenColor('paper') },
      })
    }
    if (prefersReducedMotion()) opened.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : '匹配报告加载失败'
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function openEnvelope() {
  if (opening.value || opened.value) return
  if (prefersReducedMotion()) {
    opened.value = true
    return
  }
  opening.value = true
  window.setTimeout(() => {
    opened.value = true
    opening.value = false
  }, 1000)
}

async function respond(action: 'accept' | 'reschedule', preset?: string) {
  if (!token.value) return
  error.value = ''
  try {
    const data: Record<string, string> = { action }
    if (preset) data.preset = preset
    card.value = await request<Card>(`/reports/${token.value}/respond`, { method: 'POST', auth: false, data })
    showToast(action === 'accept' ? '已接受，等对方确认' : '改期已提交')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  }
}

async function saveSquare() {
  await exportShare('1:1')
}

async function exportShare(ratio: ShareRatio) {
  if (!card.value || typeof document === 'undefined') {
    showToast('当前环境不能导出图片')
    return
  }
  saving.value = true
  try {
    const png = await renderSharePng(
      {
        peerName: card.value.peerName,
        schoolName: card.value.schoolName,
        gradeLabel: card.value.gradeLabel,
        reason: card.value.reason,
        suggestion: card.value.suggestion,
        url: card.value.url,
      },
      ratio,
    )
    const link = document.createElement('a')
    link.href = png
    link.download = ratio === '1:1' ? 'buyujian-1080.png' : 'buyujian-1080x1440.png'
    link.click()
    showToast('已保存 1:1 分享图')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '分享图生成失败'
  } finally {
    saving.value = false
  }
}

function goWaiting() {
  uni.redirectTo({ url: '/pages/waiting/index' })
}

function showLock() {
  showToast(LOCK_LINE)
}

function showToast(text: string) {
  toast.value = text
  window.setTimeout(() => {
    if (toast.value === text) toast.value = ''
  }, 2000)
}
</script>

<style scoped>
.rc-scroll {
  flex: 1;
  padding: 12px 16px 160px;
}

.report-card,
.share-canvas,
.empty-card {
  color: var(--color-ink);
}

.report-card {
  position: relative;
  overflow: hidden;
  padding: 24px 20px 20px;
  border: 1px solid var(--color-track);
  border-radius: var(--radius-envelope);
  background: var(--color-surface);
  box-shadow: var(--shadow-envelope);
}

.rc-brand {
  display: flex;
  flex-direction: column;
}

.rc-brand .zh,
.s-brand {
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 700;
}

.rc-brand .en,
.s-en,
.share-hint,
.rc-cta-hint {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.rc-kicker,
.s-kicker {
  margin: 10px 0 14px;
  color: var(--color-wax);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.rc-illu,
.s-illu {
  display: grid;
  height: 132px;
  place-items: center;
  margin-bottom: 16px;
}

.rc-identity,
.s-name,
.s-meta,
.s-reason,
.s-suggest {
  text-align: center;
}

.rc-name,
.s-name {
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 700;
}

.rc-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.pill {
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-capsule);
  color: var(--color-on-capsule);
  font-size: 12px;
  font-weight: 500;
}

.rc-reason {
  margin: 16px 0;
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.rc-reason::before,
.rc-reason::after {
  color: var(--color-wax);
}

.rc-reason::before {
  content: '“';
}

.rc-reason::after {
  content: '”';
}

.rc-suggest {
  padding: 14px;
  border-radius: var(--radius-lg);
  background: var(--color-paper);
}

.suggest-label {
  color: var(--color-text-tertiary);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.suggest-main,
.s-suggest {
  margin-top: 6px;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 700;
}

.rc-tags text {
  display: inline-block;
  margin: 8px 6px 0 0;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-wax-soft);
  color: var(--color-wax);
  font-size: 12px;
  font-weight: 500;
}

.rc-footer,
.s-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.qr-slot,
.s-qr {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: var(--color-surface);
}

.share-section {
  margin-top: 28px;
  color: var(--color-ink);
}

.share-section .h3 {
  font-size: 16px;
  font-weight: 700;
}

.share-frame {
  width: 100%;
  margin-top: 12px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--color-track);
  border-radius: var(--radius-lg);
}

.share-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: var(--color-paper);
  color: var(--color-ink);
}

.s-meta,
.share-canvas .share-hint {
  color: var(--color-text-secondary);
}

.envelope {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid var(--color-track);
  border-radius: var(--radius-envelope);
  background: var(--color-surface);
  box-shadow: var(--shadow-envelope);
}

.envelope .flap {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 46%;
  background: color-mix(in srgb, var(--color-track) 78%, var(--color-surface));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
  transition: transform 1000ms var(--ease-out-expo);
}

.envelope.opening .flap {
  transform: rotateX(180deg);
}

.envelope .seal {
  position: absolute;
  top: 38%;
  left: 50%;
  width: 84px;
  height: 84px;
  margin-left: -42px;
}

.envelope .seal::after {
  inset: 18px;
}

.envelope-copy {
  position: absolute;
  right: 16px;
  bottom: 36px;
  left: 16px;
  color: var(--color-ink);
  text-align: center;
}

.envelope-copy .h2,
.envelope-copy .lead {
  display: block;
}

.envelope-copy .lead {
  color: var(--color-text-secondary);
}

.empty-card {
  padding: 28px 16px;
  color: var(--color-ink);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .envelope .flap {
    transition: none;
  }
}
</style>
