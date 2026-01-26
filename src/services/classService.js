import api from "./api";

export const classService = {
  // List
  getAllClasses: (page = 1, limit = 10) =>
    api.get(`/admin/classrooms?page=${page}&limit=${limit}`),

  // Detail
  getClassDetail: (id) => api.get(`/admin/classrooms/${id}`),

  // Create
  createClass: (data) => api.post("/admin/classrooms", data), // { name, description, teacher_id, etc }

  // Members
  addMember: (classId, studentId) =>
    api.post(`/admin/classrooms/members`, {
      classroom_id: classId,
      student_id: studentId,
    }),

  addMemberByUsername: (classId, username) =>
    api.post(`/admin/classrooms/members`, { classroom_id: classId, username }),

  removeMember: (classId, studentId) =>
    api.delete(`/admin/classrooms/${classId}/members/${studentId}`),

  // Teacher
  assignTeacher: (classId, username) =>
    api.put(`/admin/classrooms/${classId}/teacher`, { username }),

  // Assignments
  getAssignments: (classId) =>
    api.get(`/admin/classrooms/${classId}/assignments`),

  createAssignment: (classId, data) =>
    api.post(`/admin/classrooms/${classId}/assignments`, data), // { quiz_id, deadline }

  deleteAssignment: (assignmentId) =>
    api.delete(`/admin/classrooms/assignments/${assignmentId}`),

  getAssignmentSubmissions: (assignmentId) =>
    api.get(`/admin/classrooms/assignments/${assignmentId}/submissions`),
};
