<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('ditto mini launch')
})
</script>

<style>
page {
  background: #f4efe8;
  color: #241c16;
  font-size: 28rpx;
  line-height: 1.5;
}

.page {
  padding: 32rpx 32rpx 64rpx;
}

.h1 {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.lead {
  margin-top: 12rpx;
  color: #6f6258;
  font-size: 26rpx;
}

.card {
  margin-top: 28rpx;
  padding: 28rpx;
  background: #fffdf9;
  border-radius: 20rpx;
}

.label {
  display: block;
  margin-top: 20rpx;
  color: #6f6258;
  font-size: 24rpx;
}

.field {
  margin-top: 8rpx;
  padding: 18rpx 20rpx;
  background: #fff;
  border: 1px solid #eadfd2;
  border-radius: 12rpx;
}

.primary,
.ghost {
  margin-top: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.primary {
  background: #c4522a;
  color: #fffdf9;
}

.ghost {
  background: transparent;
  color: #c4522a;
}

.primary::after,
.ghost::after {
  border: none;
}

.error {
  margin-top: 16rpx;
  color: #9d2c2c;
  font-size: 24rpx;
}

.todo {
  margin-top: 16rpx;
  color: #6f6258;
  font-size: 24rpx;
  white-space: pre-wrap;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 20rpx;
  margin-top: 28rpx;
}

.nav-link {
  color: #c4522a;
  font-size: 24rpx;
}
</style>
