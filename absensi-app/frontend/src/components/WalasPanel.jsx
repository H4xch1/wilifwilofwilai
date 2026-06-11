import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

// Interceptor buat nambahin Token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- SUB-KOMPONEN BIAR GAK SPAGETI ---

const SiswaCard = ({ siswa, onDetail }) => (
  <div className="bg-[#161b27] border border-[#1e2840] p-4 rounded-xl flex justify-between items-center hover:border-[#f5c518] transition-all">
    <span className="text-white font-medium">{siswa.nama_lengkap}</span>
    <button 
      onClick={() => onDetail(siswa)}
      className="bg-[#111520] border border-[#f5c518] text-[#f5c518] px-4 py-2 rounded-lg text-sm hover:bg-[#f5c518] hover:text-black transition"
    >
      Lihat Absensi
    </button>
  </div>
);

// --- KOMPONEN UTAMA ---

export default function WalasPanel() {
  const [siswaList, setSiswaList] = useState([]);
  const [absensiSiswa, setAbsensiSiswa] = useState([]);
  const [viewingSiswa, setViewingSiswa] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/murid');
        setSiswaList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal load siswa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLihatAbsensi = async (siswa) => {
    setViewingSiswa(siswa);
    try {
      const res = await api.get(`/absensi/walas/${siswa._id}`);
      setAbsensiSiswa(res.data);
    } catch (err) {
      alert("Gagal ambil data absensi, bray!");
    }
  };

  const exportExcel = () => {
    if (absensiSiswa.length === 0) return alert("Kosong, mau ekspor apa?");
    
    const data = absensiSiswa.map((a, i) => ({
      No: i + 1,
      Tanggal: a.tanggal,
      Status: a.status.toUpperCase(),
      Keterangan: a.keterangan || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, `Absensi_${viewingSiswa.nama_lengkap}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {!viewingSiswa ? (
        <div className="grid gap-4">
          <h2 className="text-xl text-[#f5c518] font-bold">Daftar Siswa Bimbingan</h2>
          {siswaList.map(siswa => (
            <SiswaCard key={siswa._id} siswa={siswa} onDetail={handleLihatAbsensi} />
          ))}
        </div>
      ) : (
        <div className="bg-[#111520] p-6 rounded-xl border border-[#1e2840]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-white">Absensi: {viewingSiswa.nama_lengkap}</h2>
            <div className="flex gap-2">
              <button onClick={() => setViewingSiswa(null)} className="text-gray-400 hover:text-white">Back</button>
              <button onClick={exportExcel} className="bg-[#00e5a0] text-black px-4 py-2 rounded-lg font-bold">
                Export Excel
              </button>
            </div>
          </div>
          
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-[#1e2840]">
                <th className="py-2">Tanggal</th>
                <th className="py-2">Status</th>
                <th className="py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {absensiSiswa.map((a, i) => (
                <tr key={i} className="border-b border-[#1e2840]/30">
                  <td className="py-3">{a.tanggal}</td>
                  <td className="py-3">{a.status}</td>
                  <td className="py-3">{a.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}