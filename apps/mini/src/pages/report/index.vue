<template>
  <view class="page">
    <view class="h1">不如见一面</view>
    <view class="lead">周三 Drop</view>

    <view class="card" v-if="!card">
      <view>这周还没有见面方案。</view>
      <view class="todo">建档后在「等待」页点立即出配，或从短信里的链接打开。</view>
    </view>

    <view class="card" v-else-if="!opened">
      <view class="h1">一封还没拆的信</view>
      <view class="lead">本周的见面方案在里面。</view>
      <button class="primary" @click="opened = true">拆开</button>
    </view>

    <view class="card" v-else>
      <view class="todo">{{ card.kicker }} · {{ card.schoolName }} · {{ card.gradeLabel }}</view>
      <view class="h1">{{ card.peerName }}</view>
      <view class="lead">{{ card.reason }}</view>
      <view class="todo">{{ card.suggestion }}</view>
      <view class="todo">状态 {{ card.status }}</view>
      <button class="primary" @click="respond('accept')">接受，赴约</button>
      <button class="ghost" @click="respond('reschedule', 'sun_afternoon')">改到周日下午</button>
      <button class="ghost" @click="respond('decline')">这周不去</button>
      <button class="ghost" @click="share">复制分享文案</button>
      <view class="todo">{{ card.map.todo }}</view>
      <view class="todo">{{ card.face.todo }}</view>
      <view v-if="message" class="todo">{{ message }}</view>
    </view>
    <view v-if="error" class="error">{{ error }}</view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import { request } from '../../api/http'

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
  map: { todo: string }
  face: { todo: string }
}

const card = ref<Card | null>(null)
const token = ref('')
const opened = ref(false)
const message = ref('')
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : '报告加载失败'
  }
}

async function respond(action: 'accept' | 'decline' | 'reschedule', preset?: string) {
  if (!token.value) return
  error.value = ''
  try {
    const data: Record<string, string> = { action }
    if (preset) data.preset = preset
    card.value = await request<Card>(`/reports/${token.value}/respond`, { method: 'POST', auth: false, data })
    message.value = action === 'accept' ? '已接受，等对方确认' : '已提交'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  }
}

function share() {
  if (!card.value) return
  const text = `不如见一面 · ${card.value.reason}。${card.value.suggestion}。${card.value.url}`
  uni.setClipboardData({ data: text })
}
</script>
