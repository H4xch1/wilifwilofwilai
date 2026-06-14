import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // contoh: 'jam_batas_absen'
  value: { type: String, required: true } // contoh: '07:30'
});

export default mongoose.model('Settings', SettingsSchema);