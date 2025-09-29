import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./NewPx.css";
import { cariPasienByNama } from "../api/servicePx";
import { getAutoRm } from "../api/autoRmService";
import { newPx } from "../api/NewPxService";

const MySwal = withReactContent(Swal);

interface Patient {
  id: string;
  nama: string;
  px: string;
  kelurahan?: string;
  tglLahir: string;
  jenisKelamin: "L" | "P";
}

const NewPx: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const [patientName, setPatientName] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [autoRm, setAutoRm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namaPx: "",
    addrPx: "",
    kelurahanPx: "",
    teleponPx: "",
    tlahirPx: "",
    jkPx: "",
    noKtp: "",
    domisiliPx: "",
    noJkn: "",
  });

  const handleAutoRmClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const rmString = await getAutoRm();
      setAutoRm(rmString);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching auto RM:", error);
      setError(err.message || 'Gagal mengambil nomor rekam medis.');
    } finally {
      setLoading(false);
    }
  };


  const handleSearchPatient = async () => {
    if (!patientName.trim()) {
      MySwal.fire({
        title: "Input Kosong",
        text: "Silakan masukkan nama pasien terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#004080",
      });
      return;
    }

    setIsSearching(true);
    MySwal.fire({
      title: "Mencari Pasien...",
      text: `Mencari data untuk "${patientName}"`,
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const result = await cariPasienByNama(patientName);

      const patients: Patient[] = (result.response || []).map((p: any) => ({
        id: p.id,
        nama: p.pxName,
        px: p.pxAddress,
        kelurahan: p.pxKelurahan,
        tglLahir: p.pxBirthdate,
        jenisKelamin: p.pxSex,
      }));

      const limitedPatients = patients.slice(0, 10);

      if (limitedPatients.length === 0) {
        MySwal.fire({
          title: "Tidak Ditemukan",
          text: "Tidak ada pasien dengan nama tersebut.",
          icon: "info",
          confirmButtonColor: "#004080",
        });
        setIsSearching(false);
        return;
      }

      const tableHtml = `
        <div class="search-results-wrapper">
          <table class="search-results-table">
            <thead>
              <tr>
                <th>No RM</th>
                <th>Nama Pasien</th>
                <th>Alamat</th>
                <th>Kelurahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${limitedPatients
          .map(
            (p) => `
                <tr>
                  <td><span class="rm-badge">${p.id}</span></td>
                  <td><strong>${p.nama}</strong></td>
                  <td>${p.px}</td>
                  <td>${p.kelurahan || '-'}</td>
                  <td>
                    <button class="btn-select pilih-btn" data-id="${p.id}">
                    
                      Pilih
                    </button>
                  </td>
                </tr>
              `
          )
          .join("")}
            </tbody>
          </table>
        </div>
      `;

      MySwal.fire({
        title: `📋 Hasil Pencarian`,
        html: `
          <div class="search-result-info">
            <p>Ditemukan <strong>${limitedPatients.length}</strong> pasien dari <strong>${patients.length}</strong> total hasil</p>
          </div>
          ${tableHtml}
        `,
        width: "90%",
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          popup: 'search-results-popup'
        },
        didRender: () => {
          document.querySelectorAll(".pilih-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const id = (btn as HTMLButtonElement).dataset.id;
              const pasien = patients.find((p) => p.id === id);
              if (pasien) {
                setSelectedPatient(pasien);
                setEditFormData({ ...pasien });
                setShowEditForm(true);
                MySwal.close();
                MySwal.fire({
                  title: "✅ Pasien Dipilih",
                  html: `
                    <div class="success-message">
                      <div class="patient-info">
                        <h4>${pasien.nama}</h4>
                        <p>No. RM: ${pasien.id}</p>
                      </div>
                      <p>Data pasien berhasil dimuat dan siap untuk diedit.</p>
                    </div>
                  `,
                  icon: "success",
                  confirmButtonColor: "#004080",
                  confirmButtonText: "Lanjutkan",
                });
              }
            });
          });
        },
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat mencari pasien. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: "#004080",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditFormChange = (field: keyof Patient, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  const handleSaveEditData = async () => {
    if (!editFormData) return;

    if (!editFormData.nama.trim() || !editFormData.px.trim()) {
      MySwal.fire({
        title: "⚠️ Data Tidak Lengkap",
        text: "Nama dan alamat pasien harus diisi.",
        icon: "warning",
        confirmButtonColor: "#004080",
      });
      return;
    }

    try {
      MySwal.fire({
        title: "Menyimpan Data...",
        text: "Sedang menyimpan perubahan data pasien.",
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSelectedPatient({ ...editFormData });
      MySwal.fire({
        title: "Berhasil",
        html: `
          <div class="success-message">
            <div class="patient-info">
              <h4>${editFormData.nama}</h4>
              <p>No. RM: ${editFormData.id}</p>
            </div>
            <p>Data pasien berhasil diperbarui.</p>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#004080",
        confirmButtonText: "OK"
      });

    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "❌ Error",
        text: "Terjadi kesalahan saat menyimpan data pasien.",
        icon: "error",
        confirmButtonColor: "#004080",
      });
    }
  };

  const handleCancelEdit = () => {
    MySwal.fire({
      title: "Batalkan Perubahan?",
      text: "Semua perubahan yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Tidak"
    }).then((result) => {
      if (result.isConfirmed) {
        setShowEditForm(false);
        setEditFormData(null);
      }
    });
  };

  const handleBackToSearch = () => {
    MySwal.fire({
      title: "Kembali ke Pencarian?",
      text: "Data yang sedang diedit akan hilang.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#004080",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Kembali",
      cancelButtonText: "Tidak"
    }).then((result) => {
      if (result.isConfirmed) {
        setShowEditForm(false);
        setEditFormData(null);
        setSelectedPatient(null);
        setPatientName("");
      }
    });
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

const handleSubmitNewPx = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.namaPx.trim() || !formData.addrPx.trim()) {
    MySwal.fire({ 
      title: "Data tidak lengkap", 
      text: "Nama dan alamat harus diisi.", 
      icon: "warning" 
    });
    return;
  }

const payload = {
  regNum: autoRm && autoRm.trim() !== "" ? autoRm.trim() : null,
  nama: formData.namaPx?.trim() || null,
  addr: formData.addrPx?.trim() || null,
  kelurahan: formData.kelurahanPx?.trim() || null,
  telepon: formData.teleponPx?.trim() || null,
  tanggalLahir: formData.tlahirPx && formData.tlahirPx !== "" ? formData.tlahirPx : null,
  jenisKelamin: formData.jkPx && formData.jkPx !== "" ? formData.jkPx : null,
  noKtp: formData.noKtp?.trim() || null,
  domisili: formData.domisiliPx?.trim() || null,
  nokaBpjs: formData.noJkn?.trim() || null
} as any;


  try {
    MySwal.fire({ 
      title: "Menyimpan...", 
      allowOutsideClick: false, 
      didOpen: () => MySwal.showLoading() 
    });
    
    const res = await newPx(payload);
    const savedId = res?.response?.id || res?.id || payload.id;
    
    MySwal.fire({ 
      title: "Berhasil", 
      text: `Pasien tersimpan (RM: ${savedId})`, 
      icon: "success" 
    });

    setFormData({
      namaPx: "",
      addrPx: "",
      kelurahanPx: "",
      teleponPx: "",
      tlahirPx: "",
      jkPx: "",
      noKtp: "",
      domisiliPx: "",
      noJkn: "",
    });
    setAutoRm("");
  } catch (err: any) {
    console.error("error saving px:", err);
    MySwal.fire({ 
      title: "Gagal", 
      text: err?.message || "Terjadi kesalahan saat menyimpan pasien", 
      icon: "error" 
    });
  }
};


  return (
    <div className="new-px-container">
      {showEditForm && editFormData ? (
        <div className="edit-form-container">
          <div className="edit-form-header">
            <div className="header-content">
              <h2>📝 Edit Data Pasien</h2>
              <p>Ubah dan perbarui informasi pasien sesuai kebutuhan</p>
            </div>
            <div className="patient-status">
              <div className="status-badge editing">
                Sedang Mengedit
              </div>
            </div>
          </div>

          <div className="edit-form-body">
            <div className="form-card">
              <div className="form-card-header">
                <h3>👤 Informasi Personal</h3>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-rm" className="form-label">
                    No. Rekam Medis
                  </label>
                  <input
                    id="edit-rm"
                    type="text"
                    className="form-input rm-field-edit"
                    value={editFormData.id}
                    placeholder="00.00.03"
                    title="Nomor rekam medis"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-namaPx" className="form-label required">
                    Nama Pasien
                  </label>
                  <input
                    id="edit-namaPx"
                    type="text"
                    className="form-input"
                    value={editFormData.nama}
                    onChange={(e) => handleEditFormChange("nama", e.target.value)}
                    placeholder="Contoh: Siti Aminah"
                    title="Nama pasien"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-px" className="form-label required">
                    Alamat
                  </label>
                  <input
                    id="edit-px"
                    type="text"
                    className="form-input"
                    value={editFormData.px}
                    onChange={(e) => handleEditFormChange("px", e.target.value)}
                    placeholder="Masukkan alamat lengkap"
                    title="Alamat pasien"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-kelurahan" className="form-label">
                    Kelurahan / Desa
                  </label>
                  <input
                    id="edit-kelurahan"
                    type="text"
                    className="form-input"
                    value={editFormData.kelurahan || ""}
                    onChange={(e) => handleEditFormChange("kelurahan", e.target.value)}
                    placeholder="Contoh: Sidoharjo"
                    title="Kelurahan pasien"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-tlahirPx" className="form-label">
                    Tanggal Lahir
                  </label>
                  <input
                    id="edit-tgl-lahir"
                    type="date"
                    className="form-input"
                    value={editFormData.tglLahir}
                    onChange={(e) => handleEditFormChange("tglLahir", e.target.value)}
                    title="Tanggal lahir pasien"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-jenis-kelamin" className="form-label">
                    Jenis Kelamin
                  </label>
                  <select
                    id="edit-jenis-kelamin"
                    className="form-input"
                    value={editFormData.jenisKelamin}
                    onChange={(e) => handleEditFormChange("jenisKelamin", e.target.value as "L" | "P")}
                    title="Jenis kelamin pasien"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="P">👩 Perempuan</option>
                    <option value="L">👨 Laki-laki</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Batal
              </button>
              <button type="button" className="btn btn-outline" onClick={handleBackToSearch}>
                Kembali ke Pencarian
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditData}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <nav className="tabs">
            <button
              className={activeTab === "personal" ? "active" : ""}
              onClick={() => setActiveTab("personal")}
            >
              Data Personal
            </button>
            <button
              className={activeTab === "details" ? "active" : ""}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={activeTab === "alergi-obat" ? "active" : ""}
              onClick={() => setActiveTab("alergi-obat")}
            >
              Alergi Obat
            </button>
            <button
              className={activeTab === "edit-data-pasien" ? "active" : ""}
              onClick={() => setActiveTab("edit-data-pasien")}
            >
              Edit Data Pasien
            </button>
          </nav>

          {activeTab === "personal" && (
            <form className="tab-content" onSubmit={handleSubmitNewPx}>
              <div className="form-section-header">
                <div>
                  <h2 className="section-subtitle">Pendaftaran Pasien Baru</h2>
                </div>
                <div className="rm-generator">
                  <label htmlFor="auto-rm">No. Rekam Medis</label>
                  <input
                    id="auto-rm"
                    type="text"
                    className="rm-field"
                    value={autoRm}
                    placeholder="00.00.00"
                    title="Nomor rekam medis"
                    readOnly
                  />
                  <button
                    className="btn btn-primary btn-auto"
                    type="button"
                    onClick={handleAutoRmClick}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Auto"}
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="namaPx" className="form-label">
                    Nama Pasien
                  </label>
                  <input
                    id="namaPx"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Siti Aminah"
                    title="Nama pasien"
                    value={formData.namaPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="addrPx" className="form-label">
                    Alamat
                  </label>
                  <input
                    id="addrPx"
                    type="text"
                    className="form-input"
                    placeholder="Masukkan alamat lengkap"
                    title="Alamat pasien"
                    value={formData.addrPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kelurahanPx" className="form-label">
                     Kelurahan
                  </label>
                  <input
                    id="kelurahanPx"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Sidoharjo"
                    title="Kelurahan pasien"
                    value={formData.kelurahanPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teleponPx" className="form-label">
                    Telepon Pasien
                  </label>
                  <input
                    id="teleponPx"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 081252440082"
                    title="No. HP"
                    value={formData.teleponPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tlahirPx" className="form-label">
                    Tanggal Lahir
                  </label>
                  <input
                    id="tlahirPx"
                    type="date"
                    className="form-input"
                    title="Tanggal lahir pasien"
                    value={formData.tlahirPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jkPx" className="form-label">
                    Jenis Kelamin
                  </label>
                  <select
                    id="jkPx"
                    className="form-input"
                    title="Jenis kelamin pasien"
                    value={formData.jkPx}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="P">👩 Perempuan</option>
                    <option value="L">👨 Laki-laki</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="noKtp" className="form-label">
                    No. KTP
                  </label>
                  <input
                    id="noKtp"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 3275023405670001"
                    title="No. Ktp"
                    value={formData.noKtp}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="domisiliPx" className="form-label">
                    Domisili Pasien
                  </label>
                  <input
                    id="domisiliPx"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Jl Mawar No. 23"
                    title="Domisili"
                    value={formData.domisiliPx}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="noJkn" className="form-label">
                    No. Jkn
                  </label>
                  <input
                    id="noJkn"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 0001234567890"
                    title="No. Jkn"
                    value={formData.noJkn}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Data Pasien
                </button>
              </div>
            </form>
          )}
          {activeTab === "details" && (
            <div className="tab-content details-tab">
              <div className="section-header">
                <h3>Detail Pekerjaan & Keluarga</h3>
                <p className="section-subtitle">Informasi tambahan mengenai pekerjaan pasien</p>
              </div>

              <div className="form-card">
                <fieldset className="details-section">
                  <legend>Jenis Pekerjaan</legend>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" title="Pegawai Negeri" />
                      <span className="checkmark"></span>
                      Pegawai Negeri
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" title="Wiraswasta" />
                      <span className="checkmark"></span>
                      Wiraswasta
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" title="Swasta" />
                      <span className="checkmark"></span>
                      Swasta
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" title="Petani" />
                      <span className="checkmark"></span>
                      Petani
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" title="Lain-lain" />
                      <span className="checkmark"></span>
                      Lain-Lain
                    </label>
                  </div>
                </fieldset>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="jabatan" className="form-label">
                      Jabatan
                    </label>
                    <input
                      id="jabatan"
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Manager"
                      title="Jabatan"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="perusahaan" className="form-label">
                      Perusahaan
                    </label>
                    <input
                      id="perusahaan"
                      type="text"
                      className="form-input"
                      placeholder="Nama perusahaan"
                      title="Perusahaan"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ================= EDIT DATA PASIEN TAB ================= */}
          {activeTab === "edit-data-pasien" && (
            <div className="tab-content edit-search-tab">
              <div className="search-container">
                <div className="search-header">
                  <h3>Cari & Edit Data Pasien</h3>
                  <p className="search-subtitle">
                    Masukkan nama pasien untuk mencari dan mengedit data yang sudah terdaftar
                  </p>
                </div>

                <div className="search-card">
                  <div className="search-input-group">
                    <div className="form-group search-input">
                      <label htmlFor="cari-pasien" className="form-label">
                        Nama Pasien
                      </label>
                      <input
                        id="cari-pasien"
                        type="text"
                        className="form-input search-field"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Contoh: Siti Aminah, Ahmad Rizki, dll"
                        title="Cari nama pasien"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isSearching) {
                            handleSearchPatient();
                          }
                        }}
                      />
                    </div>
                    <button
                      className={`btn btn-primary search-btn ${isSearching ? 'loading' : ''}`}
                      type="button"
                      onClick={handleSearchPatient}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <span className="spinner"></span>
                          Mencari...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔍</span>
                          Cari Pasien
                        </>
                      )}
                    </button>
                  </div>

                  <div className="search-tips">
                    <h4> Tips Pencarian:</h4>
                    <ul>
                      <li>Masukkan nama lengkap atau sebagian nama pasien</li>
                      <li>Pastikan ejaan nama sudah benar</li>
                      <li>Sistem akan menampilkan maksimal 10 hasil teratas</li>
                    </ul>
                  </div>
                </div>

                {selectedPatient && !showEditForm && (
                  <div className="selected-patient-info">
                    <h4>Pasien Terakhir Dipilih:</h4>
                    <div className="patient-card-mini">
                      <div className="patient-details">
                        <strong>{selectedPatient.nama}</strong>
                        <span className="patient-id">No. RM: {selectedPatient.id}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditFormData({ ...selectedPatient });
                          setShowEditForm(true);
                        }}
                      >
                        Edit Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewPx;