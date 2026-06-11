import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

const features = [
  { icon: 'fa-camera',             title: 'Foto Selfie',      desc: 'Absen dengan verifikasi kamera langsung, anti-titip absen.' },
  { icon: 'fa-file-pdf',           title: 'Upload Bukti',     desc: 'Sakit atau izin? Upload surat keterangan langsung di sini.' },
  { icon: 'fa-chart-line',         title: 'Rekap Otomatis',   desc: 'Statistik kehadiran terekap real-time, no manual input.' },
  { icon: 'fa-exclamation-triangle', title: 'Laporan Kasus',  desc: 'Wali kelas kirim laporan penanganan kasus langsung ke petugas.' },
];

const LandingPage = ({ user }) => {
  return (
    <div className="landing">

      {/* HERO */}
      <section className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-brand">
            <img src="/images/logo-navbar.png" alt="Logo" className="landing-brand-img" />
            <span>Absensi</span>
          </div>
        </nav>

        <div className="landing-hero-body">
          <div className="landing-badge">Digital Attendance System</div>
          <h1 className="landing-title">
            Sistem Absensi<br />
            <span className="landing-title-accent">Murid Modern</span>
          </h1>
          <p className="landing-subtitle">
            Gak ada lagi drama titip absen atau kertas ilang. Absen pake foto kamera
            langsung dari HP/Laptop, rekap otomatis — riil no fek!
          </p>
          <Link
            to={user ? '/dashboard' : '/login'}
            className="landing-cta"
          >
            <i className="fas fa-sign-in-alt"></i>
            {user ? 'Ke Dashboard' : 'Masuk Sekarang'}
          </Link>
        </div>

        {/* scan line decoration */}
        <div className="hero-scan-line"></div>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Fitur Utama</span>
          <h2 className="landing-section-title">
            <i className="fas fa-star" style={{ color: 'var(--zzz-yellow)' }}></i> Kenapa AbsenCerdas?
          </h2>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-wrap">
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOGOS */}
      <footer className="landing-footer">
        <div className="landing-logos">
          {[1,2,3,4,5,6].map(n => (
            <img key={n} src={`/images/logo/logo${n}.png`} alt={`Logo ${n}`} className="landing-logo-img" />
          ))}
        </div>
        <p className="landing-footer-copy">© {new Date().getFullYear()} AbsenCerdas · Dibuat dengan ❤️</p>
      </footer>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <i className="fas fa-circle-notch fa-spin"></i>
        <span>Nungguin session kelar load ya bray... 🤫</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/dashboard/*" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
