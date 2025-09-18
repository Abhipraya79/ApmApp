// src/api/autoRmService.ts
import apiClient from "./apiClient";

// Sesuaikan interface agar cocok dengan respons 'response' dan 'metadata'
export interface AutoRm {
  response: string; // Properti 'response' berisi string nomor rekam medis
  metadata: {
    code: number;
    message: string;
  };
}

export const getAutoRm = async (): Promise<string> => {
  try {
    const res = await apiClient.get<AutoRm>("/api/autorm");
    
    if (res.data && res.data.response) {
      return res.data.response;
    } else {
      throw new Error("Invalid data format from server");
    }
  } catch (error: any) {
    console.error("Error fetching auto RM", error);
    throw new Error(error.response?.data?.metadata?.message || "Failed to fetch auto RM");
  }
};