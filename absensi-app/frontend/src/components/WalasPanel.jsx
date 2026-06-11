import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function WalasPanel({ activePanel }) {
  const [siswaList, setSiswaList] = useState([]);
  const [absensiSiswa, setAbsensiSiswa] = useState([]);
  const [viewingSiswa, setViewingSiswa] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSiswaBimbingan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/murid');
      setSiswaList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal load murid:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAbsensi = async (siswaId) => {
    setLoading(true);
    try {
      const res = await api.get(`/absensi/walas/${siswaId}`);
      setAbsensiSiswa(res.data);
      setViewingSiswa(siswaList.find(s => s._id === siswaId));
    } catch (err) {
      alert("Data absensi gak ketemu, bray.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (absensiSiswa.length === 0) return alert("Kosong cuy, mau ekspor apaan?");
    
    const worksheet = XLSX.utils.json_to_sheet(absensiSiswa.map(a => ({
      Tanggal: a.tanggal,
      Status: a.status.toUpperCase(),
      Keterangan: a.keterangan || '-'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");
    XLSX.writeFile(workbook, `Absensi_${viewingSiswa?.nama_lengkap || 'Siswa'}.xlsx`);
  };

  useEffect(() => {
    fetchSiswaBimbingan();
  }, []);

  // Section: View Siswa Bimbingan
  if (activePanel === 'dashboard' || activePanel === 'siswa-bimbingan') {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">Siswa Bimbingan</h2>
        {loading ? <p className="text-gray-400">Loading data...</p> : (
          <div className="grid gap-3">
            {siswaList.map(s => (
              <div key={s._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                <span className="text-white">{s.nama_lengkap}</span>
                <button 
                  onClick={() => getAbsensi(s._id)}
                  className="bg-cyan-500 text-black px-4 py-2 rounded-md hover:bg-cyan-400 transition"
                >
                  Lihat Absen
                </button>
              </div>
            ))}
          </div>
        )}

        {viewingSiswa && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#161b27] p-6 rounded-xl w-full max-w-lg border border-yellow-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Absensi: {viewingSiswa.nama_lengkap}</h3>
                <button onClick={() => setViewingSiswa(null)} className="text-red-500">Tutup</button>
              </div>
              
              <button onClick={exportToExcel} className="mb-4 bg-green-600 text-white px-4 py-2 rounded w-full">
                Export to Excel
              </button>

              <div className="max-h-60 overflow-y-auto">
                {absensiSiswa.map((a, i) => (
                  <div key={i} className="text-gray-300 border-b border-gray-700 py-2">
                    {a.tanggal} - <span className={a.status === 'hadir' ? 'text-green-400' : 'text-yellow-400'}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className="p-6 text-gray-400">Pilih menu yang bener, jangan asal klik.</div>;
}