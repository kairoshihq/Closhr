# AI Setup — LM Studio Integration

Dokumen ini menjelaskan cara setup dan konfigurasi **LM Studio** sebagai AI engine lokal untuk Kairoshi Finance. Semua fitur AI (market analyst, portfolio review, coin summary, learning assistant) berjalan via LM Studio yang dijalankan di mesin lokal atau server.

---

## Prasyarat

| Kebutuhan | Minimum | Direkomendasikan |
|---|---|---|
| RAM | 8 GB | 16 GB+ |
| Disk | 10 GB free | 30 GB+ |
| GPU (opsional) | — | NVIDIA 6 GB VRAM+ |
| OS | Windows 10 / macOS 12 / Ubuntu 20.04 | — |
| LM Studio versi | 0.2.x | 0.3.x (terbaru) |

---

## 1. Install LM Studio

1. Download LM Studio dari **[https://lmstudio.ai](https://lmstudio.ai)** sesuai OS kamu.
2. Install dan jalankan LM Studio.
3. Pastikan LM Studio bisa dibuka dan masuk ke tampilan utama.

---

## 2. Download Model

Kairoshi Finance dioptimalkan untuk model-model berikut (pilih satu):

| Model | VRAM / RAM | Kualitas | Use Case |
|---|---|---|---|
| `mistral-7b-instruct-v0.2` | ~5 GB RAM | ⭐⭐⭐ | Recommended untuk dev |
| `llama-3-8b-instruct` | ~6 GB RAM | ⭐⭐⭐⭐ | Balance kualitas/kecepatan |
| `deepseek-coder-v2-lite` | ~4 GB RAM | ⭐⭐⭐ | Jika fokus analisis data |
| `qwen2.5-14b-instruct` | ~10 GB RAM | ⭐⭐⭐⭐⭐ | Produksi (butuh RAM besar) |

**Cara download model di LM Studio:**
1. Buka tab **Discover** (ikon teropong).
2. Cari nama model di atas.
3. Klik **Download** pada versi quantization `Q4_K_M` (balance size vs kualitas).
4. Tunggu download selesai — model tersimpan di `~/LM Studio/models/`.

---

## 3. Jalankan Local Server

1. Buka tab **Local Server** (ikon server) di LM Studio.
2. Pilih model yang sudah di-download dari dropdown.
3. Klik **Start Server**.
4. Server berjalan di: `http://localhost:1234/v1` (default).
5. Verifikasi server aktif:

```bash
curl http://localhost:1234/v1/models
```

Respons sukses akan menampilkan daftar model yang aktif dalam format JSON.

---

## 4. Konfigurasi LM Studio di Project

File konfigurasi utama ada di `ai-service/lmstudio-config.json`:

```json
{
  "base_url": "http://localhost:1234/v1",
  "model": "mistral-7b-instruct-v0.2",
  "context_length": 4096,
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 0.95,
  "stream": true
}
```

**Penjelasan field:**

| Field | Keterangan |
|---|---|
| `base_url` | URL server LM Studio (ganti jika bukan localhost) |
| `model` | Nama model yang aktif di LM Studio |
| `context_length` | Panjang konteks maksimum (sesuaikan dengan model) |
| `temperature` | Kreativitas respons: `0.0` = deterministik, `1.0` = kreatif |
| `max_tokens` | Batas panjang respons per request |
| `stream` | Aktifkan streaming respons (direkomendasikan `true`) |

---

## 5. Konfigurasi Environment Variable

Tambahkan ke file `.env` di folder `backend/`:

```env
# LM Studio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=mistral-7b-instruct-v0.2
LM_STUDIO_API_KEY=lm-studio
```

> **Catatan:** `LM_STUDIO_API_KEY` bisa diisi nilai apa saja (LM Studio tidak memerlukan API key asli), tapi harus ada karena library OpenAI Python membutuhkan field ini.

---

## 6. System Prompts

Semua system prompt AI tersimpan di `ai-service/prompts/`. Kamu bisa edit file-file ini untuk mengubah perilaku AI:

### `market_analyst.txt`
Digunakan oleh endpoint `POST /ai/analyze-market`. Prompt ini menginstruksikan AI untuk berperan sebagai analis pasar kripto yang memberikan analisis objektif berdasarkan data harga, volume, dan sentimen.

**Tips kustomisasi:**
- Tambahkan instruksi bahasa (misal: "Selalu jawab dalam Bahasa Indonesia").
- Sesuaikan tone: konservatif vs agresif.
- Tambahkan disclaimer yang sesuai regulasi jika diperlukan.

### `portfolio_review.txt`
Digunakan untuk fitur review portofolio pengguna. Menginstruksikan AI untuk menganalisis alokasi aset dan memberikan saran diversifikasi.

### `coin_summary.txt`
Digunakan untuk generate ringkasan cepat sebuah koin (fundamentals, use case, risiko).

### `learning_assistant.txt`
Mode edukasi — AI berperan sebagai tutor kripto untuk pengguna pemula.

---

## 7. Verifikasi Integrasi

Setelah semua setup selesai, jalankan test integrasi:

```bash
cd backend
python -m pytest tests/test_ai.py -v
```

Atau test manual via API:

```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Analisis Bitcoin saat ini", "session_id": "test-123"}'
```

Respons yang diharapkan adalah JSON dengan field `reply` berisi analisis dari AI.

---

## 8. Setup untuk Produksi (Server Remote)

Jika LM Studio berjalan di server terpisah (bukan localhost):

1. Pastikan port `1234` terbuka di firewall server.
2. Aktifkan CORS di LM Studio: Settings → Server → Enable CORS.
3. Update environment variable di backend:

```env
LM_STUDIO_BASE_URL=http://YOUR_SERVER_IP:1234/v1
```

4. Pertimbangkan menggunakan **SSH tunnel** untuk keamanan:

```bash
ssh -L 1234:localhost:1234 user@your-server-ip
```

Dengan ini, LM Studio di server diakses lewat `localhost:1234` secara terenkripsi.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Connection refused` pada port 1234 | Pastikan LM Studio server sudah di-Start |
| Respons sangat lambat | Kurangi `context_length`, atau gunakan model yang lebih kecil |
| Error `model not found` | Pastikan nama model di `.env` sama persis dengan yang aktif di LM Studio |
| Respons terpotong | Naikkan nilai `max_tokens` di `lmstudio-config.json` |
| LM Studio crash saat load model | RAM tidak cukup — coba model dengan quantization lebih rendah (Q2_K) |

---

## Referensi

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [OpenAI Python SDK](https://github.com/openai/openai-python) — digunakan sebagai client karena LM Studio kompatibel dengan OpenAI API
- `backend/app/services/ai_service.py` — implementasi client di codebase