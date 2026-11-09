<template>
  <view class="page">
    <view class="h1">第 {{ index + 1 }} 题</view>
    <view class="lead">{{ current.title }}</view>
    <view class="todo" v-if="current.caption">{{ current.caption }}</view>

    <view class="card">
      <input v-if="current.kind === 'text'" class="field" v-model="displayName" :placeholder="current.placeholder" />

      <template v-else-if="current.kind === 'single'">
        <button
          v-for="option in current.options"
          :key="option.id"
          class="ghost"
          @click="pickSingle(option.id)"
        >
          {{ selectedSingle === option.id ? '已选 · ' : '' }}{{ option.label }}
        </button>
      </template>

      <template v-else-if="current.kind === 'multi'">
        <button v-for="option in current.options" :key="option.id" class="ghost" @click="toggleMulti(option.id)">
          {{ selectedMulti.includes(option.id) ? '已选 · ' : '' }}{{ option.label }}
        </button>
      </template>

      <template v-else-if="current.kind === 'branch' && branch">
        <button v-for="option in branch.styles" :key="option.id" class="ghost" @click="branchStyle = option.id">
          {{ branchStyle === option.id ? '已选 · ' : '' }}{{ option.label }}
        </button>
        <text class="label">{{ branch.detailLabel }}</text>
        <input class="field" v-model="branchDetail" />
        <button class="ghost" @click="next">跳过补充</button>
      </template>

      <button class="primary" :disabled="!canNext" @click="next">{{ last ? '提交' : '下一步' }}</button>
      <button v-if="index > 0" class="ghost" @click="index -= 1">返回上一题</button>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
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
interface Branch {
  hobby: string
  title: string
  styles: Option[]
  detailLabel: string
}

const schemaSteps = ref<Step[]>([])
const branches = ref<Record<string, Branch>>({})
const index = ref(0)
const displayName = ref('')
const answers = ref<Record<string, string>>({})
const interests = ref<string[]>([])
const slots = ref<string[]>([])
const branchStyle = ref('')
const branchDetail = ref('')
const error = ref('')

const flow = computed(() => {
  const steps: Array<Step & { kind: Step['kind'] | 'branch' }> = []
  for (const step of schemaSteps.value) {
    steps.push(step)
    if (step.id === 'interests') {
      const hobby = interests.value.find((item) => branches.value[item])
      if (hobby && branches.value[hobby]) steps.push({ id: 'branch', kind: 'branch', title: branches.value[hobby].title })
    }
  }
  return steps
})
const current = computed(() => flow.value[index.value] || { id: '', kind: 'text' as const, title: '加载中' })
const last = computed(() => index.value >= flow.value.length - 1)
const branch = computed(() => {
  const hobby = interests.value.find((item) => branches.value[item])
  return hobby ? branches.value[hobby] : null
})
const selectedSingle = computed(() => answers.value[current.value.id] || '')
const selectedMulti = computed(() => (current.value.id === 'interests' ? interests.value : slots.value))
const canNext = computed(() => {
  const step = current.value
  if (step.kind === 'text') return displayName.value.trim().length > 0
  if (step.kind === 'single') return Boolean(answers.value[step.id])
  if (step.kind === 'multi') return selectedMulti.value.length > 0
  if (step.kind === 'branch') return Boolean(branchStyle.value)
  return false
})

onShow(async () => {
  try {
    const result = await request<{ steps: Step[]; branches: Record<string, Branch> }>('/questionnaire', { auth: false })
    schemaSteps.value = result.steps
    branches.value = result.branches
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目加载失败'
  }
})

function pickSingle(id: string) {
  answers.value = { ...answers.value, [current.value.id]: id }
}

function toggleMulti(id: string) {
  const max = current.value.max || 5
  const list = current.value.id === 'interests' ? interests : slots
  if (list.value.includes(id)) {
    list.value = list.value.filter((item) => item !== id)
    return
  }
  if (list.value.length >= max) {
    error.value = `最多选 ${max} 个`
    return
  }
  error.value = ''
  list.value = [...list.value, id]
}

async function next() {
  if (!canNext.value) return
  error.value = ''
  if (!last.value) {
    index.value += 1
    return
  }
  const hobby = interests.value.find((item) => branches.value[item]) || ''
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
        branchStyle: branchStyle.value,
        branchDetail: branchDetail.value,
        slots: slots.value,
      },
    })
    uni.redirectTo({ url: '/pages/waiting/index' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  }
}
</script>
