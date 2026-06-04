import express from 'express';
import bcrypt from 'bcryptjs';
import { verifyToken, checkRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// ============================================================
// PENTING: Route spesifik HARUS di atas route dinamis /:param
// Kalau /:role di atas, Express akan tangkap /murid /profile/me
// /list/walas sebagai `:role` dan langsung kena checkRole('admin')
// ============================================================

// GET /api/users/profile/me
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wali_kelas_id', 'nama_lengkap');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/murid (admin, petugas, walas)
router.get('/murid', verifyToken, checkRole('admin', 'petugas', 'walas'), async (req, res) => {
  try {
    const murid = await User.find({ role: 'murid' });
    res.json(murid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/list/walas
router.get('/list/walas', verifyToken, async (req, res) => {
  try {
    const walas = await User.find({ role: 'walas' }, 'nama_lengkap');
    res.json(walas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:role (admin only) — HARUS PALING BAWAH
router.get('/:role', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).populate('wali_kelas_id', 'nama_lengkap');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id (admin only)
router.put('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { nama, nik, nis, tanggal_lahir, role, kelas, kelas_wali, wali_kelas_id, password } = req.body;
    const updateData = {
      nama_lengkap: nama,
      nik,
      nis,
      tanggal_lahir,
      role,
      kelas,
      kelas_wali,
      wali_kelas_id: wali_kelas_id || null
    };

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'Data berhasil diupdate' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/users/:id (admin only)
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
