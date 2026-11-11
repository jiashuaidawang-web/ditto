<template>
  <view class="phone">
    <view class="q-top">
      <button class="q-back" @click="back">←</button>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <button class="q-lock" @click="lock">锁</button>
    </view>
    <view class="progress-segs">
      <view class="progress-seg fill"></view>
      <view class="progress-seg partial"></view>
      <view class="progress-seg"></view>
    </view>
    <view class="q-body">
      <view class="q-title">来验证一下这个<text class="em">邮箱</text></view>
      <view class="q-caption">我们发了 6 位验证码，填在下面</view>
      <view class="q-lockline">{{ LOCK_LINE }}</view>
      <view class="otp">
        <input
          v-for="(_, i) in digits"
          :key="i"
          class="dot"
          maxlength="1"
          type="number"
          :value="digits[i]"
          @input="onInput(i, $event)"
        />
      </view>
      <text v-if="error" class="error">{{ error }}</text>
    </view>
    <view class="bottom-cta">
      <button class="btn-fab" :disabled="code.length !== 6" @click="submit">→</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { setToken, setUserId } from '../../config'
import { LOCK_LINE } from '../../copy'
import { claimSession } from '../../track'

const digits = ref(['', '', '', '', '', ''])
const error = ref('')
const code = computed(() => digits.value.join(''))

function back() {
  uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/login/index' }) })
}
function lock() {
  uni.showToast({ title: LOCK_LINE, icon: 'none' })
}
function onInput(index: number, event: { detail?: { value?: string } }) {
  const raw = String(event.detail?.value || '').replace(/\D/g, '').slice(-1)
  const next = [...digits.value]
  next[index] = raw
  digits.value = next
}
async function submit() {
  if (code.value.length !== 6) return
  error.value = ''
  const target = String(uni.getStorageSync('loginEmail') || '')
  try {
    const result = await request<{ accessToken: string; user: { id: string } }>('/otp/verify', {
      method: 'POST',
      auth: false,
      data: { channel: 'email', target, code: code.value },
    })
    setToken(result.accessToken)
    setUserId(result.user.id)
    await claimSession()
    const me = await request<{ schoolId: string | null; questionnaireComplete: boolean }>('/auth/me')
    if (!me.schoolId) {
      uni.redirectTo({ url: '/pages/school/index' })
      return
    }
    uni.redirectTo({ url: me.questionnaireComplete ? '/pages/waiting/index' : '/pages/questionnaire/index' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  }
}
</script>

<style scoped>
.otp {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.dot {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-track);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}
</style>
