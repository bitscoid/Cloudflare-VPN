import { getFlagEmoji } from './string'
import { useRuntimeConfig } from '#imports'

const vlessTemplate =
  'vless://fc60147e-76b8-4bc5-b691-90b2da79e3d2@support.zoom.us:443?encryption=none&type=ws&host=vpn.bits.co.id&security=tls&sni=vpn.bits.co.id&path=%2F172.232.239.151-587#1%20%F0%9F%87%AE%F0%9F%87%A9%20Akamai%20Connected%20Cloud%20WS%20TLS%20[vpn]'
const trojanTemplate =
  'trojan://86768774-70b2-4c15-80c3-02066fb1e3b6@support.zoom.us:443?encryption=none&type=ws&host=vpn.bits.co.id&security=tls&sni=vpn.bits.co.id&path=%2F35.219.50.99-443#1%20%F0%9F%87%AE%F0%9F%87%A9%20Google%20Cloud%20WS%20TLS%20[vpn]'
const ssTemplate =
  'ss://bm9uZTpkMDIzMmM1NS1kZjE0LTRjMzMtYTMxOS1jNGM1NTVmMmIwZjQ%3D@support.zoom.us:443?plugin=v2ray-plugin%3Btls%3Bmux%3D0%3Bmode%3Dwebsocket%3Bpath%3D%2F43.218.77.16-1443%3Bhost%3Dvpn.bits.co.id#1%20%F0%9F%87%AE%F0%9F%87%A9%20Amazon.com%20WS%20TLS%20[vpn]'

type proxyType = {
  ip: string
  isp: string
  port: string
  country: string
}
type protocolsType = 'trojan' | 'vless' | 'ss'
export type ProxySettings = {
  server: string
  host: string
  protocol: protocolsType
  format: 'mihomo' | 'clash' | 'provider' | 'raw'
  tls: boolean
  wildcard: boolean
}

export function getProtocols() {
  return ['trojan', 'vless', 'ss']
}

export function getFormats() {
  return ['mihomo', 'clash', 'provider', 'raw']
}

export async function parseProxies(proxies: proxyType[], settings: ProxySettings) {
  const proxyParser = new ParseProxies(proxies, settings)

  switch (settings.format) {
    case 'raw':
      return proxyParser.toRaw()
    case 'clash':
    case 'mihomo':
      return proxyParser.toClash()
    case 'provider':
      return proxyParser.toProvider()
  }
}

class ParseProxies {
  proxies: proxyType[] = []
  settings: ProxySettings

  constructor(proxies: proxyType[], settings: ProxySettings) {
    this.proxies = proxies
    this.settings = settings
  }

  toRaw() {
    const results: string[] = []
    let configTemplate: URL | undefined | null

    switch (this.settings.protocol) {
      case 'trojan':
        configTemplate = URL.parse(trojanTemplate)
        break
      case 'vless':
        configTemplate = URL.parse(vlessTemplate)
        break
      case 'ss':
        configTemplate = URL.parse(ssTemplate)
        break
    }

    if (configTemplate) {
      configTemplate.hostname = this.settings.server
      if (!this.settings.tls) {
        configTemplate.port = '80'
      }

      for (const proxy of this.proxies) {
        let config = configTemplate
        let configSearchParams = config?.searchParams

        if (config.protocol == 'ss:') {
          let ssPlugin: string[] = (configSearchParams.get('plugin') as string)?.split(';')
          const effectiveHost = this.settings.wildcard
            ? `${this.settings.server}.${this.settings.host}`
            : this.settings.host

          ssPlugin = ssPlugin?.map(key =>
            key.startsWith('path') ? `path=/${proxy.ip}-${proxy.port}` : key
          )
          ssPlugin = ssPlugin?.map(key => (key.startsWith('host') ? `host=${effectiveHost}` : key))

          if (!this.settings.tls) {
            ssPlugin?.splice(ssPlugin.indexOf('tls'), 1)
          }
          configSearchParams.set('plugin', ssPlugin?.join(';'))
        } else {
          configSearchParams?.set('path', `/${proxy.ip}-${proxy.port}`)
          if (!this.settings.tls) {
            configSearchParams?.set('security', 'none')
          }
          const effectiveHost = this.settings.wildcard
            ? `${this.settings.server}.${this.settings.host}`
            : this.settings.host
          configSearchParams?.set('host', effectiveHost)
          configSearchParams?.set('sni', effectiveHost)
        }

        config.hash = `${getFlagEmoji(proxy.country)} ${proxy.isp} - ${proxy.ip}`

        config.search = configSearchParams.toString()
        results.push(config.toString())
      }
    }

    return results.join('\n')
  }

  async toClash() {
    const config = useRuntimeConfig()
    const proxies = this.toRaw()
    const res = await fetch(`${config.public.apiBase}/convert`, {
      method: 'post',
      body: JSON.stringify({
        url: proxies.split('\n').join(','),
        format: 'clash',
      }),
    })

    return await res.text()
  }

  async toProvider() {
    const config = useRuntimeConfig()
    const proxies = this.toRaw()
    const res = await fetch(`${config.public.apiBase}/convert`, {
      method: 'post',
      body: JSON.stringify({
        url: proxies.split('\n').join(','),
        format: 'provider',
      }),
    })

    return await res.text()
  }
}
