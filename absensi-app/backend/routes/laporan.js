import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import LaporanKasus from '../models/LaporanKasus.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('walas'), async (req, res) => {
  try {
    // Pastikan kita ambil ID yang bener dari token
    const walasId = req.user.id || req.user._id || req.user.userId;

    if (!walasId) {
        return res.status(401).json({ message: "Token lu gak ada ID-nya, bray!" });
    }

    const { siswa_id, judul, deskripsi } = req.body;
    console.log(req.user)
    const laporan = new LaporanKasus({
      walas_id: walasId, // Pake variabel yang udah kita amanin
      siswa_id, 
      judul, 
      deskripsi,
      tanggal: new Date().toISOString().split('T')[0]
    });
    
    await laporan.save();
    res.status(201).json({ message: 'Laporan sukses!' });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/walas', verifyToken, checkRole('walas'), async (req, res) => {
  try {
    const laporan = await LaporanKasus.find({ walas_id: req.user.userId })
      .populate('siswa_id', 'nama_lengkap').sort({ tanggal: -1 });
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/petugas', verifyToken, checkRole('petugas'), async (req, res) => {
  try {
    const laporan = await LaporanKasus.find()
      .populate('walas_id', 'nama_lengkap')
      .populate('siswa_id', 'nama_lengkap')
      .sort({ tanggal: -1 });
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', verifyToken, checkRole('petugas'), async (req, res) => {
  try {
    const { status } = req.body;
    await LaporanKasus.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status laporan diperbarui' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;