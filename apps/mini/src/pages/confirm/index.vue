<template>
  <view class="page">
    <view class="h1">确认见面</view>
    <view class="lead">双方都接受后才能签到。反馈只留一句，用来提示爽约。</view>

    <view class="card" v-if="!match">
      <view>这周还没有你的匹配。</view>
      <view class="todo">用种子账号 openid:seed_a 登录，在「周三 Drop」里运行截止。</view>
    </view>

    <view class="card" v-else>
      <view>{{ peerName }} · {{ match.schoolId }}</view>
      <view class="todo">{{ match.reason }}</view>
      <view class="todo">建议时间 {{ match.meetupAt || match.suggestedAt || '待定' }}</view>
      <view class="todo">{{ match.suggestionNote }}</view>
      <view class="todo">状态 {{ match.status }}</view>
      <view v-if="risk" class="todo">
        同校 {{ risk.sameSchool }} · 年级差 {{ risk.gradeGap }} · 年级差合格 {{ risk.gradeGapOk }}
      </view>

      <button class="primary" @click="respond('accept')">接受</button>
      <text class="label">改期（ISO 时间）</text>
      <input class="field" v-model="meetupAt" placeholder="2026-11-14T06:00:00.000Z" />
      <button class="ghost" @click="respond('reschedule')">改期</button>
      <button class="ghost" @click="respond('decline')">拒绝</button>
      <button class="ghost" @click="checkIn">签到</button>
      <button class="ghost" @click="sendFeedback">反馈：到了，还行</button>
      <view v-if="message" class="todo">{{ message }}</view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import { request } from '../../api/http'
import { getUserId } from '../../config'

interface Peer {
  id: string
  profile?: { displayName?: string }
}
interface MatchRow {
  id: string
  status: string
  reason: string
  schoolId: string
  meetupAt?: string
  suggestedAt?: string
  suggestionNote?: string
  userAId: string
  userBId: string
  userA: Peer
  userB: Peer
}
interface Risk {
  sameSchool: boolean
  gradeGap: number | null
  gradeGapOk: boolean
}

const match = ref<MatchRow | null>(null)
const risk = ref<Risk | null>(null)
const meetupAt = ref('2026-11-14T06:00:00.000Z')
const message = ref('')
const error = ref('')

const peerName = computed(() => {
  if (!match.value) return ''
  const me = getUserId()
  const peer = match.value.userA.id === me ? match.value.userB : match.value.userA
  return peer.profile?.displayName || '匹配对象'
})

onShow(() => {
  void load()
})

async function load() {
  error.value = ''
  try {
    match.value = await request<MatchRow | null>('/matches/me')
    if (match.value) {
      risk.value = await request<Risk>(`/matches/${match.value.id}/risk`)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '读取失败'
  }
}

async function respond(action: 'accept' | 'decline' | 'reschedule') {
  if (!match.value) return
  error.value = ''
  message.value = ''
  try {
    const data: Record<string, string> = { action }
    if (action === 'reschedule') data.meetupAt = meetupAt.value.trim()
    await request(`/matches/${match.value.id}/respond`, { method: 'POST', data })
    message.value = '已提交'
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  }
}

async function checkIn() {
  if (!match.value) return
  error.value = ''
  try {
    await request(`/matches/${match.value.id}/check-in`, { method: 'POST', data: {} })
    message.value = '已签到'
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '签到失败'
  }
}

async function sendFeedback() {
  if (!match.value) return
  error.value = ''
  try {
    await request(`/matches/${match.value.id}/feedback`, {
      method: 'POST',
      data: { rating: 4, noShow: false, comment: '到了' },
    })
    message.value = '已留下反馈'
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '反馈失败'
  }
}
</script>
