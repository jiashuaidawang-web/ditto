<template>
  <view class="lockup" :class="variant">
    <text class="lockup-zh">不如见一面</text>
    <text class="lockup-en">Better meet IRL</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'stack' | 'compact' }>(), { variant: 'stack' })
</script>

<style scoped>
.lockup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.lockup.stack {
  align-items: center;
  text-align: center;
}

.lockup-zh {
  color: #fff;
  font-size: var(--font-size-h1);
  font-weight: 700;
  line-height: 1.3;
}

.lockup.compact .lockup-zh {
  font-size: var(--font-size-h3);
}

.lockup-en {
  margin-top: 1px;
  color: rgba(255, 255, 255, 0.74);
  font-size: var(--font-size-caption);
  font-weight: 400;
  line-height: 1.3;
}

.lockup.compact .lockup-en {
  font-size: var(--font-size-micro);
}
</style>
