import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

const LandingPage = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: 'fa-camera', title: 'Selfie Verification', desc: 'Absen pakai foto kamera real-time. Anti-titip, anti-bohong, no drama.' },
    { icon: 'fa-file-upload', title: 'Upload Bukti', desc: 'Izin atau sakit? Upload surat keterangan langsung dari HP, langsung kelar.' },
    { icon: 'fa-chart-bar', title: 'Rekap Otomatis', desc: 'Statistik kehadiran terekap instan. Tidak perlu ngitung manual lagi.' },
    { icon: 'fa-exclamation-circle', title: 'Laporan Kasus', desc: 'Wali kelas bisa langsung eskalasi kasus ke petugas dalam satu klik.' },
    { icon: 'fa-lock', title: 'Akses Berbasis Peran', desc: 'Murid, wali kelas, petugas, dan admin punya akses panel masing-masing.' },
    { icon: 'fa-bell', title: 'Notifikasi Status', desc: 'Update status laporan dan absensi tersinkron langsung ke semua pihak.' },
  ];

  const roles = [
    { icon: 'fa-graduation-cap', role: 'Murid', color: '#11998e', desc: 'Absen mandiri setiap hari dengan foto selfie atau upload bukti.' },
    { icon: 'fa-chalkboard-teacher', role: 'Wali Kelas', color: '#3b82f6', desc: 'Pantau kehadiran siswa bimbingan & kirim laporan kasus.' },
    { icon: 'fa-user-shield', role: 'Petugas', color: '#f59e0b', desc: 'Terima & tindaklanjuti laporan, lihat database siswa.' },
    { icon: 'fa-cog', role: 'Admin', color: '#8b5cf6', desc: 'Kelola seluruh pengguna dan konfigurasi sistem sekolah.' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#ffffff', color: '#1e293b', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        padding: '0 40px',
        height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e2e8f0' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.3rem', color: scrolled ? '#11998e' : 'white' }}>
          <img src="/images/logo-navbar.png" alt="Logo" style={{ height: '44px', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          <span>AbsensiApp</span>
        </div>
        <Link to={user ? '/dashboard' : '/login'} style={{
          padding: '10px 26px',
          background: 'linear-gradient(135deg, #11998e, #38ef7d)',
          color: 'white',
          fontWeight: '700',
          textDecoration: 'none',
          borderRadius: '40px',
          fontSize: '0.95rem',
          boxShadow: '0 4px 14px rgba(17,153,142,0.35)',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <i className="fas fa-sign-in-alt" /> {user ? 'Dashboard' : 'Masuk'}
        </Link>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #064e3b 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(56,239,125,0.07)', top:'-100px', right:'-100px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(17,153,142,0.1)', bottom:'-80px', left:'-80px', pointerEvents:'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(56,239,125,0.12)', border: '1px solid rgba(56,239,125,0.3)',
          borderRadius: '40px', padding: '6px 18px', marginBottom: '28px',
          color: '#38ef7d', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em'
        }}>
          <i className="fas fa-bolt" /> Sistem Absensi Digital
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: '900', color: 'white',
          lineHeight: '1.15', letterSpacing: '-2px', marginBottom: '24px',
          maxWidth: '800px'
        }}>
          Absen Mudah,<br />
          <span style={{ background: 'linear-gradient(90deg, #11998e, #38ef7d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rekap Otomatis
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8',
          maxWidth: '580px', lineHeight: '1.7', marginBottom: '44px'
        }}>
          Sistem absensi berbasis kamera dan upload bukti. Tidak ada lagi drama titip absen atau berkas hilang — semuanya digital, real-time, dan tercatat rapi.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to={user ? '/dashboard' : '/login'} style={{
            padding: '15px 38px',
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            color: 'white', fontWeight: '700', textDecoration: 'none',
            borderRadius: '40px', fontSize: '1.05rem',
            boxShadow: '0 8px 25px rgba(56,239,125,0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fas fa-arrow-right" /> {user ? 'Buka Dashboard' : 'Mulai Sekarang'}
          </Link>
          <a href="#fitur" style={{
            padding: '15px 38px',
            background: 'transparent',
            color: 'white', fontWeight: '600', textDecoration: 'none',
            borderRadius: '40px', fontSize: '1.05rem',
            border: '2px solid rgba(255,255,255,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fas fa-search" /> Lihat Fitur
          </a>
        </div>

        {/* Hero bottom stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '64px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['📸', 'Kamera Real-time'], ['📄', 'Upload Bukti'], ['📊', 'Rekap Otomatis'], ['🔐', '4 Peran Akses']].map(([icon, label]) => (
            <div key={label} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{icon}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>

        {/* scroll arrow */}
        <div style={{ position: 'absolute', bottom: '32px', animation: 'bounce 2s infinite', color: 'rgba(255,255,255,0.4)' }}>
          <i className="fas fa-chevron-down" style={{ fontSize: '1.5rem' }} />
        </div>
        <style>{`
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
          .feature-card-react:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
          .role-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }
        `}</style>
      </section>

      {/* ─── FITUR ─── */}
      <section id="fitur" style={{ padding: '90px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ color: '#11998e', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kenapa Pilih Kami</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', color: '#0f172a', marginTop: '12px', letterSpacing: '-1px' }}>
              Semua yang Kamu Butuhkan
            </h2>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '16px auto 0', lineHeight: '1.7' }}>
              Dirancang khusus untuk lingkungan sekolah — simpel, cepat, dan bisa dipakai siapa saja.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map((f) => (
              <div key={f.title} className="feature-card-react" style={{
                padding: '32px 28px', background: 'white', borderRadius: '20px',
                border: '1px solid #e2e8f0', transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #e0fdf4, #d1fae5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px'
                }}>
                  <i className={`fas ${f.icon}`} style={{ fontSize: '1.4rem', color: '#11998e' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '10px', color: '#0f172a' }}>{f.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.65', fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section style={{ padding: '90px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ color: '#11998e', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Untuk Siapa</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', color: '#0f172a', marginTop: '12px', letterSpacing: '-1px' }}>
              4 Peran, 1 Sistem
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {roles.map((r) => (
              <div key={r.role} className="role-card" style={{
                padding: '32px 24px', borderRadius: '20px',
                border: '2px solid #f1f5f9', background: '#fafafa',
                textAlign: 'center', transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: r.color + '18', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`fas ${r.icon}`} style={{ fontSize: '1.6rem', color: r.color }} />
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '10px', color: '#0f172a' }}>{r.role}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        padding: '90px 24px',
        background: 'linear-gradient(135deg, #0f172a, #134e4a)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'rgba(56,239,125,0.05)', top:'-200px', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', color: 'white', marginBottom: '16px', letterSpacing: '-1px' }}>
            Siap Mulai?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto 40px' }}>
            Login sekarang dan rasakan kemudahan absensi digital di sekolahmu.
          </p>
          <Link to={user ? '/dashboard' : '/login'} style={{
            padding: '16px 44px',
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            color: 'white', fontWeight: '700', textDecoration: 'none',
            borderRadius: '40px', fontSize: '1.1rem',
            boxShadow: '0 8px 28px rgba(56,239,125,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fas fa-rocket" /> {user ? 'Buka Dashboard' : 'Login Sekarang'}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER / LOGO STRIP ─── */}
      <section style={{ background: '#f8fafc', padding: '48px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '36px', maxWidth: '900px', margin: '0 auto 32px' }}>
          {[1,2,3,4,5,6].map(n => (
            <img key={n} src={`/images/logo/logo${n}.png`} alt={`Logo ${n}`}
              style={{ height: '52px', objectFit: 'contain', opacity: 0.7 }}
              onError={e => e.target.style.display='none'}
            />
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} AbsensiApp — Sistem Absensi Digital Sekolah
        </p>
      </section>
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0fdf4', color: '#11998e', fontSize: '1.2rem' }}>
        Loading... 🤫
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
        />
        <Route
          path="/dashboard/*"
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
