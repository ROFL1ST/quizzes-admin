import api from "./api";

export const authAPI = {
  login: (credentials) => api.post("/admin/login", credentials),
  getProfile: () => api.get("/auth/me"),
  logout: () => api.post("/logout"),
};
