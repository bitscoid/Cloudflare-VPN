<script setup lang="ts">
const props = defineProps({
  to: String,
  img: String,
  alt: String,
});
</script>

<template>
  <NuxtLink :to="props.to" class="flex justify-center items-center">
    <img
      :src="props.img"
      class="grayscale hover:grayscale-0 transition-all duration-200 hover:scale-105"
      :alt="props.alt"
    />
  </NuxtLink>
</template>
