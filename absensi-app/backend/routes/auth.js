import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { nik, password } = req.body;
    const user = await User.findOne({ nik });
    if (!user) return res.status(400).json({ message: 'NIK atau Password salah!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'NIK atau Password salah!' });

    const token = jwt.sign(
      { userId: user._id, role: user.role, nama: user.nama_lengkap, nik: user.nik },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, nama: user.nama_lengkap, role: user.role, nik: user.nik }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { nama, nik, nis, tanggal_lahir, password, role, wali_kelas_id } = req.body;

    const existing = await User.findOne({ nik });
    if (existing) return res.status(400).json({ message: 'NIK sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      nama_lengkap: nama, nik, nis: nis || null,
      tanggal_lahir: tanggal_lahir || null,
      password: hashedPassword, role,
      wali_kelas_id: wali_kelas_id || null
    });

    await user.save();
    res.status(201).json({ message: 'User berhasil didaftarkan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;