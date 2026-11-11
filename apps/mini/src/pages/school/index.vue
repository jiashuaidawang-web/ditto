<template>
  <view class="phone">
    <view class="q-top">
      <button class="q-back" @click="back">←</button>
      <view class="brand-pill"><BrandLockup variant="compact" /></view>
      <button class="q-lock" @click="lock">锁</button>
    </view>
    <view class="progress-segs">
      <view class="progress-seg fill"></view>
      <view class="progress-seg fill"></view>
      <view class="progress-seg partial"></view>
    </view>
    <view class="q-body">
      <view class="q-title">选一所<text class="em">学校</text></view>
      <view class="q-caption">只在房山大学城里面配。跨校这周不做。</view>
      <view class="q-lockline">{{ LOCK_LINE }}</view>
      <view class="chip-list">
        <button
          v-for="school in schools"
          :key="school.id"
          class="chip"
          @click="choose(school.id)"
        >
          <text class="chip-label">{{ school.name }}</text>
          <text class="check">✓</text>
        </button>
      </view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>
    <AppNav />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppNav from '../../components/AppNav.vue'
import BrandLockup from '../../components/BrandLockup.vue'
import { request } from '../../api/http'
import { LOCK_LINE } from '../../copy'

const schools = ref<Array<{ id: string; name: string }>>([])
const error = ref('')

onShow(async () => {
  try {
    const result = await request<{ schools: Array<{ id: string; name: string }> }>('/schools', { auth: false })
    schools.value = result.schools
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学校名单加载失败'
  }
})

function back() {
  uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/login/index' }) })
}

function lock() {
  uni.showToast({ title: LOCK_LINE, icon: 'none' })
}

async function choose(schoolId: string) {
  error.value = ''
  try {
    await request('/me/school', { method: 'PUT', data: { schoolId } })
    uni.redirectTo({ url: '/pages/questionnaire/index' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  }
}
</script>

<style scoped>
.q-body :deep(.nav) {
  padding-bottom: 24px;
}
</style>
