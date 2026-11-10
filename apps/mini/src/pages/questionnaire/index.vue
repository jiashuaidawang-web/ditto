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
      <view class="bubble" v-else-if="current.id === 'height'">你有多<text class="em">高</text>？</view>
      <view class="bubble" v-else-if="current.id === 'heightMatch'">你希望对方大概<text class="em">多高</text>？</view>
      <view class="bubble" v-else-if="current.kind === 'specialty'">{{ current.title }}</view>
      <view class="bubble" v-else>{{ current.title }}</view>
      <view class="bubble-hint" v-if="'caption' in current && current.caption && current.id !== 'height'">{{ current.caption }}</view>
      <view class="privacy" v-if="'privacy' in current && current.privacy">🔒 {{ current.privacy }}</view>

      <view v-if="loading" class="skeleton"></view>
      <view v-else-if="current.id === 'height' || current.id === 'heightMatch'" class="height-stage">
        <view class="height-spacer"></view>
        <view class="height-val">{{ heightLabel }}</view>
        <view class="ruler-clip" :class="{ dim: current.id === 'heightMatch' && heightDontCare }">
          <view class="ruler-track" :style="{ transform: `translateX(${trackShift}px)` }">
            <view class="ruler-pad" :style="{ width: rulerWidth / 2 + 'px' }"></view>
            <view v-for="tick in ticks" :key="tick.cm" class="tick-col" :style="{ width: pxPerCm + 'px' }">
              <view class="tick" :class="{ major: tick.major }"></view>
              <text v-if="tick.label" class="tick-label">{{ tick.label }}</text>
            </view>
          </view>
          <view v-if="current.id === 'height'" class="needle"></view>
          <template v-else>
            <view class="range-band" :style="bandStyle"></view>
            <view class="needle" :style="{ left: bandStyle.left }"></view>
            <view class="needle" :style="{ left: bandRight }"></view>
          </template>
        </view>
        <view class="unit-row">
          <view class="unit-toggle">
            <button type="button" :class="{ on: heightUnit === 'ft' }" @click="heightUnit = 'ft'">ft/in</button>
            <button type="button" :class="{ on: heightUnit === 'cm' }" @click="heightUnit = 'cm'">cm</button>
          </view>
        </view>
      </view>
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

    <view class="bottom-cta" :class="{ stack: current.id === 'availability', 'height-bar': current.id === 'heightMatch' }">
      <button
        v-if="current.id === 'availability'"
        class="btn-primary"
        :disabled="!canNext || submitting"
        @click="next"
      >
        {{ submitting ? '提交中…' : '提交档案' }}
      </button>
      <button v-if="current.id === 'heightMatch'" type="button" class="dont-care" :class="{ on: heightDontCare }" @click="toggleDontCare">
        {{ heightDontCare ? '✓ 身高无所谓' : '🤷 身高无所谓' }}
      </button>
      <button v-if="current.id !== 'availability'" class="btn-fab" :disabled="!canNext || submitting" @click="next">→</button>
    </view>
    <view v-if="toast" class="toast">{{ toast }}</view>
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { saveDraft, track } from '../../track'

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
const MIN_CM = 140
const MAX_CM = 210
const pxPerCm = 8
const selfCm = ref(172)
const matchMin = ref(160)
const matchMax = ref(185)
const viewMid = ref(172.5)
const heightUnit = ref<'cm' | 'ft'>('cm')
const heightDontCare = ref(false)
const rulerWidth = ref(340)
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
let stepMark = Date.now()
const selectedBefore = new Set<string>()

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
  if (step.id === 'height') return selfCm.value >= MIN_CM && selfCm.value <= MAX_CM
  if (step.id === 'heightMatch') return heightDontCare.value || matchMax.value > matchMin.value
  if (step.kind === 'date') return Boolean(birthday.value)
  if (step.kind === 'number') return selfCm.value > 0
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
    void logStep('enter')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '网络不太稳，点一下重试'
  } finally {
    loading.value = false
  }
})

function draftBody() {
  return {
    step: current.value.id,
    displayName: displayName.value,
    answers: answers.value,
    interests: interestOrder.value,
    picks: picks.value,
    slots: slots.value,
    texts: texts.value,
    birthday: birthday.value,
    selfCm: Math.round(selfCm.value),
    matchMin: Math.round(matchMin.value),
    matchMax: Math.round(matchMax.value),
    heightDontCare: heightDontCare.value,
    multi: multiBags.value,
    email: email.value,
  }
}

