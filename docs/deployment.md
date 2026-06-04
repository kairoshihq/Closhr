# Deployment Guide — Kairoshi Finance

Panduan lengkap untuk men-deploy Kairoshi Finance ke lingkungan produksi menggunakan Docker Compose. Arsitektur produksi terdiri dari: Next.js frontend, FastAPI backend, PostgreSQL, Redis, Nginx reverse proxy, dan LM Studio AI service.

---

## Gambaran Arsitektur Produksi

```
Internet
    │
    ▼
[Nginx :443]  ←── SSL/TLS (Let's Encrypt)
    │
    ├──► [Next.js :3000]       Frontend
    │
    └──► [FastAPI :8000]       Backend API
              │
              ├──► [PostgreSQL :5432]
              ├──► [Redis :6379]
              └──► [LM Studio :1234]   (server terpisah / lokal)
```

---

## Prasyarat Server

| Komponen | Spesifikasi Minimum |
|---|---|
| OS | Ubuntu 22.04 LTS |
| CPU | 2 vCPU |
| RAM | 4 GB (8 GB+ jika LM Studio di server yang sama) |
| Disk | 30 GB SSD |
| Docker | 24.x |
| Docker Compose | 2.x (plugin) |
| Domain | Sudah diarahkan ke IP server (A record) |

---

## 1. Setup Server Awal

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verifikasi
docker --version
docker compose version
```

---

## 2. Clone Repository

```bash
git clone https://github.com/your-org/kairoshi-finance.git
cd kairoshi-finance
```

---

## 3. Konfigurasi Environment Variables

Salin template environment dan isi semua nilai yang diperlukan:

```bash
# Root
cp .env.example .env

# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env
```

Edit setiap file `.env` sesuai panduan di dokumen [env-variables.md](./env-variables.md).

**Variabel kritis yang wajib diisi sebelum deploy:**

```env
# Di root .env
POSTGRES_PASSWORD=ganti_dengan_password_kuat
JWT_SECRET=ganti_dengan_secret_panjang_random

# Di backend/.env
DATABASE_URL=postgresql://kairoshi:PASSWORD@postgres:5432/kairoshi_db
REDIS_URL=redis://redis:6379

# Di frontend/.env.local
NEXTAUTH_SECRET=ganti_dengan_secret_panjang_random
NEXTAUTH_URL=https://domain-kamu.com
```

---

## 4. Konfigurasi Nginx

Edit file `docker/nginx/nginx.conf` dan ganti `your-domain.com` dengan domain asli:

```nginx
server_name your-domain.com www.your-domain.com;
```

---

## 5. Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot -y

# Generate certificate (SEBELUM menjalankan Nginx di Docker)
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email admin@your-domain.com \
  --agree-tos
```

Certificate tersimpan di `/etc/letsencrypt/live/your-domain.com/`. Docker Compose sudah dikonfigurasi untuk mount direktori ini.

---

## 6. Build dan Jalankan Produksi

```bash
# Menggunakan Makefile (direkomendasikan)
make build
make deploy

# Atau manual
docker compose -f docker-compose.prod.yml up -d --build
```

Cek semua container berjalan:

```bash
docker compose -f docker-compose.prod.yml ps
```

Output yang diharapkan — semua service berstatus `running`:

```
NAME                    STATUS      PORTS
kairoshi-nginx          running     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
kairoshi-frontend       running     3000/tcp
kairoshi-backend        running     8000/tcp
kairoshi-postgres       running     5432/tcp
kairoshi-redis          running     6379/tcp
```

---

## 7. Migrasi Database

Setelah semua container berjalan, jalankan migrasi database:

```bash
# Via Makefile
make migrate

# Atau via script
./scripts/migrate.sh

# Atau manual
docker compose -f docker-compose.prod.yml exec backend \
  alembic upgrade head

# Prisma migration (frontend/schema)
docker compose -f docker-compose.prod.yml exec frontend \
  npx prisma migrate deploy
```

---

## 8. Seed Data Awal (Opsional)

Jika perlu data awal (misal: daftar koin default, konfigurasi sistem):

```bash
./scripts/seed-db.sh

# Atau manual
docker compose -f docker-compose.prod.yml exec frontend \
  npx tsx prisma/seed.ts
```

---

## 9. Verifikasi Deployment

```bash
# Cek health endpoint backend
curl https://your-domain.com/api/health

# Cek frontend
curl -I https://your-domain.com

# Cek logs jika ada error
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

---

## Update Deployment (Rolling Update)

Untuk deploy versi baru tanpa downtime:

```bash
git pull origin main

# Rebuild hanya service yang berubah
docker compose -f docker-compose.prod.yml up -d --build frontend backend

# Jalankan migrasi jika ada perubahan schema
make migrate
```

---

## Rollback

Jika deployment baru bermasalah:

```bash
# Kembali ke commit sebelumnya
git checkout <commit-hash-sebelumnya>

# Rebuild
docker compose -f docker-compose.prod.yml up -d --build frontend backend
```

---

## Monitoring & Logs

### Melihat Logs Real-time

```bash
# Semua service
docker compose -f docker-compose.prod.yml logs -f

# Per service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Cek Resource Usage

```bash
docker stats
```

### Backup Database

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U kairoshi kairoshi_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U kairoshi kairoshi_db < backup_20240101.sql
```

Pertimbangkan setup **cron job** untuk backup otomatis harian:

```bash
# Tambahkan ke crontab (crontab -e)
0 2 * * * /path/to/kairoshi-finance/scripts/backup-db.sh
```

---

## Perpanjang SSL Certificate

Let's Encrypt certificate berlaku 90 hari. Setup auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Tambahkan cron untuk auto-renewal
echo "0 0 * * * root certbot renew --quiet && docker compose -f /path/to/kairoshi-finance/docker-compose.prod.yml restart nginx" | sudo tee -a /etc/crontab
```

---

## Firewall (UFW)

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable

# Jangan expose port internal (3000, 8000, 5432, 6379) langsung ke publik
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Container restart terus-menerus | `docker logs <container-name>` untuk lihat error |
| `502 Bad Gateway` di Nginx | Backend belum siap — tunggu beberapa detik, cek `docker logs kairoshi-backend` |
| Database connection refused | Pastikan `DATABASE_URL` di `.env` menggunakan nama service Docker (`postgres`), bukan `localhost` |
| SSL certificate error | Pastikan domain sudah pointing ke IP server sebelum generate certificate |
| Prisma migration gagal | Cek koneksi DB dan pastikan tidak ada migration yang conflict |
| Frontend tidak bisa akses backend | Cek `NEXT_PUBLIC_API_URL` di `frontend/.env.local` |