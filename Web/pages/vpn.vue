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
const openToast = ref(false);
const toastText = ref("");
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

watch([openToast], () => {
  setTimeout(() => {
    openToast.value = false;
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
  <dialog id="settings_modal" class="modal">
    <div class="modal-box settings-card">
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

      <div class="modal-action">
        <form method="dialog">
          <button class="action-btn">Done</button>
        </form>
      </div>
    </div>
  </dialog>

  <section class="vpn-shell">
    <div class="header-row">
      <div>
        <p class="kicker">Build</p>
        <h1>Build</h1>
      </div>
      <div class="chip">{{ selectedProxies.getSelectedProxies.length }} selected</div>
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
          <button class="action-btn" @click="displaySelected = !displaySelected">
            {{ displaySelected ? "Show All" : "Only Selected" }}
          </button>
        </CardWithSlot>

        <CardWithSlot icon="cog">
          <div class="stack">
            <button class="action-btn" onclick="settings_modal.showModal()">Settings</button>
            <button
              class="action-btn"
              @click="
                async () => {
                  await copyToClipboard();
                  openToast = true;
                  toastText = 'Proxy copied to clipboard!';
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
      <button class="pager-btn" @click="page--">&lt;</button>
      <button
        v-for="pageIndex in pagination"
        :key="pageIndex"
        class="pager-btn"
        :class="pageIndex == page ? 'active' : ''"
        @click="page = pageIndex"
      >
        {{ pageIndex }}
      </button>
      <button class="pager-btn" @click="page++">&gt;</button>
    </div>

    <div v-if="openToast" class="toast-box">{{ toastText }}</div>
  </section>
</template>

<style scoped>
.vpn-shell {
  display: grid;
  gap: 1rem;
  animation: reveal 0.45s ease both;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.8rem;
}

.kicker {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 700;
}

h1 {
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(1.4rem, 2.7vw, 2rem);
}

.chip {
  border: 1px solid rgba(79, 140, 255, 0.35);
  background: rgba(79, 140, 255, 0.12);
  border-radius: 9999px;
  padding: 0.3rem 0.68rem;
  font-size: 0.78rem;
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

.action-btn {
  border: 1px solid rgba(79, 140, 255, 0.45);
  border-radius: 0.7rem;
  background: rgba(79, 140, 255, 0.16);
  color: var(--text-main);
  padding: 0.48rem 0.75rem;
  transition: 0.2s ease;
}

.action-btn:hover {
  border-color: rgba(79, 140, 255, 0.82);
}

.pager {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pager-btn {
  min-width: 36px;
  border: 1px solid var(--line);
  border-radius: 0.62rem;
  background: rgba(16, 21, 36, 0.8);
  padding: 0.3rem 0.6rem;
}

.pager-btn.active {
  border-color: rgba(79, 140, 255, 0.85);
  background: rgba(79, 140, 255, 0.15);
}

.toast-box {
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
