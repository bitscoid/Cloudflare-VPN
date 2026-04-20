<script setup lang="ts">
const props = defineProps({
  icon: String,
});
</script>

<template>
  <div class="info-card">
    <div class="icon-wrap">
      <Icon :name="`uil:${props.icon}`" size="24" class="text-[var(--text-main)]" />
    </div>
    <div class="content-wrap">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.info-card {
  width: 100%;
  min-height: 78px;
  border-radius: 0.9rem;
  border: 1px solid var(--line);
  background: rgba(16, 21, 36, 0.78);
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  border-color: rgba(112, 149, 255, 0.45);
}

.icon-wrap {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 0.8rem;
  background: rgba(79, 140, 255, 0.2);
}

.content-wrap {
  color: var(--text-main);
  font-size: 0.93rem;
}
</style>
