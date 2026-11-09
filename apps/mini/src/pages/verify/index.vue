<template>
  <view class="page">
    <view class="h1">学生认证</view>
    <view class="lead">三条路任选一条。现在都是 stub，不会把账号标成已认证。</view>

    <view class="card">
      <text class="label">学信网在线验证码</text>
      <input class="field" v-model="chsiCode" placeholder="CHSI 验证码" />
      <button class="primary" @click="submitXuexin">提交学信网 stub</button>

      <text class="label">学生证照片（OCR 占位）</text>
      <input class="field" v-model="imageRef" placeholder="本地文件名或临时 URL" />
      <button class="ghost" @click="submitCard">提交学生证 stub</button>

      <text class="label">教育邮箱</text>
      <input class="field" v-model="email" placeholder="name@university.edu.cn" />
      <button class="ghost" @click="submitEmail">提交邮箱 stub</button>

      <view v-if="todo" class="todo">{{ todo }}</view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppNav from '../../components/AppNav.vue'
import { request } from '../../api/http'

const chsiCode = ref('')
const imageRef = ref('')
const email = ref('')
const todo = ref('')
const error = ref('')

async function run(path: string, data: Record<string, string>) {
  error.value = ''
  todo.value = ''
  try {
    const result = await request<{ todo: string; verified: boolean }>(path, { method: 'POST', data })
    todo.value = `${result.todo}\nverified=${result.verified}`
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  }
}

function submitXuexin() {
  return run('/student-verify/xuexin', { chsiCode: chsiCode.value.trim() })
}
function submitCard() {
  return run('/student-verify/student-card', { imageRef: imageRef.value.trim() })
}
function submitEmail() {
  return run('/student-verify/edu-email', { email: email.value.trim() })
}
</script>
