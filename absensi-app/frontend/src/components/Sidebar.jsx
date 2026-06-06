import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user, activePanel, setActivePanel }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = {
    admin: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'account', icon: 'fa-user-circle', label: 'Account' },
      { id: 'siswa-view', icon: 'fa-users', label: 'Lihat Siswa' },
      { id: 'petugas-view', icon: 'fa-chalkboard', label: 'Lihat Petugas' },
      { id: 'walas-view', icon: 'fa-chalkboard-user', label: 'Lihat Wali Kelas' },
      { id: 'admin-view', icon: 'fa-user-shield', label: 'Lihat Admin' },
      { divider: true },
      { id: 'register-siswa', icon: 'fa-user-plus', label: 'Register Siswa' },
      { id: 'manage-siswa', icon: 'fa-edit', label: 'Manage Siswa' },
      { id: 'register-petugas', icon: 'fa-user-plus', label: 'Register Petugas' },
      { id: 'manage-petugas', icon: 'fa-edit', label: 'Manage Petugas' },
      { id: 'register-walas', icon: 'fa-user-plus', label: 'Register Wali Kelas' },
      { id: 'manage-walas', icon: 'fa-edit', label: 'Manage Wali Kelas' },
      { id: 'register-admin', icon: 'fa-user-plus', label: 'Register Admin' },
      { id: 'manage-admin', icon: 'fa-edit', label: 'Manage Admin' },
    ],
    walas: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'siswa-bimbingan', icon: 'fa-users', label: 'Siswa Bimbingan' },
      { id: 'absensi-walas', icon: 'fa-chart-line', label: 'Rekap Absensi' },
      { id: 'kirim-laporan', icon: 'fa-exclamation-triangle', label: 'Kirim Laporan Kasus' },
      { id: 'riwayat-laporan', icon: 'fa-list', label: 'Riwayat Laporan' },
      { id: 'profil-walas', icon: 'fa-id-card', label: 'Profil Saya' },
    ],
    petugas: [
      { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { divider: true },
      { id: 'absensi', icon: 'fa-check-circle', label: 'Absensi Hari Ini' },
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
    <div className={`sidebar ${isExpanded ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        {isExpanded ? (
          <>
            <img src="/images/logo/logo-navbar.png" alt="Logo" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/2838/2838912.png'} />
            <h2>AbsenCerdas</h2>
            <p>Digital Attendance</p>
          </>
        ) : (
          <div className="logo-icon-only">
            <i className="fas fa-leaf"></i>
          </div>
        )}
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
              <i className={`fas ${item.icon}`}></i>
              {isExpanded && <span>{item.label}</span>}
            </button>
          )
        ))}
      </div>
    </div>
  );
}