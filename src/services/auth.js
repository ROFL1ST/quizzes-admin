import api from "./api";

export const authAPI = {
  login: (credentials) => api.post("/admin/login", credentials),
  getProfile: () => api.get("/admin/me"),
  logout: () => api.post("/admin/logout"),
};
