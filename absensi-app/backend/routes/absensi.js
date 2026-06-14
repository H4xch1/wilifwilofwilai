import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { verifyToken, checkRole } from '../middleware/auth.js';
import Absensi from '../models/Absensi.js';
import Settings from '../models/settings.js';
import User from '../models/User.js';

const router = express.Router();

// 1. Konfigurasi Cloudinary (Otomatis narik dari Environment Variables Vercel Web lu)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Cloudinary Storage (Bypass local storage biar gak kena Error 500 Read-Only)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Memisahkan folder upload bukti surat/file vs foto kamera di Cloudinary
    const folderName = file.fieldname === 'foto_kamera' ? 'absensi/kamera' : 'absensi/bukti_file';
    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], 
      public_id: `${file.fieldname}_${Date.now()}_${req.user.userId}`,
    };
  },
});

// 3. Inisialisasi Multer bawaan Cloudinary Storage
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- ROUTE UTAMA: SUBMIT ABSENSI ---
router.post('/', verifyToken, checkRole('murid'), upload.fields([
  { name: 'bukti_file', maxCount: 1 },
  { name: 'foto_kamera', maxCount: 1 }
]), async (req, res) => {
  try {
    // --- TAMBAHAN: CEK BATAS WAKTU ---
    const setting = await Settings.findOne({ key: 'jam_batas_absen' });
    const batas = setting ? setting.value : '07:30'; // Default kalau belum diatur
    const [h, m] = batas.split(':');
    
    const sekarang = new Date();
    // Konversi WIB kalau server lu timezone-nya bukan WIB
    const jamSekarang = sekarang.getHours(); 
    const menitSekarang = sekarang.getMinutes();

    if (jamSekarang > parseInt(h) || (jamSekarang === parseInt(h) && menitSekarang > parseInt(m))) {
      return res.status(400).json({ message: `Waduh, telat bray! Absen udah ditutup dari jam ${batas}.` });
    }
    // --- AKHIR VALIDASI ---

    const { status, keterangan } = req.body;
    // ... lanjut kode existing lu ...
    const tanggal = new Date().toISOString().split('T')[0];
    const userId = req.user.userId;

    const existing = await Absensi.findOne({ user_id: userId, tanggal });
    if (existing) return res.status(400).json({ message: 'Anda sudah absen hari ini!' });

    let filePath = null;
    let fotoKameraPath = null;

    // Ambil secure URL upload-an online langsung dari payload req.files
    if (req.files && req.files['bukti_file']) {
      filePath = req.files['bukti_file'][0].path;
    }
    if (req.files && req.files['foto_kamera']) {
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

// --- ROUTE GET RIWAYAT MURID ---
router.get('/riwayat', verifyToken, checkRole('murid'), async (req, res) => {
  try {
    const riwayat = await Absensi.find({ user_id: req.user.userId }).sort({ tanggal: -1 });
    res.json(riwayat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ROUTE GET SISWA BIMBINGAN (WALAS) ---
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

// --- ROUTE STATISTIK BULANAN (ADMIN) ---
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
