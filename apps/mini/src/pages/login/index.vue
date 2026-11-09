<template>
  <view class="page">
    <view class="h1">Ditto</view>
    <view class="lead">周三晚上的校园匹配。先登录，再认证，再填空闲时间。</view>

    <view class="card">
      <text class="label">API 地址</text>
      <input class="field" v-model="apiBase" placeholder="http://localhost:3000" />
      <button class="primary" @click="saveBase">保存地址</button>

      <button class="primary" @click="wechatLogin">微信登录</button>
      <text class="todo">小程序里走 wx.login。H5 没有微信 code，用下面的开发码。</text>

      <text class="label">开发登录码（stub）</text>
      <input class="field" v-model="code" placeholder="openid:seed_a" />
      <button class="ghost" @click="devLogin">开发登录</button>
      <view v-if="todo" class="todo">{{ todo }}</view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import { request } from '../../api/http'
import { getApiBase, setApiBase, setToken, setUserId } from '../../config'

const apiBase = ref('')
const code = ref('openid:seed_a')
const error = ref('')
const todo = ref('')

onShow(() => {
  apiBase.value = getApiBase()
})

function saveBase() {
  setApiBase(apiBase.value)
  uni.showToast({ title: '已保存', icon: 'none' })
}

async function exchange(loginCode: string) {
  error.value = ''
  todo.value = ''
  const result = await request<{
    accessToken: string
    todo: string | null
    stub: boolean
    user: { id: string; studentVerified: boolean }
  }>('/auth/wechat/login', {
    method: 'POST',
    auth: false,
    data: { code: loginCode },
  })
  setToken(result.accessToken)
  setUserId(result.user.id)
  todo.value = result.todo || ''
  uni.redirectTo({ url: result.user.studentVerified ? '/pages/profile/index' : '/pages/verify/index' })
}

async function wechatLogin() {
  try {
    const login = await uni.login({ provider: 'weixin' })
    if (!login.code) throw new Error('微信没有返回 code')
    await exchange(login.code)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '微信登录失败，H5 请用开发登录'
  }
}

async function devLogin() {
  try {
    await exchange(code.value.trim())
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  }
}
</script>
