<script setup lang="ts">
definePageMeta({
  title: "Build",
});

const route = useRoute();
const selectedProxies = useSelectedProxiesStore();

const myip = reactive({
  asOrganization: "Unavailable",
  ip: "Unavailable",
  city: "",
  region: "",
  country: "",
});

type ProxyItem = {
  ip: string;
  isp: string;
  port: string;
  country: string;
};

const proxies = ref<ProxyItem[]>([]);
const countries = ref<string[]>([]);
const selectedCountry = ref("All");
const displayProxies = ref<ProxyItem[]>([]);
const page = ref(0);
const itemPerPage = ref(18);
const pagination = ref([0, 1, 2]);
const displaySelected = ref(false);
const isNoticeOpen = ref(false);
const noticeText = ref("");
const search = ref("");

const proxySettings = reactive<ProxySettings>({
  protocol: "trojan",
  format: "raw",
  tls: true,
  host: route.query.host?.toString() || "vpn.bits.co.id",
  server: "support.zoom.us",
  wildcard: false,
});

const activeHost = computed(() =>
  proxySettings.wildcard ? `${proxySettings.server}.${proxySettings.host}` : proxySettings.host,
);

const locationLabel = computed(() => {
  const city = myip.city?.trim();
  const region = myip.region?.trim();
  const locationParts = [city, region].filter(Boolean);
  return locationParts.length ? locationParts.join(", ") : "Location unavailable";
});

const countryLabel = computed(() => myip.country?.trim() || "Country unavailable");
const totalProxyCount = computed(() => proxies.value.filter((proxy) => proxy.ip && proxy.port && proxy.isp).length);
const selectedProxyCount = computed(() => selectedProxies.getSelectedProxies.length);

function applyMyIp(data: any) {
  myip.asOrganization = data?.asOrganization || data?.org || data?.organization || data?.connection?.isp || "Unavailable";
  myip.ip = data?.ip || data?.query || "Unavailable";
  myip.city = data?.city || "";
  myip.region = data?.region || data?.regionName || "";
  myip.country = data?.country || data?.countryCode || "";
}

