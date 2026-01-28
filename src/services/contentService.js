import api from "./api";

export const contentService = {
  // Topics (Admin)
  getAllTopics: (page = 1, limit = 10) =>
    api.get(`/admin/topics?page=${page}&limit=${limit}`),
  createTopic: (data) => api.post("/admin/topics", data),
  updateTopic: (slug, data) => api.put(`/admin/topics/${slug}`, data),
  deleteTopic: (slug) => api.delete(`/admin/topics/${slug}`),

  // Quizzes (Admin)
  getAllQuizzes: (page = 1, limit = 10, filters = {}) => {
    let url = `/admin/quizzes?page=${page}&limit=${limit}`;
    if (filters.classroom_id) url += `&classroom_id=${filters.classroom_id}`;
    if (filters.only_global) url += `&only_global=true`;
    return api.get(url);
  },
  createQuiz: (data) => api.post("/admin/quizzes", data),
  updateQuiz: (id, data) => api.put(`/admin/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),

  // Questions (Admin)
  getAllQuestions: (page = 1, limit = 10, quizId = 0) =>
    api.get(`/admin/questions?page=${page}&limit=${limit}&quiz_id=${quizId}`),
  createQuestion: (data) => api.post("/admin/questions", data),
  bulkCreateQuestions: (data) =>
    api.post("/admin/questions/bulk", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  copyQuestions: (data) => api.post("/admin/questions/copy", data), // New
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // Analytics
  getQuizAnalysis: (quizId) => api.get(`/admin/quizzes/analysis/${quizId}`),
  // ... other question endpoints if needed later
};
