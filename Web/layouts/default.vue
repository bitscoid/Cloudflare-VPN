<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <Navbar name="Bits VPN" />
  <div class="layout-shell">
    <main :class="['mx-auto w-[min(1200px,92vw)]', route.path === '/' ? 'py-0' : 'py-6 md:py-8']">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: calc(100vh - 64px);
}
</style>
