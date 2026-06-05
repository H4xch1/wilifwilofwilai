import mongoose from 'mongoose';

// Kita bikin penampung cache koneksi di luar fungsi
let isConnected = false;

const connectDB = async () => {
  // 1. Cek dulu, kalau udah ada koneksi yang aktif, langsung pakai aja
  if (isConnected) {
    console.log('=> Menggunakan koneksi MongoDB yang sudah ada');
    return;
  }

  try {
    // 2. Kalau belum ada, kita bikin koneksi baru
    // Pastiin nama ENV lu bener ya, di kodingan lu MONGODB_URI, di settingan Vercel harus sama!
    const db = await mongoose.connect(process.env.MONGODB_URI);
    
    // Simpan status koneksi (1 = connected)
    isConnected = db.connections[0].readyState;
    console.log('=> Koneksi MongoDB baru berhasil tersambung');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    // JANGAN PAKE process.exit(1)!! 
    // Kita throw error-nya biar Express bisa nge-handle dengan estetik
    throw new Error('Gagal tersambung ke database bray');
  }
};

export default connectDB;