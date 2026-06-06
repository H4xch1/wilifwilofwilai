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
  const [absensiList, setAbsensiList] = useState([]);
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

  // --- FETCH FUNCTIONS ---
  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan/petugas');
      setLaporanList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setLaporanList([]); }
    setLoading(false);
  };

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/murid');
      setSiswaList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setSiswaList([]); }
    setLoading(false);
  };

  const fetchAbsensiHariIni = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absensi/hari-ini');
      setAbsensiList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setAbsensiList([]); }
    setLoading(false);
  };

  const fetchProfil = async () => {
    try {
      const res = await api.get('/users/profile/me');
      setProfil(res.data || {});
    } catch (err) {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      setProfil({ nama_lengkap: user.nama || 'Petugas', nik: user.nik || '-', role: 'petugas' });
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
    if (activePanel === 'absensi-hari-ini') fetchAbsensiHariIni();
    if (activePanel === 'profil-petugas') fetchProfil();
  }, [activePanel]);

  // --- HANDLERS ---
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laporan/${id}/status`, { status });
      showMessage('Status diperbarui');
      fetchLaporan();
    } catch (err) { showMessage('Gagal update status'); }
  };

  const openChatModal = async (laporan) => {
    setChatLaporan(laporan);
    setShowChatModal(true);
    setChatLoading(true);
    try {
      const res = await api.get(`/laporan/${laporan._id}/chat`);
      setChatMessages(res.data?.chats || []);
      setMaxChat(res.data?.maxChat ?? 5);
      setCurrentChatCount(res.data?.currentCount ?? (res.data?.chats?.length || 0));
    } catch (err) { setChatMessages([]); }
    setChatLoading(false);
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    try {
      const res = await api.post(`/laporan/${chatLaporan._id}/chat`, { pesan: newChatMessage });
      setChatMessages(res.data?.chats || []);
      setCurrentChatCount(res.data?.chats?.length || 0);
      setNewChatMessage('');
    } catch (err) { showMessage('Gagal kirim'); }
  };

  return (
    <div className="panel-container">
      {/* 1. DASHBOARD */}
      {activePanel === 'dashboard' && (
        <div className="panel active-panel"><h1>👋 Halo, Petugas</h1></div>
      )}

      {/* 2. LAPORAN KASUS */}
      {activePanel === 'laporan-petugas' && (
        <div className="panel active-panel">
          <h2>Laporan Kasus</h2>
          {statusMessage && <div className="alert">{statusMessage}</div>}
          <table className="data-table">
            <thead><tr><th>Wali Kelas</th><th>Siswa</th><th>Judul</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {laporanList.map(lap => (
                <tr key={lap._id}>
                  <td>{lap.walas_id?.nama_lengkap}</td>
                  <td>{lap.siswa_id?.nama_lengkap}</td>
                  <td>{lap.judul}</td>
                  <td>{lap.status}</td>
                  <td>
                    <button onClick={() => updateStatus(lap._id, 'dibaca')}>Baca</button>
                    <button onClick={() => openChatModal(lap)}>💬 Chat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. DATA SISWA */}
      {activePanel === 'siswa-view' && (
        <div className="panel active-panel">
          <h2>Data Siswa</h2>
          <table className="data-table">
            <thead><tr><th>Nama</th><th>NIS</th><th>Kelas</th></tr></thead>
            <tbody>
              {siswaList.map(s => <tr key={s._id}><td>{s.nama_lengkap}</td><td>{s.nis}</td><td>{s.kelas}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. ABSENSI HARI INI */}
      {activePanel === 'absensi-hari-ini' && (
        <div className="panel active-panel">
          <h2>Absensi Hari Ini</h2>
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Status</th><th>Waktu</th></tr></thead>
            <tbody>
              {absensiList.map(a => <tr key={a._id}><td>{a.siswa_id?.nama_lengkap}</td><td>{a.status}</td><td>{new Date(a.tanggal).toLocaleTimeString()}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CHAT */}
      {showChatModal && (
        <div className="modal active" onClick={() => setShowChatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Chat Laporan</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {chatMessages.map((msg, i) => <div key={i}>{msg.pesan}</div>)}
            </div>
            <input value={newChatMessage} onChange={e => setNewChatMessage(e.target.value)} />
            <button onClick={sendChatMessage}>Kirim</button>
          </div>
        </div>
      )}
    </div>
  );
}