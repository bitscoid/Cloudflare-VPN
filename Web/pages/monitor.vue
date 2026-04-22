<script setup lang="ts">
import prettyBytes from 'pretty-bytes'

definePageMeta({
  title: 'Monitor',
})

const config = useRuntimeConfig()
const refreshInterval = ref(2)
const serverList = ref([
  {
    url: 'vpn.bits.co.id',
    ping: [] as Array<{ delay: number; date: Date }>,
    info: {} as ServerInfo,
    status: {} as ServerStatus,
    speed: {} as ServerSpeed,
    errors: [] as string[],
  },
])
const intervalIds: ReturnType<typeof setInterval>[] = []

type ServerInfo = {
  org?: string
  [key: string]: unknown
}

type ServerStatus = {
  nic?: Array<{ bytesSent?: number; bytesRecv?: number }>
  cpu?: string[]
  [key: string]: unknown
}

type ServerSpeed = {
  upload?: number
  download?: number
}

async function fetchServerData<T>(
  server: string,
  endpoint: string
): Promise<{ error: false; result: T } | { error: true; message: string }> {
  try {
    const res = await fetch(`https://${server}/api/v1/${endpoint}`)
    const text = await res.text()
    if (res.status === 200) {
      try {
        return { error: false, result: JSON.parse(text) as T }
      } catch {
        return { error: false, result: text as unknown as T }
      }
    }
    throw new Error(res.statusText)
  } catch (e: Error) {
    return { error: true, message: e.message }
  }
}

async function getServerPing(server: string) {
  const startTime = Date.now()
  const res = await fetchServerData<null>(server, 'ping')
  const finishTime = Date.now()
  if (!res.error) {
    return { error: false, result: finishTime - startTime }
  }
  return res
}

async function getServerInfo(server: string) {
  return fetchServerData(server, 'info')
}

async function getServerStatus(server: string) {
  return fetchServerData(server, 'status')
}

function latestPingDelay(server: any) {
  const lastPing = server.ping?.[server.ping.length - 1]
  return typeof lastPing?.delay === 'number' ? lastPing.delay : null
}

function pingStateClass(server: any) {
  const delay = latestPingDelay(server)
  if (delay === null) return 'status-idle'
  if (delay <= 150) return 'status-good'
  if (delay <= 350) return 'status-warn'
  return 'status-bad'
}

function pingLabel(server: any) {
  const delay = latestPingDelay(server)
  return delay === null ? '--' : `${delay} ms`
}

function cpuLabel(server: any) {
  const rawCpu = Number(server.status?.cpu?.[0])
  return Number.isFinite(rawCpu) ? `${Math.round(rawCpu)}%` : '0%'
}

function ramLabel(server: any) {
  return server.status?.mem ? prettyBytes(server.status.mem.used) : '--'
}

function speedLabel(speed: number | undefined) {
  return speed && speed > 0 ? `${prettyBytes(speed)}/s` : '--'
}

onMounted(async () => {
  for (const server of serverList.value) {
    getServerInfo(server.url).then(res => {
      if (res.error) {
        server.errors.unshift(res.message)
        return
      }
      server.info = res.result
    })

    intervalIds.push(
      setInterval(() => {
        for (const item of serverList.value) {
          if (item.errors.length) item.errors.pop()
        }
      }, 5000)
    )

    intervalIds.push(
      setInterval(async () => {
        getServerStatus(server.url).then(res => {
          if (res.error) {
            server.errors.unshift(res.message)
            return
          }

          const currentSent = res.result.nic?.[0]?.bytesSent ?? 0
          const currentRecv = res.result.nic?.[0]?.bytesRecv ?? 0
          const previousSent = server.status.nic?.[0]?.bytesSent ?? currentSent
          const previousRecv = server.status.nic?.[0]?.bytesRecv ?? currentRecv

          server.speed.upload = Math.max(0, (currentSent - previousSent) / refreshInterval.value)
          server.speed.download = Math.max(0, (currentRecv - previousRecv) / refreshInterval.value)
          server.status = res.result
        })

        getServerPing(server.url).then(res => {
          if (res.error) {
            server.errors.unshift(res.message)
          }

          server.ping.push({
            delay: res.result ? res.result : 0,
            date: new Date(),
          })

          if (server.ping.length > 24) {
            server.ping.shift()
          }
        })
      }, refreshInterval.value * 1000)
    )
  }
})

onBeforeUnmount(() => {
  intervalIds.forEach(id => clearInterval(id))
})
</script>

