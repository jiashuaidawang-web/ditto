<template>
  <view class="page">
    <view class="h1">不如见一面</view>
    <view class="lead">房山大学城，每周一次同校见面。手机号或邮箱验证码登录。</view>

    <view class="card">
      <text class="label">API 地址</text>
      <input class="field" v-model="apiBase" placeholder="http://localhost:3000" />
      <button class="ghost" @click="saveBase">保存地址</button>

      <view class="nav">
        <text class="nav-link" @click="channel = 'sms'">手机号</text>
        <text class="nav-link" @click="channel = 'email'">邮箱</text>
      </view>
      <text class="label">{{ channel === 'sms' ? '手机号' : '邮箱' }}</text>
      <input class="field" v-model="target" :placeholder="channel === 'sms' ? '13800001001' : 'linxia@demo.aiditto.cn'" />
      <button class="primary" @click="sendCode">获取验证码</button>
      <view v-if="devCode" class="todo">开发环境验证码 {{ devCode }}。短信 stub 不会显示已送达。</view>

      <text class="label">验证码</text>
      <input class="field" v-model="code" placeholder="6 位数字" />
      <button class="primary" @click="verify">登录</button>
      <view v-if="error" class="error">{{ error }}</view>
    </view>

    <view class="card">
      <view class="lead">微信登录留在代码里，不进周五演示。</view>
      <input class="field" v-model="wechatCode" placeholder="openid:..." />
      <button class="ghost" @click="wechatLogin">微信 stub 登录</button>
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
const channel = ref<'sms' | 'email'>('sms')
const target = ref('13800001001')
const code = ref('')
const devCode = ref('')
const wechatCode = ref('')
const error = ref('')

onShow(() => {
  apiBase.value = getApiBase()
})

function saveBase() {
  setApiBase(apiBase.value)
  uni.showToast({ title: '已保存', icon: 'none' })
}

async function goNext(userId: string) {
  setUserId(userId)
  const me = await request<{ schoolId: string | null; questionnaireComplete: boolean }>('/auth/me')
  if (!me.schoolId) {
    uni.redirectTo({ url: '/pages/school/index' })
    return
  }
  if (!me.questionnaireComplete) {
    uni.redirectTo({ url: '/pages/questionnaire/index' })
    return
  }
  uni.redirectTo({ url: '/pages/waiting/index' })
}

async function sendCode() {
  error.value = ''
  devCode.value = ''
  try {
    const result = await request<{ devCode?: string; accepted: boolean; stub: boolean; message?: string }>('/otp/send', {
      method: 'POST',
      auth: false,
      data: { channel: channel.value, target: target.value.trim() },
    })
    devCode.value = result.devCode || ''
    if (!result.accepted) {
      uni.showToast({ title: result.stub ? '验证码已记在日志里' : '短信未发出', icon: 'none' })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '发送失败'
  }
}

async function verify() {
  error.value = ''
  try {
    const result = await request<{ accessToken: string; user: { id: string } }>('/otp/verify', {
      method: 'POST',
      auth: false,
      data: { channel: channel.value, target: target.value.trim(), code: code.value.trim() },
    })
    setToken(result.accessToken)
    await goNext(result.user.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  }
}

async function wechatLogin() {
  error.value = ''
  try {
    const result = await request<{ accessToken: string; user: { id: string } }>('/auth/wechat/login', {
      method: 'POST',
      auth: false,
      data: { code: wechatCode.value.trim() || 'dev-user' },
    })
    setToken(result.accessToken)
    await goNext(result.user.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '微信登录失败'
  }
}
</script>
