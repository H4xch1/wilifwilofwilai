import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    nama: '', nik: '', nis: '', tanggal_lahir: '', password: '', role: 'murid', wali_kelas_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftarkan');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #66ea66 0%, #3f9245 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '32px',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #66ea66 0%, #3f9245)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          <i className="fas fa-user-plus"></i> Register
        </h1>
        <p style={{ marginBottom: '2rem' }}>Daftarkan user baru</p>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>NIK</label>
            <input type="text" name="nik" value={formData.nik} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>NIS (khusus siswa)</label>
            <input type="text" name="nis" value={formData.nis} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="murid">Siswa</option>
              <option value="petugas">Petugas</option>
              <option value="walas">Wali Kelas</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-submit" style={{ width: '100%' }}>Daftar</button>
        </form>
      </div>
    </div>
  );
}