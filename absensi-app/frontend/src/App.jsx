import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

const LandingPage = ({ user }) => {
    return (
        <div style={{ 
            fontFamily: "'Inter', sans-serif", 
            background: '#ffffff', 
            color: '#334155',
            minHeight: '100vh'
        }}>
            {/* HERO SECTION */}
            <div style={{
                minHeight: '85vh',
                // Gunakan gambar lokal (simpan di public/images/bg-school.jpg)
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/images/bg-school.jpg")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 20px',
                position: 'relative'
            }}>
                {/* Fallback jika gambar tidak ada: tampilkan gradient */}
                <style>{`
                    .hero-fallback {
                        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    }
                `}</style>
                {/* Navbar */}
                <div style={{ position: 'absolute', top: 0, width: '100%', padding: '25px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38ef7d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-leaf"></i> AbsenHijau
                    </div>
                </div>

                <h1 style={{ fontSize: '3.8rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1.5px', lineHeight: '1.2' }}>
                    Sistem Absensi Murid
                </h1>
                <p style={{ fontSize: '1.3rem', maxWidth: '650px', marginBottom: '40px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    Gak ada lagi drama titip absen atau kertas ilang. Absen set-set-wet pake fitur foto kamera langsung dari HP/Laptop lu dan rekap otomatis, riil no fek!
                </p>

                <Link to={user ? "/dashboard" : "/login"} style={{
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    fontWeight: '700',
                    textDecoration: 'none',
                    borderRadius: '40px',
                    fontSize: '1.2rem',
                    boxShadow: '0 5px 20px rgba(56, 239, 125, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <i className="fas fa-sign-in-alt"></i> {user ? "Ke Dashboard" : "Masuk Sekarang"}
                </Link>
            </div>

            {/* FEATURES SECTION - tidak berubah */}
            <div style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#11998e', marginBottom: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> Fitur Utama
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                    <div className="feature-card-react" style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                        <i className="fas fa-camera" style={{ fontSize: '2.5rem', color: '#11998e', marginBottom: '15px' }}></i>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>Foto Selfie</h3>
                        <p style={{ color: '#64748b' }}>Absen dengan verifikasi kamera langsung biar anti-cheat.</p>
                    </div>
                    <div className="feature-card-react" style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                        <i className="fas fa-file-pdf" style={{ fontSize: '2.5rem', color: '#11998e', marginBottom: '15px' }}></i>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>Upload Bukti</h3>
                        <p style={{ color: '#64748b' }}>Sakit atau izin tinggal upload surat keterangan fisik di sini.</p>
                    </div>
                    <div className="feature-card-react" style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                        <i className="fas fa-chart-line" style={{ fontSize: '2.5rem', color: '#11998e', marginBottom: '15px' }}></i>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>Rekap Otomatis</h3>
                        <p style={{ color: '#64748b' }}>Statistik kehadiran langsung terekap otomatis tanpa nunggu rekap manual.</p>
                    </div>
                    <div className="feature-card-react" style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '2.5rem', color: '#11998e', marginBottom: '15px' }}></i>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>Laporan Kasus</h3>
                        <p style={{ color: '#64748b' }}>Wali kelas bisa langsung kirim laporan penanganan kasus ke petugas.</p>
                    </div>
                </div>
            </div>

            {/* LOGOS SECTION */}
            <div style={{ background: '#fcfeff', padding: '60px 40px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                    <img src="/images/logo/logo1.png" alt="Logo 1" style={{ height: '60px', objectFit: 'contain' }} />
                    <img src="/images/logo/logo2.png" alt="Logo 2" style={{ height: '60px', objectFit: 'contain' }} />
                    <img src="/images/logo/logo3.png" alt="Logo 3" style={{ height: '60px', objectFit: 'contain' }} />
                    <img src="/images/logo/logo4.png" alt="Logo 4" style={{ height: '60px', objectFit: 'contain' }} />
                    <img src="/images/logo/logo5.png" alt="Logo 4" style={{ height: '60px', objectFit: 'contain' }} />
                    <img src="/images/logo/logo6.png" alt="Logo 6" style={{ height: '60px', objectFit: 'contain' }} />
                </div>
            </div>
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
        Nungguin session kelar load ya bray... 🤫
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