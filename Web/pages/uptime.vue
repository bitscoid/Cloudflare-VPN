<script setup lang="ts">
import prettyBytes from "pretty-bytes";

definePageMeta({
  title: "Monitor",
});

const refreshInterval = ref(2);
const serverList = ref([
  {
    url: "vpn.bits.co.id",
    ping: [] as Array<{ delay: number; date: Date }>,
    info: {} as any,
    status: {} as any,
    speed: {} as any,
    errors: [] as string[],
  },
]);

async function getServerPing(server: string) {
  try {
    const startTime = Date.now();
    const res = await fetch(`https://${server}/api/v1/ping`);
    const finishTime = Date.now();

    if (res.status == 200) {
      return {
        error: false,
        result: finishTime - startTime,
      };
    }
    throw new Error(res.statusText);
  } catch (e: any) {
    return {
      error: true,
      message: e.message,
    };
  }
}

async function getServerInfo(server: string) {
  try {
    const res = await fetch(`https://${server}/api/v1/info`);
    if (res.status == 200) {
      return {
        error: false,
        result: await res.json(),
      };
    }
    throw new Error(res.statusText);
  } catch (e: any) {
    return {
      error: true,
      message: e.message,
    };
  }
}

async function getServerStatus(server: string) {
  try {
    const res = await fetch(`https://${server}/api/v1/status`);
    if (res.status == 200) {
      return {
        error: false,
        result: await res.json(),
      };
    }
    throw new Error(res.statusText);
  } catch (e: any) {
    return {
      error: true,
      message: e.message,
    };
  }
}

function latestPingDelay(server: any) {
  const lastPing = server.ping?.[server.ping.length - 1];
  return typeof lastPing?.delay === "number" ? lastPing.delay : null;
}

function pingStateClass(server: any) {
  const delay = latestPingDelay(server);
  if (delay === null) return "status-idle";
  if (delay <= 150) return "status-good";
  if (delay <= 350) return "status-warn";
  return "status-bad";
}

function pingLabel(server: any) {
  const delay = latestPingDelay(server);
  return delay === null ? "--" : `${delay} ms`;
}

function cpuLabel(server: any) {
  const rawCpu = Number(server.status?.cpu?.[0]);
  return Number.isFinite(rawCpu) ? `${Math.round(rawCpu)}%` : "0%";
}

function ramLabel(server: any) {
  return server.status?.mem ? prettyBytes(server.status.mem.used) : "--";
}

function speedLabel(speed: number | undefined) {
  return speed && speed > 0 ? `${prettyBytes(speed)}/s` : "--";
}

onMounted(async () => {
  for (const server of serverList.value) {
    getServerInfo(server.url).then((res) => {
      if (res.error) {
        server.errors.unshift(res.message);
        return;
      }
      server.info = res.result;
    });

    setInterval(() => {
      for (const item of serverList.value) {
        if (item.errors.length) item.errors.pop();
      }
    }, 5000);

    setInterval(async () => {
      getServerStatus(server.url).then((res) => {
        if (res.error) {
          server.errors.unshift(res.message);
          return;
        }

        const currentSent = res.result.nic?.[0]?.bytesSent ?? 0;
        const currentRecv = res.result.nic?.[0]?.bytesRecv ?? 0;
        const previousSent = server.status.nic?.[0]?.bytesSent ?? currentSent;
        const previousRecv = server.status.nic?.[0]?.bytesRecv ?? currentRecv;

        server.speed.upload = Math.max(0, (currentSent - previousSent) / refreshInterval.value);
        server.speed.download = Math.max(0, (currentRecv - previousRecv) / refreshInterval.value);
        server.status = res.result;
      });

      getServerPing(server.url).then((res) => {
        if (res.error) {
          server.errors.unshift(res.message);
        }

        server.ping.push({
          delay: res.result ? res.result : 0,
          date: new Date(),
        });

        if (server.ping.length > 24) {
          server.ping.shift();
        }
      });
    }, refreshInterval.value * 1000);
  }
});
</script>

