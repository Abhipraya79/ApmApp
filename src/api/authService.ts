import axios from "axios";
import apiClient from "./apiClient";

interface AuthResponse {
  response: {
    token: string;
  };
  metadata: {
    code: number;
    message: string;
  };
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.get<AuthResponse>(`${import.meta.env.VITE_API_URL}/api/auth`, {
      headers: {
        "x-username": username,
        "x-password": password,
      },
    });

    if (response.data.response?.token) {
      const { token } = response.data.response;
      // Store both token AND username in localStorage
      localStorage.setItem("api_token", token);
      localStorage.setItem("username", username); 
      
      // Set default headers for subsequent requests
      apiClient.defaults.headers.common["x-token"] = token;
      apiClient.defaults.headers.common["x-username"] = username;
    }
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error.response?.data || new Error("Login request failed");
  }
};


export const logout = () => {
  localStorage.removeItem("api_token");
  localStorage.removeItem("username");
  
  delete apiClient.defaults.headers.common["x-token"];
  delete apiClient.defaults.headers.common["x-username"];
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("api_token") !== null;
};
