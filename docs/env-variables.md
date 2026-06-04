# Environment Variables — Kairoshi Finance

Dokumen referensi lengkap untuk semua environment variable yang digunakan di project Kairoshi Finance. Setiap variable dijelaskan beserta cara mendapatkan nilainya, apakah wajib diisi, dan nilai default-nya.

---

## Struktur File `.env`

Project ini memiliki tiga lokasi file `.env` yang terpisah:

| File | Digunakan oleh | Keterangan |
|---|---|---|
| `.env` (root) | Docker Compose | Variabel shared antar service (DB, Redis) |
| `frontend/.env.local` | Next.js | Variabel frontend — tidak di-commit ke Git |
| `backend/.env` | FastAPI | Variabel backend — tidak di-commit ke Git |

> **Penting:** File `.env`, `.env.local`, dan `.env.local` sudah ada di `.gitignore`. Jangan pernah commit file ini ke repository. Gunakan `.env.example` sebagai template.

---

## Root `.env`

Digunakan oleh Docker Compose untuk mengkonfigurasi semua service.

```env
# ─── PostgreSQL ───────────────────────────────────────────
POSTGRES_USER=kairoshi
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=kairoshi_db

# ─── Redis ────────────────────────────────────────────────
REDIS_PASSWORD=your_redis_password_here
```

### Referensi

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `POSTGRES_USER` | ✅ | `kairoshi` | Username PostgreSQL |
| `POSTGRES_PASSWORD` | ✅ | — | Password PostgreSQL. Gunakan password kuat (min. 16 karakter) di produksi |
| `POSTGRES_DB` | ✅ | `kairoshi_db` | Nama database |
| `REDIS_PASSWORD` | ✅ | — | Password Redis. Bisa dikosongkan di dev lokal (tidak direkomendasikan di produksi) |

---

## Frontend — `frontend/.env.local`

```env
# ─── App URL ──────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_dengan_openssl_rand_base64_32

# ─── Backend API ──────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# ─── CoinGecko API ────────────────────────────────────────
COINGECKO_API_KEY=your_coingecko_api_key

# ─── Binance (opsional, untuk WebSocket harga real-time) ──
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

# ─── Database (Prisma) ────────────────────────────────────
DATABASE_URL=postgresql://kairoshi:your_password@localhost:5432/kairoshi_db
```

### Referensi

| Variable | Wajib | Keterangan | Cara Mendapatkan |
|---|---|---|---|
| `NEXTAUTH_URL` | ✅ | URL aplikasi frontend. Ganti ke domain asli di produksi | Manual |
| `NEXTAUTH_SECRET` | ✅ | Secret key untuk enkripsi session Auth.js. Harus unik dan panjang | `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL FastAPI backend. Prefix `NEXT_PUBLIC_` berarti terekspos ke browser | Manual |
| `NEXT_PUBLIC_WS_URL` | ✅ | URL WebSocket untuk harga real-time | Manual |
| `COINGECKO_API_KEY` | ✅ | API key CoinGecko untuk data harga kripto | [coingecko.com/en/api](https://www.coingecko.com/en/api) |
| `BINANCE_API_KEY` | ⬜ | API key Binance. Hanya diperlukan jika menggunakan WebSocket Binance | [binance.com/en/my/settings/api-management](https://www.binance.com/en/my/settings/api-management) |
| `BINANCE_API_SECRET` | ⬜ | API secret Binance (pasangan dengan `BINANCE_API_KEY`) | Sama seperti di atas |
| `DATABASE_URL` | ✅ | Connection string PostgreSQL untuk Prisma ORM | Manual — sesuaikan dengan kredensial dari root `.env` |

> **Catatan `NEXT_PUBLIC_*`:** Variable dengan prefix ini akan ter-bundle ke dalam kode JavaScript frontend dan **bisa dilihat oleh pengguna** melalui browser DevTools. Jangan pernah menaruh API key sensitif (seperti secret key) di variable dengan prefix ini.

---

## Backend — `backend/.env`

```env
# ─── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://kairoshi:your_password@localhost:5432/kairoshi_db
# Untuk Docker: ganti localhost dengan nama service
# DATABASE_URL=postgresql://kairoshi:your_password@postgres:5432/kairoshi_db

# ─── Redis ────────────────────────────────────────────────
REDIS_URL=redis://:your_redis_password@localhost:6379
# Untuk Docker:
# REDIS_URL=redis://:your_redis_password@redis:6379

