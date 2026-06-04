# 🪙 Kairoshi Finance

> **Platform Crypto Analytics & AI Financial Intelligence**  
> Real-time market data · Portfolio management · AI-powered insights · Price alerts

[![CI Status](https://github.com/kairoshihq/Closhr/actions/workflows/ci.yml/badge.svg)](https://github.com/kairoshihq/Closhr/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Quick Start](#quick-start)
- [Struktur Folder](#struktur-folder)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Perintah Development](#perintah-development)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang Proyek

**Closhr** adalah platform web full-stack untuk analisis aset kripto yang dirancang untuk trader individu dan investor ritel. Platform ini menggabungkan data pasar real-time dari CoinGecko dan Binance, manajemen portofolio, sistem peringatan harga otomatis, dan asisten AI berbasis model bahasa besar (LLM) yang berjalan secara lokal via LM Studio — menjaga privasi data pengguna sepenuhnya.

---

## Fitur Utama

### Market Dashboard
- Harga real-time untuk ribuan aset kripto via CoinGecko API
- Live price stream via Binance WebSocket (latency < 500ms)
- Chart candlestick, area, dan sparkline interaktif
- Trending coins, top gainers & losers, dan market dominance

### Portfolio Management
- Tambah, edit, dan hapus aset portofolio
- Kalkulasi P/L (Profit/Loss) otomatis berdasarkan harga terkini
- Alokasi chart pie/donut per aset
- Riwayat transaksi dan rata-rata harga beli (DCA tracking)

### Watchlist & Price Alerts
- Simpan koin favorit dalam watchlist personal
- Buat price alert dengan kondisi: di atas atau di bawah threshold
- Notifikasi alert via UI (WebSocket push)
- Manajemen alert: aktifkan, nonaktifkan, hapus

### AI Financial Assistant
- Chat dengan model LLM lokal via LM Studio (100% privat, tanpa API eksternal)
- 4 mode analisis: Market Analyst, Portfolio Review, Coin Summary, Learning Assistant
- Respons streaming real-time via Server-Sent Events
- Riwayat chat tersimpan per akun

### Crypto News Aggregator
- Agregasi berita kripto terbaru dari multiple sumber
- Kategorisasi berita per koin/topik
- Deduplikasi dan normalisasi format

### Autentikasi & Keamanan
- Auth.js (NextAuth) dengan strategi JWT
- Route guard via Next.js middleware
- Password hashing dengan bcrypt
- CORS policy ketat per environment

---

## Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| **Frontend** | Next.js (App Router) | 15.x |
| **Frontend Lang** | TypeScript | 5.x |
| **UI Components** | shadcn/ui + Tailwind CSS | Latest |
| **Charts** | Recharts | 2.x |
| **State Management** | Zustand | 5.x |
| **Auth** | Auth.js (NextAuth) | 5.x |
| **ORM (Frontend)** | Prisma | 6.x |
| **Backend** | FastAPI | 0.115.x |
| **Backend Lang** | Python | 3.12+ |
| **ORM (Backend)** | SQLAlchemy | 2.x |
| **Validation** | Pydantic v2 | 2.x |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Realtime** | Socket.IO | 4.x |
| **AI Runtime** | LM Studio | 0.3.x |
| **Containerization** | Docker + Compose | v2 |
| **Reverse Proxy** | Nginx | 1.27 |
| **CI/CD** | GitHub Actions | — |

---

## Prasyarat

Pastikan semua tools berikut sudah terinstall sebelum memulai:

| Tool | Versi Minimum | Cek Instalasi |
|------|---------------|---------------|
| [Node.js](https://nodejs.org/) | 20.x LTS | `node --version` |
| [Python](https://www.python.org/) | 3.12+ | `python --version` |
| [Docker](https://www.docker.com/) | 24.x | `docker --version` |
| [Docker Compose](https://docs.docker.com/compose/) | v2.x | `docker compose version` |
| [Git](https://git-scm.com/) | 2.40+ | `git --version` |
| [LM Studio](https://lmstudio.ai/) | 0.3.x | *(Hanya untuk fitur AI)* |

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/@kairoshihq/closhr.git
cd closhr
```

### 2. Setup Otomatis

Script ini akan menginstall semua dependencies dan menyalin template `.env`:

```bash
bash scripts/setup.sh
```

### 3. Konfigurasi Environment

Edit file `.env` sesuai environment lokal kamu:

```bash
# Frontend
cp frontend/.env.example frontend/.env.local
nano frontend/.env.local   # Edit NEXTAUTH_SECRET, DATABASE_URL, dll

# Backend
cp backend/.env.example backend/.env
nano backend/.env          # Edit DATABASE_URL, REDIS_URL, LM_STUDIO_BASE_URL, dll
```

Lihat [Konfigurasi Environment](#konfigurasi-environment) untuk detail lengkap setiap variabel.

### 4. Jalankan Development Environment

```bash
make dev
```

Perintah ini akan:
- Start Docker containers: PostgreSQL, Redis, Nginx
- Jalankan Next.js dev server (`http://localhost:3000`)
- Jalankan FastAPI uvicorn server (`http://localhost:8000`)

### 5. Setup Database

```bash
# Jalankan migrasi Prisma
make migrate

# (Opsional) Isi data dummy untuk development
make seed
```

### 6. Setup AI (Opsional)

Lihat panduan lengkap di [`docs/ai-setup.md`](docs/ai-setup.md).

TL;DR:
1. Download dan install LM Studio dari [lmstudio.ai](https://lmstudio.ai)
2. Load model (rekomendasi: Llama 3.1 8B Instruct)
3. Aktifkan Local Server di LM Studio (port 1234)
4. Pastikan `LM_STUDIO_BASE_URL=http://localhost:1234/v1` di `backend/.env`

### Akses Aplikasi

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Adminer (DB GUI) | http://localhost:8080 *(jika diaktifkan)* |

---

## Struktur Folder

```
closhr/
├── .github/                    # GitHub Actions CI/CD & PR templates
│   └── workflows/
│       ├── ci.yml              # Lint, test, build on every push
│       └── deploy.yml          # Auto-deploy ke production on merge ke main
│
├── frontend/                   # Next.js 15 App Router (TypeScript)
│   ├── src/
│   │   ├── app/                # Route groups, API routes, layout global
│   │   │   ├── (auth)/         # Halaman login, register
│   │   │   ├── (dashboard)/    # Dashboard utama setelah login
│   │   │   └── api/            # Next.js API routes
│   │   ├── components/         # React components per domain
│   │   │   ├── ui/             # shadcn/ui base components
│   │   │   ├── charts/         # Chart wrappers (Recharts)
│   │   │   ├── market/         # Market-specific components
│   │   │   ├── portfolio/      # Portfolio components
│   │   │   ├── ai/             # AI chat components
│   │   │   └── layout/         # Sidebar, Navbar, Footer
│   │   ├── lib/                # Utilities, API clients, stores
│   │   │   ├── api/            # CoinGecko & Binance HTTP clients
│   │   │   ├── websocket/      # Socket.IO hooks
│   │   │   ├── store/          # Zustand state stores
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── utils.ts
│   │   │   ├── auth.ts         # Auth.js configuration
│   │   │   └── prisma.ts       # Prisma client singleton
│   │   └── types/              # TypeScript interfaces global
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema: User, Portfolio, Watchlist, Alert, AIChat
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.local              # ← Buat dari .env.example
│   └── package.json
│
├── backend/                    # FastAPI Python service
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, Socket.IO init
│   │   ├── routers/            # market, portfolio, watchlist, alerts, ai, news
│   │   ├── services/           # coingecko, binance, ai_service, cache, news
│   │   ├── models/             # Pydantic schemas + SQLAlchemy ORM models
│   │   ├── websocket/          # Socket.IO manager + price broadcast
│   │   ├── config.py           # Pydantic Settings (env vars)
│   │   ├── database.py         # Async PostgreSQL engine
│   │   └── dependencies.py     # FastAPI dependency injection
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                    # ← Buat dari .env.example
│
├── ai-service/                 # LM Studio configuration & prompts
│   ├── prompts/
│   │   ├── market_analyst.txt
│   │   ├── portfolio_review.txt
│   │   ├── coin_summary.txt
│   │   └── learning_assistant.txt
│   ├── lmstudio-config.json
│   └── README.md
│
├── docker/                     # Infrastructure configs
│   ├── nginx/nginx.conf        # Reverse proxy + SSL
│   ├── postgres/init.sql       # Initial schema
│   └── redis/redis.conf
│
├── scripts/                    # Automation scripts
│   ├── setup.sh
│   ├── seed-db.sh
│   ├── start-dev.sh
│   └── migrate.sh
│
├── docs/                       # Dokumentasi teknis lengkap
│   ├── architecture.md         # Diagram arsitektur sistem
│   ├── api-reference.md        # Dokumentasi semua endpoint
│   ├── ai-setup.md             # Panduan setup LM Studio
│   ├── deployment.md           # Production deployment guide
│   └── env-variables.md        # Referensi semua environment variables
│
├── docker-compose.yml          # Dev: semua services
├── docker-compose.prod.yml     # Production: optimized
├── .env.example                # Template env root
├── .gitignore
├── .dockerignore
├── Makefile                    # Shortcut commands
└── README.md                   # ← Kamu di sini
```

---

## Konfigurasi Environment

### Frontend (`frontend/.env.local`)

| Variable | Contoh | Wajib | Keterangan |
|----------|--------|-------|------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | ✅ | Base URL aplikasi Next.js |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ | Secret JWT session (min 32 karakter) |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/kairoshi` | ✅ | Koneksi Prisma ke PostgreSQL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | ✅ | Base URL FastAPI backend |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | ✅ | WebSocket URL Socket.IO |

### Backend (`backend/.env`)

| Variable | Contoh | Wajib | Keterangan |
|----------|--------|-------|------------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@db:5432/kairoshi` | ✅ | Async DB URL untuk SQLAlchemy |
| `REDIS_URL` | `redis://redis:6379/0` | ✅ | Redis connection string |
| `SECRET_KEY` | `openssl rand -hex 32` | ✅ | JWT signing secret |
| `COINGECKO_API_KEY` | `CG-xxxx` | ⚪ | CoinGecko Pro API key (opsional) |
| `LM_STUDIO_BASE_URL` | `http://host.docker.internal:1234/v1` | ✅ | LM Studio endpoint |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | ✅ | CORS whitelist (pisah koma) |

> 📖 Lihat [`docs/env-variables.md`](docs/env-variables.md) untuk referensi lengkap semua variabel environment.

---

## Perintah Development

### Makefile Commands

```bash
make dev          # Start semua service (Docker infra + frontend + backend)
make build        # Build Docker images production
make up           # docker compose up -d
make down         # docker compose down
make logs         # docker compose logs -f (semua service)
make migrate      # Prisma migrate dev (buat migration baru)
make seed         # Seed database dengan data dummy
make test         # Jalankan semua tests (frontend + backend)
make lint         # Lint semua kode (ESLint + flake8 + mypy)
make clean        # Hapus volumes dan containers
make shell-fe     # Masuk ke shell container frontend
make shell-be     # Masuk ke shell container backend
```

### Frontend Specifics

```bash
cd frontend

npm run dev           # Next.js development server
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript type check
npm run test          # Jest unit tests
npm run test:watch    # Jest watch mode

# Prisma
npx prisma studio     # Buka Prisma Studio (GUI database)
npx prisma migrate dev --name <nama>   # Buat migration baru
npx prisma generate   # Regenerate Prisma client
```

### Backend Specifics

```bash
cd backend

uvicorn app.main:app --reload --port 8000   # Dev server dengan hot reload
pytest                                       # Jalankan semua tests
pytest tests/test_market.py -v              # Test spesifik
pytest --cov=app --cov-report=html          # Tests dengan coverage report
flake8 app/                                 # Linting
mypy app/                                   # Type checking
```

---

## Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| [`docs/architecture.md`](docs/architecture.md) | Diagram arsitektur sistem, data flow, dan desain keputusan |
| [`docs/api-reference.md`](docs/api-reference.md) | Referensi lengkap semua REST API endpoint & WebSocket events |
| [`docs/ai-setup.md`](docs/ai-setup.md) | Panduan instalasi dan konfigurasi LM Studio |
| [`docs/deployment.md`](docs/deployment.md) | Panduan deployment production lengkap (VPS, Docker, SSL) |
| [`docs/env-variables.md`](docs/env-variables.md) | Referensi semua environment variables |

---

## Kontribusi

Kami menyambut kontribusi dari komunitas. Silakan ikuti langkah berikut:

1. **Fork** repository ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat **Pull Request** ke branch `develop`

Pastikan:
- Semua tests lolos: `make test`
- Kode sudah di-lint: `make lint`
- Ikuti format commit [Conventional Commits](https://www.conventionalcommits.org/)
- Isi PULL_REQUEST_TEMPLATE dengan deskripsi perubahan yang jelas

---

## Lisensi

Didistribusikan di bawah lisensi MIT. Lihat [`LICENSE`](LICENSE) untuk detail.

---