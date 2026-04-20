<script setup lang="ts">
const route = useRoute();
const appName = "BITS VPN";

useHead(() => {
  const pageTitle = typeof route.meta?.title === "string" ? route.meta.title.trim() : "";
  const current = pageTitle || appName;
  const title = current === appName ? appName : `${current} | ${appName}`;

  return {
    title,
  };
});
</script>

<template>
  <div class="app-canvas">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap");

:root {
  --bg-main: #090b12;
  --bg-soft: #101524;
  --text-main: #dce5ff;
  --text-soft: #8da1ce;
  --line: rgba(148, 163, 184, 0.2);
  --accent: #4f8cff;
  --accent-soft: rgba(79, 140, 255, 0.22);
}

html,
body,
#__nuxt {
  min-height: 100%;
}

body {
  margin: 0;
  color: var(--text-main);
  background: radial-gradient(circle at 15% -10%, #172851 0%, rgba(23, 40, 81, 0) 38%),
    radial-gradient(circle at 95% 0%, #142133 0%, rgba(20, 33, 51, 0) 42%), var(--bg-main);
  font-family: "Plus Jakarta Sans", sans-serif;
}

.app-canvas {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.app-canvas::before,
.app-canvas::after {
  content: "";
  position: fixed;
  pointer-events: none;
  z-index: -1;
  border-radius: 9999px;
  filter: blur(80px);
}

.app-canvas::before {
  width: 360px;
  height: 360px;
  left: -120px;
  top: 80px;
  background: rgba(84, 126, 255, 0.3);
  animation: floatGlow 9s ease-in-out infinite;
}

.app-canvas::after {
  width: 320px;
  height: 320px;
  right: -100px;
  bottom: 40px;
  background: rgba(29, 203, 178, 0.18);
  animation: floatGlow 11s ease-in-out infinite reverse;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.35s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}

@keyframes floatGlow {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-22px) scale(1.06);
  }
}
</style>
