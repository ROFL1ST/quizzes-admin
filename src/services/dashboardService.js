import api from "./api";

export const dashboardService = {
  getAnalytics: () => api.get("/admin/analytics"),
  getSystemHealth: () => api.get("/admin/health"), // Hypothetical
};
