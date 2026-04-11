import api from "./api";

export const adminService = {
  // Reports
  getReports: () => api.get("/admin/reports"),
  resolveReport: (id, status) => api.put(`/admin/reports/${id}`, { status }),

  // Reviews
  getReviews: () => api.get("/admin/reviews"),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Broadcast / Announcements
  broadcast: (data) => api.post("/admin/broadcast", data),

  // Leveling Config
  getLevelingConfig: () => api.get("/admin/config/leveling"),
  updateLevelingConfig: (value) => api.put("/admin/config/leveling", { value: String(value) }),
};
