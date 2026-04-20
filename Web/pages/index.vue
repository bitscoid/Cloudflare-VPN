<script setup lang="ts">
definePageMeta({
  title: "BITS VPN",
});

const ctas = [
  { to: "/vpn", icon: "uil:wrench", label: "Build", style: "primary" },
  { to: "/tools/converter", icon: "uil:sync", label: "Convert", style: "ghost" },
  { to: "/uptime", icon: "uil:chart-line", label: "Monitor", style: "ghost" },
];
</script>

<template>
  <section class="hero-page">
    <div class="hero-glow"></div>

    <div class="hero-content">
      <h1>BITS VPN</h1>
      <p class="subtitle">Build, Convert &amp; Monitor Cloudflare VPN.</p>

      <div class="cta-row">
        <NuxtLink
          v-for="cta in ctas"
          :key="cta.to"
          :to="cta.to"
          class="cta-btn"
          :class="cta.style === 'primary' ? 'cta-primary' : 'cta-ghost'"
        >
          <Icon :name="cta.icon" size="16" />
          {{ cta.label }}
        </NuxtLink>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: clamp(0.75rem, 2.5vh, 1.5rem) 0;
}

.hero-glow {
  position: absolute;
  inset: 12% auto auto 55%;
  width: 380px;
  height: 380px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(79, 140, 255, 0.34), rgba(79, 140, 255, 0));
  filter: blur(22px);
  pointer-events: none;
  animation: drift 7s ease-in-out infinite;
}

.hero-content {
  width: min(760px, 100%);
  margin-inline: auto;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: clamp(0.5rem, 1.6vh, 0.95rem);
  animation: reveal 0.7s ease both;
}

h1 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(2.1rem, 7vw, 4.5rem);
  line-height: 0.95;
}

.subtitle {
  margin: 0;
  max-width: 38ch;
  margin-inline: auto;
  color: var(--text-soft);
  font-size: clamp(0.88rem, 2.2vw, 1.02rem);
}

.cta-row {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.52rem;
  justify-content: center;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.74rem;
  border: 1px solid transparent;
  padding: 0.48rem 0.78rem;
  font-size: 0.9rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.cta-primary {
  border-color: rgba(79, 140, 255, 0.45);
  background: linear-gradient(135deg, rgba(79, 140, 255, 0.35), rgba(79, 140, 255, 0.15));
}

.cta-ghost {
  border-color: var(--line);
  background: rgba(16, 21, 36, 0.62);
}

.cta-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .hero-page {
    height: calc(100vh - 64px);
    padding: 0.6rem 0;
  }

  h1 {
    font-size: clamp(1.9rem, 12vw, 3rem);
  }

  .subtitle {
    max-width: 32ch;
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10px, -12px, 0) scale(1.04);
  }
}
</style>
