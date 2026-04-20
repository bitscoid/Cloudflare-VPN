<script setup lang="ts">
const selectedProxies = useSelectedProxiesStore();
const props = defineProps({
  isp: String,
  ipPort: String,
  country: String,
});

const stats = reactive({
  proxyip: false,
  delay: 0,
  loading: false,
});
const isSelected = ref(false);

async function checkProxyHealth() {
  stats.loading = true;
  try {
    const res = await $fetch(`https://vpn.bits.co.id/api/v1/check?ip=${props.ipPort}`);
    const jsonValue = res as any;
    stats.proxyip = jsonValue.proxyip;
    stats.delay = jsonValue.delay || 0;
  } catch {
    stats.proxyip = false;
    stats.delay = 0;
  }
  stats.loading = false;
}

function selectProxy() {
  selectedProxies.toggleSelectedProxies(props.ipPort as string);
  toggleIsSelected();
}

function toggleIsSelected() {
  isSelected.value = selectedProxies.getSelectedProxies.includes(props.ipPort as string);
}

onMounted(() => {
  checkProxyHealth();
  toggleIsSelected();
});

watch(props, () => {
  checkProxyHealth();
  toggleIsSelected();
});

watch(selectedProxies.getSelectedProxies, () => {
  toggleIsSelected();
});
</script>

<template>
  <article class="proxy-card" :class="isSelected ? 'selected' : ''">
    <button class="head" type="button" @click="selectProxy">
      <img width="28" :src="`https://hatscripts.github.io/circle-flags/flags/${props.country}.svg`" :alt="props.country" />
      <div class="meta">
        <strong>{{ props.isp }}</strong>
        <span>{{ props.ipPort }}</span>
      </div>
    </button>

    <button class="ping" type="button" @click="!stats.loading && checkProxyHealth()">
      <span v-if="stats.loading" class="loading loading-spinner loading-xs"></span>
      <span v-else>{{ stats.delay ? `${stats.delay} ms` : "timeout" }}</span>
      <span class="state" :class="stats.proxyip ? 'ok' : 'bad'"></span>
    </button>
  </article>
</template>

<style scoped>
.proxy-card {
  width: 100%;
  min-width: 220px;
  border-radius: 0.95rem;
  border: 1px solid var(--line);
  background: rgba(16, 21, 36, 0.84);
  padding: 0.8rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.proxy-card:hover {
  transform: translateY(-2px);
  border-color: rgba(122, 162, 255, 0.5);
}

.proxy-card.selected {
  border-color: rgba(79, 140, 255, 0.85);
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.45);
}

.head {
  width: 100%;
  display: flex;
  gap: 0.65rem;
  align-items: center;
  text-align: left;
}

.meta {
  display: flex;
  flex-direction: column;
}

.meta strong {
  font-size: 0.92rem;
}

.meta span {
  color: var(--text-soft);
  font-size: 0.78rem;
}

.ping {
  margin-top: 0.65rem;
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.65rem;
  padding: 0.35rem 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-main);
  font-size: 0.8rem;
}

.state {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 9999px;
}

.state.ok {
  background: #59e4be;
  box-shadow: 0 0 10px rgba(89, 228, 190, 0.6);
}

.state.bad {
  background: #ff6b87;
  box-shadow: 0 0 10px rgba(255, 107, 135, 0.45);
}
</style>
