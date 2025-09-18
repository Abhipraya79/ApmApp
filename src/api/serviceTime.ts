import apiClient from '../api/apiClient';

// Interface untuk WSTime sesuai dengan backend model
export interface WSTime {
    webTime: string; // Format: "yyyy-MM-dd HH:mm:ss"
}

// Interface untuk Metadata
export interface Metadata {
    statusCode: number;
    message: string;
}

// Interface untuk ReCaller wrapper
export interface ReCaller<T, M> {
    response: T;
    metadata: M;
}

// Interface untuk complete response
export interface ServerTimeResponse extends ReCaller<WSTime, Metadata> {}

export const getServerTime = async (): Promise<WSTime> => {
    try {
        const response = await apiClient.get<ServerTimeResponse>('/webservicetime');
        console.log("Raw server time response:", response.data); // Debug log
        
        // Berdasarkan struktur backend: ReCaller<WSTime, Metadata>
        if (response.data?.response?.webTime) {
            return response.data.response;
        } else {
            console.warn("Unexpected response structure:", response.data);
            throw new Error("Invalid response structure from server time API");
        }
    } catch (error: any) {
        console.error("Error mendapatkan server time:", error);
        
        if (error.response) {
            throw new Error(error.response?.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            throw new Error("Network error: Unable to reach server");
        } else {
            throw new Error(error.message || "Unknown error occurred");
        }
    }
};