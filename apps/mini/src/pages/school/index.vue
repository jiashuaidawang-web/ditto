<template>
  <view class="page">
    <view class="h1">选一所学校</view>
    <view class="lead">只在房山大学城里面配。跨校这周不做。</view>
    <view class="card">
      <button
        v-for="school in schools"
        :key="school.id"
        class="ghost"
        @click="choose(school.id)"
      >
        {{ school.name }}
      </button>
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