<template>
  <section class="uptime-shell">
    <div class="head-row">
      <h1><Icon name="uil:chart-line" size="18" /> Monitor</h1>
      <div class="head-pills">
        <span class="refresh-pill"><Icon name="uil:history" size="13" /> {{ refreshInterval }}s</span>
        <span class="refresh-pill"><Icon name="uil:server-network" size="13" /> {{ serverList.length }}</span>
      </div>
    </div>

    <Card v-for="(server, idx) in serverList" :key="server.url">
      <div class="monitor-row" :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="endpoint-cell">
          <div class="endpoint-pill"><Icon name="uil:server-network" size="14" /> {{ server.url }}</div>
          <small class="provider-copy"><Icon name="uil:building" size="12" /> {{ server.info.org || "Loading provider..." }}</small>
        </div>

        <div class="metric-cluster">
          <div class="mini-pill ping-pill" :class="pingStateClass(server)">
            <span class="dot"></span>
            <Icon name="uil:wifi" size="12" /> {{ pingLabel(server) }}
          </div>
          <div class="mini-pill"><Icon name="uil:microchip" size="12" /> {{ cpuLabel(server) }}</div>
          <div class="mini-pill"><Icon name="uil:database" size="12" /> {{ ramLabel(server) }}</div>
          <div class="mini-pill"><Icon name="uil:upload" size="12" /> {{ speedLabel(server.speed.upload) }}</div>
          <div class="mini-pill"><Icon name="uil:download-alt" size="12" /> {{ speedLabel(server.speed.download) }}</div>
        </div>

        <div class="sparkline compact">
          <div
            v-for="(pingData, index) in server.ping"
            :key="index"
            class="bar"
            :style="{ height: `${Math.max(12, Math.min(100, pingData.delay))}%`, animationDelay: `${index * 0.03}s` }"
          ></div>
        </div>

        <div v-if="server.errors.length" class="error-pill">
          <Icon name="uil:exclamation-triangle" size="15" /> {{ server.errors[0] }}
        </div>
      </div>
    </Card>
  </section>
</template>

<style scoped>
.uptime-shell {
  display: grid;
  gap: 0.62rem;
  animation: reveal 0.5s ease both;
}

.head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.head-row h1 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(1.15rem, 2.3vw, 1.45rem);
}

.head-pills {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
}

.refresh-pill {
  border: 1px solid var(--line);
  border-radius: 9999px;
  padding: 0.24rem 0.5rem;
  color: var(--text-soft);
  background: rgba(14, 19, 34, 0.7);
  font-size: 0.74rem;
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
}

.monitor-row {
  padding: 0.65rem 0.72rem;
  display: grid;
  grid-template-columns: minmax(180px, 1.2fr) minmax(320px, 1.8fr) minmax(120px, 1fr);
  align-items: center;
  gap: 0.45rem;
  animation: fadeUp 0.5s ease both;
}

.endpoint-cell {
  display: grid;
  gap: 0.24rem;
}

.endpoint-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  border-radius: 9999px;
  font-size: 0.76rem;
  border: 1px solid var(--line);
  padding: 0.24rem 0.5rem;
  background: rgba(9, 11, 18, 0.58);
  width: fit-content;
}

.provider-copy {
  color: var(--text-soft);
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-cluster {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.mini-pill {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 9999px;
  padding: 0.22rem 0.5rem;
  font-size: 0.72rem;
  color: var(--text-main);
  background: rgba(9, 11, 18, 0.68);
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
}

.ping-pill {
  color: var(--text-main);
}

.dot {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 9999px;
  background: #6a7282;
}

.status-good {
  border-color: rgba(74, 222, 128, 0.42);
  background: rgba(34, 197, 94, 0.16);
}

.status-good .dot {
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.status-warn {
  border-color: rgba(251, 191, 36, 0.42);
  background: rgba(245, 158, 11, 0.16);
}

.status-warn .dot {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.52);
}

.status-bad {
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(239, 68, 68, 0.16);
}

.status-bad .dot {
  background: #f87171;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.52);
}

.status-idle {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(71, 85, 105, 0.16);
}

.sparkline {
  border-radius: 0.62rem;
  border: 1px solid var(--line);
  padding: 0.26rem;
  min-height: 40px;
  display: flex;
  align-items: flex-end;
  gap: 0.12rem;
  background: rgba(9, 11, 18, 0.7);
}

.bar {
  width: 100%;
  max-width: 7px;
  border-radius: 0.2rem;
  background: linear-gradient(to top, #4f8cff, #7eb3ff);
  animation: rise 0.4s ease both;
}

.error-pill {
  grid-column: 1 / -1;
  border: 1px solid rgba(255, 99, 132, 0.4);
  background: rgba(255, 70, 90, 0.08);
  color: #ffc9d2;
  border-radius: 0.62rem;
  padding: 0.32rem 0.5rem;
  font-size: 0.74rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 960px) {
  .monitor-row {
    grid-template-columns: 1fr;
  }

  .sparkline.compact {
    min-height: 44px;
  }
}

@media (max-width: 760px) {
  .head-row {
    flex-wrap: wrap;
  }

  .head-pills {
    width: 100%;
    justify-content: flex-start;
  }

  .endpoint-pill,
  .provider-copy,
  .mini-pill {
    font-size: 0.69rem;
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

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rise {
  from {
    transform: scaleY(0.15);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

</style>
