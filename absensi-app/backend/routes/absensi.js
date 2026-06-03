import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, checkRole } from '../middleware/auth.js';
import Absensi from '../models/Absensi.js';
import User from '../models/User.js';

const router = express.Router();

// Pastikan folder uploads ada
const uploadDir = 'uploads/absensi/';
const kameraDir = 'uploads/absensi/kamera/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(kameraDir)) fs.mkdirSync(kameraDir, { recursive: true });

// Konfigurasi multer untuk menerima dua field file: bukti_file dan foto_kamera
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'foto_kamera') {
      cb(null, kameraDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'foto_kamera' ? 'kamera_' : 'file_';
    cb(null, `${prefix}${Date.now()}_${req.user.userId}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/absensi - Menerima file bukti_file dan/atau foto_kamera
router.post('/', verifyToken, checkRole('murid'), upload.fields([
  { name: 'bukti_file', maxCount: 1 },
  { name: 'foto_kamera', maxCount: 1 }
]), async (req, res) => {
  try {
    const { status, keterangan } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const userId = req.user.userId;

    // Cek apakah sudah absen hari ini
    const existing = await Absensi.findOne({ user_id: userId, tanggal });
    if (existing) return res.status(400).json({ message: 'Anda sudah absen hari ini!' });

    let filePath = null;
    let fotoKameraPath = null;

    if (req.files['bukti_file']) {
      filePath = req.files['bukti_file'][0].path;
    }
    if (req.files['foto_kamera']) {
      fotoKameraPath = req.files['foto_kamera'][0].path;
    }

    const absensi = new Absensi({
      user_id: userId,
      tanggal,
      status,
      file_path: filePath,
      foto_kamera: fotoKameraPath,
      keterangan: keterangan || ''
    });

    await absensi.save();
    res.status(201).json({ message: `Absensi berhasil dicatat sebagai ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/absensi/riwayat
router.get('/riwayat', verifyToken, checkRole('murid'), async (req, res) => {
  try {
    const riwayat = await Absensi.find({ user_id: req.user.userId }).sort({ tanggal: -1 });
    res.json(riwayat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/absensi/walas/:siswaId
router.get('/walas/:siswaId', verifyToken, checkRole('walas'), async (req, res) => {
  try {
    const siswa = await User.findOne({ _id: req.params.siswaId, wali_kelas_id: req.user.userId });
    if (!siswa) return res.status(403).json({ message: 'Bukan siswa bimbingan Anda' });

    const absensi = await Absensi.find({ user_id: req.params.siswaId }).sort({ tanggal: -1 }).limit(30);
    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/absensi/statistik/bulan-ini
router.get('/statistik/bulan-ini', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const bulanIni = new Date().toISOString().slice(0, 7);
    const hadir = await Absensi.countDocuments({ status: 'hadir', tanggal: { $regex: `^${bulanIni}` } });
    const sakit = await Absensi.countDocuments({ status: 'sakit', tanggal: { $regex: `^${bulanIni}` } });
    const izin = await Absensi.countDocuments({ status: 'izin', tanggal: { $regex: `^${bulanIni}` } });
    res.json({ labels: ['Hadir', 'Sakit', 'Izin'], data: [hadir, sakit, izin] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
