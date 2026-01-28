import api from "./api";

export const userService = {
  // Fetch all users (Students)
  getAllUsers: (page = 1, limit = 10) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),

  // Fetch all Staff (Admins/Instructors)
  getAllAdmins: (page = 1, limit = 10) =>
    api.get(`/admin/admins?page=${page}&limit=${limit}`),

  // Role Management
  getAllRoles: () => api.get("/admin/roles"),

  // Actions
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),

  // Creation (Supervisor creating Admin/Instructor)
  createAdmin: (data) => api.post("/admin/create-admin", data),
};
