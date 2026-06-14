import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminPanel({ activePanel }) {
  const [stats, setStats] = useState({ siswa: 0, petugas: 0, walas: 0, admin: 0 });
  const [chartData, setChartData] = useState({ labels: ['Hadir', 'Sakit', 'Izin'], data: [0, 0, 0] });
  const [users, setUsers] = useState([]);
  const [walasList, setWalasList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');
  const [jamBaru, setJamBaru] = useState('07:30');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const messageTimeout = useRef(null);

  const kelasList = ['X PPLG 1', 'X PPLG 2', 'XI PPLG 1', 'XI PPLG 2', 'XII PPLG 1', 'XII PPLG 2', 'X DKV 1', 'X DKV 2', 'XI DKV 1', 'XI DKV 2', 'XII DKV 1', 'XII DKV 2', 'X PEMASARAN 1', 'X PEMASARAN 2', 'XI PEMASARAN 1', 'XI PEMASARAN 2', 'XII PEMASARAN 1', 'XII PEMASARAN 2', 'X MPLB 1', 'X MPLB 2', 'XI MPLB 1', 'XI MPLB 2', 'XII MPLB 1', 'XII MPLB 2'];

  useEffect(() => {
    setMessage('');
  }, [activePanel]);

  const showMessage = (msg) => {
    setMessage(msg);
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(''), 3000);
  };

  const fetchStats = async () => {
    try {
      const [siswa, petugas, walas, admin] = await Promise.all([
        api.get('/users/murid'),
        api.get('/users/petugas'),
        api.get('/users/walas'),
        api.get('/users/admin')
      ]);
      setStats({
        siswa: Array.isArray(siswa.data) ? siswa.data.length : 0,
        petugas: Array.isArray(petugas.data) ? petugas.data.length : 0,
        walas: Array.isArray(walas.data) ? walas.data.length : 0,
        admin: Array.isArray(admin.data) ? admin.data.length : 0
      });
    } catch (err) { console.error(err); }
  };

  const fetchChartData = async () => {
    try {
      const res = await api.get('/absensi/statistik/bulan-ini');
      if (res.data && res.data.labels && res.data.data) setChartData(res.data);
    } catch (err) { console.error(err); }
  };

  const updateJamAbsen = async () => {
    try {
      await api.post('/settings/jam-absen', { jam: jamBaru });
      alert('Jam batas absen berhasil diupdate ke ' + jamBaru);
    } catch (err) {
      alert('Gagal update jam: ' + err.message);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const res = await api.get(`/users/${role}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setUsers([]); }
  };

  const fetchWalas = async () => {
    try {
      const res = await api.get('/users/list/walas');
      setWalasList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setWalasList([]); }
  };

  useEffect(() => {
    if (activePanel === 'dashboard') { fetchStats(); fetchChartData(); }
    if (activePanel.includes('view') || activePanel.includes('manage')) {
      let role = '';
      if (activePanel === 'siswa-view' || activePanel === 'manage-siswa') role = 'murid';
      else if (activePanel === 'petugas-view' || activePanel === 'manage-petugas') role = 'petugas';
      else if (activePanel === 'walas-view' || activePanel === 'manage-walas') role = 'walas';
      else if (activePanel === 'admin-view' || activePanel === 'manage-admin') role = 'admin';
      if (role) fetchUsers(role);
    }
    if (activePanel.includes('register')) fetchWalas();
    if (activePanel === 'manage-siswa') {
      fetchWalas();
    }
  }, [activePanel]);

  useEffect(() => {
    if (activePanel === 'dashboard' && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Kehadiran',
            data: chartData.data,
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
            borderRadius: 12,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#e2e8f0' }, title: { display: false } },
            x: { grid: { display: false }, title: { display: false } }
          }
        }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [chartData, activePanel]);

  const handleRegister = async (e, role) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nama: formData.get('nama'),
      nik: formData.get('nik'),
      nis: formData.get('nis') || null,
      tanggal_lahir: formData.get('tanggal_lahir') || null,
      password: formData.get('password'),
      role: role,
      wali_kelas_id: formData.get('wali_kelas_id') || null,
      kelas: formData.get('kelas') || null,
      kelas_wali: formData.get('kelas_wali') || null
    };
    try {
      const res = await api.post('/auth/register', data);
      showMessage(res.data.message || 'Pendaftaran sukses!');
      e.target.reset();
      if (activePanel.includes('register')) fetchWalas();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Gagal mendaftarkan');
    }
  };

  const handleDelete = async (id, role) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(role);
      showMessage('Data berhasil dihapus');
    } catch (err) { showMessage('Gagal menghapus'); }
  };

  const openEdit = (user) => {
    setEditData(user);
    setEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nama: formData.get('nama_edit'),
      nik: formData.get('nik_edit'),
      nis: formData.get('nis_edit') || null,
      tanggal_lahir: formData.get('tanggal_lahir_edit') || null,
      kelas: formData.get('kelas_edit') || null,
    };
    const password = formData.get('password_edit');
    if (password && password.trim() !== '') data.password = password;

    if (activePanel === 'manage-siswa') {
      data.wali_kelas_id = formData.get('wali_kelas_id_edit') || null;
    }
    if (activePanel === 'manage-walas') {
      data.kelas_wali = formData.get('kelas_wali_edit') || null;
    }

    try {
      await api.put(`/users/${editData._id}`, data);
      showMessage('Data berhasil diupdate!');
      setEditModalOpen(false);
      const roles = { 'manage-siswa': 'murid', 'manage-petugas': 'petugas', 'manage-walas': 'walas', 'manage-admin': 'admin' };
      fetchUsers(roles[activePanel] || 'murid');
    } catch (err) {
      console.error('Edit error:', err);
      showMessage(err.response?.data?.message || 'Gagal update');
    }
  };

  const renderViewPanel = (title, role) => {
    const safeUsers = Array.isArray(users) ? users : [];
    return (
      <div className="panel active-panel">
        <h2>{title}</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {safeUsers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nama</th><th>NIK</th>
                {role === 'murid' && <th>NIS</th>}
                {role === 'murid' && <th>Kelas</th>}
                {role === 'walas' && <th>Kelas Bimbingan</th>}
                <th>Tgl Lahir</th>
              </tr>
            </thead>
            <tbody>
              {safeUsers.map(u => (
                <tr key={u._id}>
                  <td>{u._id}</td>
                  <td>{u.nama_lengkap}</td>
                  <td>{u.nik}</td>
                  {role === 'murid' && <td>{u.nis || '-'}</td>}
                  {role === 'murid' && <td>{u.kelas || '-'}</td>}
                  {role === 'walas' && <td>{u.kelas_wali || '-'}</td>}
                  <td>{u.tanggal_lahir ? new Date(u.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="alert alert-info">Belum ada data.</div>}
      </div>
    );
  };

  const renderManagePanel = (title, role) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const getWaliName = (waliId) => {
      if (!waliId) return '-';
      const wali = walasList.find(w => w._id === waliId);
      return wali ? wali.nama_lengkap : waliId;
    };
    return (
      <div className="panel active-panel">
        <h2>{title}</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {safeUsers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nama</th><th>NIK</th>
                {role === 'murid' && <th>Kelas</th>}
                {role === 'murid' && <th>Wali Kelas</th>}
                {role === 'walas' && <th>Kelas Bimbingan</th>}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {safeUsers.map(u => (
                <tr key={u._id}>
                  <td>{u._id}</td>
                  <td>{u.nama_lengkap}</td>
                  <td>{u.nik}</td>
                  {role === 'murid' && <td>{u.kelas || '-'}</td>}
                  {role === 'murid' && (
                    <td>{getWaliName(u.wali_kelas_id)}</td>
                  )}
                  {role === 'walas' && <td>{u.kelas_wali || '-'}</td>}
                  <td>
                    <button className="btn-edit-small" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(u._id, role)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="alert alert-info">Belum ada data.</div>}
      </div>
    );
  };

  const renderRegisterPanel = (title, role) => (
    <div className="panel active-panel">
      <h2>{title}</h2>
      {message && <div className="alert alert-success">{message}</div>}
      <form onSubmit={(e) => handleRegister(e, role)}>
        <div className="form-group"><label>Nama Lengkap</label><input type="text" name="nama" required /></div>
        <div className="form-group"><label>NIK</label><input type="text" name="nik" required /></div>
        {role === 'murid' && (
          <>
            <div className="form-group"><label>NIS</label><input type="text" name="nis" /></div>
            <div className="form-group">
              <label>Kelas</label>
              <select name="kelas">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" /></div>
            <div className="form-group">
              <label>Wali Kelas</label>
              <select name="wali_kelas_id">
                <option value="">-- Tidak punya --</option>
                {walasList.map(w => <option key={w._id} value={w._id}>{w.nama_lengkap}</option>)}
              </select>
            </div>
          </>
        )}
        {role === 'walas' && (
          <div className="form-group">
            <label>Kelas Bimbingan</label>
            <select name="kelas_wali">
              <option value="">-- Pilih Kelas Bimbingan --</option>
              {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        )}
        <div className="form-group"><label>Password</label><input type="password" name="password" required /></div>
        <button type="submit" className="btn-submit">Daftar</button>
      </form>
    </div>
  );

  let panelContent = null;
  if (activePanel === 'dashboard') {
    panelContent = (
      <div className="panel active-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="welcome-section" style={{ borderRadius: '32px 32px 0 0', marginBottom: 0 }}>
          <h1>👋 Halo, {JSON.parse(localStorage.getItem('user'))?.nama_lengkap || JSON.parse(localStorage.getItem('user'))?.nama}</h1>
          <p>Kelola semua data sekolah.</p>
        </div>
        <div className="stats-grid" style={{ padding: '28px 28px 0 28px' }}>
          <div className="stat-card"><div><h3>Siswa</h3><div className="number">{stats.siswa}</div></div><i className="fas fa-user-graduate stat-icon"></i></div>
          <div className="stat-card"><div><h3>Petugas</h3><div className="number">{stats.petugas}</div></div><i className="fas fa-chalkboard stat-icon"></i></div>
          <div className="stat-card"><div><h3>Wali Kelas</h3><div className="number">{stats.walas}</div></div><i className="fas fa-chalkboard-user stat-icon"></i></div>
          <div className="stat-card"><div><h3>Admin</h3><div className="number">{stats.admin}</div></div><i className="fas fa-user-shield stat-icon"></i></div>
        </div>
        <div style={{ padding: '0 28px' }}>
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#000000ff' }}>
            <h3>Pengaturan Jam Absen</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="time" 
                value={jamBaru} 
                onChange={(e) => setJamBaru(e.target.value)}
                style={{ padding: '8px' }}
              />
              <button 
                onClick={updateJamAbsen}
                style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Simpan Jam Batas
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              *Admin bisa atur jam batas absensi di sini. Murid nggak bakal bisa absen lewat dari jam ini.
            </p>
          </div>
        </div>
        <div style={{ padding: '0 28px 24px 28px' }}>
          <div className="stat-card" style={{ padding: '0', border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}>
            <canvas ref={chartRef} style={{ width: '100%', height: '200px' }}></canvas>
          </div>
        </div>
      </div>
    );
  } else if (activePanel === 'account') {
    panelContent = <div className="panel active-panel"><h2>Account</h2><p>Informasi akun admin akan ditampilkan di sini.</p></div>;
  } else if (activePanel === 'siswa-view') panelContent = renderViewPanel('Data Siswa', 'murid');
  else if (activePanel === 'petugas-view') panelContent = renderViewPanel('Data Petugas', 'petugas');
  else if (activePanel === 'walas-view') panelContent = renderViewPanel('Data Wali Kelas', 'walas');
  else if (activePanel === 'admin-view') panelContent = renderViewPanel('Data Admin', 'admin');
  else if (activePanel === 'manage-siswa') panelContent = renderManagePanel('Manage Siswa', 'murid');
  else if (activePanel === 'manage-petugas') panelContent = renderManagePanel('Manage Petugas', 'petugas');
  else if (activePanel === 'manage-walas') panelContent = renderManagePanel('Manage Wali Kelas', 'walas');
  else if (activePanel === 'manage-admin') panelContent = renderManagePanel('Manage Admin', 'admin');
  else if (activePanel === 'register-siswa') panelContent = renderRegisterPanel('Register Siswa', 'murid');
  else if (activePanel === 'register-petugas') panelContent = renderRegisterPanel('Register Petugas', 'petugas');
  else if (activePanel === 'register-walas') panelContent = renderRegisterPanel('Register Wali Kelas', 'walas');
  else if (activePanel === 'register-admin') panelContent = renderRegisterPanel('Register Admin', 'admin');
  else panelContent = <div className="panel active-panel"><p>Panel tidak ditemukan: {activePanel}</p></div>;

  return (
    <>
      {panelContent}
      {editModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setEditModalOpen(false)}>&times;</span>
            <h3>Edit Data</h3>
            <form onSubmit={handleEdit}>
              <input type="hidden" name="id_edit" value={editData._id} />
              <div className="form-group"><label>Nama</label><input type="text" name="nama_edit" defaultValue={editData.nama_lengkap} required /></div>
              <div className="form-group"><label>NIK</label><input type="text" name="nik_edit" defaultValue={editData.nik} required /></div>
              <div className="form-group"><label>NIS</label><input type="text" name="nis_edit" defaultValue={editData.nis || ''} /></div>
              <div className="form-group"><label>Tgl Lahir</label><input type="date" name="tanggal_lahir_edit" defaultValue={editData.tanggal_lahir ? editData.tanggal_lahir.split('T')[0] : ''} /></div>

              {activePanel === 'manage-siswa' && (
                <>
                  <div className="form-group">
                    <label>Kelas</label>
                    <select name="kelas_edit" defaultValue={editData.kelas || ''}>
                      <option value="">-- Pilih Kelas --</option>
                      {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Wali Kelas</label>
                    <select name="wali_kelas_id_edit" defaultValue={editData.wali_kelas_id || ''}>
                      <option value="">-- Tidak punya --</option>
                      {walasList.map(w => <option key={w._id} value={w._id}>{w.nama_lengkap}</option>)}
                    </select>
                  </div>
                </>
              )}
              {activePanel === 'manage-walas' && (
                <div className="form-group">
                  <label>Kelas Bimbingan</label>
                  <select name="kelas_wali_edit" defaultValue={editData.kelas_wali || ''}>
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group"><label>Password (kosongkan jika tidak diubah)</label><input type="password" name="password_edit" /></div>
              <button type="submit" className="btn-submit">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}