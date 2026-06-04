# 📡 API Reference — Kairoshi Finance Backend

> Dokumentasi lengkap semua endpoint REST API dan WebSocket events untuk Kairoshi Finance Backend (FastAPI).
>
> **Base URL:** `http://localhost:8000` (development) | `https://api.kairoshi.finance` (production)  
> **Interactive Docs:** `{BASE_URL}/docs` (Swagger UI) · `{BASE_URL}/redoc` (ReDoc)  
> **API Version:** v1

---

## Daftar Isi

- [Autentikasi](#autentikasi)
- [Format Response](#format-response)
- [Rate Limiting](#rate-limiting)
- [Endpoints: Market](#endpoints-market)
- [Endpoints: Portfolio](#endpoints-portfolio)
- [Endpoints: Watchlist](#endpoints-watchlist)
- [Endpoints: Alerts](#endpoints-alerts)
- [Endpoints: AI Chat](#endpoints-ai-chat)
- [Endpoints: News](#endpoints-news)
- [WebSocket Events](#websocket-events)
- [Error Codes](#error-codes)

---

## Autentikasi

API menggunakan **JWT Bearer Token** yang di-generate oleh Auth.js di sisi frontend. Token dikirim via header `Authorization`.

```http
Authorization: Bearer <jwt_token>
```

Endpoint yang memerlukan autentikasi ditandai dengan 🔐. Endpoint tanpa tanda dapat diakses publik.

**Mendapatkan Token:**

Auth dilakukan via frontend Auth.js. Backend memvalidasi token menggunakan `SECRET_KEY` yang sama. Untuk testing via Swagger/Postman:

```bash
# Login via frontend, copy token dari cookie/localStorage
# Atau gunakan endpoint test:
POST /auth/token
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Format Response

### Success Response

```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'quantity' harus lebih dari 0",
    "details": [
      {
        "field": "quantity",
        "message": "value is not a valid float"
      }
    ]
  }
}
```

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Default | 300 req | 1 menit |
| `/market/*` | 100 req | 1 menit |
| `/ai/*` | 30 req | 1 menit |
| `/auth/*` | 20 req | 1 menit |

Saat limit terlampaui, response `429 Too Many Requests` dengan header:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600
Retry-After: 45
```

---

## Endpoints: Market

### `GET /market`

Mendapatkan daftar harga koin kripto.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `ids` | string | — | ID koin pisah koma: `bitcoin,ethereum,solana` |
| `vs_currency` | string | `usd` | Currency pembanding: `usd`, `idr`, `eur` |
| `per_page` | integer | `50` | Jumlah koin per halaman (max: 250) |
| `page` | integer | `1` | Nomor halaman |
| `order` | string | `market_cap_desc` | Urutan: `market_cap_desc`, `volume_desc`, `price_asc` |
| `sparkline` | boolean | `false` | Sertakan data sparkline 7 hari |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "current_price": 67432.50,
      "market_cap": 1326540000000,
      "market_cap_rank": 1,
      "total_volume": 28450000000,
      "price_change_24h": 1250.30,
      "price_change_percentage_24h": 1.89,
      "circulating_supply": 19750000,
      "ath": 73738.00,
      "ath_change_percentage": -8.54,
      "last_updated": "2025-01-15T10:30:00Z",
      "sparkline_in_7d": {
        "price": [65000.0, 65500.0, "..."]
      }
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 13500,
    "cache_hit": true,
    "cached_at": "2025-01-15T10:29:45Z"
  }
}
```

---

### `GET /market/trending`

Mendapatkan koin trending dalam 24 jam terakhir (dari CoinGecko Trending).

**Query Parameters:** Tidak ada

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "coins": [
      {
        "id": "solana",
        "name": "Solana",
        "symbol": "SOL",
        "market_cap_rank": 5,
        "thumb": "https://...",
        "price_btc": 0.00294,
        "score": 0
      }
    ],
    "nfts": [...],
    "categories": [...]
  }
}
```

---

### `GET /market/{coin_id}`

Mendapatkan detail lengkap satu koin.

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `coin_id` | string | CoinGecko ID: `bitcoin`, `ethereum`, `solana` |

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `vs_currency` | string | `usd` | Currency pembanding |
| `include_description` | boolean | `false` | Sertakan deskripsi proyek |
| `include_links` | boolean | `false` | Sertakan link website, explorer, dll |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "description": "Bitcoin adalah...",
    "current_price": 67432.50,
    "market_data": {
      "market_cap": { "usd": 1326540000000 },
      "total_volume": { "usd": 28450000000 },
      "high_24h": { "usd": 68100.00 },
      "low_24h": { "usd": 66500.00 },
      "price_change_24h": 1250.30,
      "price_change_percentage_7d": 5.24,
      "price_change_percentage_30d": -2.11,
      "circulating_supply": 19750000,
      "total_supply": 21000000,
      "max_supply": 21000000
    },
    "links": {
      "homepage": ["https://bitcoin.org"],
      "blockchain_site": ["https://blockchair.com/bitcoin"],
      "twitter_screen_name": "bitcoin",
      "subreddit_url": "https://www.reddit.com/r/Bitcoin/"
    }
  }
}
```

**Error Responses:**

| Status | Code | Kondisi |
|--------|------|---------|
| `404` | `COIN_NOT_FOUND` | `coin_id` tidak ditemukan di CoinGecko |
| `503` | `UPSTREAM_ERROR` | CoinGecko API tidak tersedia |

---

### `GET /market/chart/{coin_id}`

Mendapatkan data historis harga untuk chart.

**Path Parameters:** `coin_id` — CoinGecko ID koin

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `vs_currency` | string | `usd` | Currency |
| `days` | integer | `7` | Periode: `1`, `7`, `14`, `30`, `90`, `180`, `365`, `max` |
| `interval` | string | `daily` | Interval data: `minutely`, `hourly`, `daily` |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "prices": [
      [1735689600000, 67432.50],
      [1735776000000, 68100.00]
    ],
    "market_caps": [
      [1735689600000, 1326540000000]
    ],
    "total_volumes": [
      [1735689600000, 28450000000]
    ]
  }
}
```

---

## Endpoints: Portfolio

Semua endpoint portfolio memerlukan autentikasi 🔐. Data portfolio bersifat privat per user.

### `GET /portfolio` 🔐

Mendapatkan semua aset portofolio user yang sedang login.

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "assets": [
      {
        "id": "uuid-xxxx",
        "asset_symbol": "BTC",
        "asset_name": "Bitcoin",
        "quantity": 0.5,
        "avg_buy_price": 62000.00,
        "current_price": 67432.50,
        "current_value": 33716.25,
        "cost_basis": 31000.00,
        "profit_loss": 2716.25,
        "profit_loss_percentage": 8.76,
        "added_at": "2024-12-01T10:00:00Z",
        "updated_at": "2025-01-10T15:30:00Z"
      }
    ],
    "summary": {
      "total_value": 45320.50,
      "total_cost": 41500.00,
      "total_profit_loss": 3820.50,
      "total_profit_loss_percentage": 9.20,
      "asset_count": 3
    }
  }
}
```

---

### `POST /portfolio` 🔐

Menambah aset baru ke portofolio.

**Request Body:**

```json
{
  "asset_symbol": "ETH",
  "quantity": 2.5,
  "avg_buy_price": 3200.00,
  "notes": "DCA bulan Januari"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `asset_symbol` | string | ✅ | Simbol aset: `BTC`, `ETH`, `SOL` (uppercase) |
| `quantity` | float | ✅ | Jumlah unit aset (> 0) |
| `avg_buy_price` | float | ✅ | Harga rata-rata beli dalam USD (> 0) |
| `notes` | string | ⚪ | Catatan opsional (max 500 karakter) |

**Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "uuid-yyyy",
    "asset_symbol": "ETH",
    "asset_name": "Ethereum",
    "quantity": 2.5,
    "avg_buy_price": 3200.00,
    "added_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Kondisi |
|--------|------|---------|
| `400` | `VALIDATION_ERROR` | Field tidak valid (quantity <= 0, simbol tidak dikenal) |
| `409` | `ASSET_ALREADY_EXISTS` | Aset dengan simbol tersebut sudah ada di portofolio |

---

### `PUT /portfolio/{asset_id}` 🔐

Memperbarui aset portofolio yang sudah ada.

**Path Parameters:** `asset_id` — UUID aset portofolio

**Request Body** (semua field opsional):

```json
{
  "quantity": 3.0,
  "avg_buy_price": 3100.00,
  "notes": "Tambah posisi"
}
```

**Response:** `200 OK` — Objek aset yang diperbarui (sama dengan POST response)

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `403` | Aset bukan milik user yang login |
| `404` | `asset_id` tidak ditemukan |

---

### `DELETE /portfolio/{asset_id}` 🔐

Menghapus aset dari portofolio.

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "deleted": true,
    "asset_id": "uuid-yyyy"
  }
}
```

---

## Endpoints: Watchlist

### `GET /watchlist` 🔐

Mendapatkan semua koin dalam watchlist user.

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-ww",
      "coin_id": "solana",
      "coin_name": "Solana",
      "coin_symbol": "SOL",
      "current_price": 185.30,
      "price_change_24h": 3.45,
      "added_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### `POST /watchlist` 🔐

Menambah koin ke watchlist.

**Request Body:**

```json
{
  "coin_id": "solana"
}
```

**Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "uuid-ww",
    "coin_id": "solana",
    "added_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error:** `409` jika koin sudah ada di watchlist.

---

### `DELETE /watchlist/{coin_id}` 🔐

Menghapus koin dari watchlist.

**Path Parameters:** `coin_id` — CoinGecko ID koin (bukan UUID)

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": { "deleted": true, "coin_id": "solana" }
}
```

---

## Endpoints: Alerts

### `GET /alerts` 🔐

Mendapatkan semua price alert user.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `active_only` | boolean | `false` | Filter hanya alert aktif |
| `coin_id` | string | — | Filter berdasarkan koin |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-al",
      "coin_id": "bitcoin",
      "coin_name": "Bitcoin",
      "condition": "above",
      "threshold": 70000.00,
      "active": true,
      "last_triggered_at": null,
      "created_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### `POST /alerts` 🔐

Membuat price alert baru.

**Request Body:**

```json
{
  "coin_id": "bitcoin",
  "condition": "above",
  "threshold": 70000.00
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `coin_id` | string | ✅ | CoinGecko ID koin |
| `condition` | enum | ✅ | `above` atau `below` |
| `threshold` | float | ✅ | Harga trigger dalam USD (> 0) |

**Response:** `201 Created` — Objek alert baru

**Error:** `400` jika `condition` bukan `above`/`below`. `422` jika `threshold` <= 0.

---

### `PUT /alerts/{alert_id}` 🔐

Memperbarui atau toggle status alert.

**Request Body** (semua opsional):

```json
{
  "threshold": 72000.00,
  "active": false
}
```

**Response:** `200 OK` — Objek alert yang diperbarui

---

### `DELETE /alerts/{alert_id}` 🔐

Menghapus alert.

**Response:** `200 OK`

---

## Endpoints: AI Chat

### `POST /ai/chat` 🔐

Mengirim pesan ke AI assistant. Response menggunakan **Server-Sent Events (SSE)** untuk streaming.

**Request Body:**

```json
{
  "message": "Analisis Bitcoin saat ini, apakah bagus untuk beli?",
  "prompt_type": "market_analyst",
  "context": {
    "include_portfolio": true,
    "coin_ids": ["bitcoin", "ethereum"]
  }
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `message` | string | ✅ | Pesan user (max 2000 karakter) |
| `prompt_type` | enum | ✅ | `market_analyst` · `portfolio_review` · `coin_summary` · `learning_assistant` |
| `context.include_portfolio` | boolean | ⚪ | Inject data portofolio user ke konteks |
| `context.coin_ids` | string[] | ⚪ | Inject data harga koin ke konteks |

**Response:** `200 OK` dengan `Content-Type: text/event-stream`

```
data: {"token": "Berdasarkan", "finish_reason": null}

data: {"token": " analisis", "finish_reason": null}

data: {"token": " teknikal", "finish_reason": null}

data: {"token": " ...", "finish_reason": null}

data: {"token": "", "finish_reason": "stop", "usage": {"prompt_tokens": 450, "completion_tokens": 287}}
```

**Cara konsumsi di frontend:**

```typescript
const response = await fetch('/ai/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE dan append token ke UI
}
```

**Error Responses:**

| Status | Code | Kondisi |
|--------|------|---------|
| `503` | `AI_SERVICE_UNAVAILABLE` | LM Studio tidak berjalan |
| `400` | `INVALID_PROMPT_TYPE` | `prompt_type` tidak valid |
| `429` | `RATE_LIMIT_EXCEEDED` | Terlalu banyak request AI (30/menit) |

---

### `GET /ai/history` 🔐

Mendapatkan riwayat chat AI user.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `limit` | integer | `20` | Jumlah chat (max: 100) |
| `offset` | integer | `0` | Offset untuk pagination |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-chat",
      "prompt_type": "market_analyst",
      "messages": [
        { "role": "user", "content": "Analisis Bitcoin...", "timestamp": "2025-01-15T10:30:00Z" },
        { "role": "assistant", "content": "Berdasarkan analisis...", "timestamp": "2025-01-15T10:30:05Z" }
      ],
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": { "total": 45, "limit": 20, "offset": 0 }
}
```

---

### `DELETE /ai/history` 🔐

Menghapus seluruh riwayat chat AI user.

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": { "deleted_count": 45 }
}
```

---

## Endpoints: News

### `GET /news`

Mendapatkan berita kripto terbaru.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `coin_id` | string | — | Filter berita per koin: `bitcoin`, `ethereum` |
| `category` | string | — | Filter kategori: `defi`, `nft`, `regulation`, `exchange` |
| `limit` | integer | `20` | Jumlah berita (max: 50) |
| `page` | integer | `1` | Nomor halaman |

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": "news-hash-abc",
      "title": "Bitcoin Mencapai ATH Baru di $74,000",
      "summary": "Bitcoin kembali mencetak rekor tertinggi...",
      "url": "https://coindesk.com/...",
      "source": "CoinDesk",
      "thumbnail": "https://...",
      "published_at": "2025-01-15T08:00:00Z",
      "related_coins": ["bitcoin"],
      "categories": ["market"]
    }
  ],
  "meta": { "total": 250, "page": 1, "limit": 20 }
}
```

---

## WebSocket Events

Koneksi WebSocket menggunakan **Socket.IO** di endpoint `ws://localhost:8000/socket.io/`.

### Koneksi

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: { token: jwtToken },
  transports: ["websocket"],
});

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", (err) => console.error("Error:", err.message));
```

### Events: Client → Server

#### `subscribe`

Mulai menerima update harga real-time untuk simbol tertentu.

```javascript
socket.emit("subscribe", { symbol: "BTC" });
socket.emit("subscribe", { symbols: ["BTC", "ETH", "SOL"] }); // bulk
```

#### `unsubscribe`

Berhenti menerima update harga.

```javascript
socket.emit("unsubscribe", { symbol: "BTC" });
```

---

### Events: Server → Client

#### `price:{SYMBOL}`

Update harga real-time. Di-emit saat ada update dari Binance WebSocket.

**Contoh: `price:BTC`**

```json
{
  "symbol": "BTC",
  "price": 67455.20,
  "price_change_24h": 1.95,
  "volume_24h": 28600000000,
  "timestamp": "2025-01-15T10:30:01.234Z"
}
```

```javascript
socket.on("price:BTC", (data) => {
  store.updatePrice("BTC", data.price);
});
```

#### `alert:triggered`

Dikirim ke room spesifik user saat price alert terpicu.

```json
{
  "alert_id": "uuid-al",
  "coin_id": "bitcoin",
  "coin_name": "Bitcoin",
  "condition": "above",
  "threshold": 70000.00,
  "triggered_price": 70050.30,
  "triggered_at": "2025-01-15T10:35:00Z"
}
```

#### `news:breaking`

Breaking news yang relevan (dikirim ke semua client).

```json
{
  "title": "SEC Approve Bitcoin ETF",
  "url": "https://...",
  "source": "Reuters",
  "timestamp": "2025-01-15T09:00:00Z",
  "related_coins": ["bitcoin"]
}
```

#### `error`

Error dari server (koneksi, auth, dsb).

```json
{
  "code": "AUTH_FAILED",
  "message": "Token tidak valid atau expired"
}
```

---

## Error Codes

### HTTP Status Codes

| Status | Artinya | Contoh Situasi |
|--------|---------|----------------|
| `200` | OK | Request berhasil |
| `201` | Created | Resource baru berhasil dibuat |
| `400` | Bad Request | Validasi input gagal |
| `401` | Unauthorized | Token tidak ada atau tidak valid |
| `403` | Forbidden | User tidak punya akses ke resource |
| `404` | Not Found | Resource tidak ditemukan |
| `409` | Conflict | Resource sudah ada (duplikat) |
| `422` | Unprocessable Entity | Format data benar tapi nilai tidak valid |
| `429` | Too Many Requests | Rate limit terlampaui |
| `500` | Internal Server Error | Error tak terduga di server |
| `503` | Service Unavailable | External service (CoinGecko, LM Studio) tidak tersedia |

### Application Error Codes

| Code | HTTP | Keterangan |
|------|------|------------|
| `VALIDATION_ERROR` | 400 | Validasi Pydantic gagal |
| `INVALID_PROMPT_TYPE` | 400 | `prompt_type` bukan nilai yang valid |
| `AUTH_TOKEN_MISSING` | 401 | Header `Authorization` tidak ada |
| `AUTH_TOKEN_INVALID` | 401 | JWT tidak valid atau expired |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT expired |
| `FORBIDDEN` | 403 | Resource bukan milik user |
| `COIN_NOT_FOUND` | 404 | `coin_id` tidak ditemukan di CoinGecko |
| `ASSET_NOT_FOUND` | 404 | Portfolio asset tidak ditemukan |
| `ALERT_NOT_FOUND` | 404 | Alert tidak ditemukan |
| `ASSET_ALREADY_EXISTS` | 409 | Aset dengan simbol tersebut sudah ada |
| `WATCHLIST_COIN_EXISTS` | 409 | Koin sudah ada di watchlist |
| `RATE_LIMIT_EXCEEDED` | 429 | Terlalu banyak request |
| `AI_SERVICE_UNAVAILABLE` | 503 | LM Studio tidak bisa dihubungi |
| `UPSTREAM_ERROR` | 503 | CoinGecko/Binance API error |
| `INTERNAL_ERROR` | 500 | Error tidak terduga |

---

*Untuk melaporkan bug atau ketidaksesuaian dokumentasi, buka issue di GitHub dengan label `documentation`.*