import mongoose from 'mongoose';

const laporanSchema = new mongoose.Schema({
  walas_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  siswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  judul: { type: String, required: true },
  deskripsi: { type: String, required: true },
  tanggal: { type: String, required: true },
  status: { type: String, enum: ['belum_dibaca', 'dibaca', 'ditindaklanjuti'], default: 'belum_dibaca' }
}, 

{ timestamps: true });

export default mongoose.model('LaporanKasus', laporanSchema);