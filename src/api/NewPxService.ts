import apiClient from "./apiClient";

export interface NewPxPayload {
  regNum: string;
  namaPx: string;
  addrPx: string;
  kelurahanPx: string;
  teleponPx: string;
  tlahirPx: string;
  jkPx: string;
  noKtp: string;
  domisiliPx: string;
  noJkn: string;
}

/**
 * Service untuk mengirim data profil pasien baru ke server.
 * @param patientData Objek data pasien yang akan disimpan.
 * @returns Promise yang berisi response dari server.
 */

export const NewPx = async (patientData: NewPxPayload) => {
  try {
    const response = await apiClient.post('/api/px', patientData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error saat memanggil API NewPx:", error);
    throw error;
  }
};