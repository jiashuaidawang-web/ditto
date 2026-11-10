<template>
  <view class="page">
    <view class="h1">资料与空闲</view>
    <view class="lead">同校优先，年级差不超过 2。空闲时段用来建议见面时间。</view>

    <view class="card">
      <text class="label">怎么称呼</text>
      <input class="field" v-model="displayName" />
      <text class="label">学校 id（匹配用，例如 fudan）</text>
      <input class="field" v-model="schoolId" />
      <text class="label">学校名称</text>
      <input class="field" v-model="schoolName" />
      <text class="label">年级序号 1-8</text>
      <input class="field" type="number" v-model="grade" />
      <text class="label">专业</text>
      <input class="field" v-model="major" />
      <text class="label">一句话</text>
      <input class="field" v-model="bio" />
      <text class="label">想认识的人 / 兴趣（逗号分隔）</text>
      <input class="field" v-model="interests" />

      <text class="label">空闲（上海时间，再点一次取消）</text>
      <button class="ghost" @click="wed = !wed">{{ wed ? '已选' : '未选' }} 周三 19:00–21:00</button>
      <button class="ghost" @click="sat = !sat">{{ sat ? '已选' : '未选' }} 周六 14:00–17:00</button>
      <button class="ghost" @click="sun = !sun">{{ sun ? '已选' : '未选' }} 周日 14:00–17:00</button>

      <button class="primary" @click="save">保存</button>
      <view v-if="message" class="todo">{{ message }}</view>
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

const displayName = ref('')
const schoolId = ref('cnu_liangxiang')
const schoolName = ref('')
const grade = ref('2')
const major = ref('')
const bio = ref('')
const interests = ref('')
const wed = ref(true)
const sat = ref(true)
const sun = ref(false)
const message = ref('')
const error = ref('')

onShow(async () => {
  try {
    const profile = await request<{
      displayName?: string
      schoolId?: string
      schoolName?: string
      grade?: number
      major?: string
      bio?: string
      preferences?: { interests?: string[] }
    } | null>('/profiles/me')
    if (profile) {
      displayName.value = profile.displayName || ''
      schoolId.value = profile.schoolId || ''
      schoolName.value = profile.schoolName || ''
      grade.value = profile.grade ? String(profile.grade) : ''
      major.value = profile.major || ''
      bio.value = profile.bio || ''
      interests.value = (profile.preferences?.interests || []).join('，')
    }
    const slots = await request<Array<{ weekday: number }>>('/availability')
    wed.value = slots.some((slot) => slot.weekday === 3)
    sat.value = slots.some((slot) => slot.weekday === 6)
    sun.value = slots.some((slot) => slot.weekday === 7)
  } catch {
    // stay on the empty form when the profile does not exist yet
  }
})

async function save() {
  error.value = ''
  message.value = ''
  const slots = []
  if (wed.value) slots.push({ weekday: 3, startMin: 19 * 60, endMin: 21 * 60 })
  if (sat.value) slots.push({ weekday: 6, startMin: 14 * 60, endMin: 17 * 60 })
  if (sun.value) slots.push({ weekday: 7, startMin: 14 * 60, endMin: 17 * 60 })
  try {
    await request('/profiles/me', {
      method: 'PUT',
      data: {
        displayName: displayName.value.trim(),
        schoolId: schoolId.value.trim(),
        schoolName: schoolName.value.trim(),
        grade: Number(grade.value),
        major: major.value.trim(),
        bio: bio.value.trim(),
        preferences: {
          intent: 'friends',
          interests: interests.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
          pace: 'slow',
        },
      },
    })
    await request('/availability', { method: 'PUT', data: { slots } })
    message.value = '已保存资料和空闲时段。'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  }
}
</script>
