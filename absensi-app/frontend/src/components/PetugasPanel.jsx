import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function PetugasPanel({ activePanel }) {
  const [laporanList, setLaporanList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [absensiList, setAbsensiList] = useState([]); // FIX 1: state was missing
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

  const fetchAbsensi = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absensi/hari-ini');
      setAbsensiList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAbsensiList([]);
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

  const openDetailModal = (laporan) => { setSelectedLaporan(laporan); setShowDetailModal(true); };
  const closeDetailModal = () => { setShowDetailModal(false); setSelectedLaporan(null); };

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
    if (currentChatCount >= maxChat) { showMessage('Maksimal 5 pesan sudah tercapai'); return; }
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

  // FIX 2: 'absensi' not 'absensi-hari-ini' — match Sidebar menu id
  // FIX 3: add 'profil-petugas' trigger
  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
    if (activePanel === 'absensi') fetchAbsensi();       // was 'absensi-hari-ini' — fixed
    if (activePanel === 'profil-petugas') fetchProfil(); // was missing trigger — fixed
  }, [activePanel]);

  const statusBadge = (status) => {
    const map = {
      belum_dibaca: { cls: 'status-sakit', label: 'Belum Dibaca' },
      dibaca:       { cls: 'status-izin',  label: 'Dibaca' },
      ditindaklanjuti: { cls: 'status-hadir', label: 'Ditindaklanjuti' },
    };
    const s = map[status] || { cls: '', label: status };
    return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
  };

  const renderLaporanTable = () => {
    if (!Array.isArray(laporanList) || laporanList.length === 0) return null;
    return laporanList.map(lap => (
      <tr key={lap._id} style={{ cursor: 'pointer' }} onClick={() => openDetailModal(lap)}>
        <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
        <td>{lap.walas_id?.nama_lengkap || '-'}</td>
        <td>{lap.siswa_id?.nama_lengkap || '-'}</td>
        <td>{lap.judul}</td>
        <td>{statusBadge(lap.status)}</td>
        <td>
          <button className="btn-edit-small" onClick={(e) => { e.stopPropagation(); updateStatus(lap._id, 'dibaca'); }}>Tandai Dibaca</button>
          <button className="btn-edit-small btn-edit-small--green" onClick={(e) => { e.stopPropagation(); updateStatus(lap._id, 'ditindaklanjuti'); }}>Tindak Lanjut</button>
          <button className="btn-edit-small btn-edit-small--yellow" onClick={(e) => { e.stopPropagation(); openChatModal(lap); }}>💬 Chat</button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="panel-container">

        {/* DASHBOARD */}
        {activePanel === 'dashboard' && (
          <div className="panel active-panel">
            <div className="welcome-section">
              <h1>👋 Halo, Petugas</h1>
              <p>Kelola laporan kasus dari wali kelas dan pantau absensi siswa.</p>
            </div>
          </div>
        )}

        {/* LAPORAN */}
        {activePanel === 'laporan-petugas' && (
          <div className="panel active-panel">
            <h2><i className="fas fa-inbox"></i> Laporan Kasus dari Wali Kelas</h2>
            {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
            {loading && <div className="alert alert-info">Memuat...</div>}
            {!loading && (!Array.isArray(laporanList) || laporanList.length === 0) && (
              <div className="alert alert-info">Belum ada laporan kasus.</div>
            )}
            {!loading && Array.isArray(laporanList) && laporanList.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr><th>Tgl Lapor</th><th>Wali Kelas</th><th>Siswa</th><th>Judul</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>{renderLaporanTable()}</tbody>
              </table>
            )}
          </div>
        )}

        {/* ABSENSI — FIX 2: activePanel 'absensi' matches Sidebar id */}
        {activePanel === 'absensi' && (
          <div className="panel active-panel">
            <h2><i className="fas fa-clipboard-list"></i> Absensi Hari Ini</h2>
            {loading && <div className="alert alert-info">Memuat...</div>}
            {!loading && absensiList.length === 0 && (
              <div className="alert alert-info">Belum ada data absensi hari ini.</div>
            )}
            {!loading && absensiList.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr><th>Nama Siswa</th><th>Status</th><th>Waktu</th></tr>
                </thead>
                <tbody>
                  {absensiList.map((abs, idx) => (
                    <tr key={idx}>
                      <td>{abs.siswa_id?.nama_lengkap || '-'}</td>
                      <td>
                        <span className={`status-badge ${abs.status === 'hadir' ? 'status-hadir' : abs.status === 'sakit' ? 'status-sakit' : 'status-izin'}`}>
                          {abs.status}
                        </span>
                      </td>
                      <td>{new Date(abs.tanggal).toLocaleTimeString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SISWA VIEW */}
        {activePanel === 'siswa-view' && (
          <div className="panel active-panel">
            <h2><i className="fas fa-users"></i> Database Siswa</h2>
            {loading && <div className="alert alert-info">Memuat...</div>}
            {!loading && siswaList.length === 0 && (
              <div className="alert alert-info">Tidak ada data siswa.</div>
            )}
            {!loading && siswaList.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr><th>Nama Lengkap</th><th>NIS</th><th>Kelas</th></tr>
                </thead>
                <tbody>
                  {siswaList.map((s) => (
                    <tr key={s._id}>
                      <td>{s.nama_lengkap || '-'}</td>
                      <td>{s.nis || s.nik || '-'}</td>
                      <td>{s.kelas || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* FIX 3: Profil panel was never rendered */}
        {activePanel === 'profil-petugas' && (
          <div className="panel active-panel">
            <h2><i className="fas fa-id-card"></i> Profil Saya</h2>
            {loading && <div className="alert alert-info">Memuat...</div>}
            {!loading && profil && (
              <div className="profil-card">
                <div className="form-group"><label>Nama Lengkap</label><p>{profil.nama_lengkap || '-'}</p></div>
                <div className="form-group"><label>NIK / ID</label><p>{profil.nik || profil._id || '-'}</p></div>
                <div className="form-group"><label>Role</label><p style={{ textTransform: 'capitalize' }}>{profil.role || 'Petugas'}</p></div>
                {profil.email && <div className="form-group"><label>Email</label><p>{profil.email}</p></div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
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
            <div className="form-group"><label>Status</label>{statusBadge(selectedLaporan.status)}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn-submit" onClick={closeDetailModal}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHAT */}
      {showChatModal && chatLaporan && (
        <div className="modal active" onClick={closeChatModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={closeChatModal}>&times;</span>
            <h3>Chat dengan Wali Kelas</h3>
            <p style={{ color: 'var(--zzz-muted)', marginBottom: '4px' }}><strong style={{ color: 'var(--zzz-text)' }}>Laporan:</strong> {chatLaporan.judul}</p>
            <p style={{ fontSize: '12px', color: 'var(--zzz-muted)', marginBottom: '12px' }}>
              Sisa kuota: <span style={{ color: 'var(--zzz-yellow)' }}>{maxChat - currentChatCount}</span> dari {maxChat}
            </p>
            <div className="chat-box">
              {chatLoading && <p style={{ color: 'var(--zzz-muted)' }}>Memuat pesan...</p>}
              {!chatLoading && chatMessages.length === 0 && <p style={{ color: 'var(--zzz-muted)' }}>Belum ada pesan.</p>}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-wrap ${msg.pengirim === 'petugas' ? 'chat-self' : 'chat-other'}`}>
                  <div className={`chat-bubble ${msg.pengirim === 'petugas' ? 'chat-bubble--self' : 'chat-bubble--other'}`}>
                    <strong>{msg.pengirim === 'petugas' ? 'Petugas' : 'Wali Kelas'}</strong>
                    <div>{msg.pesan}</div>
                    <div className="chat-time">{new Date(msg.waktu).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
            {currentChatCount < maxChat ? (
              <div className="chat-input-row">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Tulis pesan..."
                  value={newChatMessage}
                  onChange={e => setNewChatMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                />
                <button className="btn-submit" onClick={sendChatMessage}>Kirim</button>
              </div>
            ) : (
              <div className="alert alert-info">Maksimal 5 pesan tercapai.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
