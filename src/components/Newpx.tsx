import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./NewPx.css";
import { cariPasienByNama } from "../api/servicePx";
import { getAutoRm } from "../api/autoRmService";
import { NewPx } from "../api/NewPxService";
import type { NewPxPayload } from "../api/NewPxService";
import { updatePx } from "../api/UpdatePxService";

const MySwal = withReactContent(Swal);

interface PatientSearchResult {
  id: string;
  nama: string;
  px: string;
  kelurahan?: string;
  tglLahir: string;
  jenisKelamin: "L" | "P";
  telepon?: string;
  noKtp?: string;
  domisili?: string;
  noJkn?: string;
}

const NewPxComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [patientName, setPatientName] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [autoRm, setAutoRm] = useState<string>("");
  const [formData, setFormData] = useState<NewPxPayload>({
    regNum: "", namaPx: "", addrPx: "", kelurahanPx: "", teleponPx: "",
    tlahirPx: "", jkPx: "", noKtp: "", domisiliPx: "", noJkn: "",
  });

  const [editPayload, setEditPayload] = useState<NewPxPayload | null>(null);

  const handleAutoRmClick = async () => {
    setLoading(true);
    try {
      const rmString = await getAutoRm();
      setAutoRm(rmString);
      setFormData(prev => ({ ...prev, regNum: rmString }));
    } catch (err: any) {
      MySwal.fire({ title: "Error", text: err.message || 'Gagal mengambil nomor rekam medis.', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) return "";
    try {
      const dateStr = String(dateValue);
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.split('T')[0].split(' ')[0];
      }
      const dateObj = new Date(dateValue);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    } catch (e) { }
    return "";
  };

  const handleSearchPatient = async () => {
    if (!patientName.trim()) {
      MySwal.fire({ title: "Input Kosong", text: "Silakan masukkan nama pasien.", icon: "warning" });
      return;
    }
    setIsSearching(true);
    MySwal.fire({ title: "Mencari Pasien...", allowOutsideClick: false, didOpen: () => MySwal.showLoading() });

    try {
      const result = await cariPasienByNama(patientName);
      const patients: PatientSearchResult[] = (result.response || []).map((p: any) => ({
        id: p.id,
        nama: p.pxName,
        px: p.pxAddress,
        kelurahan: p.kelurahanPx,
        tglLahir: formatDateForInput(p.pxBirthdate),
        jenisKelamin: p.pxSex,
        telepon: p.pxPhone,
        noKtp: p.pxKtp,
        domisili: p.domisiliPx,
        noJkn: p.pxNojkn,
      }));

      if (patients.length === 0) {
        MySwal.fire({ title: "Tidak Ditemukan", text: "Tidak ada pasien dengan nama tersebut.", icon: "info" });
        return;
      }

      const tableHtml = `
        <div class="search-results-wrapper">
          <table class="search-results-table">
            <thead><tr><th>No RM</th><th>Nama Pasien</th><th>Alamat</th><th>Aksi</th></tr></thead>
            <tbody>
              ${patients.slice(0, 10).map(p => `
                <tr>
                  <td><span class="rm-badge">${p.id}</span></td>
                  <td><strong>${p.nama}</strong></td>
                  <td>${p.px}</td>
                  <td><button class="btn-select pilih-btn" data-id="${p.id}">Pilih</button></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`;

      MySwal.fire({
        title: `Hasil Pencarian`,
        html: tableHtml,
        width: "90%",
        showConfirmButton: false,
        showCloseButton: true,
        didRender: () => {
          document.querySelectorAll(".pilih-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const id = (btn as HTMLButtonElement).dataset.id;
              const pasien = patients.find((p) => p.id === id);
              if (pasien) {
                const dataUntukEdit: NewPxPayload = {
                  regNum: pasien.id,
                  namaPx: pasien.nama,
                  addrPx: pasien.px,
                  kelurahanPx: pasien.kelurahan || "",
                  tlahirPx: pasien.tglLahir,
                  jkPx: pasien.jenisKelamin,
                  teleponPx: pasien.telepon || "",
                  noKtp: pasien.noKtp || "",
                  domisiliPx: pasien.domisili || "",
                  noJkn: pasien.noJkn || "",
                };
                setEditPayload(dataUntukEdit);
                setShowEditForm(true);
                MySwal.close();
              }
            });
          });
        },
      });
    } catch (error) {
      MySwal.fire({ title: "Error", text: "Terjadi kesalahan saat mencari pasien.", icon: "error" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditPayloadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEditPayload(prev => prev ? { ...prev, [id.replace('edit-', '')]: value } : null);
  };

  const handleSaveEditData = async () => {
    if (!editPayload) return;
    if (!editPayload.namaPx.trim() || !editPayload.addrPx.trim()) {
      MySwal.fire({ title: "⚠️ Data Tidak Lengkap", text: "Nama dan alamat pasien harus diisi.", icon: "warning" });
      return;
    }
    
    try {
      MySwal.fire({ title: "Menyimpan Perubahan...", allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      await updatePx(editPayload);
      MySwal.fire({ title: "Berhasil!", text: `Data pasien ${editPayload.namaPx} berhasil diperbarui.`, icon: "success" });
      setShowEditForm(false);
      setEditPayload(null);
    } catch (error) {
      MySwal.fire({ title: "❌ Gagal Memperbarui", text: "Terjadi kesalahan saat menyimpan perubahan.", icon: "error" });
    }
  };
  
  const handleBackToSearch = () => {
    setShowEditForm(false);
    setEditPayload(null);
    setPatientName("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleSubmitNewPx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPx.trim() || !formData.addrPx.trim() || !autoRm.trim()) {
      MySwal.fire({ title: "Data tidak lengkap", text: "Nomor RM, Nama, dan Alamat harus diisi.", icon: "warning" });
      return;
    }
    const payload: NewPxPayload = { ...formData, regNum: autoRm };
    try {
      MySwal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const response = await NewPx(payload);
      const successMessage = response.data || `Pasien ${payload.namaPx} berhasil disimpan.`;
      MySwal.fire({ title: "Berhasil!", text: successMessage, icon: "success" });
      setFormData({ regNum: "", namaPx: "", addrPx: "", kelurahanPx: "", teleponPx: "", tlahirPx: "", jkPx: "", noKtp: "", domisiliPx: "", noJkn: "" });
      setAutoRm("");
    } catch (err: any) {
      MySwal.fire({ title: "Gagal Menyimpan", text: err?.response?.data?.message || err?.message || "Terjadi kesalahan.", icon: "error" });
    }
  };

  return (
    <div className="new-px-container">
      {showEditForm && editPayload ? (
        <div className="edit-form-container">
          <div className="edit-form-header">
            <h2>Edit Data Pasien</h2>
            <p>Ubah dan perbarui informasi untuk pasien <strong>{editPayload.namaPx}</strong></p>
          </div>
          <div className="edit-form-body">
            <div className="form-card">
              <div className="form-card-header"><h3>Informasi Personal</h3></div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-regNum">No. Rekam Medis</label>
                  <input id="edit-regNum" type="text" value={editPayload.regNum} disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-namaPx">Nama Pasien</label>
                  <input id="edit-namaPx" type="text" value={editPayload.namaPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="edit-addrPx">Alamat</label>
                  <input id="edit-addrPx" type="text" value={editPayload.addrPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-kelurahanPx">Kelurahan</label>
                  <input id="edit-kelurahanPx" type="text" value={editPayload.kelurahanPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-teleponPx">Telepon</label>
                  <input id="edit-teleponPx" type="text" value={editPayload.teleponPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-tlahirPx">Tanggal Lahir</label>
                  <input id="edit-tlahirPx" type="date" value={editPayload.tlahirPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-jkPx">Jenis Kelamin</label>
                  <select id="edit-jkPx" value={editPayload.jkPx} onChange={handleEditPayloadChange}>
                    <option value="">Pilih</option><option value="P">Perempuan</option><option value="L">Laki-laki</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-noKtp">No. KTP</label>
                  <input id="edit-noKtp" type="text" value={editPayload.noKtp} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-domisiliPx">Domisili</label>
                  <input id="edit-domisiliPx" type="text" value={editPayload.domisiliPx} onChange={handleEditPayloadChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-noJkn">No. JKN</label>
                  <input id="edit-noJkn" type="text" value={editPayload.noJkn} onChange={handleEditPayloadChange} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleBackToSearch}>Kembali</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditData}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <nav className="tabs">
            <button className={activeTab === "personal" ? "active" : ""} onClick={() => setActiveTab("personal")}>Data Personal</button>
            <button className={activeTab === "edit-data-pasien" ? "active" : ""} onClick={() => setActiveTab("edit-data-pasien")}>Edit Data Pasien</button>
          </nav>
          {activeTab === "personal" && (
            <form className="tab-content" onSubmit={handleSubmitNewPx}>
              <div className="form-section-header">
                <div><h2 className="section-subtitle">Pendaftaran Pasien Baru</h2></div>
                <div className="rm-generator">
                  <label htmlFor="auto-rm">No. Rekam Medis</label>
                  <input className="form-input" id="auto-rm" type="text" value={autoRm} placeholder="00.00.00" readOnly />
                  <button type="button" className="btn btn-primary" onClick={handleAutoRmClick} disabled={loading}>{loading ? "Loading..." : "Auto"}</button>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label htmlFor="namaPx">Nama Pasien</label><input id="namaPx" type="text" value={formData.namaPx} onChange={handleChange} /></div>
                <div className="form-group full-width"><label htmlFor="addrPx">Alamat</label><input id="addrPx" type="text" value={formData.addrPx} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="kelurahanPx">Kelurahan</label><input id="kelurahanPx" type="text" value={formData.kelurahanPx} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="teleponPx">Telepon</label><input id="teleponPx" type="text" value={formData.teleponPx} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="tlahirPx">Tanggal Lahir</label><input id="tlahirPx" type="date" value={formData.tlahirPx} onChange={handleChange} /></div>
                <div className="form-group">
                  <label htmlFor="jkPx">Jenis Kelamin</label>
                  <select id="jkPx" value={formData.jkPx} onChange={handleChange}>
                    <option value="">Pilih</option><option value="P">Perempuan</option><option value="L">Laki-laki</option>
                  </select>
                </div>
                <div className="form-group"><label htmlFor="noKtp">No. KTP</label><input id="noKtp" type="text" value={formData.noKtp} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="domisiliPx">Domisili</label><input id="domisiliPx" type="text" value={formData.domisiliPx} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="noJkn">No. JKN</label><input id="noJkn" type="text" value={formData.noJkn} onChange={handleChange} /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          )}
          {activeTab === "edit-data-pasien" && (
            <div className="tab-content edit-search-tab">
              <div className="search-container">
                <div className="search-header">
                  <h3>Cari & Edit Data Pasien</h3>
                  <p>Masukkan nama pasien untuk mencari dan mengedit data.</p>
                </div>
                <div className="search-card">
                  <div className="search-input-group">
                    <div className="form-group">
                      <label htmlFor="cari-pasien">Nama Pasien</label>
                      <input id="cari-pasien" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleSearchPatient(); }} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleSearchPatient} disabled={isSearching}>{isSearching ? 'Mencari...' : 'Cari'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewPxComponent;