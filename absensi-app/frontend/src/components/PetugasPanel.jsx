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

  const showMessage = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

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

  const openChatModal = async (laporan) => {
    setChatLaporan(laporan);
    setShowChatModal(true);
    setChatLoading(true);
    try {
      const res = await api.get(`/laporan/${laporan._id}/chat`);
      setChatMessages(res.data.chats || []);
      setMaxChat(res.data.maxChat || 5);
      setCurrentChatCount(res.data.currentCount || 0);
    } catch (err) { setChatMessages([]); }
    setChatLoading(false);
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    try {
      await api.post(`/laporan/${chatLaporan._id}/chat`, { pesan: newChatMessage });
      setNewChatMessage('');
      await openChatModal(chatLaporan);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Gagal kirim');
    }
  };

  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
    if (activePanel === 'absensi-hari-ini') fetchAbsensiHariIni();
  }, [activePanel]);

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
             <table className="data-table">
                <thead><tr><th>Siswa</th><th>Judul</th><th>Aksi</th></tr></thead>
                <tbody>
                  {laporanList.map(lap => (
                    <tr key={lap._id}>
                      <td>{lap.siswa_id?.nama_lengkap}</td>
                      <td>{lap.judul}</td>
                      <td><button onClick={() => openChatModal(lap)}>💬 Chat</button></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {activePanel === 'absensi-hari-ini' && (
          <div className="panel active-panel">
            <h2>Absensi Hari Ini</h2>
            {loading ? <p>Memuat...</p> : (
              <table className="data-table">
                <thead><tr><th>Nama</th><th>Status</th></tr></thead>
                <tbody>
                  {absensiList.map(a => <tr key={a._id}><td>{a.siswa_id?.nama_lengkap}</td><td>{a.status}</td></tr>)}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showChatModal && chatLaporan && (
        <div className="modal active" style={{ zIndex: 9999 }}>
            <div className="modal-content">
                <span className="close-modal" onClick={() => setShowChatModal(false)}>&times;</span>
                <h3>Chat</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {chatMessages.map((m, i) => <p key={i}><strong>{m.pengirim}:</strong> {m.pesan}</p>)}
                </div>
                <input value={newChatMessage} onChange={e => setNewChatMessage(e.target.value)} />
                <button onClick={sendChatMessage}>Kirim</button>
            </div>
        </div>
      )}
    </>
  );
}