<template>
  <view class="phone">
    <view class="q-top">
      <button class="q-back" @click="goBack">←</button>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <button class="q-lock" @click="showLock">锁</button>
    </view>
    <view class="progress-segs">
      <view class="progress-seg" :class="segClass(1)"></view>
      <view class="progress-seg" :class="segClass(2)"></view>
      <view class="progress-seg" :class="segClass(3)"></view>
      <view class="progress-seg" :class="segClass(4)"></view>
    </view>

    <view class="q-body">
      <view class="bubble-label">不如见一面</view>
      <view class="bubble" v-if="current.id === 'interests'">你有哪些<text class="em">爱好和兴趣</text>？</view>
      <view class="bubble" v-else-if="current.id === 'availability'">这周你<text class="em">什么时候方便见面</text>？</view>
      <view class="bubble" v-else-if="current.kind === 'specialty'">{{ current.title }}</view>
      <view class="bubble" v-else>{{ current.title }}</view>
      <view class="bubble-hint" v-if="'caption' in current && current.caption">{{ current.caption }}</view>
      <view class="privacy" v-if="'privacy' in current && current.privacy">🔒 {{ current.privacy }}</view>

      <view v-if="loading" class="skeleton"></view>
      <input v-else-if="current.kind === 'text' && current.id === 'displayName'" class="field" v-model="displayName" :placeholder="textPlaceholder" />
      <input v-else-if="current.kind === 'text'" class="field" v-model="texts[current.id]" :placeholder="current.placeholder || ''" />

      <view v-else-if="current.kind === 'single' || (current.kind === 'multi' && current.id !== 'availability')" class="chip-list">
        <button
          v-for="option in current.options || []"
          :key="option.id"
          class="chip"
          :class="{ selected: isOn(option.id), wide: current.wide }"
          @click="choose(option.id)"
        >
          <text v-if="option.emoji" class="emoji">{{ option.emoji }}</text>
          <text class="chip-label">{{ option.label }}</text>
          <text class="check">✓</text>
        </button>
      </view>

      <view v-else-if="current.kind === 'date'" class="slider-card">
        <input class="field" type="date" v-model="birthday" />
      </view>
      <view v-else-if="current.kind === 'number'" class="slider-card">
        <input class="field" type="number" v-model="heightCm" placeholder="172" />
        <view class="bubble-hint">厘米</view>
      </view>
      <view v-else-if="current.kind === 'range'" class="slider-card">
        <input class="field" type="number" v-model="ageMin" placeholder="最小年龄" />
        <input class="field" type="number" v-model="ageMax" placeholder="最大年龄" />
      </view>
      <view v-else-if="current.kind === 'school'" class="chip-list">
        <button
          v-for="school in schools"
          :key="school.id"
          class="chip wide"
          :class="{ selected: answers.school === school.id }"
          @click="chooseSchool(school.id)"
        >
          <text class="chip-label">{{ school.cardName || school.name }}</text>
          <text class="check">✓</text>
        </button>
      </view>
      <view v-else-if="current.kind === 'interstitial'" class="illustration">📒</view>
      <view v-else-if="current.kind === 'email'">
        <input class="field" v-model="email" placeholder="you@email.com" />
      </view>
      <view v-else-if="current.kind === 'otp'">
        <input class="field" v-model="otpCode" placeholder="6 位验证码" />
      </view>
      <view v-else-if="current.kind === 'photos'" class="photo-grid">
        <view class="photo-slot">＋</view>
        <view class="photo-slot filled">📷</view>
        <view class="photo-slot filled">🌆</view>
      </view>
      <view v-else-if="current.kind === 'rank'" class="chip-list">
        <button
          v-for="(hobby, rank) in rankList"
          :key="hobby"
          class="chip wide"
          @click="promoteRank(rank)"
        >
          <text class="emoji">{{ rank + 1 }}</text>
          <text class="chip-label">{{ hobbyLabel(hobby) }}</text>
        </button>
      </view>

      <view v-else-if="current.id === 'availability'" class="slot-grid">
        <button
          v-for="option in current.options || []"
          :key="option.id"
          class="chip"
          :class="{ selected: isOn(option.id) }"
          @click="choose(option.id)"
        >
          <text class="chip-label">{{ option.label }}</text>
          <text v-if="option.time" class="slot-time">{{ option.time }}</text>
          <text class="check">✓</text>
        </button>
      </view>

      <view v-else-if="current.kind === 'interests'">
        <view class="chip-list">
          <button
            v-for="option in current.options || []"
            :key="option.id"
            class="chip"
            :class="{ selected: interestOrder.includes(option.id) }"
            @click="toggleHobby(option.id)"
          >
            <text class="emoji">{{ option.emoji }}</text>
            <text class="chip-label">{{ option.label }}</text>
            <text class="check">✓</text>
          </button>
          <button
            v-for="custom in customHobbies"
            :key="custom"
            class="chip selected"
            @click="removeInterest(custom)"
          >
            <text class="emoji">✨</text>
            <text class="chip-label">{{ customLabel(custom) }}</text>
            <text class="check">✓</text>
          </button>
        </view>
        <view class="custom-row">
          <text>✎</text>
          <input class="field" v-model="customDraft" maxlength="20" placeholder="写一个爱好" />
          <button class="add-btn" @click="addCustom">添加</button>
        </view>
      </view>

      <view v-else-if="current.kind === 'specialty'">
        <view class="chip-list">
          <button
            v-for="option in current.options"
            :key="option.id"
            class="chip"
            :class="{ selected: specialtyOn(current.hobby, option.id), other: option.id === 'other' }"
            @click="toggleSpecialty(current.hobby, option.id)"
          >
            <text class="emoji">{{ option.emoji }}</text>
            <text class="chip-label">{{ specialtyLabel(current.hobby, option) }}</text>
            <text v-if="option.id !== 'other'" class="check">✓</text>
          </button>
        </view>
        <view v-if="editingOther" class="other-panel">
          <input class="field" v-model="otherDraft" maxlength="24" placeholder="写一下你的说法" />
          <view class="other-actions">
            <button class="btn-secondary" @click="editingOther = false">取消</button>
            <button class="btn-primary" @click="confirmOther(current.hobby)">确认</button>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-cta" :class="{ stack: current.id === 'availability' }">
      <button
        v-if="current.id === 'availability'"
        class="btn-primary"
        :disabled="!canNext || submitting"
        @click="next"
      >
        {{ submitting ? '提交中…' : '提交档案' }}
      </button>
      <button v-else class="btn-fab" :disabled="!canNext || submitting" @click="next">→</button>
    </view>
    <view v-if="toast" class="toast">{{ toast }}</view>
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'

