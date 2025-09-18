import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { cariPasienByNama, getPasienByRM, cariPasienByRekmed } from "../api/servicePx";
import { getDoctor } from "../api/serviceDoctor";
import type { Nakes } from "../api/serviceDoctor";
import { getServerTime } from "../api/serviceTime";
import "./AppointmentForm.css";

const MySwal = withReactContent(Swal);

interface Pasien {
  id: string;
  pxName: string;
  pxAddress: string;
  pxKelurahan?: string;
  pxBirthdate: string;
  pxSex: "L" | "P";
}

interface AppointmentFormData {
  rekamMedis: string;
  register: string;
  nama: string;
  alamat: string;
  kelurahan: string;
  tglLahir: string;
  umur: string;
  jenisKelamin: string;
  rujukan: string;
  dokter: string;
  tanggal: string;
  jamMasuk: string;
  status: string;
  spesialis: string;
}

const AppointmentForm = () => {
  const [patientName, setPatientName] = useState<string>("");
  const [formData, setFormData] = useState<AppointmentFormData>({
    rekamMedis: "",
    register: "",
    nama: "",
    alamat: "",
    kelurahan: "",
    tglLahir: "",
    umur: "",
    jenisKelamin: "",
    rujukan: "",
    dokter: "",
    tanggal: "",
    jamMasuk: "",
    status: "",
    spesialis: "",
  });

  // State untuk rekam medis format xx.xx.xx
  const [rekmedParts, setRekmedParts] = useState<string[]>(['', '', '']);
  const [rekamMedisQuery, setRekamMedisQuery] = useState<string>("");

  // Refs untuk auto-focus input rekmed
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);

  const [NakesList, setNakesList] = useState<Nakes[]>([]);
  const [loadingDokter, setLoadingDokter] = useState<boolean>(false);

  const hitungUmur = (tglLahir: string): string => {
    if (!tglLahir) return "";
    const birthDate = new Date(tglLahir);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} Thn ${months} Bln ${days} Hr`;
  };

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const serverTime = await getServerTime();
        const dateObj = new Date(serverTime.webTime.replace(' ', 'T'));
        const tanggal = dateObj.toISOString().split("T")[0];
        const jamMasuk = dateObj.toTimeString().slice(0, 5);

        setFormData((prev) => ({
          ...prev,
          tanggal,
          jamMasuk,
        }));
      } catch (err) {
        console.error("Gagal mengambil waktu server:", err);
      }
    };

    fetchTime();
  }, []);

  useEffect(() => {
    const fetchNakes = async () => {
      setLoadingDokter(true);
      try {
        const data = await getDoctor();
        setNakesList(data);
      } catch (err) {
        console.error("Gagal mengambil Nakes dokter:", err);
        setNakesList([]);
      } finally {
        setLoadingDokter(false);
      }
    };
    fetchNakes();
  }, []);

  const handlePatientSelection = (selectedPatient: Pasien) => {
    const formattedTglLahir = (selectedPatient.pxBirthdate || "").split("T")[0];

    setPatientName(selectedPatient.pxName || "");
    setFormData((prev) => ({
      ...prev,
      rekamMedis: selectedPatient.id || "",
      register: selectedPatient.id || "",
      nama: selectedPatient.pxName || "",
      alamat: selectedPatient.pxAddress || "",
      kelurahan: selectedPatient.pxKelurahan || "",
      tglLahir: formattedTglLahir,
      jenisKelamin: selectedPatient.pxSex === "L" ? "Laki-laki" : "Perempuan",
      umur: hitungUmur(formattedTglLahir),
    }));

    MySwal.close();
    MySwal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Data ${selectedPatient.pxName} berhasil dimuat`,
      timer: 1500,
      showConfirmButton: false,
      confirmButtonColor: "#2563eb"
    });
  };


  const handleRekmedInputChange = (index: number, value: string): void => {
    if (/^\d{0,2}$/.test(value)) {
      const newParts = [...rekmedParts];
      newParts[index] = value;
      setRekmedParts(newParts);

      if (value.length === 2) {
        if (index === 0) {
          input2Ref.current?.focus();
        } else if (index === 1) {
          input3Ref.current?.focus();
        }
      }
    }
  };

  const handleRekmedKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && rekmedParts[index] === '' && index > 0) {
      const refs = [input1Ref, input2Ref, input3Ref];
      refs[index - 1].current?.focus();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchByRekmedParts();
    }
  };

  const handleSearchByRekmedParts = async () => {
    if (rekmedParts.some((part) => part.length !== 2)) {
      MySwal.fire({
        title: "Input Tidak Lengkap",
        text: "Semua kolom rekam medis harus diisi 2 digit angka.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const rekmedNumber = `${rekmedParts[0]}.${rekmedParts[1]}.${rekmedParts[2]}`;

    MySwal.fire({
      title: "Mencari Pasien...",
      text: `Mencari data untuk RM: ${rekmedNumber}`,
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      // Coba menggunakan cariPasienByRekmed terlebih dahulu
      const res = await cariPasienByRekmed(rekmedNumber);

      if (res?.response) {
        // Jika response berupa single object
        if (typeof res.response === 'object' && !Array.isArray(res.response) && res.response.id) {
          const patient = mapPasienToPatient(res.response);
          handlePatientSelection(patient);
          setRekmedParts(['', '', '']); // Reset form
        }
        // Jika response berupa array
        else if (Array.isArray(res.response) && res.response.length > 0) {
          const patient = mapPasienToPatient(res.response[0]);
          handlePatientSelection(patient);
          setRekmedParts(['', '', '']); // Reset form
        } else {
          // Fallback ke getPasienByRM jika tidak ada data
          await fallbackSearchByRM(rekmedNumber);
        }
      } else {
        await fallbackSearchByRM(rekmedNumber);
      }
    } catch (err: any) {
      console.error("Error cariPasienByRekmed:", err);
      // Fallback ke getPasienByRM jika error
      await fallbackSearchByRM(rekmedNumber);
    }
  };

  // Fallback search menggunakan getPasienByRM
  const fallbackSearchByRM = async (rekmedNumber: string) => {
    try {
      const res = await getPasienByRM(rekmedNumber);
      const pasien = res?.data;

      if (!pasien) {
        MySwal.fire({
          title: "Tidak Ditemukan",
          text: `Pasien dengan RM ${rekmedNumber} tidak ditemukan.`,
          icon: "info",
          confirmButtonColor: "#2563eb"
        });
        return;
      }

      const patient = mapPasienToPatient(pasien);
      handlePatientSelection(patient);
      setRekmedParts(['', '', '']); // Reset form
    } catch (fallbackErr: any) {
      console.error("Error fallback getPasienByRM:", fallbackErr);
      MySwal.fire({
        title: "Tidak Ditemukan",
        text: `Pasien dengan RM ${rekmedNumber} tidak ditemukan.`,
        icon: "info",
        confirmButtonColor: "#2563eb"
      });
    }
  };

  const handleSearchPatient = async () => {
    if (!patientName.trim()) {
      MySwal.fire({
        title: "Input Kosong",
        text: "Silakan masukkan nama pasien terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    MySwal.fire({
      title: "Mencari Pasien...",
      text: `Mencari data untuk "${patientName}"`,
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const result = await cariPasienByNama(patientName);
      const patients: Pasien[] = result.response || [];

      if (patients.length > 0) {
        const tableHtml = `
          <div class="patient-table-container">
            <div class="table-header">
              <h3>Daftar Pasien Ditemukan (${patients.length})</h3>
              <p class="table-subtitle">Klik pada baris untuk memilih pasien</p>
            </div>
            <div class="table-wrapper">
              <table class="patient-table">
                <thead>
                  <tr>
                    <th>No. RM</th>
                    <th>Nama Pasien</th>
                    <th>Alamat</th>
                    <th class="status-col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${patients
            .map(
              (p, index) => `
                    <tr class="patient-row" data-patient-index="${index}" tabindex="0">
                      <td>
                        <span class="rm-badge">${p.id}</span>
                      </td>
                      <td>
                        <div class="patient-info">
                          <div class="patient-name">${p.pxName}</div>
                          <div class="patient-gender">${p.pxSex === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </div>
                      </td>
                      <td class="patient-address" title="${p.pxAddress || '-'}">
                        ${p.pxAddress || '-'}
                      </td>
                      <td class="status-col">
                        <span class="status-badge">Klik untuk pilih</span>
                        <div class="click-indicator">
                          <span class="arrow">→</span>
                        </div>
                      </td>
                    </tr>
                  `
            )
            .join("")}
                </tbody>
              </table>
            </div>
          
          </div>
          
          <style>
            .patient-table-container {
              width: 100%;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
              border: 1px solid #e5e7eb;
            }
            
            .table-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
              color: white;
              padding: 20px 24px 16px;
              position: relative;
            }
            
            .table-header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            }
            
            .table-header h3 {
              margin: 0 0 4px 0;
              font-size: 20px;
              font-weight: 700;
              text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .table-subtitle {
              margin: 0;
              font-size: 14px;
              opacity: 0.9;
              font-weight: 400;
            }
            
            .table-wrapper {
              max-height: 450px;
              overflow-y: auto;
              position: relative;
            }
            
            .table-wrapper::-webkit-scrollbar {
              width: 8px;
            }
            
            .table-wrapper::-webkit-scrollbar-track {
              background: #f8fafc;
            }
            
            .table-wrapper::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 4px;
            }
            
            .table-wrapper::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            
            .patient-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
            }
            
            .patient-table th {
              background: #f8fafc;
              padding: 16px 20px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
              position: sticky;
              top: 0;
              z-index: 10;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .patient-table th:first-child {
              border-top-left-radius: 0;
            }
            
            .patient-table th:last-child {
              border-top-right-radius: 0;
            }
            
            .patient-row {
              cursor: pointer;
              transition: all 0.2s ease-in-out;
              border-bottom: 1px solid #f1f5f9;
              position: relative;
            }
            
            .patient-row:hover {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              transform: translateX(4px);
              box-shadow: 
                inset 4px 0 0 #2563eb,
                0 2px 8px rgba(37, 99, 235, 0.1);
            }
            
            .patient-row:active {
              transform: translateX(2px) scale(0.98);
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            }
            
            .patient-row:focus {
              outline: none;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              box-shadow: 
                inset 4px 0 0 #2563eb,
                0 0 0 2px rgba(37, 99, 235, 0.2);
            }
            
            .patient-row td {
              padding: 16px 20px;
              vertical-align: middle;
              position: relative;
            }
            
            .rm-badge {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
              display: inline-block;
              min-width: 60px;
              text-align: center;
            }
            
            .patient-info {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            
            .patient-name {
              font-weight: 600;
              color: #1f2937;
              font-size: 15px;
            }
            
            .patient-gender {
              font-size: 12px;
              color: #6b7280;
              font-weight: 500;
            }
            
            .patient-address {
              color: #6b7280;
              max-width: 250px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .status-col {
              width: 140px;
              text-align: center;
            }
            
            .status-badge {
              background: #f3f4f6;
              color: #6b7280;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.2s ease;
              display: inline-block;
            }
            
            .click-indicator {
              position: absolute;
              right: 20px;
              top: 50%;
              transform: translateY(-50%);
              opacity: 0;
              transition: all 0.3s ease;
            }
            
            .arrow {
              font-size: 18px;
              color: #2563eb;
              font-weight: bold;
            }
            
            .patient-row:hover .status-badge {
              background: #2563eb;
              color: white;
              transform: scale(1.05);
            }
            
            .patient-row:hover .click-indicator {
              opacity: 1;
              transform: translateY(-50%) translateX(10px);
            }
            
            .table-footer {
              background: #f8fafc;
              padding: 12px 24px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            }
            
            .table-footer p {
              margin: 0;
              font-size: 13px;
              color: #6b7280;
              font-style: italic;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
              .patient-table th:nth-child(3),
              .patient-table td:nth-child(3) {
                display: none;
              }
              
              .patient-table-container {
                margin: 0 -10px;
                border-radius: 8px;
              }
              
              .table-header {
                padding: 16px 20px 12px;
              }
              
              .table-header h3 {
                font-size: 18px;
              }
              
              .patient-row:hover {
                transform: translateX(2px);
              }
              
              .status-col {
                width: 100px;
              }
              
              .status-badge {
                font-size: 10px;
                padding: 4px 8px;
              }
            }
            
            @media (max-width: 480px) {
              .patient-table th,
              .patient-row td {
                padding: 12px 16px;
              }
              
              .rm-badge {
                padding: 6px 10px;
                font-size: 11px;
                min-width: 50px;
              }
              
              .patient-name {
                font-size: 14px;
              }
              
              .status-col {
                display: none;
              }
            }
            
            /* Animation for row selection */
            @keyframes selectPulse {
              0% { box-shadow: inset 4px 0 0 #2563eb, 0 0 0 0 rgba(37, 99, 235, 0.4); }
              50% { box-shadow: inset 4px 0 0 #2563eb, 0 0 0 8px rgba(37, 99, 235, 0.2); }
              100% { box-shadow: inset 4px 0 0 #2563eb, 0 0 0 0 rgba(37, 99, 235, 0); }
            }
            
            .patient-row.selecting {
              animation: selectPulse 0.6s ease-out;
            }
          </style>
        `;

        MySwal.fire({
          title: "",
          html: tableHtml,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: "Tutup",
          width: "1000px",
          padding: "0",
          customClass: {
            popup: 'patient-selection-popup'
          },
          didOpen: () => {
            document.querySelectorAll(".patient-row").forEach((row, index) => {
              const htmlRow = row as HTMLElement;

              htmlRow.addEventListener("click", () => {
                htmlRow.classList.add("selecting");
                const selectedPatient = patients[index];
                setTimeout(() => {
                  handlePatientSelection(selectedPatient);
                }, 300);
              });
              htmlRow.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  htmlRow.click();
                }
              });
            });
          }
        });
      } else {
        MySwal.fire({
          title: "Tidak Ditemukan",
          text: "Pasien dengan nama tersebut tidak ditemukan.",
          icon: "info",
          confirmButtonColor: "#2563eb"
        });
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      MySwal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat mengambil data.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  const mapPasienToPatient = (pasien: any): Pasien => ({
    id: pasien.rekmed ?? pasien.id ?? pasien.no_rm ?? "",
    pxName: pasien.nama ?? pasien.fullName ?? pasien.pxName ?? "",
    pxAddress: pasien.alamat ?? pasien.address ?? pasien.pxAddress ?? "",
    pxKelurahan: pasien.kelurahan ?? pasien.pxKelurahan ?? "",
    pxBirthdate: pasien.tanggalLahir ?? pasien.birthdate ?? pasien.pxBirthdate ?? "",
    pxSex:
      pasien.jenisKelamin
        ? pasien.jenisKelamin.toString().toUpperCase().startsWith("L")
          ? "L"
          : "P"
        : (pasien.sex === "M" ? "L" : pasien.sex === "F" ? "P" : "L"),
  });

  const handleSearchByRM = async () => {
    const rm = rekamMedisQuery.trim();
    if (!rm) {
      MySwal.fire({
        title: "Input Kosong",
        text: "Masukkan No. RM terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    MySwal.fire({
      title: "Mencari...",
      text: `Mencari RM: ${rm}`,
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading()
    });

    try {
      const res = await getPasienByRM(rm);
      const pasien = res?.data;
      if (!pasien) {
        MySwal.fire({
          title: "Tidak Ditemukan",
          text: `Pasien dengan RM ${rm} tidak ditemukan.`,
          icon: "info",
          confirmButtonColor: "#2563eb"
        });
        return;
      }
      const patient = mapPasienToPatient(pasien);
      handlePatientSelection(patient);
      setRekamMedisQuery("");
    } catch (err: any) {
      console.error("Error getPasienByRM:", err);
      MySwal.fire({
        title: "Error",
        text: (err?.toString?.() ?? "Gagal mengambil data"),
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  const clearForm = () => {
    setPatientName("");
    setRekmedParts(['', '', '']);
    setRekamMedisQuery("");
    setFormData({
      rekamMedis: "",
      register: "",
      nama: "",
      alamat: "",
      kelurahan: "",
      tglLahir: "",
      umur: "",
      jenisKelamin: "",
      rujukan: "",
      dokter: "",
      tanggal: formData.tanggal,
      jamMasuk: formData.jamMasuk,
      status: "",
      spesialis: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.nama || !formData.dokter || !formData.tanggal) {
      MySwal.fire({
        title: "Data Tidak Lengkap",
        text: "Silakan lengkapi data pasien, dokter, dan tanggal appointment.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // Tampilkan konfirmasi
    MySwal.fire({
      title: "Konfirmasi Appointment",
      html: `
        <div style="text-align: left;">
          <p><strong>Pasien:</strong> ${formData.nama}</p>
          <p><strong>No. RM:</strong> ${formData.rekamMedis}</p>
          <p><strong>Dokter:</strong> ${NakesList.find(n => n.id.toString() === formData.dokter)?.dokterName || '-'}</p>
          <p><strong>Tanggal:</strong> ${formData.tanggal}</p>
          <p><strong>Jam:</strong> ${formData.jamMasuk}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Data appointment yang akan disimpan:", formData);

        MySwal.fire({
          title: "Berhasil!",
          text: "Appointment berhasil disimpan.",
          icon: "success",
          confirmButtonColor: "#059669"
        });
      }
    });
  };

  const handleAutofillDateTime = async () => {
    try {
        MySwal.fire({
            title: "Memuat...",
            text: "Mengambil waktu server terkini",
            allowOutsideClick: false,
            didOpen: () => MySwal.showLoading(),
        });

        const serverTime = await getServerTime();
        console.log("Server time received:", serverTime); // Debug log
        
        // Validasi response
        if (!serverTime || !serverTime.webTime) {
            throw new Error("Invalid server time response");
        }

        // Parse webTime yang formatnya "yyyy-MM-dd HH:mm:ss"
        // Contoh: "2024-03-15 14:30:25" -> Date object
        const dateObj = new Date(serverTime.webTime.replace(' ', 'T')); // Convert to ISO format
        
        // Validasi apakah date valid
        if (isNaN(dateObj.getTime())) {
            throw new Error("Invalid date format from server");
        }

        const tanggal = dateObj.toISOString().split("T")[0];
        const jamMasuk = dateObj.toTimeString().slice(0, 5);

        setFormData((prev) => ({
            ...prev,
            tanggal,
            jamMasuk,
        }));

        MySwal.close();
        MySwal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `Tanggal dan jam berhasil diisi dengan waktu server: ${tanggal} ${jamMasuk}`,
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: "#2563eb"
        });

    } catch (err: any) {
        console.error("Gagal mengambil waktu server:", err);
        
        MySwal.close();
        
        MySwal.fire({
            title: "Error",
            text: `Gagal mengambil waktu server: ${err.message || err}. Menggunakan waktu lokal.`,
            icon: "warning",
            confirmButtonColor: "#f59e0b"
        }).then(() => {
            // Fallback ke waktu lokal
            const now = new Date();
            const tanggal = now.toISOString().split("T")[0];
            const jamMasuk = now.toTimeString().slice(0, 5);

            setFormData((prev) => ({
                ...prev,
                tanggal,
                jamMasuk,
            }));

            MySwal.fire({
                icon: 'info',
                title: 'Menggunakan Waktu Lokal',
                text: `Tanggal dan jam diisi dengan waktu lokal: ${tanggal} ${jamMasuk}`,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: "#2563eb"
            });
        });
    }
};
  return (
    <div className="appointment-form-container">
      <div className="form-header">
        <h2>Form Appointment Kunjungan Pasien</h2>
        <p>Silakan lengkapi data pasien untuk membuat appointment</p>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">
            <h3>Data Pasien</h3>
          </div>

          <div className="form-grid">
            {/* Pencarian by Nama */}
            <div className="form-group full-width">
              <label htmlFor="namaPasien">

                Nama Pasien
              </label>
              <div className="input-with-button">
                <input
                  id="namaPasien"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ketik nama pasien untuk mencari..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchPatient();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  className="btn btn-search"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Pencarian by Rekam Medis Format xx.xx.xx */}
            <div className="form-group full-width">
              <label>
                Nomor Rekam Medis (Format: xx.xx.xx)
              </label>
              <div className="rekmed-input-container">
                <div className="rekmed-inputs">
                  <input
                    ref={input1Ref}
                    type="text"
                    value={rekmedParts[0]}
                    onChange={(e) => handleRekmedInputChange(0, e.target.value)}
                    onKeyDown={(e) => handleRekmedKeyDown(0, e)}
                    maxLength={2}
                    placeholder="00"
                    className="rekmed-input"
                  />
                  <span className="rekmed-separator">.</span>
                  <input
                    ref={input2Ref}
                    type="text"
                    value={rekmedParts[1]}
                    onChange={(e) => handleRekmedInputChange(1, e.target.value)}
                    onKeyDown={(e) => handleRekmedKeyDown(1, e)}
                    maxLength={2}
                    placeholder="00"
                    className="rekmed-input"
                  />
                  <span className="rekmed-separator">.</span>
                  <input
                    ref={input3Ref}
                    type="text"
                    value={rekmedParts[2]}
                    onChange={(e) => handleRekmedInputChange(2, e.target.value)}
                    onKeyDown={(e) => handleRekmedKeyDown(2, e)}
                    maxLength={2}
                    placeholder="00"
                    className="rekmed-input"
                  />
                  <button
                    type="button"
                    onClick={handleSearchByRekmedParts}
                    className="btn btn-search rekmed-search-btn"
                    disabled={rekmedParts.some(part => part.length !== 2)}
                  >
                    Cari
                  </button>
                </div>
                <div className="rekmed-preview">
                  Preview: {rekmedParts[0] || '00'}.{rekmedParts[1] || '00'}.{rekmedParts[2] || '00'}
                </div>
              </div>
            </div>


            <div className="form-group">
              <label htmlFor="register">
                Register
              </label>
              <input id="register" type="text" value={formData.register} readOnly />
            </div>

            <div className="form-group full-width">
              <label htmlFor="alamat">
                Alamat Lengkap
              </label>
              <input id="alamat" type="text" value={formData.alamat} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="kelurahan">
                Kelurahan
              </label>
              <input id="kelurahan" type="text" value={formData.kelurahan} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="tglLahir">
                Tanggal Lahir
              </label>
              <input id="tglLahir" type="date" value={formData.tglLahir} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="umur">
                Umur
              </label>
              <input id="umur" type="text" value={formData.umur} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="jenisKelamin">
                Jenis Kelamin
              </label>
              <input id="jenisKelamin" type="text" value={formData.jenisKelamin} readOnly />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <h3>Data Appointment</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rujukan">
                Rujukan
              </label>
              <input
                id="rujukan"
                type="text"
                value={formData.rujukan}
                onChange={(e) => setFormData({ ...formData, rujukan: e.target.value })}
                placeholder="Masukkan asal rujukan"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dokter">
                Dokter
              </label>
              <select
                id="dokter"
                value={formData.dokter}
                onChange={(e) => {
                  const selectedDoctorId = e.target.value;
                  const selectedDoctor = NakesList.find((n) => n.id.toString() === selectedDoctorId);

                  setFormData((prev) => ({
                    ...prev,
                    dokter: selectedDoctorId,
                    spesialis: selectedDoctor ? selectedDoctor.spe || "" : "",
                  }));
                }}
              >
                <option value="">-- Pilih Dokter --</option>
                {loadingDokter ? (
                  <option disabled>Memuat daftar dokter...</option>
                ) : NakesList && NakesList.length > 0 ? (
                  NakesList.map((Nakes) => (
                    <option key={Nakes.id} value={Nakes.id}>
                      {Nakes.dokterName}
                    </option>
                  ))
                ) : (
                  <option disabled>Belum ada Nakes</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="spesialis">
                Spesialis
              </label>
              <input id="spesialis" type="text" value={formData.spesialis} readOnly />
            </div>
           <div className="form-group">
    <label htmlFor="tanggal">
        Tanggal Appointment
    </label>
    <div className="input-with-button">
        <input
            id="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
        />
    </div>
</div>

<div className="form-group">
    <label htmlFor="jamMasuk">
        Jam Masuk
    </label>
    <div className="input-with-button">
        <input
            id="jamMasuk"
            type="time"
            value={formData.jamMasuk}
            onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
        />
        <button
            type="button"
            onClick={handleAutofillDateTime} // atau handleAutofillDateTimeQuick
            className="btn btn-autofill"
            title="Isi dengan tanggal dan jam server saat ini"
        >
            <span className="autofill-icon">🕒</span>
            Sekarang
        </button>
    </div>
</div>
            <div className="form-group full-width">
              <label htmlFor="status">
                Status / Saran
              </label>
              <input
                id="status"
                type="text"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Masukkan status atau saran"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={clearForm}>
            Bersihkan Form
          </button>
          <button type="submit" className="btn btn-save">
            Simpan Appointment
          </button>
        </div>
      </form>


    </div>
  );
};

export default AppointmentForm;