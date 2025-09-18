import apiClient from "./apiClient";

export interface Nakes {
    id: string;
    dokterName: string;
    nickName: string;
    dpjp: string;
    spe: string;
    photo: string;  
  }

  export const getDoctor = async (): Promise<Nakes[]> => {
  try {
    const response = await apiClient.get("/nakesref/name");
    return response.data.response || [];
  } catch (error: any) {
    console.error("Error getDoctor:", error);
    throw error.response?.data?.message || "Gagal fetch jadwal dokter";
  }
};

