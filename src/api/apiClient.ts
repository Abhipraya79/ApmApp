import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor for every REQUEST sent
apiClient.interceptors.request.use(
  (config) => {
    // Get token and username from localStorage
    const token = localStorage.getItem("api_token");
    const username = localStorage.getItem("username");

    // If they exist, add them to the request headers
    if (token && username) {
      config.headers["x-token"] = token;
      config.headers["x-username"] = username;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for every RESPONSE received
apiClient.interceptors.response.use(
  (response) => response, // If successful, just pass it through
  async (error) => {
    // Check if the error is due to an invalid token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      console.error("Session is invalid or has expired. Please log in again.");
      
      // ✅ FIX: Directly remove items from localStorage to break the circular dependency
      localStorage.removeItem("api_token");
      localStorage.removeItem("username");
      
      // Reload the page; the router will automatically redirect to /login
      window.location.reload(); 
    }
    
    // For any other error, just pass it along
    return Promise.reject(error);
  }
);

export default apiClient;
