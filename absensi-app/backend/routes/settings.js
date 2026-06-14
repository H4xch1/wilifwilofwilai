import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import Settings from '../models/settings.js';

const router = express.Router();

// Get jam batas (bisa diakses siapa aja yang login)
router.get('/jam-absen', verifyToken, async (req, res) => {
  const setting = await Settings.findOne({ key: 'jam_batas_absen' });
  res.json({ jam_batas: setting ? setting.value : '07:30' }); // Default 07:30
});

// Update jam batas (Hanya Admin)
router.post('/jam-absen', verifyToken, checkRole('admin'), async (req, res) => {
  const { jam } = req.body; // format 'HH:mm'
  await Settings.findOneAndUpdate({ key: 'jam_batas_absen' }, { value: jam }, { upsert: true });
  res.json({ message: 'Jam batas berhasil diupdate' });
});

export default router;