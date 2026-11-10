<template>
  <view class="stage">
    <view class="phone">
      <view class="topbar">
        <button class="icon" @click="back">‹</button>
        <view class="brand"><image class="avatar" src="/static/mkt/bird-avatar.png" mode="aspectFill" />不如见一面</view>
        <button class="icon" @click="lock">锁</button>
      </view>
      <view class="progress"><text class="on"></text><text class="on"></text><text></text></view>
      <view class="body">
        <text class="sender">不如见一面</text>
        <view class="bubble">来验证一下这个邮箱 📬</view>
        <view class="bubble sm">我们发了 6 位验证码，填在下面</view>
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
        <text v-if="error" class="err">{{ error }}</text>
      </view>
      <view class="footer">
        <button class="cta" :disabled="code.length !== 6" @click="submit">→</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { request } from '../../api/http'
import { setToken, setUserId } from '../../config'
import { claimSession } from '../../track'

const digits = ref(['', '', '', '', '', ''])
const error = ref('')
const code = computed(() => digits.value.join(''))

function back() {
  uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/login/index' }) })
}
function lock() {
  uni.showToast({ title: '只用于登录，不会公开', icon: 'none' })
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
.body { flex: 1; padding: 8px 18px 96px; }
.sender { display: block; margin: 4px 0 6px 6px; color: rgba(255, 255, 255, 0.72); font-size: 12px; }
.bubble { display: inline-block; margin-bottom: 10px; padding: 14px 18px; border-radius: 18px 18px 18px 6px; background: #fff; color: #1a2744; font-size: 18px; }
.bubble.sm { font-size: 16px; }
.otp { display: flex; gap: 10px; margin-top: 22px; }
.dot {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  background: rgba(8, 28, 68, 0.55);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}
.footer { position: absolute; right: 0; bottom: 0; left: 0; display: flex; justify-content: flex-end; padding: 14px 18px 22px; }
.cta { width: 56px; height: 56px; margin: 0; border: none; border-radius: 50%; background: #fff; color: #0b1f44; font-size: 24px; }
.cta[disabled] { background: rgba(180, 198, 220, 0.35); color: rgba(255, 255, 255, 0.7); }
.err { display: block; margin-top: 12px; font-size: 12px; }
</style>
