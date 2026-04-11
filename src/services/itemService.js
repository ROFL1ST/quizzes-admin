import api from "./api";

export const itemService = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/admin/shop/items?page=${page}&limit=${limit}`),
  create: (data) => api.post("/admin/shop/items", data),
  update: (id, data) => api.put(`/admin/shop/items/${id}`, data),
  delete: (id) => api.delete(`/admin/shop/items/${id}`),
};
