import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { getCountPx } from "../api/getCountPx";
import { getJadwalDokter } from "../api/getJadwalDokter";

// ✅ Interface tipe data dokter (sesuai struktur dari backend)
interface Doctor {
  id: string;
  dokterId: number;
  dokterName: string;
  beginTime: string; // Contoh: "2025-10-14 08:00:00"
  endTime: string;   // Contoh: "2025-10-14 12:00:00"
  photo?: string | null;
  dpjp?: string | null;
}

// ✅ Tipe status dokter
type DoctorStatus = "active" | "ended" | "upcoming";

// ✅ Komponen utama Dashboard
const Dashboard: React.FC = () => {
  // State untuk jumlah pasien dan daftar dokter
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [doctorsToday, setDoctorsToday] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 🔹 Update waktu setiap menit untuk deteksi status real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update setiap 1 menit

    return () => clearInterval(timer);
  }, []);

  // 🔹 Fungsi untuk menentukan status dokter dengan validasi yang lebih baik
  const getDoctorStatus = (begin: string, end: string): DoctorStatus => {
    try {
      const now = currentTime;
      const start = new Date(begin);
      const finish = new Date(end);

      // Validasi apakah tanggal valid
      if (isNaN(start.getTime()) || isNaN(finish.getTime())) {
        console.error("Invalid date format:", { begin, end });
        return "ended";
      }

      // Cek apakah praktek sudah dimulai
      if (now < start) {
        return "upcoming"; // Belum dimulai
      }

      // Cek apakah praktek sedang berlangsung
      if (now >= start && now <= finish) {
        return "active"; // Sedang praktek
      }

      // Praktek sudah selesai
      return "ended";
    } catch (error) {
      console.error("Error calculating doctor status:", error);
      return "ended";
    }
  };

  // 🔹 Fungsi untuk format waktu menjadi HH:MM
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString.slice(11, 16);
      }
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return timeString.slice(11, 16);
    }
  };

  // 🔹 Fungsi untuk mendapatkan label status dalam Bahasa Indonesia
  const getStatusLabel = (status: DoctorStatus): string => {
    const labels = {
      active: "Sedang Praktek",
      ended: "Praktek Selesai",
      upcoming: "Belum Dimulai",
    };
    return labels[status];
  };

  // 🔹 Fungsi untuk memuat data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil total pasien dari endpoint backend
        const totalRes = await getCountPx();
        if (totalRes && typeof totalRes.response === "number") {
          setTotalPatients(totalRes.response);
        }

        // Ambil jadwal dokter hari ini dari endpoint backend
        const jadwalRes = await getJadwalDokter();

        // Cek jika hasilnya array dan isi ke state
        if (Array.isArray(jadwalRes)) {
          setDoctorsToday(jadwalRes);
        } else if (jadwalRes && Array.isArray(jadwalRes.response)) {
          // Jika backend membungkus data dalam { response: [...] }
          setDoctorsToday(jadwalRes.response);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Saat masih memuat data
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Memuat data...</h2>
        </div>
      </div>
    );
  }

  // 🔹 Render utama dashboard
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Klinik</h1>
        <p className="dashboard-subtitle">
          Klinik Muhammadiyah Lamongan - Sistem Informasi Pendaftaran Pasien
        </p>
      </div>

      {/* Total Pasien */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Total Pasien</h3>
          <p className="summary-number">{totalPatients}</p>
          <span className="summary-label">Terdaftar</span>
        </div>

        <div className="summary-card">
          <div className="summary-icon success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>Dokter Hari Ini</h3>
          <p className="summary-number">{doctorsToday.length}</p>
          <span className="summary-label">Terjadwal</span>
        </div>
      </div>

      {/* Daftar Dokter Hari Ini */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <span className="title-icon">👨‍⚕️</span>
          Jadwal Dokter Praktek Hari Ini
        </h2>

        <div className="doctor-list">
          {doctorsToday.length === 0 ? (
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>Tidak ada jadwal dokter hari ini.</p>
            </div>
          ) : (
            doctorsToday.map((doctor) => {
              const status = getDoctorStatus(doctor.beginTime, doctor.endTime);

              return (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-photo-container">
                    <img
                      src={
                        doctor.photo
                          ? `data:image/jpeg;base64,${doctor.photo}`
                          : "/assets/default-doctor.jpg"
                      }
                      alt={doctor.dokterName}
                      className="doctor-photo"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/80/2563eb/ffffff?text=Dr";
                      }}
                    />
                    <div className={`status-badge status-${status}`}>
                      <span className="status-dot"></span>
                    </div>
                  </div>
                  <div className="doctor-info">
                    <h3 className="doctor-name">{doctor.dokterName}</h3>
                    <p className="doctor-specialization">
                      {doctor.dpjp || "Dokter Umum"}
                    </p>
                    <div className="doctor-schedule">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {formatTime(doctor.beginTime)} - {formatTime(doctor.endTime)}
                      </span>
                    </div>
                    <div className={`doctor-status status-${status}`}>
                      {getStatusLabel(status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;