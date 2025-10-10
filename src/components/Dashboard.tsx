import React, { useEffect, useState } from "react";
import "./Dashboard.css";
// Ganti nama import agar konsisten dengan file yang ada
import { getCountPx } from "../api/getCountPx"; // Asumsi nama file service dan fungsinya

// 1. Interface 'Doctor' didefinisikan di luar komponen
interface Doctor {
  id: number;
  name: string;
  specialization: string;
  schedule: string;
}

const Dashboard: React.FC = () => {
  // 2. State tetap sama
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [doctorsToday, setDoctorsToday] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalPasienResponse = await getCountPx();
        if (totalPasienResponse && typeof totalPasienResponse.response === 'number') {
            setTotalPatients(totalPasienResponse.response);
        }
        const todayDoctors: Doctor[] = [
          { id: 1, name: "dr. Ahmad Fauzi", specialization: "Umum", schedule: "08.00 - 12.00" },
          { id: 2, name: "drg. Siti Rahmawati", specialization: "Gigi", schedule: "09.00 - 13.00" },
          { id: 3, name: "dr. Hadi Santoso", specialization: "Anak", schedule: "10.00 - 14.00" },
        ];
        setDoctorsToday(todayDoctors);

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Dependency array kosong agar useEffect hanya berjalan sekali

  // 4. Menambahkan kondisi loading untuk user experience yang lebih baik
  if (loading) {
    return <div className="dashboard-container"><h2>Memuat data...</h2></div>;
  }

  // 5. Pernyataan 'return' sekarang berada di dalam fungsi komponen
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Selamat Datang di Dashboard</h1>
      <p className="dashboard-subtitle">
        Klinik Muhammadiyah Lamongan - Sistem Informasi Pendaftaran Pasien
      </p>

      <div className="dashboard-summary">
        <div className="summary-card">
          {/* Judul diubah agar sesuai dengan data (total pasien terdaftar) */}
          <h3>Total Pasien Terdaftar</h3>
          <p className="summary-number">{totalPatients}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Dokter yang Praktek Hari Ini</h2>
        <div className="doctor-list">
          {doctorsToday.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <h3>{doctor.name}</h3>
              <p className="doctor-specialization">{doctor.specialization}</p>
              <p className="doctor-schedule">Jadwal: {doctor.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;