interface Option {
  id: string
  label: string
  emoji?: string
}
interface Step {
  id: string
  kind: 'text' | 'single' | 'multi' | 'interests' | 'date' | 'number' | 'range' | 'school' | 'interstitial' | 'email' | 'otp' | 'photos' | 'rank'
  title: string
  caption?: string
  privacy?: string
  placeholder?: string
  illustration?: string
  wide?: boolean
  max?: number
  customLabel?: string
  options?: Array<Option & { time?: string }>
}
interface Specialty {
  hobby: string
  title: string
  options: Option[]
}
interface SpecialtyStep {
  id: string
  kind: 'specialty'
  hobby: string
  title: string
  options: Option[]
}

const schemaSteps = ref<Step[]>([])
const specialties = ref<Record<string, Specialty>>({})
const index = ref(0)
const loading = ref(true)
const submitting = ref(false)
const displayName = ref('')
const answers = ref<Record<string, string>>({})
const interestOrder = ref<string[]>([])
const picks = ref<Record<string, string[]>>({})
const slots = ref<string[]>([])
const texts = ref<Record<string, string>>({})
const birthday = ref('')
const heightCm = ref('172')
const ageMin = ref('20')
const ageMax = ref('28')
const email = ref('')
const otpCode = ref('')
const schools = ref<Array<{ id: string; name: string; cardName?: string }>>([])
const multiBags = ref<Record<string, string[]>>({})
const rankOrder = ref<string[]>([])
const customDraft = ref('')
const otherDraft = ref('')
const editingOther = ref(false)
const error = ref('')
const toast = ref('')

const flow = computed(() => {
  const steps: Array<Step | SpecialtyStep> = []
  for (const step of schemaSteps.value) {
    if (step.id === 'availability') {
      for (const id of interestOrder.value) {
        if (id.startsWith('custom:')) continue
        const card = specialties.value[id]
        if (!card) continue
        steps.push({ id: `specialty:${id}`, kind: 'specialty', hobby: id, title: card.title, options: card.options })
      }
    }
    steps.push(step)
  }
  return steps
})

const current = computed(() => flow.value[Math.min(index.value, Math.max(flow.value.length - 1, 0))] || {
  id: '',
  kind: 'text' as const,
  title: '题目加载中',
})
const last = computed(() => flow.value.length > 0 && index.value >= flow.value.length - 1)
const progress = computed(() => `${flow.value.length ? ((Math.min(index.value, flow.value.length - 1) + 1) / flow.value.length) * 100 : 0}%`)
const customHobbies = computed(() => interestOrder.value.filter((id) => id.startsWith('custom:')))
const textPlaceholder = computed(() => (current.value.kind === 'text' ? current.value.placeholder || '' : ''))

const phase = computed(() => {
  const step = current.value
  if (step.kind === 'specialty' || step.id === 'interests') return 'interest'
  if (step.id === 'availability') return 'slots'
  return 'basics'
})

