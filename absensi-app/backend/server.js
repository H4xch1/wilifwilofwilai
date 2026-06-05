import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import absensiRoutes from './routes/absensi.js';
import laporanRoutes from './routes/laporan.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. PASANG CORS DI PALING ATAS HARGA MATI!
app.use(cors({
    origin: ['https://wilifwilof.vercel.app', 'http://localhost:5173'], // Masukin domain frontend Vercel lu & localhost biar aman
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Tambahin OPTIONS di sini bray     
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. TRICK JITU: Bypass langsung kalau browser cuman ngecek ombak (Preflight OPTIONS)
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. MIDDLEWARE DATABASE DIBAWAH CORS & OPTIONS!
// Biar request cek ombak gak ketahan sama loading database
app.use(async (req, res, next) => {
  // Kalau browser cuman kirim preflight OPTIONS, langsung lolosin tanpa cek DB
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  try {
    await connectDB();
    next();
  } catch (err) {
    // Pastiin kalau DB error, tetep kasih header CORS biar kelihatan di inspect element frontend
    res.header("Access-Control-Allow-Origin", "https://wilifwilof.vercel.vercel.app");
    res.status(500).json({ error: "Database connection failed bray" });
  }
});

// Route-route API lu
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/laporan', laporanRoutes);

app.get('/api/data', (req, res) => {
  res.json({ message: "You're in!" });
});

export default app;