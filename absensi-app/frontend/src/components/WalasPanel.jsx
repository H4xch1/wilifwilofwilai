import { useState, useEffect } from 'react';
import axios from 'axios';
// === PERUBAHAN: Import library XLSX ===
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default function WalasPanel({ activePanel }) {
  const [siswaList, setSiswaList] = useState([]);
  const [laporanMessage, setLaporanMessage] = useState('');
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);
  const [absensiSiswa, setAbsensiSiswa] = useState([]);
  const [viewingSiswa, setViewingSiswa] = useState(null);
  const [showAbsensi, setShowAbsensi] = useState(false);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);

  // === PERUBAHAN: Fungsi baru buat Export Excel ===
  const exportToExcel = () => {
    if (absensiSiswa.length === 0) {
      alert("Data absensi kosong!");
      return;

    }

  }

    const worksheet = XLSX.utils.json_to_sheet(absensiSiswa.map((a, i) => ({
      No: i + 1,
      Tanggal: a.tanggal,
      Status: a.status,
      Keterangan: a.keterangan
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");
    XLSX.writeFile(workbook, `Absensi_${viewingSiswa?.nama_lengkap || 'Siswa'}.xlsx`);
  };

  const fetchSiswaBimbingan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/murid');
      const data = Array.isArray(res.data) ? res.data : [];
      setSiswaList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayatLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan/walas');
      const data = Array.isArray(res.data) ? res.data : [];
      setRiwayatLaporan(data);
    } catch (err) {
      console.error('Gagal ambil riwayat laporan, pakai mock', err);
      setRiwayatLaporan(mockRiwayat);
    }
    setLoading(false);
  };

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile/me');
      setProfil(res.data);
    } catch (err) {
      console.error('Gagal ambil profil, pakai localStorage fallback', err);
      const user = JSON.parse(localStorage.getItem('user')) || {};
      setProfil({ nama_lengkap: user.nama || 'Walas', nik: user.nik || '-', role: 'walas' });
    }
    setLoading(false);
  };

  const handleKirimLaporan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const res = await api.post('/laporan', {
        siswa_id: formData.get('siswa_id'),
        judul: formData.get('judul'),
        deskripsi: formData.get('deskripsi')
      });
      setLaporanMessage(res.data.message);
      e.target.reset();
    } catch (err) {
      setLaporanMessage('Laporan terkirim (mock). API belum siap.');
      e.target.reset();
    }
  };

  const handleLihatAbsensi = async (siswaId) => {
    setLoading(true);
    try {
      const res = await api.get(`/absensi/walas/${siswaId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setAbsensiSiswa(data);
      const siswa = siswaList.find(s => s._id === siswaId);
      setViewingSiswa(siswa);
      setShowAbsensi(true);
    } catch (err) {
      console.error('Gagal ambil absensi, pakai mock', err);
      setAbsensiSiswa(mockAbsensi);
      const siswa = siswaList.find(s => s._id === siswaId);
      setViewingSiswa(siswa || { nama_lengkap: 'Siswa' });
      setShowAbsensi(true);
    }
    setLoading(false);
  };

  const handleBackToSiswa = () => {
    setShowAbsensi(false);
    setViewingSiswa(null);
    setAbsensiSiswa([]);
  };

  useEffect(() => {
    if (activePanel === 'siswa-bimbingan' || activePanel === 'kirim-laporan') {
      fetchSiswaBimbingan();
    }
    if (activePanel === 'riwayat-laporan') {
      fetchRiwayatLaporan();
    }
    if (activePanel === 'profil-walas') {
      fetchProfil();
    }
    setShowAbsensi(false);
    setViewingSiswa(null);
  }, [activePanel]);

  if (activePanel === 'dashboard') {
    return (
      <div className="panel active-panel">
        <div className="welcome-section">
          <h1>👋 Halo Wali Kelas</h1>
          <p>Pantau siswa dan kirim laporan kasus.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Siswa Bimbingan</h3>
              <div className="number">{siswaList.length}</div>
            </div>
            <i className="fas fa-users stat-icon"></i>
          </div>
        </div>
      </div>
    );
  }

  if (activePanel === 'siswa-bimbingan') {
    if (showAbsensi && viewingSiswa) {
    return (
      <div className="panel active-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Absensi: {viewingSiswa.nama_lengkap}</h2>
          <div>
            <button onClick={() => setShowAbsensi(false)}>Kembali</button>
            <button onClick={exportToExcel} style={{ marginLeft: '10px' }}>Export Excel</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {absensiSiswa.map((a, i) => (
              <tr key={i}>
                <td>{a.tanggal}</td>
                <td>{a.status}</td>
                <td>{a.keterangan || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    }

    // TAMPILAN DAFTAR SISWA BIMBINGAN (diperbaiki kontrasnya)
    return (
      <div className="panel active-panel">
        <h2>Siswa Bimbingan</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
        {!loading && siswaList.length === 0 && <div className="alert alert-info">Belum ada siswa bimbingan.</div>}
        {!loading && siswaList.length > 0 && (
          siswaList.map(siswa => (
            <div
              key={siswa._id}
              style={{
                background: '#1e293b',        // latar gelap kontras
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '12px',
                borderLeft: '3px solid #f5c518'
              }}
            >
              <strong style={{ color: '#f5c518', fontSize: '15px' }}>{siswa.nama_lengkap}</strong>
              <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '8px' }}>
                (NIS: {siswa.nis || '-'})
              </span>
              <br />
              <button
                className="btn-edit-small"
                onClick={() => handleLihatAbsensi(siswa._id)}
                style={{ marginTop: '8px' }}
              >
                Lihat Absensi
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  if (activePanel === 'kirim-laporan') {
    return (
      <div className="panel active-panel">
        <h2><i className="fas fa-exclamation-triangle"></i> Kirim Laporan Kasus Siswa</h2>
        {laporanMessage && <div className="alert alert-success">{laporanMessage}</div>}
        <form onSubmit={handleKirimLaporan}>
          <div className="form-group">
            <label>Pilih Siswa</label>
            <select name="siswa_id" required>
              <option value="">-- Pilih Siswa Bimbingan --</option>
              {siswaList.map(s => (
                <option key={s._id} value={s._id}>{s.nama_lengkap} (NIS: {s.nis || '-'})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Judul Laporan</label>
            <input type="text" name="judul" placeholder="Contoh: Bolos, Perilaku, dll" required />
          </div>
          <div className="form-group">
            <label>Deskripsi Lengkap</label>
            <textarea name="deskripsi" rows="4" placeholder="Jelaskan kronologi, bukti, dll..." required></textarea>
          </div>
          <button type="submit" className="btn-submit"><i className="fas fa-paper-plane"></i> Kirim ke Petugas</button>
        </form>
      </div>
    );
  }

  if (activePanel === 'riwayat-laporan') {
    return (
      <div className="panel active-panel">
        <h2><i className="fas fa-list"></i> Riwayat Laporan Kasus</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
        {!loading && riwayatLaporan.length === 0 && <div className="alert alert-info">Belum ada laporan yang dikirim.</div>}
        {!loading && riwayatLaporan.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Tanggal</th><th>Siswa</th><th>Judul</th><th>Deskripsi</th><th>Status</th></tr>
            </thead>
            <tbody>
              {riwayatLaporan.map((lap) => (
                <tr key={lap._id}>
                  <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{lap.siswa_id?.nama_lengkap || 'Siswa'}</td>
                  <td>{lap.judul}</td>
                  <td>{lap.deskripsi}</td>
                  <td>
                    {lap.status === 'belum_dibaca' && <span style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '20px' }}>Belum dibaca</span>}
                    {lap.status === 'dibaca' && <span style={{ background: '#dbeafe', padding: '4px 8px', borderRadius: '20px' }}>Sudah dibaca</span>}
                    {lap.status === 'ditindaklanjuti' && <span style={{ background: '#d1fae5', padding: '4px 8px', borderRadius: '20px' }}>Ditindaklanjuti</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  if (activePanel === 'profil-walas') {
    return (
      <div className="panel active-panel">
        <h2>Profil Wali Kelas</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
        {profil && (
          <table className="data-table">
            <tbody>
              <tr><th>Nama</th><td>{profil.nama_lengkap}</td></tr>
              <tr><th>NIK</th><td>{profil.nik}</td></tr>
              <tr><th>Role</th><td>{profil.role}</td></tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return <div className="panel active-panel"><p>Panel tidak ditemukan: {activePanel}</p></div>;
