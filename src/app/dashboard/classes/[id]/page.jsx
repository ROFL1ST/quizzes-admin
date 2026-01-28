"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { classService } from "@/services/classService";
import {
  Loader2,
  Users,
  BookOpen,
  Clock,
  Calendar,
  ArrowLeft,
  Plus,
  Trash,
  UserPlus,
  GraduationCap,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateAssignmentModal from "@/components/classes/CreateAssignmentModal";
import AssignTeacherModal from "@/components/classes/AssignTeacherModal";
import ManageContentModal from "@/components/content/ManageContentModal";
import QuizQuestionsManager from "@/components/content/QuizQuestionsManager";
import { contentService } from "@/services/contentService";
import api from "@/services/api";
import { FileText, HelpCircle } from "lucide-react";

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // Data
  const [detail, setDetail] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");

  // Actions
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Quizzes State
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Use ManageQuestionModal from import if available, else import it
  // Assuming ManageContentModal was imported.
  // Add: import ManageContentModal from "@/components/content/ManageContentModal"; (Already imported)

  // Need to import ManageQuestionModal too if we want to add questions
  // import ManageQuestionModal from "@/components/content/ManageQuestionModal"; (Not imported yet, need to add import)
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] =
    useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await classService.getClassDetail(id);
      if (res.data?.data) {
        setDetail(res.data.data.classroom);
        setAssignments(res.data.data.assignments || []);
      }

      // Fetch Quizzes for this classroom
      const quizRes = await contentService.getAllQuizzes(1, 100, {
        classroom_id: id,
      });
      if (quizRes.data?.data) {
        setQuizzes(quizRes.data.data);
      }
    } catch (err) {
      toast.error("Failed to load class detail");
      console.error(err);
      // router.push("/dashboard/classes"); // Don't redirect on minor error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.data) setCurrentUserRole(res.data.data.role);
      })
      .catch(() => {});
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberUsername) return;
    setAddingMember(true);
    try {
      await classService.addMemberByUsername(id, newMemberUsername);
      toast.success("Member added");
      setNewMemberUsername("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!confirm("Remove student from class?")) return;
    try {
      await classService.removeMember(id, studentId);
      toast.success("Removed");
      fetchData();
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleDeleteAssignment = async (assignId) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await classService.deleteAssignment(assignId);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await contentService.deleteQuiz(quizId);
      toast.success("Quiz Deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full p-20">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );

  if (!detail) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {detail.name}
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-mono rounded-lg">
              {detail.code}
            </span>
          </h1>
          <p className="text-slate-500 flex items-center gap-2">
            <GraduationCap size={16} /> Instructor:{" "}
            <span className="font-bold">
              {detail.teacher?.name || detail.admin?.name || "Unassigned"}
            </span>
            {["admin", "supervisor"].includes(currentUserRole) && (
              <button
                onClick={() => setShowAssignTeacherModal(true)}
                className="ml-2 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                title="Change Instructor"
              >
                <Edit2 size={14} />
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        {[
          { id: "assignments", label: "Assignments", icon: BookOpen },
          { id: "quizzes", label: "Quizzes", icon: FileText },
          { id: "members", label: "Class Members", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 flex items-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={18} /> {tab.label}
            {tab.id === "assignments" && (
              <span className="bg-slate-100 px-2 rounded-full text-xs text-slate-600">
                {assignments.length}
              </span>
            )}
            {tab.id === "quizzes" && (
              <span className="bg-slate-100 px-2 rounded-full text-xs text-slate-600">
                {quizzes.length}
              </span>
            )}
            {tab.id === "members" && (
              <span className="bg-slate-100 px-2 rounded-full text-xs text-slate-600">
                {detail.members?.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              <Plus size={18} /> New Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.length > 0 ? (
              assignments.map((a) => (
                <div
                  key={a.ID}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group"
                >
                  <button
                    onClick={() => handleDeleteAssignment(a.ID)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">
                      {a.quiz?.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {a.quiz?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-bold bg-orange-50 px-3 py-2 rounded-lg w-fit">
                    <Clock size={16} />
                    Deadline: {new Date(a.deadline).toLocaleDateString()}{" "}
                    {new Date(a.deadline).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No assignments yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 mb-4">
            <div className="flex gap-3">
              <HelpCircle className="mt-1" />
              <div>
                <h4 className="font-bold">Classroom Quizzes</h4>
                <p className="text-sm">
                  Create quizzes specifically for this class. These quizzes will
                  not appear in the global topic lists.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setShowQuizModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              <Plus size={18} /> Create Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzes.length > 0 ? (
              quizzes.map((q) => (
                <div
                  key={q.ID}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingQuiz(q);
                        setShowQuizModal(true);
                      }}
                      className="text-slate-300 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(q.ID)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">
                      {q.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {q.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${q.active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"}`}
                    >
                      {q.active ? "Active" : "Draft"}
                    </span>
                    <button
                      onClick={() => {
                        setEditingQuiz(null); // Clear edit data to ensure mode is mostly clean or manage question modal handles it
                        setSelectedQuizForQuestions(q);
                        setShowQuestionModal(true);
                      }}
                      className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle size={14} /> Manage Questions
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No quizzes specific to this class yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Add Member Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <UserPlus
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Add student by username..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddMember}
              disabled={addingMember || !newMemberUsername}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {addingMember && <Loader2 className="animate-spin" size={18} />}{" "}
              Add
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(detail.members || []).length > 0 ? (
                  detail.members.map((m) => (
                    <tr key={m.ID} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {m.student?.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">
                        @{m.student?.username}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveMember(m.student_id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No members in this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        classId={id}
        onSuccess={fetchData}
      />

      <AssignTeacherModal
        isOpen={showAssignTeacherModal}
        classData={detail}
        onClose={() => setShowAssignTeacherModal(false)}
        onSuccess={fetchData}
      />

      {/* Quiz Modal */}
      <ManageContentModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onSuccess={fetchData}
        type="quiz"
        editData={editingQuiz}
        classroom_id={id} // Pass classroom ID to skip topic requirement
      />

      {/* Advanced Question Manager */}
      {selectedQuizForQuestions && (
        <QuizQuestionsManager
          isOpen={showQuestionModal}
          onClose={() => setShowQuestionModal(false)}
          quiz={selectedQuizForQuestions}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
