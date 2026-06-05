import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import absensiRoutes from './routes/absensi.js';
import laporanRoutes from './routes/laporan.js';

dotenv.config();
connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: 'https://wilifwilof.vercel.app/', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],     
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/laporan', laporanRoutes);

app.get('/api/data', (req, res) => {
  res.json({ message: "You're in!" });
});

const dirs = ['uploads/absensi', 'uploads/absensi/kamera'];
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

/* const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di port https://localhost:${PORT}/`)); */
export default app;