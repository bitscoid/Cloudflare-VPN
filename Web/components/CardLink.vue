<script setup lang="ts">
const props = defineProps({
  to: String,
  img: String,
  alt: String,
});
</script>

<template>
  <NuxtLink :to="props.to" class="card-link">
    <img :src="props.img" class="card-image" :alt="props.alt" />
    <div class="card-overlay">
      <span class="label">Open</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card-link {
  position: relative;
  display: block;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--line);
  background: rgba(16, 21, 36, 0.8);
  transform: translateY(0);
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.card-link:hover {
  transform: translateY(-6px);
  border-color: rgba(112, 149, 255, 0.6);
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.86;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.card-link:hover .card-image {
  transform: scale(1.03);
  opacity: 1;
}

.card-overlay {
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.75rem;
  display: flex;
  justify-content: flex-end;
  background: linear-gradient(to top, rgba(6, 8, 14, 0.85), rgba(6, 8, 14, 0));
}

.label {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  padding: 0.25rem 0.62rem;
  font-size: 0.75rem;
  color: var(--text-main);
}
</style>
