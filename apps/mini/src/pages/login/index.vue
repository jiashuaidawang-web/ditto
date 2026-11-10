<template>
  <view class="stage">
    <view class="phone">
      <view class="topbar">
        <button class="icon" @click="back">‹</button>
        <view class="brand"><image class="avatar" src="/static/mkt/bird-avatar.png" mode="aspectFill" />不如见一面</view>
        <button class="icon" @click="lock">锁</button>
      </view>
      <view class="progress"><text class="on"></text><text></text><text></text></view>
      <view class="body">
        <text class="sender">不如见一面</text>
        <view class="bubble">你的<text class="em">邮箱</text>是？📧</view>
      </view>
      <view class="footer">
        <text class="hint">为了不丢账号，先验证邮箱</text>
        <view class="row">
          <view class="input-bar">
            <input v-model="email" type="text" placeholder="you@email.com" confirm-type="next" @confirm="next" />
          </view>
          <button class="cta" :disabled="!valid" @click="next">→</button>
        </view>
        <text v-if="error" class="err">{{ error }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { request } from '../../api/http'

const email = ref('')
const error = ref('')
const valid = computed(() => email.value.includes('@') && email.value.includes('.'))

function back() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/welcome/index' }) })
}
function lock() {
  uni.showToast({ title: '只用于登录，不会公开', icon: 'none' })
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
.stage {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: linear-gradient(180deg, rgba(20, 40, 80, 0.15), rgba(10, 30, 60, 0.2)), url('/static/mkt/login-landscape.png') center / cover no-repeat;
}
.phone {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  flex-direction: column;
  color: #fff;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 18%), linear-gradient(180deg, #2f62bb 0%, #1e4f9e 42%, #003d72 100%);
}
.topbar { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; padding: 14px 14px 6px; }
.icon { margin: 0; padding: 0; border: none; background: transparent; color: #fff; font-size: 22px; }
.brand { justify-self: center; display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px 5px 6px; border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 999px; background: rgba(20, 50, 110, 0.35); }
.avatar { width: 26px; height: 26px; border-radius: 50%; }
.progress { display: flex; gap: 6px; padding: 4px 22px 10px; }
.progress text { flex: 1; height: 3px; border-radius: 2px; background: rgba(255, 255, 255, 0.28); }
.progress .on { background: #fff; }
.body { flex: 1; padding: 8px 18px 140px; }
.sender { display: block; margin: 4px 0 6px 6px; color: rgba(255, 255, 255, 0.72); font-size: 12px; }
.bubble { display: inline-block; padding: 14px 18px; border-radius: 18px 18px 18px 6px; background: #fff; color: #1a2744; font-size: 18px; }
.em { font-weight: 800; }
.footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 14px 18px 22px; }
.hint { display: block; margin: 0 8px 8px; color: rgba(255, 255, 255, 0.62); font-size: 12px; text-align: center; }
.row { display: flex; align-items: center; gap: 10px; }
.input-bar { flex: 1; min-height: 52px; padding: 0 18px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; background: rgba(8, 28, 68, 0.55); }
.input-bar input { height: 52px; color: #fff; font-size: 16px; }
.cta { width: 56px; height: 56px; margin: 0; border: none; border-radius: 50%; background: #fff; color: #0b1f44; font-size: 24px; }
.cta[disabled] { background: rgba(180, 198, 220, 0.35); color: rgba(255, 255, 255, 0.7); }
.err { display: block; margin-top: 8px; color: #fff; font-size: 12px; text-align: center; }
</style>
