<script setup lang="ts">
const parameters = [
  {
    key: "pass",
    desc: "Enter password",
    isMultiple: false,
    example: "&pass=fool",
  },
  {
    key: "free",
    desc: "Select free VPN only",
    isMultiple: false,
    example: "&free=1",
  },
  {
    key: "premium",
    desc: "Select premium VPN only",
    isMultiple: false,
    example: "&premium=1",
  },
  {
    key: "vpn",
    desc: "Select VPN by protocol",
    isMultiple: true,
    example: "&vpn=vmess",
  },
  {
    key: "format",
    desc: "Select format",
    isMultiple: false,
    example: "&format=clash",
  },
  {
    key: "region",
    desc: "Select VPN by region",
    isMultiple: true,
    example: "&region=Asia",
  },
  {
    key: "cc",
    desc: "Select VPN by country code",
    isMultiple: true,
    example: "&cc=SG",
  },
  {
    key: "include",
    desc: "Select VPN by name",
    isMultiple: true,
    example: "&include=melbi",
  },
  {
    key: "exclude",
    desc: "Exclude VPN by name",
    isMultiple: true,
    example: "&exclude=amazon",
  },
  {
    key: "tls",
    desc: "Select VPN TLS or NTLS",
    isMultiple: false,
    example: "&tls=1",
  },
  {
    key: "network",
    desc: "Select VPN by network type",
    isMultiple: true,
    example: "&network=ws",
  },
  {
    key: "port",
    desc: "Select VPN by port",
    isMultiple: true,
    example: "&port=80,443",
  },
  {
    key: "ip",
    desc: "Convert VPN host domain to IP",
    isMultiple: false,
    example: "&ip=1",
  },
  {
    key: "sni",
    desc: "Set VPN with SNI host",
    isMultiple: true,
    example: "&sni=sni.host",
  },
  {
    key: "cdn",
    desc: "Set VPN with CDN host",
    isMultiple: true,
    example: "&cdn=cdn.host",
  },
  {
    key: "mode",
    desc: "Select connection mode",
    isMultiple: true,
    example: "&mode=cdn",
  },
  {
    key: "limit",
    desc: "Limit the number of VPNs",
    isMultiple: false,
    example: "&limit=10",
  },
  {
    key: "subdomain",
    desc: "Add subdomain to server domain",
    isMultiple: false,
    example: "&subdomain=zoom.us",
  },
  {
    key: "arg",
    desc: "Enter key-value pair",
    isMultiple: true,
    example: "&arg=xudp,key:value",
  },
];
</script>

<template>
  <div class="my-10 mx-[10%]">
    <div class="rounded-md">
      <table class="table">
        <thead>
          <tr class="font-black">
            <th>Key</th>
            <th>Desc</th>
            <th>Is Multiple</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in parameters">
            <td>{{ data.key }}</td>
            <td>{{ data.desc }}</td>
            <td>
              <span class="badge" :class="data.isMultiple ? 'badge-success' : 'badge-error'">{{
                data.isMultiple ? "Yes" : "No"
              }}</span>
            </td>
            <td>{{ data.example }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
