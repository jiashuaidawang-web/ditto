<template>
  <view class="lockup" :class="variant">
    <view class="wax-seal mini"></view>
    <view class="lockup-words">
      <text class="lockup-zh">不如见一面</text>
      <text class="lockup-en">Better meet IRL</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'stack' | 'compact' }>(), { variant: 'stack' })
</script>

<style scoped>
.lockup {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lockup.stack {
  flex-direction: column;
  gap: 10px;
}

.lockup-words {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.lockup.stack .lockup-words {
  align-items: center;
  text-align: center;
}

.lockup-zh {
  color: var(--color-ink);
  font-size: var(--font-size-h1);
  font-weight: 700;
  line-height: 1.3;
}

.lockup.compact .lockup-zh {
  font-size: var(--font-size-h3);
}

.lockup-en {
  margin-top: 1px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-weight: 400;
  line-height: 1.3;
}

.lockup.compact .lockup-en {
  font-size: var(--font-size-micro);
}
</style>
