# BITS VPN

Modern VPN management platform powered by Cloudflare Workers dan Cloudflare Pages.

## Overview

BITS VPN adalah enterprise-grade VPN solution yang menggabungkan Cloudflare Workers untuk tunnel backend dan Nuxt 4 web interface untuk manajemen proxy. Mendukung multiple protocols (VLESS, Trojan, Shadowsocks, VMess) dengan fitur lengkap seperti subscription API, real-time health monitoring, dan multiple export formats.

## Features

- **Multi-Protocol Support**: VLESS, Trojan, Shadowsocks, VMess
- **Cloudflare Workers Backend**: Serverless tunnel dengan edge performance
- **Modern Web Interface**: Nuxt 4 + Tailwind CSS
- **Subscription API**: Support query parameters untuk filtering
- **Real-time Monitoring**: Proxy health check dengan latency display
- **Export Formats**: Clash, sing-box, raw, Mihomo, provider

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Nuxt 4, Vue 3, Tailwind CSS |
| Backend | Cloudflare Workers, KV, Cache |
| Deployment | Cloudflare Pages, Cloudflare Workers |

## Repository Structure

```
Cloudflare-VPN/
├── Web/          # Frontend application (Nuxt 4)
│   ├── pages/    # Build, Convert, Monitor pages
│   ├── components/
│   ├── stores/ # Pinia state management
│   └── utils/  # Configuration parsers
│
└── Proxy/       # Backend (Cloudflare Workers)
    └── _worker.js   # VPN tunnel handler
```

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- npm or bun

### Frontend Setup

```bash
cd Web
npm install
npm run dev
```

Akses development server di `http://localhost:3000`.

### Production Build

```bash
cd Web
npm run build
```

### Deployment

**Frontend ke Cloudflare Pages:**

```bash
cd Web
npm run build
npx wrangler pages deploy .output/public --project-name bits-vpn
```

**Backend ke Cloudflare Workers:**

1. Buka [Cloudflare Workers Dashboard](https://dash.cloudflare.com/workers)
2. Buat worker baru
3. Copy isi `_worker.js` ke editor
4. (Optional) Tambahkan KV bindings jika diperlukan
5. Deploy

## API Reference

### Subscription Endpoint

```
GET /api/v1/sub
```

**Query Parameters:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `cc` | Country code filter | `cc=ID,SG` |
| `format` | Output format | `format=clash` |
| `limit` | Proxy limit | `limit=10` |
| `vpn` | Protocol filter | `vpn=vless,trojan` |
| `port` | Port filter | `port=443` |
| `domain` | Server domain | `domain=zoom.us` |

**Supported Formats:** `raw`, `clash`, `mihomo`, `provider`, `v2ray`

### Health Check Endpoint

```
GET /api/v1/check?ip=<ip:port>
```

Returns JSON dengan `proxyip` (boolean) dan `delay` (ms).

## Pages Overview

| Route | Description |
|-------|-------------|
| `/build` | Build & manage proxy list |
| `/convert` | Convert URLs ke berbagai format |
| `/monitor` | Real-time proxy health monitoring |

## Configuration

Edit profile settings di halaman `/build` melalui Settings modal:

- **Server**: Target server (default: `support.zoom.us`)
- **Host**: VPN host (default: `vpn.bits.co.id`)
- **Protocol**: VLESS, Trojan, Shadowsocks, VMess
- **TLS**: Enable/disable TLS
- **Wildcard**: Enable subdomain wildcard

## License

MIT License - Silahkan gunakan untuk kebutuhan pribadi maupun komersial.