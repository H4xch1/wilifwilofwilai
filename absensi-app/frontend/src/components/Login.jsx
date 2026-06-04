import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login({ setUser }) {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/login`, { nik, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  const toggleVideoSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Video Background dengan suara (awal mute) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        playsInline
        muted
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        <source src="/videos/background.webm" type="video/webm" />
        Browser Anda tidak mendukung video tag.
      </video>

      {/* Overlay gelap agar teks terbaca */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1
      }}></div>

      {/* Tombol kontrol suara video */}
      <button
        onClick={toggleVideoSound}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 3,
          background: 'rgba(0,0,0,0.7)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          color: '#38ef7d',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <i className={isVideoMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'}></i>
      </button>

      {/* Konten Form Login */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          maxWidth: '1000px',
          width: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}>
          {/* Sisi Kiri - Welcome */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <img src="/images/logo-navbar.png" alt="Login" style={{ width: '200px', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>Selamat Datang!</h2>
            <p style={{ color: '#cbd5e1' }}>Masuk ke dashboard<br />Sistem Absensi Cerdas</p>
          </div>

          {/* Sisi Kanan - Form */}
          <div style={{ flex: 1, padding: '3rem' }}>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #66ea66 0%, #3f9245)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              <i className="fas fa-graduation-cap"></i> Login
            </h1>
            <p style={{ marginBottom: '2rem', color: '#cbd5e1' }}>Masukkan NIK dan password Anda</p>

            {error && (
              <div style={{ marginBottom: '1.5rem', color: '#f87171', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
                <i className="fas fa-exclamation-triangle"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#e2e8f0', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <i className="fas fa-id-card" style={{ color: '#38ef7d', marginRight: '5px' }}></i> NIK
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Masukkan NIK"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ color: '#e2e8f0', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <i className="fas fa-lock" style={{ color: '#38ef7d', marginRight: '5px' }}></i> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '40px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                  transition: 'transform 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                {loading ? 'Loading...' : <><i className="fas fa-arrow-right-to-bracket"></i> Masuk</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}