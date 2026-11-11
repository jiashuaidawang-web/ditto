<template>
  <view class="phone">
    <view class="q-top">
      <button class="q-back" @click="back">←</button>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <button class="q-lock" @click="lock">锁</button>
    </view>
    <view class="progress-segs">
      <view class="progress-seg partial"></view>
      <view class="progress-seg"></view>
      <view class="progress-seg"></view>
    </view>
    <view class="q-body">
      <view class="q-title">你的<text class="em">邮箱</text>是？</view>
      <view class="q-lockline">{{ LOCK_LINE }}</view>
      <input class="field" v-model="email" type="text" placeholder="you@email.com" confirm-type="next" @confirm="next" />
      <text class="lead hint">为了不丢账号，先验证邮箱</text>
      <text v-if="error" class="error">{{ error }}</text>
    </view>
    <view class="bottom-cta">
      <button class="btn-fab" :disabled="!valid" @click="next">→</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { LOCK_LINE } from '../../copy'

const email = ref('')
const error = ref('')
const valid = computed(() => email.value.includes('@') && email.value.includes('.'))

function back() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/welcome/index' }) })
}
function lock() {
  uni.showToast({ title: LOCK_LINE, icon: 'none' })
}
async function next() {
  if (!valid.value) return
  error.value = ''
  const target = email.value.trim()
  uni.setStorageSync('loginEmail', target)
  try {
    await request('/otp/send', { method: 'POST', auth: false, data: { channel: 'email', target } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '发码失败，仍可继续填写'
  }
  uni.navigateTo({ url: '/pages/login/otp' })
}
</script>

<style scoped>
.hint {
  display: block;
  margin-top: 12px;
  text-align: left;
}
</style>