function segClass(part: number) {
  const id = current.value.id
  const late = ['school', 'prefsIntro', 'email', 'emailOtp', 'work', 'education', 'attribution', 'opener', 'dealbreakers', 'intent', 'matchPace', 'budget', 'eduImportance', 'photos', 'hobbyRanking']
  const prefs = ['ethnicity', 'ethnicityPrefs', 'ageRange', 'height', 'heightMatch']
  let cursor = 1
  if (current.value.kind === 'specialty' || id === 'interests' || id === 'availability') cursor = 2
  if (prefs.includes(id)) cursor = 3
  if (late.includes(id)) cursor = 4
  if (part < cursor) return 'fill'
  if (part === cursor) return 'partial'
  return ''
}

const canNext = computed(() => {
  const step = current.value
  if (step.kind === 'text' && step.id === 'displayName') return displayName.value.trim().length > 0
  if (step.kind === 'text') return (texts.value[step.id] || '').trim().length > 0
  if (step.kind === 'single') return Boolean(answers.value[step.id])
  if (step.kind === 'multi' && step.id === 'availability') return slots.value.length > 0
  if (step.kind === 'multi') return (multiBags.value[step.id] || []).length > 0
  if (step.kind === 'date') return Boolean(birthday.value)
  if (step.kind === 'number') return Number(heightCm.value) > 0
  if (step.kind === 'range') return Number(ageMin.value) > 0 && Number(ageMax.value) >= Number(ageMin.value)
  if (step.kind === 'school') return Boolean(answers.value.school)
  if (step.kind === 'email') return email.value.includes('@')
  if (step.kind === 'otp') return otpCode.value.trim().length >= 4
  if (step.kind === 'interstitial' || step.kind === 'photos' || step.kind === 'rank') return true
  if (step.kind === 'interests') return interestOrder.value.length > 0
  if (step.kind === 'specialty') return (picks.value[step.hobby] || []).length > 0
  return false
})

onShow(async () => {
  loading.value = true
  try {
    const result = await request<{ steps: Step[]; specialties: Record<string, Specialty> }>('/questionnaire', { auth: false })
    schemaSteps.value = result.steps
    specialties.value = result.specialties
    const schoolList = await request<{ schools: Array<{ id: string; name: string; cardName?: string }> }>('/schools', { auth: false })
    schools.value = schoolList.schools
  } catch (err) {
    error.value = err instanceof Error ? err.message : '网络不太稳，点一下重试'
  } finally {
    loading.value = false
  }
})

function isOn(id: string) {
  if (current.value.kind === 'single') return answers.value[current.value.id] === id
  if (current.value.id === 'availability') return slots.value.includes(id)
  return (multiBags.value[current.value.id] || []).includes(id)
}

function choose(id: string) {
  error.value = ''
  const step = current.value
  if (step.kind === 'single') {
    answers.value = { ...answers.value, [step.id]: id }
    return
  }
  if (step.kind !== 'multi') return
  const bag = step.id === 'availability' ? slots : { value: multiBags.value[step.id] || [] }
  if (step.id === 'availability') {
    if (slots.value.includes(id)) slots.value = slots.value.filter((item) => item !== id)
    else slots.value = [...slots.value, id]
    return
  }
  const currentBag = multiBags.value[step.id] || []
  multiBags.value = {
    ...multiBags.value,
    [step.id]: currentBag.includes(id) ? currentBag.filter((item) => item !== id) : [...currentBag, id],
  }
  void bag
}

function toggleHobby(id: string) {
  error.value = ''
  if (interestOrder.value.includes(id)) {
    interestOrder.value = interestOrder.value.filter((item) => item !== id)
    const next = { ...picks.value }
    delete next[id]
    picks.value = next
    clamp()
    return
  }
  interestOrder.value = [...interestOrder.value, id]
}

function addCustom() {
  const text = customDraft.value.trim()
  if (!text) return
  const id = `custom:${text}`
  if (!interestOrder.value.includes(id)) interestOrder.value = [...interestOrder.value, id]
  customDraft.value = ''
}

function removeInterest(id: string) {
  interestOrder.value = interestOrder.value.filter((item) => item !== id)
  clamp()
}

function customLabel(id: string) {
  return id.slice('custom:'.length)
}

function specialtyOn(hobby: string, optionId: string) {
  const selected = picks.value[hobby] || []
  if (optionId === 'other') return selected.some((item) => item.startsWith('other:'))
  return selected.includes(optionId)
}

function specialtyLabel(hobby: string, option: Option) {
  if (option.id !== 'other') return option.label
  const custom = (picks.value[hobby] || []).find((item) => item.startsWith('other:'))
  return custom ? `其他 · ${custom.slice('other:'.length)}` : option.label
}

