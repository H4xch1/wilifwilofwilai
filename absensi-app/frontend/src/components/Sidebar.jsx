import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user, activePanel, setActivePanel }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = {
    admin: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'siswa-view', icon: 'fa-users', label: 'Lihat Siswa' },
      { id: 'petugas-view', icon: 'fa-chalkboard', label: 'Lihat Petugas' },
      { id: 'walas-view', icon: 'fa-chalkboard-user', label: 'Lihat Walas' },
      { id: 'admin-view', icon: 'fa-user-shield', label: 'Lihat Admin' },
      { divider: true },
      { id: 'register-siswa', icon: 'fa-user-plus', label: 'Register Siswa' },
      { id: 'manage-siswa', icon: 'fa-edit', label: 'Manage Siswa' },
      { id: 'register-petugas', icon: 'fa-user-plus', label: 'Register Petugas' },
      { id: 'manage-petugas', icon: 'fa-edit', label: 'Manage Petugas' },
      { id: 'register-walas', icon: 'fa-user-plus', label: 'Register Walas' },
      { id: 'manage-walas', icon: 'fa-edit', label: 'Manage Walas' },
      { id: 'register-admin', icon: 'fa-user-plus', label: 'Register Admin' },
      { id: 'manage-admin', icon: 'fa-edit', label: 'Manage Admin' },
    ],
    walas: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'siswa-bimbingan', icon: 'fa-users', label: 'Siswa Bimbingan' },
      { id: 'kirim-laporan', icon: 'fa-exclamation-triangle', label: 'Kirim Laporan Kasus' },
      { id: 'riwayat-laporan', icon: 'fa-list', label: 'Riwayat Laporan' },
      { id: 'profil-walas', icon: 'fa-id-card', label: 'Profil Saya' },
    ],
    petugas: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'laporan-petugas', icon: 'fa-inbox', label: 'Laporan Kasus dari Walas' },
      { id: 'siswa-view', icon: 'fa-users', label: 'Lihat Database Siswa' },
    ],
    murid: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'absen-form', icon: 'fa-camera', label: 'Form Absensi' },
      { id: 'riwayat-absen', icon: 'fa-history', label: 'Riwayat Absensi' },
      { id: 'profil', icon: 'fa-id-card', label: 'Profil Saya' },
    ]
  };

  const items = menuItems[user.role] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><i className="fas fa-chalkboard-user"></i> AbsenCerdas</h2>
        <p>Digital Attendance</p>
      </div>
      <div className="sidebar-menu">
        {items.map((item, idx) => (
          item.divider ? (
            <div key={idx} className="menu-divider"></div>
          ) : (
            <button
              key={item.id}
              className={`menu-item ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => setActivePanel(item.id)}
            >
              <i className={`fas ${item.icon}`}></i> {item.label}
            </button>
          )
        ))}
      </div>
    </div>
  );
}