import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nama_lengkap: { type: String, required: true },
  nik: { type: String, required: true, unique: true },
  nis: { type: String, default: null },
  tanggal_lahir: { type: Date, default: null },
  password: { type: String, required: true },
  role: { type: String, enum: ['murid', 'petugas', 'walas', 'admin'], required: true },
  wali_kelas_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);