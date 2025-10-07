import apiClient from "./apiClient";

/**
 * Searches for a patient by name.
 * The authentication token is automatically added by the apiClient interceptor.
 * @param nama The name of the patient to search for.
 * @returns The API response data.
 */
export const cariPasienByNama = async (nama: string) => {
  try {
    const url = `/api/px?nama=${encodeURIComponent(nama)}&pg=0&sz=10`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};

/**
 * Searches for a patient by medical record number.
 * The authentication token is automatically added by the apiClient interceptor.
 * @param rekamMedis The medical record number to search for.
 * @returns The API response data.
 */
export const getPasienByRM = async (rekamMedis: string) => {
  try {
    const cleanRM = rekamMedis.replace(/\./g, '');
    const url = `/pxref/rekmed?id=${cleanRM}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};

/**
 * Searches for a patient by medical record number with rekmed parameter.
 * Alternative method for searching by rekmed using different endpoint parameter.
 * @param rekmed The medical record number in format xx.xx.xx or clean format
 * @returns The API response data.
 */
export const cariPasienByRekmed = async (rekmed: string) => {
  try {
    const url = `/pxref/rekmed?rekmed=${encodeURIComponent(rekmed)}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Gagal fetch data pasien by rekmed";
  }
};