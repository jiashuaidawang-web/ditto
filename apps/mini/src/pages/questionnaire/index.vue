<template>
  <view class="page quiz">
    <view class="caption">第 {{ index + 1 }} 步</view>
    <view class="progress"><view class="progress-fill" :style="{ width: progress }"></view></view>
    <view class="h2">{{ current.title }}</view>
    <view class="lead" v-if="current.caption">{{ current.caption }}</view>

    <view v-if="loading" class="skeleton"></view>
    <view v-else-if="current.kind === 'text'">
      <input class="field" v-model="displayName" :placeholder="current.placeholder || ''" />
    </view>
    <view v-else-if="current.kind === 'single' || current.kind === 'multi'">
      <button
        v-for="option in current.options || []"
        :key="option.id"
        class="option"
        :class="{ on: isOn(option.id) }"
        @click="choose(option.id)"
      >
        <text>{{ option.label }}</text>
        <text v-if="isOn(option.id)">✓</text>
      </button>
    </view>
    <view v-else class="branch-hold">
      <view class="skeleton"></view>
      <view class="skeleton short"></view>
      <view class="lead">分支内容待补</view>
    </view>

    <view class="bottom-cta">
      <view v-if="error" class="error">{{ error }}</view>
      <button class="primary" :disabled="!canNext || submitting" @click="next">
        {{ submitting ? '提交中' : last ? '提交' : '下一步' }}
      </button>
      <button v-if="index > 0" class="ghost" @click="back">返回上一题</button>
    </view>
    <view v-if="toast" class="toast">{{ toast }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '../../api/http'

interface Option {
  id: string
  label: string
}
interface Step {
  id: string
  kind: 'text' | 'single' | 'multi'
  title: string
  caption?: string
  placeholder?: string
  max?: number
  options?: Option[]
}
interface BranchHold {
  hobby: string
  pending: true
  note: string
}

const schemaSteps = ref<Step[]>([])
const branches = ref<Record<string, BranchHold>>({})
const index = ref(0)
const loading = ref(true)
const submitting = ref(false)
const displayName = ref('')
const answers = ref<Record<string, string>>({})
const interests = ref<string[]>([])
const slots = ref<string[]>([])
const error = ref('')
const toast = ref('')

const flow = computed(() => {
  const steps: Array<Step | { id: 'branch'; kind: 'branch'; title: string }> = []
  for (const step of schemaSteps.value) {
    steps.push(step)
    if (step.id === 'interests' && interests.value.some((item) => branches.value[item])) {
      steps.push({ id: 'branch', kind: 'branch', title: '兴趣分支' })
    }
  }
  return steps
})
const current = computed(() => flow.value[index.value] || { id: '', kind: 'text' as const, title: '题目加载中' })
const last = computed(() => flow.value.length > 0 && index.value >= flow.value.length - 1)
const progress = computed(() => `${flow.value.length ? ((index.value + 1) / flow.value.length) * 100 : 0}%`)
const canNext = computed(() => {
  const step = current.value
  if (step.kind === 'text') return displayName.value.trim().length > 0
  if (step.kind === 'single') return Boolean(answers.value[step.id])
  if (step.kind === 'multi') return (step.id === 'interests' ? interests.value : slots.value).length > 0
  return step.kind === 'branch'
})

onShow(async () => {
  loading.value = true
  try {
    const result = await request<{ steps: Step[]; branches: Record<string, BranchHold> }>('/questionnaire', { auth: false })
    schemaSteps.value = result.steps
    branches.value = result.branches
  } catch (err) {
    error.value = err instanceof Error ? err.message : '网络不太稳，点一下重试'
  } finally {
    loading.value = false
  }
})

function isOn(id: string) {
  if (current.value.kind === 'single') return answers.value[current.value.id] === id
  const list = current.value.id === 'interests' ? interests.value : slots.value
  return list.includes(id)
}

function choose(id: string) {
  error.value = ''
  if (current.value.kind === 'single') {
    answers.value = { ...answers.value, [current.value.id]: id }
    return
  }
  const max = current.value.kind === 'multi' ? current.value.max || 5 : 5
  const list = current.value.id === 'interests' ? interests : slots
  if (list.value.includes(id)) {
    list.value = list.value.filter((item) => item !== id)
    return
  }
  if (list.value.length >= max) {
    showToast(`最多选 ${max} 个`)
    return
  }
  list.value = [...list.value, id]
}

function back() {
  if (index.value > 0) index.value -= 1
}

async function next() {
  if (!canNext.value || submitting.value) return
  error.value = ''
  if (!last.value) {
    index.value += 1
    return
  }
  const hobby = interests.value.find((item) => branches.value[item]) || ''
  submitting.value = true
  try {
    await request('/questionnaire', {
      method: 'POST',
      data: {
        displayName: displayName.value.trim(),
        gender: answers.value.gender,
        lookingFor: answers.value.lookingFor,
        grade: Number(answers.value.grade),
        intent: answers.value.intent,
        interests: interests.value,
        branchHobby: hobby,
        slots: slots.value,
      },
    })
    uni.redirectTo({ url: '/pages/waiting/index' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
    showToast('提交失败，已保留答案')
  } finally {
    submitting.value = false
  }
}

function showToast(text: string) {
  toast.value = text
  setTimeout(() => {
    if (toast.value === text) toast.value = ''
  }, 2000)
}
</script>

<style scoped>
.quiz {
  padding-bottom: 180px;
}

.caption {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.branch-hold .short {
  width: 60%;
}
</style>
