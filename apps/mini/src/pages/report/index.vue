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
        <view class="seal">💌</view>
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
            <view class="flap"></view>
            <view class="seal">💌</view>
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
              <view class="s-illu">💌</view>
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

function goWaiting() {
  uni.redirectTo({ url: '/pages/waiting/index' })
}

function showLock() {
  showToast('报告里没有联系方式，只用于确认这次见面')
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
  padding: 12px 16px 140px;
}

.report-card,
.share-canvas,
.empty-card {
  color: #14203a;
}

.report-card {
  position: relative;
  overflow: hidden;
  padding: 24px 20px 20px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 16px;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.94), rgba(214, 230, 255, 0.88));
  box-shadow: 0 16px 36px rgba(7, 22, 68, 0.22);
}

.rc-brand {
  display: flex;
  flex-direction: column;
}

.rc-brand .zh {
  font-size: 15px;
  font-weight: 700;
}

.rc-brand .en,
.s-en,
.share-hint,
.rc-cta-hint {
  color: #5d6b86;
  font-size: 10px;
}

.rc-kicker,
.s-kicker {
  margin: 10px 0 14px;
  color: #e40089;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.rc-illu,
.s-illu {
  display: grid;
  height: 120px;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(126, 182, 255, 0.55), rgba(47, 111, 228, 0.35));
  font-size: 36px;
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
  font-size: 20px;
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
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: #163a9a;
  font-size: 12px;
  font-weight: 500;
}

.rc-reason {
  margin: 16px 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
}

.rc-reason::before {
  content: '“';
  color: #e40089;
}

.rc-reason::after {
  content: '”';
  color: #e40089;
}

.rc-suggest {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
}

.suggest-label {
  color: #7b879c;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.suggest-main,
.s-suggest {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 600;
}

.rc-tags text {
  display: inline-block;
  margin: 8px 6px 0 0;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(228, 0, 137, 0.12);
  color: #b8006c;
  font-size: 12px;
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
  background: #fff;
}

.share-section {
  margin-top: 28px;
  color: #fff;
}

.share-section .h3 {
  font-size: 16px;
  font-weight: 600;
}

.share-frame {
  width: 100%;
  margin-top: 12px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
}

.share-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: linear-gradient(180deg, #7eb6ff, #163a9a 70%, #0b1d55);
  color: #fff;
}

.s-brand,
.s-name,
.s-reason,
.s-suggest {
  color: #fff;
}

.s-meta,
.s-en,
.share-canvas .share-hint {
  color: rgba(255, 255, 255, 0.74);
}

.s-kicker {
  color: #e40089;
}

.envelope {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: 0 16px 36px rgba(7, 22, 68, 0.22);
}

.envelope .flap {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 46%;
  background: rgba(255, 255, 255, 0.28);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: top center;
  transition: transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
}

.envelope.opening .flap {
  transform: rotateX(180deg);
}

.envelope .seal {
  position: absolute;
  top: 42%;
  left: 50%;
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  margin-left: -36px;
  border-radius: 50%;
  background: #e40089;
  font-size: 32px;
}

.envelope-copy {
  position: absolute;
  right: 0;
  bottom: 36px;
  left: 0;
  color: #fff;
  text-align: center;
}

.empty-card {
  padding: 28px 16px;
  color: #fff;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .envelope .flap {
    transition: none;
  }
}
</style>
