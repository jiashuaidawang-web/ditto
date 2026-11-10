<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { readReportToken } from './deeplink'

onLaunch(() => {
  const token = readReportToken()
  if (token) {
    uni.reLaunch({ url: `/pages/report/index?token=${encodeURIComponent(token)}` })
  }
})
</script>
