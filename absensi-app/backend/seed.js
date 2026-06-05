/*import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Absensi from './models/Absensi.js';
import LaporanKasus from './models/LaporanKasus.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/db_absensi');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Absensi.deleteMany({});
    await LaporanKasus.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await User.create([
      {
        nama_lengkap: 'Admin Utama',
        nik: '111111111',
        nis: null,
        tanggal_lahir: null,
        password: hashedPassword,
        role: 'admin',
        wali_kelas_id: null
      },
      {
        nama_lengkap: 'Pak Budi',
        nik: '222222222',
        nis: null,
        tanggal_lahir: null,
        password: hashedPassword,
        role: 'walas',
        wali_kelas_id: null
      },
      {
        nama_lengkap: 'Bu Siti',
        nik: '333333333',
        nis: null,
        tanggal_lahir: null,
        password: hashedPassword,
        role: 'petugas',
        wali_kelas_id: null
      },
      {
        nama_lengkap: 'Udin',
        nik: '123123123',
        nis: '2026001',
        tanggal_lahir: new Date('2008-05-15'),
        password: hashedPassword,
        role: 'murid',
        wali_kelas_id: null  // Will be updated after walas is created
      },
      {
        nama_lengkap: 'Asep',
        nik: '444444444',
        nis: '2026002',
        tanggal_lahir: new Date('2008-08-20'),
        password: hashedPassword,
        role: 'murid',
        wali_kelas_id: null
      }
    ]);

    console.log('Users created:', users.map(u => `${u.nama_lengkap} (${u.role})`).join(', '));

    // Update wali_kelas_id for murid (assign to Pak Budi)
    const walas = users.find(u => u.role === 'walas');
    const murids = users.filter(u => u.role === 'murid');

    for (const murid of murids) {
      murid.wali_kelas_id = walas._id;
      await murid.save();
    }
    console.log(`Assigned ${murids.length} murid to walas: ${walas.nama_lengkap}`);

    // Create sample absensi for Udin
    const udin = users.find(u => u.nama_lengkap === 'Udin');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await Absensi.create([
      {
        user_id: udin._id,
        tanggal: yesterday,
        status: 'hadir',
        file_path: null,
        foto_kamera: null,
        keterangan: 'Masuk tepat waktu'
      },
      {
        user_id: udin._id,
        tanggal: today,
        status: 'hadir',
        file_path: null,
        foto_kamera: null,
        keterangan: 'Masuk tepat waktu'
      }
    ]);
    console.log('Sample absensi created for Udin');

    const asep = users.find(u => u.nama_lengkap === 'Asep');
    await LaporanKasus.create({
      walas_id: walas._id,
      siswa_id: asep._id,
      judul: 'Bolos Sekolah',
      deskripsi: 'Siswa tidak masuk 2 hari berturut-turut tanpa keterangan',
      tanggal: today,
      status: 'belum_dibaca'
    });
    console.log('Sample laporan kasus created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin  : NIK=111111111, PW=123456');
    console.log('  Walas  : NIK=222222222, PW=123456');
    console.log('  Petugas: NIK=333333333, PW=123456');
    console.log('  Murid  : NIK=123123123, PW=123456 (Udin)');
    console.log('  Murid  : NIK=444444444, PW=123456 (Asep)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB(); */
