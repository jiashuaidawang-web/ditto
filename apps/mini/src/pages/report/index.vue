<template>
  <view class="page report">
    <BrandLockup variant="compact" />

    <view class="card empty" v-if="!card">
      <view class="h2">本周暂未配对</view>
      <view class="lead">下周期见。建档后可在等待页触发出配。</view>
    </view>

    <view v-else-if="!opened" class="envelope" :class="{ opening }" @click="openEnvelope">
      <view class="flap"></view>
      <view class="seal"></view>
      <view class="envelope-copy">
        <text class="h2">本周见面方案</text>
        <text class="lead">点一下拆开</text>
      </view>
    </view>

    <view v-else class="poster">
      <view class="poster-kicker">匹配报告</view>
      <view class="poster-title">本周见面方案</view>
      <view class="veil"></view>
      <view class="field-label">对方称呼</view>
      <view class="peer">{{ card.peerName }}</view>
      <view class="meta">
        <text class="field-label">学校</text>
        <text class="school">{{ card.schoolName }}</text>
        <text class="field-label">年级</text>
        <text class="grade">{{ card.gradeLabel }}</text>
      </view>
      <view class="field-label">为何合适</view>
      <view class="reason">{{ card.reason }}</view>
      <view class="field-label">建议见面</view>
      <view class="suggestion">{{ card.suggestion }}</view>
      <view class="qr-row">
        <view>
          <view class="lead">打开方案</view>
          <view class="wordmark">不如见一面</view>
        </view>
        <image v-if="qr" class="qr" :src="qr" mode="aspectFit" />
      </view>
    </view>

    <view v-if="opened && card" class="bottom-cta">
      <button class="primary" :disabled="saving" @click="saveSquare">{{ saving ? '生成中' : '保存分享' }}</button>
      <button class="secondary" @click="respond('accept')">确认赴约</button>
      <button class="ghost" @click="respond('reschedule', 'sun_afternoon')">改到周日下午</button>
      <view v-if="card.map" class="lead">{{ card.map.label }} · 地图占位</view>
      <view v-if="card.face" class="lead">核身占位</view>
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
import { renderSharePng, type ShareRatio } from '../../share/poster'

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
        color: { dark: '#1F1A24', light: '#FFFFFF' },
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

function showToast(text: string) {
  toast.value = text
  window.setTimeout(() => {
    if (toast.value === text) toast.value = ''
  }, 2000)
}
</script>

<style scoped>
.report {
  min-height: 100vh;
}

.envelope {
  position: relative;
  height: 420px;
  margin-top: var(--space-6);
  border-radius: var(--radius-envelope);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-envelope);
  overflow: hidden;
}

.flap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 46%;
  background: var(--color-brand-coral);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
  transition: transform 1000ms var(--ease-out-expo);
}

.envelope.opening .flap {
  transform: rotateX(180deg);
}

.seal {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 56px;
  height: 56px;
  margin-left: -28px;
  border-radius: 50%;
  background: var(--color-accent-midnight);
}

.envelope-copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 36px;
  text-align: center;
}

.poster {
  margin-top: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, var(--color-bg-page), #ffe8e4);
  box-shadow: var(--shadow-md);
  animation: reveal 1000ms var(--ease-out-expo);
}

.poster-kicker,
.field-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.poster-title {
  margin-top: var(--space-1);
  color: var(--color-brand-coral);
  font-size: var(--font-size-h2);
  font-weight: 600;
}

.veil {
  height: 72px;
  margin: var(--space-4) 0;
  border-radius: var(--radius-lg);
  background: var(--color-poster-veil);
}

.peer {
  margin-top: var(--space-1);
  font-size: var(--font-size-display);
  font-weight: 700;
  line-height: 1.2;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-4);
}

.school,
.grade {
  color: var(--color-accent-midnight);
  font-size: var(--font-size-h3);
  font-weight: 600;
}

.reason {
  margin-top: var(--space-2);
  font-size: var(--font-size-h2);
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.suggestion {
  margin-top: var(--space-2);
  font-size: var(--font-size-body);
}

.qr-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: var(--space-6);
}

.qr {
  width: 72px;
  height: 72px;
  background: #fff;
}

.wordmark {
  margin-top: var(--space-1);
  font-size: var(--font-size-caption);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flap,
  .poster {
    transition: none;
    animation: none;
  }
}
</style>