function toggleSpecialty(hobby: string, optionId: string) {
  error.value = ''
  if (optionId === 'other') {
    editingOther.value = true
    const existing = (picks.value[hobby] || []).find((item) => item.startsWith('other:'))
    otherDraft.value = existing ? existing.slice('other:'.length) : ''
    return
  }
  const selected = picks.value[hobby] || []
  picks.value = {
    ...picks.value,
    [hobby]: selected.includes(optionId) ? selected.filter((item) => item !== optionId) : [...selected, optionId],
  }
}

function confirmOther(hobby: string) {
  const text = otherDraft.value.trim()
  if (!text) {
    showToast('先写几个字')
    return
  }
  const selected = (picks.value[hobby] || []).filter((item) => !item.startsWith('other:'))
  picks.value = { ...picks.value, [hobby]: [...selected, `other:${text}`] }
  editingOther.value = false
}

function showLock() {
  showToast('这些回答只用于匹配，不会公开联系方式')
}

function goBack() {
  editingOther.value = false
  if (index.value > 0) {
    index.value -= 1
    return
  }
  uni.redirectTo({ url: '/pages/school/index' })
}

function clamp() {
  if (index.value > flow.value.length - 1) index.value = Math.max(0, flow.value.length - 1)
}

const rankList = computed(() => {
  const base = interestOrder.value.filter((id) => !id.startsWith('custom:'))
  const ordered = rankOrder.value.filter((id) => base.includes(id))
  return [...ordered, ...base.filter((id) => !ordered.includes(id))]
})

function hobbyLabel(id: string) {
  const step = schemaSteps.value.find((item) => item.id === 'interests')
  return step?.options?.find((option) => option.id === id)?.label || id
}

function promoteRank(rank: number) {
  const list = [...rankList.value]
  if (rank <= 0) return
  const [item] = list.splice(rank, 1)
  list.splice(rank - 1, 0, item)
  rankOrder.value = list
}

async function chooseSchool(id: string) {
  answers.value = { ...answers.value, school: id }
  try {
    await request('/me/school', { method: 'PUT', data: { schoolId: id } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学校保存失败'
  }
}

async function sendEmailCode() {
  const result = await request<{ devCode?: string; accepted: boolean }>('/otp/send', {
    method: 'POST',
    auth: false,
    data: { channel: 'email', target: email.value.trim() },
  })
  if (result.devCode) showToast(`开发验证码 ${result.devCode}`)
  else if (!result.accepted) showToast('验证码只记在日志里，尚未送达')
}

async function next() {
  if (!canNext.value || submitting.value) return
  error.value = ''
  editingOther.value = false
  if (current.value.id === 'email' && !last.value) {
    try {
      await sendEmailCode()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发码失败'
      return
    }
  }
  if (!last.value) {
    index.value += 1
    return
  }
  submitting.value = true
  const specialtiesPayload: Record<string, string[]> = {}
  for (const id of interestOrder.value) {
    if (!id.startsWith('custom:') && picks.value[id]?.length) specialtiesPayload[id] = picks.value[id]
  }
  try {
    await request('/questionnaire', {
      method: 'POST',
      data: {
        displayName: displayName.value.trim(),
        gender: answers.value.gender,
        lookingFor: answers.value.lookingFor,
        grade: Number(answers.value.grade),
        intent: answers.value.intent || 'unsure',
        interests: interestOrder.value,
        specialties: specialtiesPayload,
        slots: slots.value,
        extras: {
          student: answers.value.student,
          birthday: birthday.value,
          ageMin: Number(ageMin.value),
          ageMax: Number(ageMax.value),
          heightCm: Number(heightCm.value),
          heightMatch: answers.value.heightMatch,
          ethnicity: multiBags.value.ethnicity || [],
          ethnicityPrefs: multiBags.value.ethnicityPrefs || [],
          email: email.value.trim(),
          emailCodeEntered: otpCode.value.trim().length >= 4,
          work: texts.value.work || '',
          education: answers.value.education,
          attribution: answers.value.attribution,
          opener: texts.value.opener || '',
          dealbreakers: multiBags.value.dealbreakers || [],
          matchPace: answers.value.matchPace,
          budget: answers.value.budget,
          eduImportance: answers.value.eduImportance,
          photos: 'placeholder',
          hobbyRanking: rankList.value,
        },
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
.privacy {
  margin: 8px 0 14px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  text-align: center;
}
.illustration {
  margin-top: 12px;
  width: min(280px, 100%);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(160deg, #6ec8ff, #3aa0ef 40%, #7ec8ff);
  font-size: 96px;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.photo-slot {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.35);
  border-radius: 16px;
  background: rgba(12, 36, 82, 0.42);
  font-size: 28px;
}
.photo-slot.filled {
  border-style: solid;
  background: linear-gradient(160deg, #6ec8ff, #3aa0ef);
}
.error {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 88px;
}
</style>
