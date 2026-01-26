import api from "./api";

export const userService = {
  // Fetch all users (with pagination/search if supported, currently get all)
  getAllUsers: () => api.get("/admin/users"),

  // Role Management
  getAllRoles: () => api.get("/admin/roles"),

  // Actions
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),

  // Creation (Supervisor creating Admin/Instructor)
  createAdmin: (data) => api.post("/admin/create-admin", data),
};