function normalizeMyIpPayload(payload: any) {
  if (typeof payload !== "string") return payload;

  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function applyUnavailableMyIp() {
  myip.asOrganization = "Unavailable";
  myip.ip = "Unavailable";
  myip.city = "";
  myip.region = "";
  myip.country = "";
}

async function loadMyIp() {
  try {
    const primaryRaw = await $fetch("https://vpn.bits.co.id/api/v1/myip", { cache: "no-cache" });
    const primary = normalizeMyIpPayload(primaryRaw);

    if ((primary as any)?.ip || (primary as any)?.query) {
      applyMyIp(primary as any);
      return;
    }
  } catch {}

  applyUnavailableMyIp();
}

function getTempProxies() {
  let proxiesTemp = proxies.value;

  if (displaySelected.value) {
    proxiesTemp = proxiesTemp.filter((proxy) => selectedProxies.getSelectedProxies.includes(`${proxy.ip}:${proxy.port}`));
  }

  if (selectedCountry.value.length === 2) {
    proxiesTemp = proxiesTemp.filter((proxy) => proxy.country.toString() === selectedCountry.value.toLowerCase());
  }

  if (search.value) {
    proxiesTemp = proxiesTemp.filter((proxy) => proxy.isp.toString().toLowerCase().includes(search.value.toLowerCase()));
  }

  return proxiesTemp;
}

async function copyToClipboard() {
  try {
    const configResult = await parseProxies(
      proxies.value.filter((proxy) => selectedProxies.getSelectedProxies.includes(`${proxy.ip}:${proxy.port}`)) as any,
      proxySettings,
    );
    await navigator.clipboard.writeText(configResult as string);
    noticeText.value = "Proxy copied to clipboard!";
    isNoticeOpen.value = true;
  } catch {
    noticeText.value = "Failed to copy proxy config.";
    isNoticeOpen.value = true;
  }
}

watch([page, proxies, selectedCountry, displaySelected, search], () => {
  setDisplayProxies();
  setPagination();
});

watch([isNoticeOpen], () => {
  if (!isNoticeOpen.value) return;

  setTimeout(() => {
    isNoticeOpen.value = false;
  }, 2600);
});

if (import.meta.client) {
  loadMyIp();
}

useFetch("https://raw.githubusercontent.com/bitscoid/Cloudflare-VPN/refs/heads/main/Proxy/proxyList.txt").then((res) => {
  if (res.status.value === "success") {
    const proxiesTemp: ProxyItem[] = [];
    const countriesTemp: string[] = [];

    for (const data of (res.data.value as string).split("\n")) {
      const [ip, port, country, isp] = data.split(",");
      if (!ip || !port || !country || !isp) continue;
      proxiesTemp.push({ ip, port, country: country.toLowerCase(), isp });
      countriesTemp.push(country);
    }

    proxies.value = proxiesTemp;
    countries.value = ["All", ...new Set(countriesTemp)];
  }
});

function setDisplayProxies() {
  const proxiesTemp = getTempProxies();
  const startIndex = page.value * itemPerPage.value;
  const endIndex = startIndex + itemPerPage.value;
  displayProxies.value = proxiesTemp.slice(startIndex, endIndex);
}

function setPagination() {
  const proxiesTemp = getTempProxies();
  const maxIndex = Math.max(0, Math.ceil(proxiesTemp.length / itemPerPage.value) - 1);
  const maxItem = 5;
  const paginationTemp = [];

  if (page.value < 0) page.value = 0;
  if (page.value > maxIndex) page.value = maxIndex;

  for (let i = page.value <= 2 ? 0 : page.value + 2 >= maxIndex ? Math.max(0, maxIndex - 4) : page.value - 2; i <= maxIndex; i++) {
    paginationTemp.push(i);
    if (paginationTemp.length >= maxItem) break;
  }

  pagination.value = paginationTemp;
}
</script>

<template>
  <dialog id="settings_dialog" class="settings-dialog">
    <div class="settings-card">
      <h3>Profile Settings</h3>
      <p>Tune server profile before export.</p>

      <div class="field-grid">
        <label class="field">
          <span>Server</span>
          <input v-model="proxySettings.server" type="text" placeholder="support.zoom.us" />
        </label>
        <label class="field">
          <span>Host</span>
          <input v-model="proxySettings.host" type="text" placeholder="vpn.bits.co.id" />
        </label>
        <label class="field">
          <span>Protocol</span>
          <select v-model="proxySettings.protocol">
            <option v-for="protocol in getProtocols()" :key="protocol" :value="protocol">{{ protocol }}</option>
          </select>
        </label>
        <label class="field">
          <span>Format</span>
          <select v-model="proxySettings.format">
            <option v-for="format in getFormats()" :key="format" :value="format">{{ format }}</option>
          </select>
        </label>
        <label class="field switcher">
          <span>TLS</span>
          <input v-model="proxySettings.tls" type="checkbox" />
        </label>
        <label class="field switcher">
          <span>Wildcard</span>
          <input v-model="proxySettings.wildcard" type="checkbox" />
        </label>
      </div>

      <div class="preview">Effective host: <strong>{{ activeHost }}</strong></div>

      <div class="settings-actions">
        <form method="dialog">
          <button class="panel-button">Done</button>
        </form>
      </div>
    </div>
  </dialog>

  <section class="vpn-shell">
    <div class="header-row">
      <h1 class="view-title">
        <span class="view-icon"><Icon name="uil:wrench" size="14" /></span>
        <span>Build</span>
      </h1>

      <div class="head-pills">
        <span class="head-pill"><Icon name="uil:server-network" size="13" /> {{ totalProxyCount }}</span>
        <span class="head-pill"><Icon name="uil:check-circle" size="13" /> {{ selectedProxyCount }}</span>
      </div>
    </div>

    <div class="control-ribbon">
      <label class="ribbon-input">
        <Icon name="uil:search" size="14" />
        <input v-model="search" type="text" placeholder="Search provider" class="input-surface" />
      </label>

      <label class="ribbon-select">
        <Icon name="uil:globe" size="14" />
        <select v-model="selectedCountry" class="select-surface">
          <option v-for="country in countries" :key="country">{{ country }}</option>
        </select>
      </label>

      <button class="panel-button ghost" @click="displaySelected = !displaySelected">
        <Icon name="uil:list-ul" size="14" />
        {{ displaySelected ? "Show All" : "Only Selected" }}
      </button>

      <button class="panel-button" onclick="settings_dialog.showModal()"><Icon name="uil:sliders-v-alt" size="14" /> Settings</button>
      <button class="panel-button export" @click="copyToClipboard">
        <Icon name="uil:import" size="14" /> Export
      </button>
    </div>

    <div class="meta-grid">
      <article class="meta-tile">
        <span class="meta-icon"><Icon name="uil:building" size="14" /></span>
        <div>
          <strong>{{ myip.asOrganization }}</strong>
          <p>{{ myip.ip }}</p>
        </div>
      </article>

      <article class="meta-tile">
        <span class="meta-icon"><Icon name="uil:map-marker" size="14" /></span>
        <div>
          <strong>{{ locationLabel }}</strong>
          <p>{{ countryLabel }}</p>
        </div>
      </article>
    </div>

    <div class="proxy-grid-wrap">
      <div class="proxy-grid">
        <ProxyCard
          v-for="proxy in displayProxies"
          :key="`${proxy.ip}:${proxy.port}`"
          :isp="proxy.isp"
          :ip-port="`${proxy.ip}:${proxy.port}`"
          :country="proxy.country"
        />
      </div>
    </div>

    <div class="pager">
      <button class="pager-control" @click="page--">&lt;</button>
      <button
        v-for="pageIndex in pagination"
        :key="pageIndex"
        class="pager-control"
        :class="pageIndex == page ? 'active' : ''"
        @click="page = pageIndex"
      >
        {{ pageIndex }}
      </button>
      <button class="pager-control" @click="page++">&gt;</button>
    </div>

    <div v-if="isNoticeOpen" class="notice-chip">{{ noticeText }}</div>
  </section>
</template>

<style scoped>
.vpn-shell {
  display: grid;
  gap: 0.82rem;
  animation: reveal 0.45s ease both;
}

.header-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.3rem 0 0.5rem;
  gap: 0.6rem;
}