async function logStep(action: string, optionId?: string) {
  const dwellMs = Date.now() - stepMark
  stepMark = Date.now()
  const page = current.value.id || 'questionnaire'
  let recorded = action
  if (optionId && (action === 'select' || action === 'deselect')) {
    const key = `${page}:${optionId}`
    if (action === 'select' && selectedBefore.has(key)) recorded = 'reselect'
    if (action === 'select') selectedBefore.add(key)
  }
  await track({
    page,
    action: recorded,
    dwellMs,
    payload: { optionId: optionId || '', value: draftBody() },
  })
  await saveDraft(draftBody())
}

let draftTimer: ReturnType<typeof setTimeout> | null = null
watch([selfCm, matchMin, matchMax, heightDontCare], () => {
  if (current.value.id !== 'height' && current.value.id !== 'heightMatch') return
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    void saveDraft(draftBody())
  }, 400)
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
    const previous = answers.value[step.id]
    answers.value = { ...answers.value, [step.id]: id }
    void logStep(previous && previous !== id ? 'reselect' : 'select', id)
    return
  }
  if (step.kind !== 'multi') return
  const bag = step.id === 'availability' ? slots : { value: multiBags.value[step.id] || [] }
  if (step.id === 'availability') {
    const removing = slots.value.includes(id)
    if (removing) slots.value = slots.value.filter((item) => item !== id)
    else slots.value = [...slots.value, id]
    void logStep(removing ? 'deselect' : 'select', id)
    return
  }
  const currentBag = multiBags.value[step.id] || []
  const removing = currentBag.includes(id)
  multiBags.value = {
    ...multiBags.value,
    [step.id]: removing ? currentBag.filter((item) => item !== id) : [...currentBag, id],
  }
  void logStep(removing ? 'deselect' : 'select', id)
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
  void logStep('back')
  if (index.value > 0) {
    index.value -= 1
    void logStep('enter')
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

const ticks = computed(() => {
  const rows: Array<{ cm: number; major: boolean; label: string }> = []
  for (let cm = MIN_CM; cm <= MAX_CM; cm += 1) {
    if (heightUnit.value === 'cm') {
      rows.push({ cm, major: cm % 5 === 0, label: cm % 10 === 0 ? String(cm) : '' })
      continue
    }
    const inches = cm / 2.54
    const nearest = Math.round(inches)
    const onInch = Math.abs(inches - nearest) < 0.22 && nearest % 2 === 0
    const feet = Math.floor(nearest / 12)
    const inch = nearest % 12
    rows.push({ cm, major: onInch, label: onInch ? `${feet}'${inch}"` : '' })
  }
  return rows
})

const trackShift = computed(() => {
  const anchor = current.value.id === 'height' ? selfCm.value : viewMid.value
  return -((anchor - MIN_CM) * pxPerCm)
})

const bandStyle = computed(() => {
  const left = rulerWidth.value / 2 + (matchMin.value - viewMid.value) * pxPerCm
  const width = (matchMax.value - matchMin.value) * pxPerCm
  return { left: `${left}px`, width: `${Math.max(width, 8)}px` }
})

const bandRight = computed(() => {
  const left = rulerWidth.value / 2 + (matchMax.value - viewMid.value) * pxPerCm
  return `${left}px`
})

function formatOne(cm: number) {
  if (heightUnit.value === 'cm') return `${Math.round(cm)}`
  const inches = Math.round(cm / 2.54)
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

const heightLabel = computed(() => {
  if (current.value.id === 'heightMatch') {
    if (heightDontCare.value) return '身高无所谓'
    return heightUnit.value === 'cm'
      ? `${formatOne(matchMin.value)}–${formatOne(matchMax.value)} cm`
      : `${formatOne(matchMin.value)}–${formatOne(matchMax.value)}`
  }
  return heightUnit.value === 'cm' ? `${formatOne(selfCm.value)} cm` : formatOne(selfCm.value)
})

function clampCm(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type RulerDrag = { mode: 'self' | 'pan' | 'min' | 'max'; x: number; self: number; min: number; max: number; mid: number }
let rulerDrag: RulerDrag | null = null

function beginRuler(clientX: number, localX: number, width: number) {
  if (width > 0) rulerWidth.value = width
  if (current.value.id === 'height') {
    rulerDrag = { mode: 'self', x: clientX, self: selfCm.value, min: 0, max: 0, mid: 0 }
    return
  }
  const left = rulerWidth.value / 2 + (matchMin.value - viewMid.value) * pxPerCm
  const right = rulerWidth.value / 2 + (matchMax.value - viewMid.value) * pxPerCm
  let mode: RulerDrag['mode'] = 'pan'
  if (Math.abs(localX - left) <= 22) mode = 'min'
  else if (Math.abs(localX - right) <= 22) mode = 'max'
  rulerDrag = { mode, x: clientX, self: 0, min: matchMin.value, max: matchMax.value, mid: viewMid.value }
}

function moveRuler(clientX: number) {
  if (!rulerDrag) return
  const dCm = (clientX - rulerDrag.x) / pxPerCm
  if (rulerDrag.mode === 'self') {
    selfCm.value = clampCm(rulerDrag.self - dCm, MIN_CM, MAX_CM)
    return
  }
  heightDontCare.value = false
  if (rulerDrag.mode === 'pan') {
    const span = rulerDrag.max - rulerDrag.min
    const min = clampCm(rulerDrag.min - dCm, MIN_CM, MAX_CM - span)
    matchMin.value = min
    matchMax.value = min + span
    viewMid.value = rulerDrag.mid - (rulerDrag.min - min)
    return
  }
  if (rulerDrag.mode === 'min') {
    matchMin.value = clampCm(rulerDrag.min + dCm, MIN_CM, rulerDrag.max - 1)
    return
  }
  matchMax.value = clampCm(rulerDrag.max + dCm, rulerDrag.min + 1, MAX_CM)
}

function endRuler() {
  rulerDrag = null
}

function bindRuler() {
  if (typeof document === 'undefined') return
  const el = document.querySelector('.ruler-clip') as HTMLElement | null
  if (!el || el.dataset.bound === '1') return
  el.dataset.bound = '1'
  const start = (event: PointerEvent) => {
    event.preventDefault()
    const rect = el.getBoundingClientRect()
    beginRuler(event.clientX, event.clientX - rect.left, rect.width)
    const move = (ev: PointerEvent) => {
      ev.preventDefault()
      moveRuler(ev.clientX)
    }
    const up = () => {
      endRuler()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  el.addEventListener('pointerdown', start)
}

function toggleDontCare() {
  heightDontCare.value = !heightDontCare.value
}

watch([matchMin, matchMax, heightDontCare], () => {
  const value = heightDontCare.value
    ? 'dont_care'
    : `${Math.round(matchMin.value)}_${Math.round(matchMax.value)}`
  answers.value = { ...answers.value, heightMatch: value }
})

watch(current, async (step) => {
  if (step.id !== 'height' && step.id !== 'heightMatch') return
  await nextTick()
  bindRuler()
  uni.createSelectorQuery()
    .select('.ruler-clip')
    .boundingClientRect()
    .exec((rects) => {
      const rect = rects?.[0] as { width?: number } | null
      if (rect?.width) rulerWidth.value = rect.width
    })
})

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
    void logStep('leave')
    index.value += 1
    void logStep('enter')
    return
  }
  void logStep('submit')
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
          heightCm: Math.round(selfCm.value),
          heightMatch: heightDontCare.value
            ? 'dont_care'
            : `${Math.round(matchMin.value)}_${Math.round(matchMax.value)}`,
          heightMatchMin: Math.round(matchMin.value),
          heightMatchMax: Math.round(matchMax.value),
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
.height-stage {
  display: flex;
  min-height: calc(100vh - 250px);
  flex-direction: column;
}
.height-spacer { flex: 1; min-height: 72px; }
.height-val {
  align-self: center;
  margin-bottom: 12px;
  padding: 8px 18px;
  border-radius: 999px;
  background: #fff;
  color: #1a2744;
  font-size: 22px;
  font-weight: 700;
}
.ruler-clip {
  position: relative;
  height: 78px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  background: rgba(6, 18, 48, 0.62);
  touch-action: none;
}
.ruler-clip.dim { opacity: 0.4; }
.ruler-track {
  display: flex;
  height: 100%;
  align-items: flex-end;
}
.ruler-pad { flex: none; height: 100%; }
.tick-col {
  position: relative;
  flex: none;
  height: 100%;
}
.tick {
  position: absolute;
  bottom: 14px;
  left: 0;
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.45);
}
.tick.major { height: 26px; background: rgba(255, 255, 255, 0.85); }
.tick-label {
  position: absolute;
  bottom: 42px;
  left: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  transform: translateX(-50%);
  white-space: nowrap;
}
.needle {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 50%;
  z-index: 2;
  width: 3px;
  border-radius: 2px;
  background: #e40089;
  transform: translateX(-50%);
}
.range-band {
  position: absolute;
  top: 16px;
  bottom: 16px;
  border-radius: 8px;
  background: rgba(228, 0, 137, 0.28);
}
.unit-row { display: flex; justify-content: flex-end; margin-top: 12px; }
.unit-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
}
.unit-toggle button {
  margin: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  line-height: 1;
}
.unit-toggle button.on { background: #fff; color: #1a2744; font-weight: 700; }
.dont-care {
  flex: 1;
  height: 52px;
  margin: 0;
  border: none;
  border-radius: 999px;
  background: #e40089;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}
.dont-care.on { box-shadow: inset 0 0 0 2px #fff; }
</style>
