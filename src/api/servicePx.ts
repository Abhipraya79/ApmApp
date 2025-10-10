import apiClient from "./apiClient";

/**
 * Mencari daftar pasien berdasarkan nama.
 * @param nama Nama pasien yang dicari.
 * @returns Data hasil pencarian dari API.
 */
export const cariPasienByNama = async (nama: string) => {
  try {
    const url = `/api/px?nama=${encodeURIComponent(nama)}&pg=0&sz=10`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal mengambil data pasien";
  }
};

/**
 * Mengambil data detail satu pasien berdasarkan ID / Nomor Rekam Medis.
 * @param id Nomor Rekam Medis pasien.
 * @returns Data detail satu pasien dari API.
 */
export const getPasienById = async (id: string) => {
  try {
    const url = `/api/px/${id}`; 
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal mengambil detail data pasien";
  }
};

/**
 * Mencari pasien berdasarkan nomor rekam medis (format: xx.xx.xx).
 * @param rekmed Nomor rekam medis pasien.
 * @returns Data pasien dari API.
 */
export const cariPasienByRekmed = async (rekmed: string) => {
  try {
    const url = `/api/px/rekmed/${encodeURIComponent(rekmed)}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal mengambil data pasien by rekmed";
  }
};