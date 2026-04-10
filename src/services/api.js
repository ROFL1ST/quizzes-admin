import axios from "axios";

// Access backend URL from environment or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY, // Inject API Key
  },
  withCredentials: true,
});

// Response Interceptor: Handle Auth Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, redirect to login
      if (typeof window !== "undefined") {
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
