import mongoose from 'mongoose';

const absensiSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tanggal: { type: String, required: true },
  status: { type: String, enum: ['hadir', 'sakit', 'izin'], required: true },
  file_path: { type: String, default: null },
  foto_kamera: { type: String, default: null },
  keterangan: { type: String, default: '' }
}, { timestamps: true });

absensiSchema.index({ user_id: 1, tanggal: 1 }, { unique: true });

export default mongoose.model('Absensi', absensiSchema);