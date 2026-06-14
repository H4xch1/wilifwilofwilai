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
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. CORS Dinamis (Bypass semua domain .vercel.app)
app.use(cors({
    origin: (origin, callback) => {
        // Izinkan kalau request dari vercel.app, localhost, atau kalau origin kosong (server-to-server)
        if (!origin || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Bypass OPTIONS
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Database Middleware
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/data', (req, res) => {
  res.json({ message: "You're in!" });
});

export default app;