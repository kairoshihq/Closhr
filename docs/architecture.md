# 🏗️ Arsitektur Sistem — Kairoshi Finance

> Dokumen ini menjelaskan arsitektur sistem secara menyeluruh, termasuk diagram komponen, data flow, keputusan desain, dan trade-off teknis.

---

## Daftar Isi

- [Overview Arsitektur](#overview-arsitektur)
- [Diagram Sistem](#diagram-sistem)
- [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
- [Data Flow Utama](#data-flow-utama)
- [Strategi State Management](#strategi-state-management)
- [Strategi Caching](#strategi-caching)
- [Real-time Architecture](#real-time-architecture)
- [AI Integration Architecture](#ai-integration-architecture)
- [Database Design](#database-design)
- [Keamanan (Security Architecture)](#keamanan-security-architecture)
- [Keputusan Desain & Trade-off](#keputusan-desain--trade-off)

---

## Overview Arsitektur

Kairoshi Finance menggunakan arsitektur **modular monorepo** dengan pemisahan layer yang jelas:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│              Browser (Next.js SSR/CSR + React)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GATEWAY LAYER                             │
│                    Nginx Reverse Proxy                          │
│         SSL Termination · Rate Limiting · Compression           │
└────────────┬──────────────────────────────┬─────────────────────┘
             │ HTTP                         │ HTTP
             ▼                             ▼
┌────────────────────┐          ┌──────────────────────────────┐
│  FRONTEND SERVICE  │          │      BACKEND SERVICE          │
│  Next.js 15        │          │      FastAPI + Socket.IO      │
│  ├── App Router    │          │      ├── REST API Routers     │
│  ├── Server Comp.  │◄────────►│      ├── Background Services  │
│  ├── Auth.js       │  HTTP    │      └── WebSocket Manager    │
│  └── Prisma ORM    │          └──────┬───────────────┬────────┘
└────────────────────┘                 │               │
                                       │               │
              ┌────────────────────────┘               │
              │                                        │
              ▼                                        ▼
┌─────────────────────┐                   ┌────────────────────────┐
│   DATA LAYER        │                   │   EXTERNAL SERVICES    │
│  ┌───────────────┐  │                   │  ┌──────────────────┐  │
│  │  PostgreSQL   │  │                   │  │  CoinGecko API   │  │
│  │  (Primary DB) │  │                   │  └──────────────────┘  │
│  └───────────────┘  │                   │  ┌──────────────────┐  │
│  ┌───────────────┐  │                   │  │  Binance WS      │  │
│  │    Redis      │  │                   │  └──────────────────┘  │
│  │  (Cache/PubSub)│ │                   │  ┌──────────────────┐  │
│  └───────────────┘  │                   │  │  LM Studio       │  │
└─────────────────────┘                   │  │  (Local LLM)     │  │
                                          │  └──────────────────┘  │
                                          └────────────────────────┘
```

---

## Diagram Sistem

### Deployment View (Docker Compose)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Network: kairoshi_net                  │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  ┌────────┐  │
│  │   frontend   │   │   backend    │   │    db      │  │ redis  │  │
│  │  :3000       │   │  :8000       │   │  :5432     │  │ :6379  │  │
│  │  Next.js 15  │   │  FastAPI     │   │ PostgreSQL  │  │ Redis7 │  │
│  └──────┬───────┘   └──────┬───────┘   └────────────┘  └────────┘  │
│         │                  │                                        │
│  ┌──────▼──────────────────▼──────────────────────────────────────┐ │
│  │                        nginx :80/:443                          │ │
│  │              Reverse Proxy · SSL · Rate Limit                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
          │
          │ (Host Machine)
          ▼
    LM Studio :1234
    (Local LLM Runtime)
```

---

## Layer-by-Layer Breakdown

### Layer 1: Client (Browser)

Next.js 15 dengan App Router menggunakan **Hybrid Rendering**:

| Komponen | Rendering Strategy | Alasan |
|----------|--------------------|--------|
| Landing page | SSG (Static) | Tidak butuh data dinamis |
| Auth pages | CSR | Interaksi form, tidak perlu SEO |
| Market dashboard | SSR + CSR hybrid | Initial data via SSR, update via WebSocket |
| Portfolio page | SSR | Data sensitif user, butuh auth server-side |
| AI Chat | CSR | Streaming response, interaksi real-time |
| News feed | ISR (revalidate 300s) | Data semi-statis, butuh SEO |

### Layer 2: Gateway (Nginx)

Nginx menangani:
- **SSL Termination** — TLS 1.2/1.3 dengan sertifikat Let's Encrypt
- **Routing** — `/api/*` dan `/socket.io/*` ke backend, semua lain ke frontend
- **Rate Limiting** — 100 req/min per IP untuk auth endpoints, 30 req/min untuk AI
- **Gzip Compression** — Response > 1KB dikompres
- **Static File Caching** — Header `Cache-Control` untuk aset statis Next.js

### Layer 3: Frontend Service (Next.js)

```
src/
├── app/                     ← Next.js App Router
│   ├── (auth)/              ← Route group (tidak muncul di URL)
│   ├── (dashboard)/         ← Protected routes
│   └── api/                 ← API Routes (Server Actions)
├── components/              ← UI Components
├── lib/
│   ├── api/                 ← HTTP clients (fetch wrappers)
│   ├── store/               ← Zustand stores (global client state)
│   ├── hooks/               ← Custom React hooks
│   ├── auth.ts              ← Auth.js config
│   └── prisma.ts            ← Prisma singleton
└── types/                   ← TypeScript interfaces
```

**State Management Flow:**

```
Server Component  →  Props  →  Client Component
                                     │
                              Zustand Store
                                     │
                         WebSocket (real-time updates)
```

### Layer 4: Backend Service (FastAPI)

```
app/
├── main.py                  ← App factory, middleware, router registration
├── routers/                 ← HTTP endpoint handlers (thin controllers)
├── services/                ← Business logic (thick services)
├── models/
│   ├── schemas.py           ← Pydantic (request/response validation)
│   └── db.py                ← SQLAlchemy ORM (persistence)
├── websocket/               ← Socket.IO event handlers
├── config.py                ← Pydantic Settings (env vars)
├── database.py              ← Async SQLAlchemy engine + session factory
└── dependencies.py          ← FastAPI dependency injection
```

**Request lifecycle:**

```
HTTP Request
    │
    ▼
Nginx (TLS, rate limit)
    │
    ▼
FastAPI Middleware (CORS, logging)
    │
    ▼
Dependencies (auth JWT, DB session, Redis)
    │
    ▼
Router Handler (validation via Pydantic)
    │
    ▼
Service Layer (business logic, external API calls)
    │
    ├──► PostgreSQL (CRUD)
    ├──► Redis (cache read/write)
    └──► LM Studio / CoinGecko / Binance (external)
    │
    ▼
Pydantic Response Model (serialization)
    │
    ▼
HTTP Response
```

---

## Data Flow Utama

### 1. Market Data Flow (REST)

```
User buka halaman Market
        │
        ▼
Next.js SSR: fetch /market (backend)
        │
        ▼
backend/routers/market.py
        │
        ▼
services/coingecko.py
        │
        ├── Redis cache HIT? → Kembalikan cached data (TTL 60s)
        │
        └── Redis cache MISS?
                │
                ▼
        Fetch CoinGecko API
                │
                ▼
        Simpan ke Redis (TTL 60s)
                │
                ▼
        Return ke client
                │
                ▼
        Hydrate Zustand marketStore
                │
                ▼
        React components re-render
```

### 2. Real-time Price Flow (WebSocket)

```
Binance WebSocket (external)
        │
        ▼
backend/services/binance.py
  (persistent WS connection ke Binance)
        │
        ▼
backend/websocket/price_stream.py
  (proses & filter update harga)
        │
        ▼
Redis Pub/Sub (publish ke channel 'prices')
        │
        ▼
backend/websocket/manager.py
  (subscribe Redis, broadcast ke klien)
        │
        ▼ Socket.IO emit
Frontend useMarketSocket hook
        │
        ▼
Zustand marketStore.updatePrice()
        │
        ▼
React components re-render (only affected)
```

### 3. AI Chat Flow (SSE Streaming)

```
User kirim pesan di AIChatPanel
        │
        ▼
POST /ai/chat {message, prompt_type}
        │
        ▼
backend/routers/ai.py
  (validasi request, get user context)
        │
        ▼
backend/services/ai_service.py
  - Load system prompt dari ai-service/prompts/
  - Inject konteks: harga terkini, data portofolio user
  - Format pesan ke OpenAI-compatible format
        │
        ▼
HTTP POST → LM Studio :1234/v1/chat/completions
  (streaming: stream=True)
        │
        ▼ Server-Sent Events
FastAPI StreamingResponse
        │
        ▼
Frontend EventSource → AIChatPanel
  (token demi token ditampilkan)
        │
        ▼
Setelah selesai: simpan ke DB ai_chats
```

---

## Strategi State Management

### Client State (Zustand)

Digunakan untuk state yang:
- Perlu dishare antar banyak komponen tanpa prop drilling
- Di-update secara real-time via WebSocket
- Bersifat sementara (tidak perlu persisten antar sesi)

```typescript
// Contoh struktur store
interface MarketStore {
  prices: Record<string, CoinPrice>
  trending: CoinPrice[]
  isLoading: boolean
  updatePrice: (coinId: string, price: number) => void
  setTrending: (coins: CoinPrice[]) => void
}
```

**Store yang ada:**
- `marketStore` — harga koin, trending, market cap
- `portfolioStore` — aset user, kalkulasi P/L
- `alertStore` — daftar alert aktif
- `uiStore` — state UI: sidebar open/close, theme, loading states

### Server State (Next.js + Prisma)

Untuk data yang:
- Perlu persisten
- Butuh auth server-side
- Di-fetch via Server Components atau Server Actions

### Form State

React Hook Form digunakan untuk semua form (login, tambah aset, buat alert, dll).

---

## Strategi Caching

### Redis Caching Layers

| Data | TTL | Strategi | Alasan |
|------|-----|----------|--------|
| Harga koin (list) | 60 detik | Cache-aside | Harga berubah cepat, 60s acceptable untuk REST |
| Detail koin | 5 menit | Cache-aside | Data stabil kecuali harga |
| Trending coins | 10 menit | Cache-aside | Update lambat |
| News feed | 15 menit | Cache-aside | Update berita tidak real-time |
| User session | 7 hari | Write-through | Perlu konsistensi |

### Cache Invalidation

```python
# Pattern: invalidasi selektif saat ada WebSocket update harga
async def on_price_update(coin_id: str, new_price: float):
    await cache.delete(f"coin:{coin_id}:price")
    # List harga tidak di-invalidasi (biar TTL yang handle)
    await broadcast_price(coin_id, new_price)
```

### Next.js Caching

- **Static pages** — di-cache di CDN (ISR dengan revalidate)
- **API Routes** — default no-cache, kecuali dikonfigurasi eksplisit
- **Server Components** — di-cache per request oleh Next.js

---

## Real-time Architecture

### Socket.IO Room Architecture

```
Socket.IO Server
├── Room: "prices:BTC"    ← Semua user yang melihat BTC
├── Room: "prices:ETH"    ← Semua user yang melihat ETH
├── Room: "alerts:{userId}"  ← Alert notifikasi per user
└── Room: "news"          ← Breaking news (semua user)
```

**Flow subscribe/unsubscribe:**

```typescript
// Frontend: saat komponen mount
useEffect(() => {
  socket.emit('subscribe', { symbol: 'BTC' })
  socket.on('price:BTC', updatePrice)

  return () => {
    socket.emit('unsubscribe', { symbol: 'BTC' })
    socket.off('price:BTC')
  }
}, [])
```

### WebSocket Events

| Event | Arah | Payload |
|-------|------|---------|
| `subscribe` | Client → Server | `{ symbol: string }` |
| `unsubscribe` | Client → Server | `{ symbol: string }` |
| `price:{symbol}` | Server → Client | `{ price, change_24h, volume }` |
| `alert:triggered` | Server → Client | `{ alertId, coinId, condition, price }` |
| `news:breaking` | Server → Client | `{ title, url, timestamp }` |

---

## AI Integration Architecture

### LM Studio sebagai Local LLM Runtime

```
┌─────────────────────────────────────────────┐
│              ai-service/                    │
│  ┌─────────────────────────────────────┐   │
│  │         System Prompts              │   │
│  │  market_analyst.txt                 │   │
│  │  portfolio_review.txt               │   │
│  │  coin_summary.txt                   │   │
│  │  learning_assistant.txt             │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │      lmstudio-config.json           │   │
│  │  model, context_length, temperature │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              │
              ▼ (dibaca oleh)
┌─────────────────────────────────────────────┐
│    backend/services/ai_service.py           │
│                                            │
│  1. Load system prompt sesuai prompt_type  │
│  2. Inject real-time context (prices)      │
│  3. Format ke OpenAI Chat format           │
│  4. POST ke LM Studio /v1/chat/completions │
│  5. Stream response via SSE                │
└─────────────────────────────────────────────┘
              │
              ▼ HTTP (OpenAI-compatible)
┌─────────────────────────────────────────────┐
│              LM Studio                      │
│      http://localhost:1234/v1               │
│   Model: Llama 3.1 8B Instruct             │
│   Context: 4096 tokens                     │
│   Temperature: 0.7                         │
└─────────────────────────────────────────────┘
```

### Prompt Engineering Strategy

Setiap `prompt_type` memiliki sistem prompt yang berbeda dan dioptimalkan:

| Prompt Type | Fokus | Konteks yang Di-inject |
|-------------|-------|------------------------|
| `market_analyst` | Analisis teknikal & fundamental | Harga 24h, volume, trending data |
| `portfolio_review` | Evaluasi & saran portofolio | Data portofolio user, alokasi, P/L |
| `coin_summary` | Profil lengkap satu koin | Detail koin dari CoinGecko |
| `learning_assistant` | Edukasi kripto | Tidak ada (general knowledge) |

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────┐
│  users                                               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ id (UUID PK)                                    │ │
│  │ email (VARCHAR UNIQUE NOT NULL)                 │ │
│  │ password_hash (TEXT NOT NULL)                   │ │
│  │ name (VARCHAR)                                  │ │
│  │ created_at (TIMESTAMP DEFAULT NOW())            │ │
│  └─────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────┘
           │ 1
           │
     ┌─────┼──────────────────────────────────┐
     │     │                                  │
     │ N   │ N                          N     │ N
     ▼     ▼                            ▼     ▼
┌──────┐ ┌──────────┐            ┌──────────┐ ┌──────────┐
│port- │ │watchlist │            │ alerts   │ │ai_chats  │
│folio │ │          │            │          │ │          │
├──────┤ ├──────────┤            ├──────────┤ ├──────────┤
│id    │ │id        │            │id        │ │id        │
│user_id│ │user_id   │            │user_id   │ │user_id   │
│symbol│ │coin_id   │            │coin_id   │ │messages  │
│qty   │ │added_at  │            │condition │ │(JSONB)   │
│avg_px│ │          │            │threshold │ │created_at│
│added │ │          │            │active    │ │          │
└──────┘ └──────────┘            └──────────┘ └──────────┘
```

### Indexing Strategy

```sql
-- Untuk query cepat portfolio per user
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);

-- Untuk lookup alert aktif (polling setiap N detik)
CREATE INDEX idx_alerts_active ON alerts(active) WHERE active = true;
CREATE INDEX idx_alerts_coin_id ON alerts(coin_id, active);

-- Untuk watchlist lookup
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);

-- Untuk chat history
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id, created_at DESC);
```

---

## Keamanan (Security Architecture)

### Authentication Flow

```
User login (email + password)
        │
        ▼
Auth.js credentials provider
        │
        ▼
Verifikasi password hash (bcrypt, cost factor 12)
        │
        ▼
Generate JWT session token
  (signed dengan NEXTAUTH_SECRET)
        │
        ▼
Token disimpan di httpOnly cookie
  (tidak accessible via JavaScript)
        │
        ▼
Setiap request:
  middleware.ts → validasi token → allow/redirect
```

### Backend API Authorization

```python
# dependencies.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Token tidak valid atau expired"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.get(User, user_id)
    if not user:
        raise credentials_exception
    return user
```

### Security Headers (Nginx)

```nginx
# Ditambahkan di semua response
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; ...";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### CORS Policy

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Keputusan Desain & Trade-off

### 1. Monorepo vs Polyrepo

**Keputusan:** Monorepo  
**Alasan:** Memudahkan koordinasi perubahan yang mempengaruhi frontend dan backend sekaligus (misalnya perubahan tipe data), shared tooling (ESLint, prettier config), dan CI/CD yang lebih sederhana.  
**Trade-off:** Repository lebih besar, git history lebih padat.

### 2. FastAPI (Python) vs Node.js untuk Backend

**Keputusan:** FastAPI (Python)  
**Alasan:** Ekosistem Python unggul untuk AI/ML integration. Kemudahan integrasi dengan library seperti `openai`, `httpx`, `pydantic`. Async native di FastAPI sangat efisien untuk I/O-heavy workloads (API calls, WebSocket).  
**Trade-off:** Dua runtime berbeda (Node.js + Python) menambah kompleksitas DevOps.

### 3. LM Studio vs Cloud LLM API

**Keputusan:** LM Studio (local)  
**Alasan:** Privasi pengguna — data keuangan sensitif tidak keluar ke server eksternal. Zero API cost untuk LLM. Tetap berfungsi tanpa koneksi internet.  
**Trade-off:** Membutuhkan hardware yang cukup kuat (min 8GB RAM untuk model 7B). Kualitas output mungkin di bawah GPT-4/Claude untuk reasoning kompleks.

### 4. Prisma (frontend) + SQLAlchemy (backend) vs Satu ORM

**Keputusan:** Dua ORM terpisah per runtime  
**Alasan:** Prisma adalah standar terbaik di ekosistem Next.js/TypeScript. SQLAlchemy adalah standar terbaik di Python. Menggunakan keduanya memberi developer experience terbaik di masing-masing layer.  
**Trade-off:** Schema harus disinkronkan di dua tempat. Mitigasi: `prisma/schema.prisma` sebagai source of truth, `models/db.py` di backend harus mengikutinya.

### 5. Zustand vs Redux vs React Query

**Keputusan:** Zustand untuk state global + React Query untuk server state  
**Alasan:** Zustand memiliki boilerplate minimal dan API yang sangat sederhana. Cocok untuk state UI dan WebSocket updates. React Query menangani caching, background refetch, dan stale-while-revalidate untuk data server secara otomatis.  
**Trade-off:** Dua library state management, perlu pemahaman yang lebih baik tentang kapan pakai yang mana.

---

*Dokumen ini diperbarui seiring evolusi arsitektur sistem. Untuk mendiskusikan keputusan arsitektur, buka GitHub Discussion.*