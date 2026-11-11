<template>
  <view class="phone">
    <view class="q-top">
      <view class="q-top-spacer"></view>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <view class="q-top-spacer"></view>
    </view>
    <view class="letter-mark" aria-hidden="true">
      <view class="letter-sheet">
        <view class="letter-flap"></view>
        <view class="wax-seal"></view>
      </view>
    </view>
    <view class="h1">本周已锁定，等待见面方案</view>
    <view class="lead">等待见面方案。周二 23:59 截止，周三 19:00 发出。演示可以现在就出配。</view>
    <view class="card">
      <view v-if="cycle">{{ cycle.weekKey }} · {{ cycle.phase }}</view>
      <view class="todo" v-if="cycle">截止 {{ cycle.cutoffAt }}</view>
      <view class="todo" v-if="cycle">推送 {{ cycle.releaseAt }}</view>
      <view class="todo">当前状态 {{ phase }}</view>
      <button class="primary" @click="load">刷新</button>
      <button v-if="phase === 'matched' || phase === 'confirmed'" class="primary" @click="openReport">查看见面方案</button>
    </view>
    <view class="card">
      <view class="lead">开发入口。用 x-dev-token 立即出配，规则仍是同校、年级差不超过 2。</view>
      <text class="label">x-dev-token</text>
      <input class="field" v-model="devToken" />
      <button class="ghost" @click="release">立即出配</button>
      <view v-if="log" class="todo">{{ log }}</view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { getDevToken, setDevToken } from '../../config'

const cycle = ref<{ weekKey: string; phase: string; cutoffAt: string; releaseAt: string } | null>(null)
const phase = ref('waiting')
const devToken = ref('dev-admin')
const log = ref('')
const error = ref('')

onShow(() => {
  devToken.value = getDevToken()
  void load()
})

async function load() {
  error.value = ''
  try {
    cycle.value = await request('/drop/current')
    const status = await request<{ phase: string }>('/me/status')
    phase.value = status.phase
  } catch (err) {
    error.value = err instanceof Error ? err.message : '读取失败'
  }
}

async function release() {
  error.value = ''
  log.value = ''
  setDevToken(devToken.value.trim() || 'dev-admin')
  try {
    const result = await request<{
      acceptedCount?: number
      stubbed?: boolean
      notifications?: Array<{ accepted: boolean; stub: boolean; url?: string; provider?: string }>
    }>('/drop/release', { method: 'POST', dev: true, data: {} })
    const first = result.notifications?.[0]
    log.value = `accepted=${result.acceptedCount ?? 0} stubbed=${result.stubbed}\n${first?.provider || ''} ${first?.url || ''}`
    await load()
    if (phase.value === 'matched' || phase.value === 'confirmed') {
      uni.redirectTo({ url: '/pages/report/index' })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '出配失败'
  }
}

function openReport() {
  uni.redirectTo({ url: '/pages/report/index' })
}
</script>

<style scoped>
.h1, .lead, .card {
  margin-left: 16px;
  margin-right: 16px;
}
.h1 {
  text-align: center;
}
.lead {
  text-align: center;
}
</style>
