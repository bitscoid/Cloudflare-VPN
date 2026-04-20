<script setup lang="ts">
definePageMeta({
  title: "Reference",
});

const parameters = [
  { key: "pass", desc: "Enter password", isMultiple: false, example: "&pass=fool" },
  { key: "free", desc: "Select free VPN only", isMultiple: false, example: "&free=1" },
  { key: "premium", desc: "Select premium VPN only", isMultiple: false, example: "&premium=1" },
  { key: "vpn", desc: "Select VPN by protocol", isMultiple: true, example: "&vpn=vmess" },
  { key: "format", desc: "Select format", isMultiple: false, example: "&format=clash" },
  { key: "region", desc: "Select VPN by region", isMultiple: true, example: "&region=Asia" },
  { key: "cc", desc: "Select by country code", isMultiple: true, example: "&cc=SG" },
  { key: "include", desc: "Select by provider name", isMultiple: true, example: "&include=melbi" },
  { key: "exclude", desc: "Exclude by provider name", isMultiple: true, example: "&exclude=amazon" },
  { key: "tls", desc: "Filter TLS/NTLS", isMultiple: false, example: "&tls=1" },
  { key: "network", desc: "Filter by network", isMultiple: true, example: "&network=ws" },
  { key: "port", desc: "Filter by port", isMultiple: true, example: "&port=80,443" },
  { key: "ip", desc: "Convert host to IP", isMultiple: false, example: "&ip=1" },
  { key: "sni", desc: "Set SNI host", isMultiple: true, example: "&sni=sni.host" },
  { key: "cdn", desc: "Set CDN host", isMultiple: true, example: "&cdn=cdn.host" },
  { key: "mode", desc: "Select mode", isMultiple: true, example: "&mode=cdn" },
  { key: "limit", desc: "Limit result size", isMultiple: false, example: "&limit=10" },
  { key: "subdomain", desc: "Add server subdomain", isMultiple: false, example: "&subdomain=zoom.us" },
  { key: "arg", desc: "Custom key-value args", isMultiple: true, example: "&arg=xudp,key:value" },
];
</script>

<template>
  <section class="docs-shell">
    <div class="head">
      <h1>Query Reference</h1>
      <p>Parameters for subscription customization.</p>
    </div>

    <div class="table-shell">
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Description</th>
            <th>Multiple</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in parameters" :key="data.key">
            <td>{{ data.key }}</td>
            <td>{{ data.desc }}</td>
            <td>
              <span class="chip" :class="data.isMultiple ? 'yes' : 'no'">
                {{ data.isMultiple ? "Yes" : "No" }}
              </span>
            </td>
            <td class="example">{{ data.example }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.docs-shell {
  display: grid;
  gap: 1rem;
  animation: reveal 0.45s ease both;
}

.head h1 {
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
}

.head p {
  color: var(--text-soft);
}

.table-shell {
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: rgba(16, 21, 36, 0.85);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

th {
  color: var(--text-soft);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chip {
  border-radius: 9999px;
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid transparent;
}

.chip.yes {
  color: #8ef2d9;
  border-color: rgba(96, 235, 190, 0.45);
  background: rgba(43, 194, 147, 0.13);
}

.chip.no {
  color: #ffb4c2;
  border-color: rgba(255, 122, 146, 0.45);
  background: rgba(239, 76, 109, 0.13);
}

.example {
  color: #9fc0ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
