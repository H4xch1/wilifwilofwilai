import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminPanel from './AdminPanel';
import WalasPanel from './WalasPanel';
import PetugasPanel from './PetugasPanel';
import MuridPanel from './MuridPanel';

export default function Dashboard({ user, setUser }) {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPanel = () => {
    switch (user.role) {
      case 'admin':
        return <AdminPanel activePanel={activePanel} />;
      case 'walas':
        return <WalasPanel activePanel={activePanel} />;
      case 'petugas':
        return <PetugasPanel activePanel={activePanel} />;
      case 'murid':
        return <MuridPanel activePanel={activePanel} />;
      default:
        return <div>Role tidak dikenal</div>;
    }
  };

  const panelTitles = {
    dashboard: 'Dashboard',
    account: 'Account',
    'siswa-view': 'Data Siswa',
    'petugas-view': 'Data Petugas',
    'walas-view': 'Data Walas',
    'admin-view': 'Data Admin',
    'register-siswa': 'Register Siswa',
    'manage-siswa': 'Manage Siswa',
    'register-petugas': 'Register Petugas',
    'manage-petugas': 'Manage Petugas',
    'register-walas': 'Register Walas',
    'manage-walas': 'Manage Walas',
    'register-admin': 'Register Admin',
    'manage-admin': 'Manage Admin',
    'absen-form': 'Form Absensi',
    'riwayat-absen': 'Riwayat Absensi',
    'profil': 'Profil Saya',
    'siswa-bimbingan': 'Siswa Bimbingan',
    'kirim-laporan': 'Kirim Laporan Kasus',
    'riwayat-laporan': 'Riwayat Laporan',
    'profil-walas': 'Profil Saya',
    'laporan-petugas': 'Laporan Kasus',
  };

  const getBottomNavItems = () => {
    const role = user.role;
    if (role === 'admin') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { id: 'siswa-view', icon: 'fa-users', label: 'Siswa' },
        { id: 'register-siswa', icon: 'fa-user-plus', label: 'Register' },
        { id: 'account', icon: 'fa-user-circle', label: 'Akun' },
      ];
    } else if (role === 'walas') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { id: 'siswa-bimbingan', icon: 'fa-users', label: 'Siswa' },
        { id: 'kirim-laporan', icon: 'fa-exclamation-triangle', label: 'Laporan' },
        { id: 'profil-walas', icon: 'fa-id-card', label: 'Profil' },
      ];
    } else if (role === 'petugas') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { id: 'laporan-petugas', icon: 'fa-inbox', label: 'Laporan' },
        { id: 'siswa-view', icon: 'fa-users', label: 'Siswa' },
      ];
    } else if (role === 'murid') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { id: 'absen-form', icon: 'fa-camera', label: 'Absensi' },
        { id: 'riwayat-absen', icon: 'fa-history', label: 'Riwayat' },
        { id: 'profil', icon: 'fa-id-card', label: 'Profil' },
      ];
    }
    return [];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div>
      {!isMobile && <Sidebar user={user} activePanel={activePanel} setActivePanel={setActivePanel} />}
      
      <div className="main-content">
        <div className="top-bar">
          <div className="page-title">{panelTitles[activePanel] || 'Dashboard'}</div>
          <div className="user-info">
            <span><i className="fas fa-user-astronaut"></i> {user.nama}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> {isMobile ? 'Keluar' : 'Logout'}
            </button>
          </div>
        </div>
        <div className="content-area">
          {renderPanel()}
        </div>
      </div>

      {isMobile && (
        <div className="bottom-nav">
          <div className="bottom-nav-items">
            {getBottomNavItems().map((item) => (
              <button
                key={item.id}
                className={`bottom-nav-item ${activePanel === item.id ? 'active' : ''}`}
                onClick={() => setActivePanel(item.id)}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
