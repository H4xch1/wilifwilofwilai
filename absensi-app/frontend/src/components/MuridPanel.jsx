import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
}, (error) => Promise.reject(error));

export default function MuridPanel({ activePanel }) {
  const [absenMessage, setAbsenMessage] = useState('');
  const [riwayat, setRiwayat] = useState([]);
  const [sudahAbsen, setSudahAbsen] = useState(false);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAbsen, setSelectedAbsen] = useState(null);

  // FUNGSI SAKTI
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}/${path}`;
  };

  const checkSudahAbsen = async () => {
    try {
      const res = await api.get('/absensi/riwayat');
      const today = new Date().toISOString().split('T')[0];
      const sudah = res.data.some(item => item.tanggal.split('T')[0] === today);
      setSudahAbsen(sudah);
      setRiwayat(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkSudahAbsen();
    api.get('/users/profile').then(res => setProfil(res.data)).catch(console.error);
  }, []);

  // --- PANEL: ABSEN FORM ---
  if (activePanel === 'absen-form') {
    return (
      <div className="panel active-panel">
        <h2>Form Absensi</h2>
        {sudahAbsen ? (
          <div className="alert alert-success">Hari ini kamu sudah absen! Mantap! 🔥</div>
        ) : (
          <div className="alert alert-info">Silakan lakukan absensi hari ini.</div>
        )}
        {/* Tambahin form absen lu di bawah sini ya bray */}
      </div>
    );
  }

  // --- PANEL: RIWAYAT ABSEN ---
  if (activePanel === 'riwayat-absen') {
    return (
      <div className="panel active-panel">
        <h2>Riwayat Absensi</h2>
        <table className="data-table">
          <thead>
            <tr><th>Tanggal</th><th>Status</th><th>Bukti</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {riwayat.map((absen) => (
              <tr key={absen._id}>
                <td>{new Date(absen.tanggal).toLocaleDateString('id-ID')}</td>
                <td>{absen.status}</td>
                <td>{absen.file_path ? 'Ada' : '-'}</td>
                <td><button onClick={() => setSelectedAbsen(absen)}>Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedAbsen && (
          <div className="modal-overlay" onClick={() => setSelectedAbsen(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Detail Absensi</h3>
              <p>Status: {selectedAbsen.status}</p>
              
              {selectedAbsen.foto_kamera && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={getImageUrl(selectedAbsen.foto_kamera)} alt="Foto Kamera" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
                </div>
              )}
              {selectedAbsen.file_path && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={getImageUrl(selectedAbsen.file_path)} alt="Bukti File" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                </div>
              )}
              <a href={getImageUrl(selectedAbsen.file_path)} target="_blank" rel="noopener noreferrer">Lihat File</a>
              <button onClick={() => setSelectedAbsen(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PANEL: PROFIL ---
  if (activePanel === 'profil') {
    return (
      <div className="panel active-panel">
        <h2>Profil Saya</h2>
        {profil && (
          <table className="data-table">
            <tbody>
              <tr><th>Nama</th><td>{profil.nama_lengkap}</td></tr>
              <tr><th>NIK</th><td>{profil.nik}</td></tr>
              <tr><th>NIS</th><td>{profil.nis || '-'}</td></tr>
              <tr><th>Role</th><td>{profil.role}</td></tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // --- DEFAULT PANEL (DASHBOARD) ---
  return (
    <div className="panel active-panel">
      <h2>Dashboard Murid</h2>
      <p>Selamat datang di sistem absensi! Pilih menu di samping buat lanjut.</p>
    </div>
  );
}