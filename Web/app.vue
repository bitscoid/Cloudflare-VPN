<script setup lang="ts">
const route = useRoute();
const appName = "BITS VPN";

function getNormalizedPath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function isSinglePagePath(path: string) {
  const normalized = getNormalizedPath(path);
  return normalized === "/" || normalized === "/convert" || normalized === "/monitor";
}

useHead(() => {
  const pageTitle = typeof route.meta?.title === "string" ? route.meta.title.trim() : "";
  const current = pageTitle || appName;
  const title = current === appName ? appName : `${current} | ${appName}`;
  const isSinglePage = isSinglePagePath(route.path);

  return {
    title,
    bodyAttrs: {
      class: isSinglePage ? "single-page-body" : undefined,
    },
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
  --bg-main: #05070d;
  --bg-soft: #0f1320;
  --text-main: #eef3ff;
  --text-soft: #9aabcf;
  --line: rgba(148, 163, 184, 0.2);
  --accent: #4f8cff;
  --accent-soft: rgba(79, 140, 255, 0.22);
}

html,
body,
#__nuxt {
  height: 100%;
}

body.single-page-body {
  overflow: hidden;
  position: fixed;
  inset: 0;
  width: 100%;
}

body.single-page-body #__nuxt,
body.single-page-body .app-canvas {
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
}

body {
  margin: 0;
  color: var(--text-main);
  background: var(--bg-main);
  font-family: "Plus Jakarta Sans", sans-serif;
}

.app-canvas {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
  overflow: hidden;
}

.app-canvas::before {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  bottom: -30vh;
  height: 40vh;
  pointer-events: none;
  z-index: -1;
  background: linear-gradient(45deg, #00dc82, #36e4da 50%, #0047e1);
  filter: blur(20vh);
  opacity: 0.95;
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
</style>
