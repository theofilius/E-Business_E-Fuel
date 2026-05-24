# Panduan Deployment: MongoDB Atlas untuk E-Fuel

Dokumen ini menjelaskan cara mengganti database lokal E-Fuel ke MongoDB Atlas agar aplikasi bisa diakses secara online tanpa bergantung pada mesin lokal.

---

## A. Membuat MongoDB Atlas

### 1. Buat Akun & Project

1. Buka [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Buat akun baru atau login jika sudah punya.
3. Di halaman **Organizations**, klik **New Project**.
4. Beri nama project: **E-Fuel**
5. Klik **Create Project**.

### 2. Buat Cluster (Free Tier)

1. Di dalam project E-Fuel, klik **Build a Database**.
2. Pilih tier **M0 Free** (gratis, cukup untuk demo dan development).
3. Pilih **Cloud Provider**: AWS, GCP, atau Azure (pilih salah satu).
4. Pilih **Region** terdekat, misalnya:
   - Asia Pacific: `Singapore (ap-southeast-1)` atau `Jakarta (ap-southeast-3)`
5. Beri nama cluster, misal: `efuel-cluster` (atau biarkan default `Cluster0`).
6. Klik **Create**.
   > Proses pembuatan cluster butuh 1–3 menit.

### 3. Buat Database User

1. Di sidebar kiri, klik **Database Access**.
2. Klik **Add New Database User**.
3. Pilih Authentication Method: **Password**.
4. Isi:
   - **Username**: `efuel_admin`
   - **Password**: gunakan password yang kuat (minimal 16 karakter, kombinasi huruf besar/kecil/angka/simbol)
   - ⚠️ **Catat password ini** — tidak bisa dilihat lagi setelah disimpan.
5. Di **Database User Privileges**, pilih: **Atlas Admin** (untuk kemudahan demo).
6. Klik **Add User**.

### 4. Konfigurasi Network Access

1. Di sidebar kiri, klik **Network Access**.
2. Klik **Add IP Address**.
3. Untuk **demo cepat**: klik **Allow Access from Anywhere** → otomatis isi `0.0.0.0/0`.
4. Klik **Confirm**.

> ⚠️ **Catatan Keamanan**: `0.0.0.0/0` mengizinkan koneksi dari semua IP.
> Ini praktis untuk demo/development, tetapi untuk production nyata sebaiknya
> dibatasi ke IP spesifik server backend (misalnya IP Render).

### 5. Ambil Connection String

1. Di sidebar kiri, klik **Database** → klik **Connect** pada cluster Anda.
2. Pilih **Connect your application**.
3. Driver: **Node.js**, Version: **5.5 or later**.
4. Salin connection string yang muncul, formatnya:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=<AppName>
   ```
5. Ganti placeholder sesuai data Anda:
   - `<username>` → `efuel_admin` (atau username yang dibuat di langkah 3)
   - `<password>` → password yang dicatat di langkah 3
   - Tambahkan nama database setelah `/`: ganti `/?` menjadi `/efuel?`

**Contoh hasil akhir:**
```
mongodb+srv://efuel_admin:P@ssw0rdKuat!@efuel-cluster.ab1cd.mongodb.net/efuel?retryWrites=true&w=majority
```

---

## B. Konfigurasi Local Development (MongoDB Lokal)

Untuk development di mesin sendiri, **tidak perlu mengubah apapun**. Tetap gunakan:

```bash
# Terminal 1 — jalankan MongoDB lokal
cd backend
npm run db:local

# Terminal 2 — jalankan backend
cd backend
npm run dev

# Terminal 3 — jalankan frontend
npm run dev   # dari root e-fuel/
```

File `backend/.env` untuk local:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/efuel
JWT_SECRET=efuel_jwt_secret_key_2024_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## C. Konfigurasi MongoDB Atlas

### Option 1 — Edit file `backend/.env` langsung (untuk seed / testing Atlas dari local)

```env
PORT=5001
MONGODB_URI=mongodb+srv://efuel_admin:PASSWORD_ANDA@efuel-cluster.ab1cd.mongodb.net/efuel?retryWrites=true&w=majority
JWT_SECRET=ganti_dengan_secret_panjang_dan_acak_di_production
JWT_EXPIRE=30d
NODE_ENV=production
```

> ⚠️ Jangan commit file `.env` asli ke GitHub. File ini sudah ada di `.gitignore`.

### Option 2 — Environment Variables di platform deployment (Render, dsb)

Tambahkan env vars berikut di dashboard Render (lihat bagian F).

---

## D. Seed Database Atlas

> ⚠️ **PERHATIAN**: Script seed akan menghapus semua **orders** yang ada (`Order.deleteMany({})`),
> tetapi **tidak** menghapus users yang sudah ada. Jalankan hanya saat ingin reset data demo.

### Langkah Seed ke Atlas

1. **Backup `.env` local** jika ingin kembali ke local setelah selesai:
   ```bash
   cp backend/.env backend/.env.local.bak
   ```

2. **Ubah MONGODB_URI di `backend/.env`** ke connection string Atlas Anda:
   ```env
   MONGODB_URI=mongodb+srv://efuel_admin:PASSWORD@cluster.mongodb.net/efuel?retryWrites=true&w=majority
   ```

3. **Jalankan seed**:
   ```bash
   cd backend
   npm run seed
   ```

4. **Output yang diharapkan**:
   ```
   ✅ MongoDB Connected: efuel-cluster.ab1cd.mongodb.net (Atlas ☁️)
   🗑️  Cleared all existing orders
   ✅ created customer: demo@efuel.com
   ✅ created customer: premium@efuel.com
   ✅ created admin: admin@efuel.com
   ✅ created driver: driver1@efuel.com
   ✅ created driver: driver2@efuel.com
   ✅ created driver: driver3@efuel.com

   🌱 Seeding complete. Demo accounts:
      Customer (Basic)   → demo@efuel.com    / demo123
      Customer (Premium) → premium@efuel.com / premium123
      Admin              → admin@efuel.com   / admin123
      Driver 1           → driver1@efuel.com / driver123
   ```
   > Jika user sudah ada: muncul `ℹ️ customer demo@efuel.com — already exists, skipped` (aman, tidak error).

5. **Kembalikan `.env` ke local** jika perlu:
   ```bash
   cp backend/.env.local.bak backend/.env
   ```

---

## E. Cek Data di MongoDB Atlas

1. Buka [https://cloud.mongodb.com](https://cloud.mongodb.com).
2. Klik **Database** di sidebar.
3. Klik **Browse Collections** pada cluster Anda.
4. Pastikan database **`efuel`** muncul di kiri.
5. Buka collection **`users`** → pastikan ada 6 dokumen (demo, premium, admin, driver1–3).
6. Buka collection **`orders`** → seharusnya kosong (baru di-seed, belum ada order).

---

## F. Deployment ke Render

### Backend Service

1. Buka [https://render.com](https://render.com) dan login.
2. Klik **New** → **Web Service**.
3. Hubungkan GitHub repo E-Fuel Anda.
4. Konfigurasi:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
     > Script ini menjalankan `node src/server.js` (sudah ada di `backend/package.json`).
5. Di tab **Environment**, tambahkan variabel:

   | Key | Value |
   |-----|-------|
   | `PORT` | `5001` (atau biarkan Render assign otomatis) |
   | `MONGODB_URI` | `mongodb+srv://efuel_admin:...@.../efuel?retryWrites=true&w=majority` |
   | `JWT_SECRET` | string acak panjang (misal generate di [randomkeygen.com](https://randomkeygen.com)) |
   | `JWT_EXPIRE` | `30d` |
   | `NODE_ENV` | `production` |

6. Klik **Create Web Service**.
7. Tunggu deploy selesai (~2–3 menit).
8. Test health check: `https://<your-render-url>/api/health`

### CORS untuk Frontend

Jika frontend di-deploy ke URL berbeda dari backend, update CORS di `backend/src/server.js`:
```javascript
// Ganti origin: '*' dengan URL frontend production
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:8081'],
  ...
}));
```

---

## G. Troubleshooting

### Backend gagal connect ke Atlas

| Gejala | Solusi |
|--------|--------|
| `MongoServerError: bad auth` | Password salah atau karakter khusus di password (encode dengan `encodeURIComponent`) |
| `Could not connect to any servers` | IP belum di-whitelist (tambahkan `0.0.0.0/0` di Network Access) |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB lokal tidak berjalan — jalankan `npm run db:local` |
| `MongoParseError: Invalid scheme` | URI format salah (pastikan dimulai dengan `mongodb+srv://`) |
| `serverSelectionTimeoutMS exceeded` | Cluster Atlas sedang cold start (tunggu 30 detik, coba lagi) |

### Seed tidak masuk ke Atlas

- Pastikan `MONGODB_URI` di `.env` sudah mengarah ke Atlas (bukan `127.0.0.1`).
- Cek output seed: harus muncul `(Atlas ☁️)` di baris Connected.
- Jika user sudah exist → normal (skipped, bukan error).

### Login gagal setelah seed

- Pastikan seed sukses (cek di Atlas Browse Collections → users).
- Cek `JWT_SECRET` sama antara saat seed dan saat login (nilai di env tidak berubah).
- Jika butuh reset total: di Atlas, hapus manual collection `users` lalu jalankan `npm run seed` lagi.

---

## H. Ringkasan Perintah

```bash
# Development local (MongoDB lokal)
cd backend && npm run db:local    # Terminal 1: start MongoDB
cd backend && npm run dev          # Terminal 2: start backend

# Seed ke database aktif (local atau Atlas, tergantung MONGODB_URI di .env)
cd backend && npm run seed

# Start production (di server, setelah set env vars)
cd backend && npm start
```

---

## Checklist Siap Demo dengan Atlas

- [ ] Cluster Atlas M0 (Free) sudah dibuat
- [ ] Database user `efuel_admin` sudah dibuat dengan password kuat
- [ ] Network Access sudah allow `0.0.0.0/0`
- [ ] Connection string sudah dicopy dan diisi database name `efuel`
- [ ] `MONGODB_URI` Atlas sudah dimasukkan ke `.env` (lokal) atau env Render
- [ ] `npm run seed` berhasil — output `(Atlas ☁️)` muncul
- [ ] Atlas Browse Collections menampilkan 6 users
- [ ] `/api/health` mengembalikan `200 OK`
- [ ] Login `demo@efuel.com / demo123` berhasil
- [ ] Login `premium@efuel.com / premium123` berhasil (isPremium: true)
- [ ] Login `admin@efuel.com / admin123` berhasil
- [ ] File `.env` asli TIDAK ter-commit ke GitHub
