"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { classService } from "@/services/classService";
import { contentService } from "@/services/contentService";
import toast from "react-hot-toast";

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  classId,
  onSuccess,
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [source, setSource] = useState("global"); // "global" | "classroom"
  const [formData, setFormData] = useState({
    quiz_id: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQuizzes(source);
    }
  }, [isOpen, source]);

  const fetchQuizzes = async (selectedSource) => {
    try {
      let filters = {};
      if (selectedSource === "global") {
        filters.only_global = true;
      } else {
        filters.classroom_id = classId;
      }

      const res = await contentService.getAllQuizzes(1, 100, filters);
      setQuizzes(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load quizzes");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API expects: { quiz_id, deadline }
      // Deadline format: YYYY-MM-DD HH:mm:ss. HTML datetime-local gives "YYYY-MM-DDTHH:mm"
      const dateStr = formData.deadline.replace("T", " ") + ":00";

      await classService.createAssignment(classId, {
        quiz_id: parseInt(formData.quiz_id),
        deadline: dateStr,
      });
      toast.success("Assignment created");
      setFormData({ quiz_id: "", deadline: "" });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">New Assignment</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSource("global")}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                source === "global"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Global Quizzes
            </button>
            <button
              type="button"
              onClick={() => setSource("classroom")}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                source === "classroom"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Classroom Quizzes
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Select Quiz ({source === "global" ? "Global" : "Classroom"})
            </label>
            <select
              required
              value={formData.quiz_id}
              onChange={(e) =>
                setFormData({ ...formData, quiz_id: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
            >
              <option value="">-- Choose Quiz --</option>
              {quizzes.map((q) => (
                <option key={q.ID} value={q.ID}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Assign Quiz"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
