import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Hapus import 'fs' karena ilegal di serverless!

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import absensiRoutes from './routes/absensi.js';
import laporanRoutes from './routes/laporan.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Buka CORS-nya biar bisa ditembak dari frontend lu di Vercel
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Bagus isi URL frontend lu di env, atau '*' dulu buat testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Catatan: Folder uploads ini gak bakal bisa ketulis secara dinamis di Vercel!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware untuk mastiin database selalu konek tiap ada request masuk
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
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