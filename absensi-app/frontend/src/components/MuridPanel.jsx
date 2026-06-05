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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [fotoBlob, setFotoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAbsen, setSelectedAbsen] = useState(null);

  const checkSudahAbsen = async () => {
    try {
      const res = await api.get('/absensi/riwayat');
      const today = new Date().toISOString().split('T')[0];
      const todayAbsen = (Array.isArray(res.data) ? res.data : []).find(a => a.tanggal === today);
      setSudahAbsen(!!todayAbsen);
    } catch (err) {
      console.error('Gagal cek absen', err);
      setSudahAbsen(false);
    }
  };

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absensi/riwayat');
      setRiwayat(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal ambil riwayat', err);
      setRiwayat([]);
    }
    setLoading(false);
  };

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile/me');
      setProfil(res.data);
    } catch (err) {
      console.error('Gagal ambil profil', err);
    }
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (e) {
      alert('Tidak dapat akses kamera. Izinkan akses kamera.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        setFotoBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewVisible(true);
      }
    }, 'image/png');
    
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const retakePhoto = async () => {
    setPreviewVisible(false);
    setFotoBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    await startCamera();
  };

  const handleAbsen = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const status = e.target.status.value;
    const keterangan = e.target.keterangan.value;
    formData.append('status', status);
    if (keterangan) formData.append('keterangan', keterangan);

    const fileInput = e.target.elements['bukti_file']?.files[0];
    if (fileInput) {
      formData.append('bukti_file', fileInput);
    }

    if (fotoBlob) {
      const fileName = `kamera_${Date.now()}.png`;
      formData.append('foto_kamera', fotoBlob, fileName);
    }

    try {
      setLoading(true);
      const res = await api.post('/absensi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAbsenMessage(res.data.message || 'Absen berhasil!');
      setSudahAbsen(true);
      setPreviewVisible(false);
      setFotoBlob(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    } catch (err) {
      console.error('Error absen:', err);
      setAbsenMessage(err.response?.data?.message || 'Gagal absen, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (absen) => {
    setSelectedAbsen(absen);
  };

  const closeDetail = () => {
    setSelectedAbsen(null);
  };

  useEffect(() => {
    if (activePanel === 'absen-form') {
      checkSudahAbsen();
      startCamera();
    }
    if (activePanel === 'riwayat-absen') fetchRiwayat();
    if (activePanel === 'profil') fetchProfil();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [activePanel]);

  if (activePanel === 'dashboard') {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return (
      <div className="panel active-panel">
        <div className="welcome-section">
          <h1>👋 Halo, {user.nama || 'Murid'}</h1>
          <p>Role: Murid</p>
        </div>
      </div>
    );
  }

  if (activePanel === 'absen-form') {
    return (
      <div className="panel active-panel">
        <h2>Form Absensi</h2>
        {sudahAbsen ? (
          <div className="alert alert-success">Anda sudah absen hari ini.</div>
        ) : (
          <>
            {absenMessage && <div className={`alert ${absenMessage.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>{absenMessage}</div>}
            <form onSubmit={handleAbsen} encType="multipart/form-data">
              <div className="form-group">
                <label>Status</label>
                <div className="radio-group">
                  <label><input type="radio" name="status" value="hadir" required /> Hadir</label>
                  <label><input type="radio" name="status" value="sakit" /> Sakit</label>
                  <label><input type="radio" name="status" value="izin" /> Izin</label>
                </div>
              </div>
              <div className="form-group">
                <label>📸 Foto Selfie (Kamera)</label>
                <div className="camera-container">
                  <video ref={videoRef} autoPlay playsInline style={{ display: previewVisible ? 'none' : 'block', width: '100%', maxWidth: '300px' }}></video>
                  <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                  {!previewVisible && (
                    <button type="button" className="btn-capture" onClick={capturePhoto}>Ambil Foto</button>
                  )}
                  {previewVisible && (
                    <>
                      <button type="button" className="btn-retake" onClick={retakePhoto}>Ulang</button>
                      <div className="foto-preview">
                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '120px', marginTop: '10px' }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>📎 Upload File Tambahan (opsional)</label>
                <input type="file" name="bukti_file" accept=".jpg,.jpeg,.png,.gif,.pdf" />
              </div>
              <div className="form-group">
                <label>📝 Keterangan (opsional)</label>
                <textarea name="keterangan" rows="2"></textarea>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Simpan Absensi'}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  if (activePanel === 'riwayat-absen') {
    return (
      <div className="panel active-panel">
        <h2>Riwayat Absensi</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
        {!loading && riwayat.length === 0 && <div className="alert alert-info">Belum ada riwayat absensi.</div>}
        {!loading && riwayat.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Sesi</th><th>Status</th><th>Foto</th><th>File</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {riwayat.map((r, i) => (
                  <tr key={i} onClick={() => openDetail(r)} style={{ cursor: 'pointer' }}>
                    <td>{r.tanggal}</td>
                    <td>{r.sesi ? (r.sesi === 'masuk' ? '🌅 Masuk' : '🌙 Pulang') : '-'}</td>
                    <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                    <td>{r.foto_kamera ? '📷 Ada' : '-'}</td>
                    <td>{r.file_path ? '📄 Ada' : '-'}</td>
                    <td><button className="btn-view" onClick={(e) => { e.stopPropagation(); openDetail(r); }}>Detail</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {selectedAbsen && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
              <span className="close-modal" onClick={closeDetail}>&times;</span>
              <h3>Detail Absensi</h3>
              <p><strong>Tanggal:</strong> {selectedAbsen.tanggal}</p>
              <p><strong>Sesi:</strong> {selectedAbsen.sesi ? (selectedAbsen.sesi === 'masuk' ? 'Masuk (Pagi)' : 'Pulang (Sore)') : '-'}</p>
              <p><strong>Status:</strong> {selectedAbsen.status}</p>
              <p><strong>Keterangan:</strong> {selectedAbsen.keterangan || '-'}</p>
              
              {selectedAbsen.foto_kamera && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Foto Kamera:</strong>
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={`${API_URL.replace('/api', '')}/${selectedAbsen.foto_kamera}`} 
                      alt="Foto Absen" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Foto+tidak+ditemukan'; }}
                    />
                  </div>
                  <a href={`${API_URL.replace('/api', '')}/${selectedAbsen.foto_kamera}`} target="_blank" rel="noopener noreferrer">Buka di tab baru</a>
                </div>
              )}
              
              {selectedAbsen.file_path && (
                <div>
                  <strong>File Bukti:</strong>
                  <div style={{ marginTop: '10px' }}>
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(selectedAbsen.file_path) ? (
                      <div style={{ marginBottom: '10px' }}>
                        <img 
                          src={`${API_URL.replace('/api', '')}/${selectedAbsen.file_path}`} 
                          alt="Bukti File" 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      </div>
                    ) : null}
                    <a href={`${API_URL.replace('/api', '')}/${selectedAbsen.file_path}`} target="_blank" rel="noopener noreferrer">Download / Lihat File</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activePanel === 'profil') {
    return (
      <div className="panel active-panel">
        <h2>Profil Saya</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
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

  return <div className="panel active-panel"><p>Panel tidak ditemukan: {activePanel}</p></div>;
}