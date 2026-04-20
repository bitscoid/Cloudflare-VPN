<script setup lang="ts">
definePageMeta({
  title: "Build",
});

const route = useRoute();
const selectedProxies = useSelectedProxiesStore();

const myip = reactive({
  asOrganization: "",
  ip: "",
  city: "",
  region: "",
  country: "",
});

const proxies = ref([{ ip: "", isp: "", port: "", country: "" }]);
const countries = ref([""]);
const selectedCountry = ref("All");
const displayProxies = ref([{ ip: "", isp: "", port: "", country: "" }]);
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

function setDisplayProxies() {
  const displayProxiesTemp = [];
  const proxiesTemp = getTempProxies();

  for (let i = page.value * itemPerPage.value; i < page.value * itemPerPage.value + itemPerPage.value; i++) {
    const proxy = proxiesTemp[i];
    if (proxy?.isp.toString()) {
      displayProxiesTemp.push(proxiesTemp[i]);
    }
  }

  displayProxies.value = displayProxiesTemp as any;
}

function setPagination() {
  const proxiesTemp = getTempProxies();
  const maxIndex = Math.floor(proxiesTemp.length / itemPerPage.value);
  const maxItem = 5;
  const paginationTemp = [];

  if (page.value < 0) page.value = 0;
  if (page.value > maxIndex) page.value = maxIndex;
  for (let i = page.value <= 2 ? 0 : page.value + 2 >= maxIndex ? maxIndex - 4 : page.value - 2; i <= maxIndex; i++) {
    paginationTemp.push(i);
    if (paginationTemp.length >= maxItem) break;
  }
  pagination.value = paginationTemp;
}

async function copyToClipboard() {
  const configResult = await parseProxies(
    proxies.value.filter((proxy) => selectedProxies.getSelectedProxies.includes(`${proxy.ip}:${proxy.port}`)) as any,
    proxySettings,
  );
  navigator.clipboard.writeText(configResult as string);
}

watch([page, proxies, selectedCountry, displaySelected, search], () => {
  setDisplayProxies();
  setPagination();
});

watch([isNoticeOpen], () => {
  setTimeout(() => {
    isNoticeOpen.value = false;
  }, 2600);
});

if (import.meta.client) {
  $fetch("https://vpn.bits.co.id/api/v1/myip", { cache: "no-cache" })
    .then((jsonValue: any) => {
      myip.asOrganization = jsonValue?.asOrganization || "Unknown";
      myip.ip = jsonValue?.ip || "Unknown";
      myip.city = jsonValue?.city || "Unknown";
      myip.region = jsonValue?.region || "Unknown";
      myip.country = jsonValue?.country || "Unknown";
    })
    .catch(() => {
      myip.asOrganization = "Failed";
      myip.ip = "Failed";
    });
}

useFetch("https://raw.githubusercontent.com/bitscoid/Cloudflare-VPN/refs/heads/main/Proxy/proxyList.txt").then((res) => {
  if (res.status.value === "success") {
    const proxiesTemp = [];
    const countriesTemp = [];

    for (const data of (res.data.value as string).split("\n")) {
      const [ip, port, country, isp] = data.split(",");
      proxiesTemp.push({ ip, port, country: country.toLowerCase(), isp });
      countriesTemp.push(country);
    }

    proxies.value = proxiesTemp as any;
    countries.value = ["All", ...new Set(countriesTemp)];
  }
});
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
    </div>

    <div class="panel-grid">
      <aside class="stack">
        <CardWithSlot icon="traffic-light">
          <div>
            <strong>{{ myip.asOrganization }}</strong>
            <p>{{ myip.ip }}</p>
          </div>
        </CardWithSlot>

        <CardWithSlot icon="map-marker">
          <div>
            <strong>{{ myip.city }}, {{ myip.region }}</strong>
            <p>{{ myip.country }}</p>
          </div>
        </CardWithSlot>

        <CardWithSlot icon="cloud-computing">
          <select v-model="selectedCountry" class="select-surface">
            <option v-for="country in countries" :key="country">{{ country }}</option>
          </select>
        </CardWithSlot>
      </aside>

      <div class="proxy-grid">
        <ProxyCard
          v-for="proxy in displayProxies"
          :key="`${proxy.ip}:${proxy.port}`"
          :isp="proxy.isp"
          :ip-port="`${proxy.ip}:${proxy.port}`"
          :country="proxy.country"
        />
      </div>

      <aside class="stack">
        <CardWithSlot icon="search">
          <input v-model="search" type="text" placeholder="Search provider" class="input-surface" />
        </CardWithSlot>

        <CardWithSlot icon="list-ul">
          <button class="panel-button" @click="displaySelected = !displaySelected">
            {{ displaySelected ? "Show All" : "Only Selected" }}
          </button>
        </CardWithSlot>

        <CardWithSlot icon="cog">
          <div class="stack">
            <button class="panel-button" onclick="settings_dialog.showModal()">Settings</button>
            <button
              class="panel-button"
              @click="
                async () => {
                  await copyToClipboard();
                  isNoticeOpen = true;
                  noticeText = 'Proxy copied to clipboard!';
                }
              "
            >
              Export
            </button>
          </div>
        </CardWithSlot>
      </aside>
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
  gap: 1rem;
  animation: reveal 0.45s ease both;
}

.header-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0 0.9rem;
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
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .panel-grid {
    grid-template-columns: 260px 1fr 260px;
  }
}

.stack {
  display: grid;
  gap: 0.7rem;
  align-content: start;
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
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: rgba(9, 11, 18, 0.8);
  color: var(--text-main);
  padding: 0.5rem 0.65rem;
}

.panel-button {
  border: 1px solid rgba(79, 140, 255, 0.45);
  border-radius: 0.7rem;
  background: rgba(79, 140, 255, 0.16);
  color: var(--text-main);
  padding: 0.48rem 0.75rem;
  transition: 0.2s ease;
}

.panel-button:hover {
  border-color: rgba(79, 140, 255, 0.82);
}

.pager {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pager-control {
  min-width: 36px;
  border: 1px solid var(--line);
  border-radius: 0.62rem;
  background: rgba(16, 21, 36, 0.8);
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
