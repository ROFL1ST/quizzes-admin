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
import api from "@/services/api";

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await classService.getClassDetail(id);
      if (res.data?.data) {
        setDetail(res.data.data.classroom);
        setAssignments(res.data.data.assignments || []);
      }
    } catch (err) {
      toast.error("Failed to load class detail");
      router.push("/dashboard/classes");
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
    </div>
  );
}
