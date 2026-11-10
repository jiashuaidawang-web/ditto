<template>
  <view class="page">
    <view class="h1">周三 Drop</view>
    <view class="lead">周二 23:59 截止，周三 19:00 推送匹配海报和见面建议。推送目前只写日志。</view>

    <view class="card">
      <view v-if="cycle">{{ cycle.weekKey }} · {{ cycle.phase }}</view>
      <view class="todo" v-if="cycle">截止 {{ cycle.cutoffAt }}</view>
      <view class="todo" v-if="cycle">推送 {{ cycle.releaseAt }}</view>
      <button class="primary" @click="load">刷新本周</button>
      <view v-if="error" class="error">{{ error }}</view>
    </view>

    <view class="card">
      <view class="lead">开发调试。会用 x-dev-token 触发本周截止和推送，然后去确认页看自己的匹配。</view>
      <text class="label">x-dev-token</text>
      <input class="field" v-model="devToken" />
      <button class="ghost" @click="runCutoff">运行周二截止</button>
      <button class="ghost" @click="runRelease">运行周三 19:00 推送</button>
      <view v-if="log" class="todo">{{ log }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import { request } from '../../api/http'
import { getDevToken, setDevToken } from '../../config'

const cycle = ref<{ weekKey: string; phase: string; cutoffAt: string; releaseAt: string } | null>(null)
const devToken = ref('dev-admin')
const error = ref('')
const log = ref('')

onShow(() => {
  devToken.value = getDevToken()
  void load()
})

async function load() {
  error.value = ''
  try {
    cycle.value = await request('/drop/current')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '读取失败'
  }
}

async function run(path: string) {
  error.value = ''
  log.value = ''
  setDevToken(devToken.value.trim() || 'dev-admin')
  try {
    const result = await request<{ phase: string; pairCount?: number; notifyCount?: number; intended?: string[] }>(
      path,
      { method: 'POST', dev: true, data: {} },
    )
    log.value = `phase=${result.phase}\n${(result.intended || []).join('\n')}`
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '触发失败'
  }
}

function runCutoff() {
  return run('/drop/cutoff')
}
function runRelease() {
  return run('/drop/release')
}
</script>
