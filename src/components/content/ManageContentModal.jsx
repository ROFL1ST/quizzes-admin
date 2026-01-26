"use client";

import { useState, useEffect } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import { contentService } from "@/services/contentService";
import toast from "react-hot-toast";

export default function ManageContentModal({
  isOpen,
  onClose,
  onSuccess,
  type, // "quiz" or "topic"
  topics = [], // List of topics for Quiz dropdown
  editData = null, // If provided, mode is EDIT
}) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        // Reset for create
        setFormData(
          type === "quiz"
            ? {
                title: "",
                description: "",
                topic_id: topics.length > 0 ? topics[0].ID : "",
                difficulty: "easy",
                time_limit: 60,
                passing_score: 70,
              }
            : {
                title: "",
                description: "",
              },
        );
      }
    }
  }, [isOpen, editData, type, topics]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "quiz") {
        const payload = {
          ...formData,
          topic_id: parseInt(formData.topic_id),
          time_limit: parseInt(formData.time_limit),
          passing_score: parseInt(formData.passing_score),
        };
        if (editData) await contentService.updateQuiz(editData.ID, payload);
        else await contentService.createQuiz(payload);
      } else {
        // Topic
        if (editData) await contentService.updateTopic(editData.Slug, formData);
        else await contentService.createTopic(formData);
      }

      toast.success(`${type === "quiz" ? "Quiz" : "Topic"} saved successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 capitalize">
            {editData ? "Edit" : "Create"} {type}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              placeholder="e.g. Introduction to HCI"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900"
              placeholder="Brief description..."
            />
          </div>

          {type === "quiz" && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Topic
                </label>
                <select
                  value={formData.topic_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, topic_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                >
                  {topics.map((t) => (
                    <option key={t.ID} value={t.ID}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Time Limit (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.time_limit || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, time_limit: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Passing Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passing_score: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty || "easy"}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