.view-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(1.15rem, 2.3vw, 1.45rem);
  letter-spacing: 0.01em;
}

.view-icon {
  width: 1.58rem;
  height: 1.58rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(79, 140, 255, 0.42);
  background: linear-gradient(145deg, rgba(79, 140, 255, 0.3), rgba(79, 140, 255, 0.1));
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.2);
  color: #cfe0ff;
  display: grid;
  place-items: center;
  animation: pulseIcon 2.8s ease-in-out infinite;
}

.head-pills {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
}

.head-pill {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 9999px;
  padding: 0.2rem 0.48rem;
  font-size: 0.72rem;
  color: var(--text-soft);
  background: rgba(12, 17, 31, 0.72);
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
}

.control-ribbon {
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  background: linear-gradient(145deg, rgba(16, 21, 36, 0.88), rgba(10, 14, 26, 0.94));
  padding: 0.62rem;
  display: grid;
  gap: 0.55rem;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.75fr) auto auto auto;
  align-items: center;
}

.ribbon-input,
.ribbon-select {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.72rem;
  background: rgba(9, 11, 18, 0.66);
  padding: 0.28rem 0.52rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.meta-tile {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.82rem;
  background: rgba(12, 17, 31, 0.74);
  padding: 0.55rem 0.65rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
}

.meta-icon {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 0.45rem;
  background: rgba(79, 140, 255, 0.18);
  color: #a8c5ff;
  display: grid;
  place-items: center;
}

.meta-tile strong,
.meta-tile p {
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-tile strong {
  font-size: 0.9rem;
}

.meta-tile p {
  margin-top: 0.14rem;
  color: var(--text-soft);
  font-size: 0.77rem;
}

.proxy-grid-wrap {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.92rem;
  background: rgba(11, 15, 27, 0.76);
  padding: 0.65rem;
}

.proxy-grid {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  align-content: start;
}

.input-surface,
.select-surface,
.settings-card input,
.settings-card select {
  width: 100%;
  border: 0;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--text-main);
  padding: 0.3rem 0.35rem;
}

.panel-button {
  border: 1px solid rgba(79, 140, 255, 0.44);
  border-radius: 0.7rem;
  background: rgba(10, 14, 26, 0.72);
  color: var(--text-main);
  padding: 0.42rem 0.66rem;
  font-size: 0.78rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  transition: 0.2s ease;
}

.panel-button:hover {
  border-color: rgba(79, 140, 255, 0.82);
  transform: translateY(-1px);
}

.panel-button.ghost {
  border-color: rgba(148, 163, 184, 0.35);
}

.panel-button.export {
  border-color: rgba(255, 183, 92, 0.54);
}

.pager {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pager-control {
  min-width: 36px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.62rem;
  background: rgba(10, 14, 26, 0.78);
  padding: 0.3rem 0.6rem;
}

.pager-control.active {
  border-color: rgba(79, 140, 255, 0.85);
  background: rgba(79, 140, 255, 0.15);
}

.notice-chip {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  border: 1px solid rgba(79, 140, 255, 0.4);
  background: rgba(16, 21, 36, 0.94);
  border-radius: 0.7rem;
  padding: 0.5rem 0.75rem;
  z-index: 60;
}

@media (max-width: 1100px) {
  .control-ribbon {
    grid-template-columns: minmax(0, 1fr) minmax(180px, 1fr);
  }
}

@media (max-width: 760px) {
  .header-row {
    justify-content: center;
    flex-wrap: wrap;
  }

  .head-pills {
    width: 100%;
    justify-content: center;
  }

  .control-ribbon {
    grid-template-columns: 1fr;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes pulseIcon {
  0%,
  100% {
    box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.2), 0 0 0 rgba(79, 140, 255, 0);
  }
  50% {
    box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.34), 0 0 14px rgba(79, 140, 255, 0.26);
  }
}

.settings-card {
  border: 1px solid var(--line);
  background: rgba(12, 17, 30, 0.98);
  border-radius: 0.95rem;
  padding: 1rem;
}

.settings-dialog {
  border: none;
  border-radius: 0.95rem;
  padding: 0;
  width: min(740px, 92vw);
  max-height: min(84vh, 760px);
  background: transparent;
}

.settings-dialog::backdrop {
  background: rgba(8, 11, 20, 0.72);
  backdrop-filter: blur(2px);
}

.settings-actions {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
}

.settings-card h3 {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.1rem;
}

.settings-card p {
  color: var(--text-soft);
  margin-top: 0.35rem;
  margin-bottom: 0.7rem;
}

.field-grid {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.field {
  display: grid;
  gap: 0.34rem;
}

.field span {
  color: var(--text-soft);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.switcher {
  align-content: center;
}

.preview {
  margin-top: 0.65rem;
  font-size: 0.84rem;
  color: var(--text-soft);
}

.preview strong {
  color: var(--text-main);
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
</style>