# ─── JWT & Security ───────────────────────────────────────
JWT_SECRET=generate_dengan_openssl_rand_base64_64
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── CoinGecko ────────────────────────────────────────────
COINGECKO_API_KEY=your_coingecko_api_key
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3

# ─── Binance ──────────────────────────────────────────────
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
BINANCE_WS_URL=wss://stream.binance.com:9443/ws

# ─── LM Studio (AI Service) ───────────────────────────────
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=mistral-7b-instruct-v0.2
LM_STUDIO_API_KEY=lm-studio

# ─── App ──────────────────────────────────────────────────
APP_ENV=development
APP_DEBUG=true
APP_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### Referensi — Database & Cache

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Connection string PostgreSQL format: `postgresql://USER:PASS@HOST:PORT/DB`. Di Docker, `HOST` adalah nama service (`postgres`) |
| `REDIS_URL` | ✅ | — | Connection string Redis. Format: `redis://:PASSWORD@HOST:PORT`. Hapus `:PASSWORD@` jika Redis tanpa password |

### Referensi — JWT & Security

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | Secret key untuk signing JWT token. Generate dengan `openssl rand -base64 64` |
| `JWT_ALGORITHM` | ⬜ | `HS256` | Algoritma JWT. `HS256` sudah cukup untuk kebanyakan kasus |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | ⬜ | `30` | Masa berlaku access token dalam menit |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | ⬜ | `7` | Masa berlaku refresh token dalam hari |

### Referensi — External APIs

| Variable | Wajib | Keterangan | Cara Mendapatkan |
|---|---|---|---|
| `COINGECKO_API_KEY` | ✅ | API key CoinGecko. Versi gratis ada limit 30 req/menit | [coingecko.com/en/api](https://www.coingecko.com/en/api) — daftar akun dan buat API key |
| `COINGECKO_BASE_URL` | ⬜ | Base URL CoinGecko API. Jangan diubah kecuali CoinGecko mengganti endpoint | — |
| `BINANCE_API_KEY` | ⬜ | API key Binance untuk WebSocket stream harga. Tidak perlu permission trading — cukup "Read Info" | [binance.com API Management](https://www.binance.com/en/my/settings/api-management) |
| `BINANCE_API_SECRET` | ⬜ | Pasangan secret dari `BINANCE_API_KEY` | Sama seperti di atas |
| `BINANCE_WS_URL` | ⬜ | URL WebSocket Binance. Sudah dikonfigurasi default | — |

### Referensi — LM Studio

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `LM_STUDIO_BASE_URL` | ✅ | `http://localhost:1234/v1` | URL server LM Studio. Ganti `localhost` dengan IP server jika LM Studio berjalan di mesin terpisah |
| `LM_STUDIO_MODEL` | ✅ | — | Nama model yang aktif di LM Studio. Harus sama persis dengan yang ditampilkan di UI LM Studio |
| `LM_STUDIO_API_KEY` | ⬜ | `lm-studio` | LM Studio tidak memerlukan API key asli, tapi field ini wajib ada karena library OpenAI Python membutuhkannya |

### Referensi — App Config

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `APP_ENV` | ⬜ | `development` | Environment aplikasi. Gunakan `production` di server produksi |
| `APP_DEBUG` | ⬜ | `false` | Mode debug FastAPI. Wajib `false` di produksi (menampilkan stack trace ke client) |
| `APP_PORT` | ⬜ | `8000` | Port FastAPI berjalan |
| `CORS_ORIGINS` | ✅ | — | Daftar origin yang diizinkan akses API, dipisah koma. Di produksi isi dengan domain frontend: `https://your-domain.com` |

---

## Cara Generate Secret Key

Untuk `NEXTAUTH_SECRET`, `JWT_SECRET`, dan secret lainnya, gunakan salah satu cara berikut:

```bash
# Menggunakan openssl (Linux/macOS)
openssl rand -base64 32

# Menggunakan Python
python3 -c "import secrets; print(secrets.token_urlsafe(48))"

# Menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## Perbedaan Dev vs Produksi

| Variable | Development | Produksi |
|---|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-domain.com` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://your-domain.com/api` |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | `wss://your-domain.com/api` |
| `DATABASE_URL` (host) | `localhost` | `postgres` (nama service Docker) |
| `REDIS_URL` (host) | `localhost` | `redis` (nama service Docker) |
| `LM_STUDIO_BASE_URL` | `http://localhost:1234/v1` | `http://ai-server-ip:1234/v1` |
| `APP_ENV` | `development` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `CORS_ORIGINS` | `http://localhost:3000` | `https://your-domain.com` |