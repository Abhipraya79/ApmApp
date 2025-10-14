import apiClient from './apiClient';

export const getJadwalDokter = async () => {
  try {
    const response = await apiClient.get(`/jpref/daily`);
    return response.data;
  } catch (error) {
    console.error("Error saat memanggil API getJadwalDokter:", error);
    throw error;
  }
};
  