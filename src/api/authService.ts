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

const SESSION_KEY = 'app_session_id';
const TOKEN_KEY = 'api_token';
const USERNAME_KEY = 'username';

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
const initializeSession = () => {
  const currentSession = sessionStorage.getItem(SESSION_KEY);
  const storedSession = localStorage.getItem(SESSION_KEY);

  if (!currentSession || currentSession !== storedSession) {
    console.log('New app session detected - clearing authentication');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.clear();

    delete apiClient.defaults.headers.common["x-token"];
    delete apiClient.defaults.headers.common["x-username"];
  }
};

initializeSession();

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
      const sessionId = generateSessionId();
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERNAME_KEY, username);
      localStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(SESSION_KEY, sessionId);
      
      apiClient.defaults.headers.common["x-token"] = token;
      apiClient.defaults.headers.common["x-username"] = username;
      
      console.log('Login successful - session created:', sessionId);
    }
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error.response?.data || new Error("Login request failed");
  }
};

export const logout = () => {
  console.log('Manual logout - clearing all data');
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
  
  delete apiClient.defaults.headers.common["x-token"];
  delete apiClient.defaults.headers.common["x-username"];
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  const currentSession = sessionStorage.getItem(SESSION_KEY);
  const storedSession = localStorage.getItem(SESSION_KEY);
  
  // Cek apakah session masih valid
  const sessionValid = Boolean(currentSession && currentSession === storedSession);
  const tokenExists = token !== null;
  
  const authenticated = tokenExists && sessionValid;
  
  console.log('Authentication check:', {
    tokenExists,
    sessionValid,
    authenticated,
    currentSession,
    storedSession
  });
  
  // Jika session tidak valid tapi token ada, clear semuanya
  if (tokenExists && !sessionValid) {
    console.log('Invalid session detected - clearing authentication');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(SESSION_KEY);
    
    delete apiClient.defaults.headers.common["x-token"];
    delete apiClient.defaults.headers.common["x-username"];
    
    return false;
  }
  
  return authenticated;
};