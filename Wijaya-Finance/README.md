# Wijaya Finance Bot

Bot Telegram untuk pencatatan keuangan pribadi dengan fitur laporan Excel dan PDF.

## Fitur
- Tambah pemasukan
- Tambah pengeluaran  
- Lihat laporan (harian, mingguan, bulanan, tahunan)
- Export laporan ke Excel dan PDF

## Deploy ke Railway

### 1. Persiapan
- Buat akun di [railway.app](https://railway.app)
- Push kode ini ke GitHub

### 2. Deploy
1. Login Railway dengan GitHub
2. Klik "New Project" → "Deploy from GitHub repo"
3. Pilih repository ini
4. Railway akan otomatis build

### 3. Tambah Database PostgreSQL
1. Di dashboard project, klik "New" → "Database" → "PostgreSQL"
2. Railway otomatis menambahkan `DATABASE_URL`

### 4. Set Environment Variables
Di tab "Variables", tambahkan:
```
BOT_TOKEN=token_dari_botfather
WEBHOOK_URL=https://nama-app.up.railway.app
NODE_ENV=production
```

Untuk mendapatkan WEBHOOK_URL:
1. Ke "Settings" → "Networking"
2. Klik "Generate Domain"
3. Copy URL yang muncul

### 5. Buat Tabel Database
Jalankan SQL ini di database Railway:
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  tipe VARCHAR(10) NOT NULL,
  item VARCHAR(255) NOT NULL,
  harga INTEGER NOT NULL,
  tanggal TIMESTAMP DEFAULT NOW()
);
```

### 6. Test Bot
Kirim `/start` ke bot di Telegram

## Environment Variables
| Variable | Deskripsi |
|----------|-----------|
| BOT_TOKEN | Token dari BotFather |
| DATABASE_URL | URL PostgreSQL (otomatis dari Railway) |
| WEBHOOK_URL | URL Railway app untuk webhook |
| NODE_ENV | Set ke `production` |

## Struktur Proyek
```
├── index.js          # Webhook server
├── bot.js            # Bot logic
├── db.js             # Database connection
├── package.json      # Dependencies
├── Procfile          # Railway process
├── menus/            # Keyboard menus
└── utils/            # Utilities
```
