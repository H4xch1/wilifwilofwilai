import { useState, useEffect } from 'react';

export default function Sidebar({ user, activePanel, setActivePanel }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(false);
      else setIsExpanded(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const getMenuItems = () => {
    const role = user.role;
    if (role === 'admin') {
      return [
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
      ];
    } else if (role === 'walas') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { divider: true },
        { id: 'siswa-bimbingan', icon: 'fa-users', label: 'Siswa Bimbingan' },
        { id: 'kirim-laporan', icon: 'fa-exclamation-triangle', label: 'Kirim Laporan Kasus' },
        { id: 'riwayat-laporan', icon: 'fa-list', label: 'Riwayat Laporan' },
        { id: 'profil-walas', icon: 'fa-id-card', label: 'Profil Saya' },
      ];
    } else if (role === 'petugas') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { divider: true },
        { id: 'laporan-petugas', icon: 'fa-inbox', label: 'Laporan Kasus dari Walas' },
        { id: 'siswa-view', icon: 'fa-users', label: 'Lihat Database Siswa' },
      ];
    } else if (role === 'murid') {
      return [
        { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { divider: true },
        { id: 'absen-form', icon: 'fa-camera', label: 'Form Absensi' },
        { id: 'riwayat-absen', icon: 'fa-history', label: 'Riwayat Absensi' },
        { id: 'profil', icon: 'fa-id-card', label: 'Profil Saya' },
      ];
    }
    return [];
  };

  const items = getMenuItems();
  const sidebarClass = `sidebar ${!isExpanded ? 'collapsed' : ''}`;

  const handleMenuClick = (id) => {
    if (typeof setActivePanel === 'function') {
      setActivePanel(id);
    } else {
      console.error('setActivePanel is not a function', setActivePanel);
    }
  };

  // Desktop only
  if (isMobile) return null;

  return (
    <>
      <div className={sidebarClass}>
        <div className="sidebar-header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>

          <img
            src="/images/logo/logo-navbar.png"
            alt="Logo"
            className="sidebar-logo"
            onError={(e) => (e.target.src = 'https://cdn-icons-png.flaticon.com/512/2838/2838912.png')}
          />
          {isExpanded && (
            <>
              <h2>AbsenCerdas</h2>
              <p>Digital Attendance</p>
            </>
          )}
        </div>

        <div className="sidebar-menu">
          {items.map((item, idx) =>
            item.divider ? (
              <div key={idx} className="menu-divider"></div>
            ) : (
              <button
                key={item.id}
                className={`menu-item ${activePanel === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <i className={`fas ${item.icon}`}></i>
                {isExpanded && <span>{item.label}</span>}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}
