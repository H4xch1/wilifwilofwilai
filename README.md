# AbsenCerdas - Sistem Absensi Digital

## Struktur Project
```
ABSENSI-APP/
├── backend/     # Node.js + Express + MongoDB
└── frontend/    # React + Vite
```

## Setup

### 1. Install MongoDB

# Ubuntu
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Windows: jalankan MongoDB Compass atau mongod.exe
```

### 2. Backend

cd backend
npm install

# Seed database dengan data awal (termasuk Udin)
npm run seed

# Jalankan server
npm run dev        # port 5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev        # port 3000
```

| Murid | Asep | `444444444` | `123456` |

## Features
- Multi-role: Admin, Petugas, Wali Kelas, Murid
- Absensi dengan foto kamera
- Upload bukti file
- Laporan kasus antar role
- Statistik & grafik kehadiran
