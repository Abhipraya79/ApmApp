import apiClient from './apiClient';

/**
 * @param regNum Nomor Rekam Medis pasien yang akan dihapus.
 * @returns Promise yang berisi response dari server.
 */
export const deletePx = async (regNum: string) => {
  try {
    const response = await apiClient.delete('/api/px', {
      params: {
        norm: regNum 
      }
    });

    console.log('API Delete Response:', response.data);
    return response.data;

  } catch (error) {
    console.error(`Error saat menghapus pasien dengan regNum: ${regNum}`, error);
    throw error;
  }
};