import apiClient from "./apiClient";
import type { NewPxPayload } from "./NewPxService";

/**
 * * @param patientData 
 * @returns
 */
export const updatePx = async (patientData: NewPxPayload) => {
  try {
    const response = await apiClient.put('/api/px', patientData);
    console.log('API Update Response:', response.data);
    return response.data;

  } catch (error) {
    console.error("Error saat mengupdate profil pasien:", error); 
    throw error;
  }
};