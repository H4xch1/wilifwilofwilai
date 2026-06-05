import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function PetugasPanel({ activePanel }) {
  const [laporanList, setLaporanList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [profil, setProfil] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatLaporan, setChatLaporan] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [maxChat, setMaxChat] = useState(5);
  const [currentChatCount, setCurrentChatCount] = useState(0);

  let messageTimeout = null;
  const showMessage = (msg) => {
    setStatusMessage(msg);
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => setStatusMessage(''), 3000);
  };

  useEffect(() => {
    setStatusMessage('');
    setShowDetailModal(false);
    setSelectedLaporan(null);
    setShowChatModal(false);
    setChatLaporan(null);
    setChatMessages([]);
    setNewChatMessage('');
  }, [activePanel]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan/petugas');
      let data = [];
      if (res.data && Array.isArray(res.data)) data = res.data;
      else if (res.data && typeof res.data === 'object') data = Object.values(res.data);
      setLaporanList(data);
    } catch (err) {
      console.error(err);
      setLaporanList([]);
    }
    setLoading(false);
  };

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/murid');
      let data = [];
      if (res.data && Array.isArray(res.data)) data = res.data;
      else if (res.data && typeof res.data === 'object') data = Object.values(res.data);
      setSiswaList(data);
    } catch (err) {
      console.error(err);
      setSiswaList([]);
    }
    setLoading(false);
  };

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile/me');
      setProfil(res.data || {});
    } catch (err) {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      setProfil({ nama_lengkap: user.nama || 'Petugas', nik: user.nik || '-', role: 'petugas' });
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laporan/${id}/status`, { status });
      showMessage('Status laporan diperbarui');
      fetchLaporan();
    } catch (err) {
      showMessage('Gagal update status');
    }
  };

  const openDetailModal = (laporan) => {
    setSelectedLaporan(laporan);
    setShowDetailModal(true);
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLaporan(null);
  };

  const openChatModal = async (laporan) => {
    setChatLaporan(laporan);
    setShowChatModal(true);
    setChatLoading(true);
    try {
      const res = await api.get(`/laporan/${laporan._id}/chat`);
      const chats = (res.data && Array.isArray(res.data.chats)) ? res.data.chats : [];
      setChatMessages(chats);
      setMaxChat(res.data?.maxChat ?? 5);
      setCurrentChatCount(res.data?.currentCount ?? chats.length);
    } catch (err) {
      setChatMessages([]);
    }
    setChatLoading(false);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setChatLaporan(null);
    setChatMessages([]);
    setNewChatMessage('');
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    if (currentChatCount >= maxChat) {
      showMessage('Maksimal 5 pesan sudah tercapai');
      return;
    }
    try {
      const res = await api.post(`/laporan/${chatLaporan._id}/chat`, { pesan: newChatMessage });
      const newChats = (res.data && Array.isArray(res.data.chats)) ? res.data.chats : [];
      setChatMessages(newChats);
      setCurrentChatCount(newChats.length);
      setNewChatMessage('');
      showMessage('Pesan terkirim');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Gagal kirim pesan');
    }
  };

  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
    if (activePanel === 'profil-petugas') fetchProfil();
  }, [activePanel]);

  const renderLaporanTable = () => {
    if (!Array.isArray(laporanList) || laporanList.length === 0) return null;
    return laporanList.map(lap => (
      <tr key={lap._id} style={{ cursor: 'pointer' }} onClick={() => openDetailModal(lap)}>
        <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
        <td>{lap.walas_id?.nama_lengkap || '-'}</td>
        <td>{lap.siswa_id?.nama_lengkap || '-'}</td>
        <td>{lap.judul}</td>
        <td>
          {lap.status === 'belum_dibaca' && <span style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '20px' }}>Belum dibaca</span>}
          {lap.status === 'dibaca' && <span style={{ background: '#dbeafe', padding: '4px 8px', borderRadius: '20px' }}>Dibaca</span>}
          {lap.status === 'ditindaklanjuti' && <span style={{ background: '#d1fae5', padding: '4px 8px', borderRadius: '20px' }}>Ditindaklanjuti</span>}
        </td>
        <td>
          <button className="btn-edit-small" style={{ background: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); updateStatus(lap._id, 'dibaca'); }}>Tandai Dibaca</button>
          <button className="btn-edit-small" style={{ background: '#10b981' }} onClick={(e) => { e.stopPropagation(); updateStatus(lap._id, 'ditindaklanjuti'); }}>Tindak Lanjuti</button>
          <button className="btn-edit-small" style={{ background: '#f59e0b' }} onClick={(e) => { e.stopPropagation(); openChatModal(lap); }}>💬 Chat</button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="panel-container">
        {activePanel === 'dashboard' && (
          <div className="panel active-panel">
            <div className="welcome-section">
              <h1>👋 Halo, Petugas</h1>
              <p>Kelola laporan kasus dari wali kelas.</p>
            </div>
          </div>
        )}

        {activePanel === 'laporan-petugas' && (
          <div className="panel active-panel">
            <h2><i className="fas fa-inbox"></i> Laporan Kasus dari Wali Kelas</h2>
            {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
            {loading && <div className="alert alert-info">Memuat...</div>}
            {!loading && (!Array.isArray(laporanList) || laporanList.length === 0) && <div className="alert alert-info">Belum ada laporan kasus.</div>}
            {!loading && Array.isArray(laporanList) && laporanList.length > 0 && (
              <table className="data-table">
                <thead><tr><th>Tgl Lapor</th><th>Wali Kelas</th><th>Siswa</th><th>Judul</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>{renderLaporanTable()}</tbody>
              </table>
            )}
          </div>
        )}
        
      </div>

      {showDetailModal && selectedLaporan && (
        <div className="modal active" onClick={closeDetailModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={closeDetailModal}>&times;</span>
            <h3>Detail Laporan Kasus</h3>
            <div className="form-group"><label>Tanggal Lapor</label><p>{new Date(selectedLaporan.tanggal).toLocaleDateString('id-ID')}</p></div>
            <div className="form-group"><label>Wali Kelas</label><p>{selectedLaporan.walas_id?.nama_lengkap || '-'}</p></div>
            <div className="form-group"><label>Siswa</label><p>{selectedLaporan.siswa_id?.nama_lengkap || '-'}</p></div>
            <div className="form-group"><label>Judul</label><p>{selectedLaporan.judul}</p></div>
            <div className="form-group"><label>Deskripsi</label><p style={{ whiteSpace: 'pre-wrap' }}>{selectedLaporan.deskripsi}</p></div>
            <div className="form-group"><label>Status</label><p>{selectedLaporan.status}</p></div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button className="btn-submit" onClick={closeDetailModal}>Tutup</button></div>
          </div>
        </div>
      )}

      {showChatModal && chatLaporan && (
        <div className="modal active" onClick={closeChatModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={closeChatModal}>&times;</span>
            <h3>Chat dengan Wali Kelas</h3>
            <p><strong>Laporan:</strong> {chatLaporan.judul}</p>
            <p>Sisa kuota: {maxChat - currentChatCount} dari {maxChat}</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', marginBottom: '16px', background: '#f8fafc' }}>
              {chatLoading && <p>Memuat...</p>}
              {!chatLoading && chatMessages.length === 0 && <p>Belum ada pesan.</p>}
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '12px', textAlign: msg.pengirim === 'petugas' ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', background: msg.pengirim === 'petugas' ? '#10b981' : '#e2e8f0', color: msg.pengirim === 'petugas' ? 'white' : '#1e293b', padding: '8px 12px', borderRadius: '16px', maxWidth: '80%' }}>
                    <strong>{msg.pengirim === 'petugas' ? 'Petugas' : 'Wali Kelas'}</strong><br />
                    {msg.pesan}
                    <div style={{ fontSize: '10px' }}>{new Date(msg.waktu).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {currentChatCount < maxChat && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={{ flex: 1, padding: '8px', borderRadius: '40px' }} placeholder="Tulis pesan..." value={newChatMessage} onChange={e => setNewChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} />
                <button className="btn-submit" onClick={sendChatMessage}>Kirim</button>
              </div>
            )}
            {currentChatCount >= maxChat && <div className="alert alert-info">Maksimal 5 pesan tercapai.</div>}
          </div>
        </div>
      )}
    </>
  );
}