<template>
  <section class="uptime-shell" aria-label="Server monitor">
    <div class="head-row">
      <h1 class="view-title">
        <span class="view-icon"><Icon name="uil:chart-line" size="14" aria-hidden="true" /></span>
        <span>Monitor</span>
      </h1>
      <div class="head-pills" aria-label="Monitor statistics">
        <span class="refresh-pill"
          ><Icon name="uil:history" size="13" aria-hidden="true" /> {{ refreshInterval }}s</span
        >
        <span class="refresh-pill"
          ><Icon name="uil:server-network" size="13" aria-hidden="true" />
          {{ serverList.length }}</span
        >
      </div>
    </div>

    <Card
      v-for="(server, idx) in serverList"
      :key="server.url"
      role="article"
      :aria-label="`Server ${server.url}`"
    >
      <div class="monitor-row" :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="endpoint-cell">
          <div class="endpoint-provider-row">
            <div class="endpoint-pill">
              <Icon name="uil:server-network" size="14" aria-hidden="true" />
              <span class="endpoint-name">{{ server.url }}</span>
            </div>
            <div class="provider-pill">
              <Icon name="uil:building" size="12" aria-hidden="true" />
              <span class="provider-name">{{ server.info.org || 'Loading provider...' }}</span>
            </div>
          </div>
        </div>

        <div class="metric-cluster" role="group" aria-label="Server metrics">
          <div class="mini-pill" aria-label="CPU usage">
            <Icon name="uil:processor" size="12" aria-hidden="true" /> {{ cpuLabel(server) }}
          </div>
          <div class="mini-pill" aria-label="Memory usage">
            <Icon name="uil:database" size="12" aria-hidden="true" /> {{ ramLabel(server) }}
          </div>
          <div class="mini-pill" aria-label="Upload speed">
            <Icon name="uil:upload" size="12" aria-hidden="true" />
            {{ speedLabel(server.speed.upload) }}
          </div>
          <div class="mini-pill" aria-label="Download speed">
            <Icon name="uil:download-alt" size="12" aria-hidden="true" />
            {{ speedLabel(server.speed.download) }}
          </div>
          <div
            class="mini-pill ping-pill"
            :class="pingStateClass(server)"
            aria-label="Ping latency"
          >
            <span class="dot" aria-hidden="true"></span>
            <Icon name="uil:wifi" size="12" aria-hidden="true" /> {{ pingLabel(server) }}
          </div>
        </div>

        <div v-if="server.errors.length" class="error-pill" role="alert" aria-live="polite">
          <Icon name="uil:exclamation-triangle" size="15" aria-hidden="true" />
          {{ server.errors[0] }}
        </div>
      </div>
    </Card>
  </section>
</template>

<style scoped>
.uptime-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.62rem;
  height: 100%;
  overflow: hidden;
  padding-top: 0.7rem;
  animation: reveal 0.5s ease both;
}

.head-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  margin: 0.3rem 0 0.5rem;
}

.view-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  font-family: 'Space Grotesk', sans-serif;
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
  grid-template-columns: minmax(200px, 1.2fr) minmax(420px, 2.2fr);
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  animation: fadeUp 0.5s ease both;
}

.endpoint-cell {
  min-width: 0;
}

.endpoint-provider-row {
  display: flex;
  align-items: center;
  gap: 0.34rem;
  width: 100%;
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.endpoint-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  border-radius: 9999px;
  font-size: 0.76rem;
  border: 1px solid rgba(79, 140, 255, 0.42);
  padding: 0.25rem 0.56rem;
  background: linear-gradient(145deg, rgba(79, 140, 255, 0.24), rgba(79, 140, 255, 0.08));
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.18);
  min-width: 0;
  max-width: 54%;
  flex: 0 1 auto;
}

.provider-pill {
  border: 1px solid rgba(96, 235, 190, 0.3);
  border-radius: 9999px;
  padding: 0.23rem 0.52rem;
  background: linear-gradient(145deg, rgba(24, 120, 96, 0.22), rgba(24, 120, 96, 0.08));
  color: #bcefe2;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  min-width: 0;
  width: fit-content;
  max-width: 44%;
  flex: 0 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.endpoint-name,
.provider-name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-cluster {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  min-width: 0;
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
  min-width: 0;
  white-space: nowrap;
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

  .metric-cluster {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (max-width: 1180px) {
  .metric-cluster {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 760px) {
  .head-row {
    flex-wrap: wrap;
    justify-content: center;
    margin: 0.35rem 0 0.75rem;
  }

  .head-pills {
    position: static;
    width: 100%;
    justify-content: center;
  }

  .endpoint-provider-row {
    flex-wrap: wrap;
  }

  .endpoint-pill,
  .provider-pill {
    max-width: 100%;
    flex: 1 1 auto;
  }

  .endpoint-pill,
  .provider-pill,
  .mini-pill {
    font-size: 0.69rem;
  }
}
</style>
