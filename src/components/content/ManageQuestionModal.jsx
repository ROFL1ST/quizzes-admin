"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Plus, Trash } from "lucide-react";
import { contentService } from "@/services/contentService";
import toast from "react-hot-toast";

export default function ManageQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  quizzes = [],
  editData = null,
}) {
  // Default structure for a new question
  const defaultForm = {
    quiz_id: "",
    question: "", // Matched to backend payload
    type: "mcq", // mcq, short_answer, boolean, multi_select
    options: ["", "", "", ""],
    correct: "", // Matched to backend (was correct_answer)
    hint: "",
    difficulty: 0.5,
  };

  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Handle correct answer parsing for multi-select
        let parsedCorrect = editData.correct;
        try {
          if (
            editData.type === "multi_select" &&
            typeof editData.correct === "string" &&
            editData.correct.startsWith("[")
          ) {
            parsedCorrect = JSON.parse(editData.correct);
          }
        } catch (e) {
          console.error("Failed to parse correct answer JSON", e);
        }

        setFormData({
          ...defaultForm,
          ...editData,
          options: editData.options || [],
          correct: parsedCorrect || editData.correct, // Use parsed array if successful
        });
      } else {
        setFormData({
          ...defaultForm,
          quiz_id: quizzes.length > 0 ? quizzes[0].ID : "",
        });
      }
    }
  }, [isOpen, editData, quizzes]);

  if (!isOpen) return null;

  const handleOptionChange = (idx, val) => {
    const newOpts = [...formData.options];
    newOpts[idx] = val;
    setFormData({ ...formData, options: newOpts });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (idx) => {
    const newOpts = formData.options.filter((_, i) => i !== idx);
    setFormData({ ...formData, options: newOpts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        quiz_id: parseInt(formData.quiz_id),
        question: formData.question,
        type: formData.type,
        difficulty: parseFloat(formData.difficulty || 0.5),
        correct:
          formData.type === "multi_select" && Array.isArray(formData.correct)
            ? JSON.stringify(formData.correct)
            : formData.correct,
        options:
          formData.type === "mcq" || formData.type === "multi_select"
            ? formData.options
            : [],
        hint: formData.hint || "",
      };

      if (editData) await contentService.updateQuestion(editData.ID, payload);
      else await contentService.createQuestion(payload);

      toast.success("Question saved");
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">
            {editData ? "Edit" : "Create"} Question
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Quiz
              </label>
              <select
                value={formData.quiz_id}
                onChange={(e) =>
                  setFormData({ ...formData, quiz_id: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                required
              >
                <option value="">Select Quiz</option>
                {quizzes.map((q) => (
                  <option key={q.ID} value={q.ID}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="multi_select">Multi Select</option>
                <option value="short_answer">Short Answer</option>
                <option value="boolean">True/False</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Difficulty
            </label>
            <select
              value={
                formData.difficulty <= 0.3
                  ? "easy"
                  : formData.difficulty <= 0.7
                    ? "medium"
                    : "hard"
              }
              onChange={(e) => {
                const val = e.target.value;
                // Map string back to float approximation
                const numVal =
                  val === "easy" ? 0.2 : val === "medium" ? 0.5 : 0.8;
                setFormData({ ...formData, difficulty: numVal });
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Question Text
            </label>
            <textarea
              rows={3}
              required
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900"
              placeholder="Enter the question here..."
            />
          </div>

          {(formData.type === "mcq" || formData.type === "multi_select") && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">
                  Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900"
                    placeholder={`Option ${idx + 1}`}
                    required
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Correct Answer
            </label>
            {formData.type === "boolean" ? (
              <select
                value={formData.correct}
                onChange={(e) =>
                  setFormData({ ...formData, correct: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              >
                <option value="">Select Correct Answer</option>
                <option value="Benar">True/Benar</option>
                <option value="Salah">False/Salah</option>
              </select>
            ) : formData.type === "mcq" ? (
              <select
                value={formData.correct}
                onChange={(e) =>
                  setFormData({ ...formData, correct: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              >
                <option value="">Select Correct Option</option>
                {formData.options.map((opt, idx) => (
                  <option key={idx} value={opt || `Option ${idx}`}>
                    {opt || `Option ${idx + 1}`}
                  </option>
                ))}
              </select>
            ) : formData.type === "multi_select" ? (
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-2">
                  Select all correct options:
                </p>
                {formData.options.map((opt, idx) => {
                  const currentCorrect = Array.isArray(formData.correct)
                    ? formData.correct
                    : [];
                  const isChecked = currentCorrect.includes(opt);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let newCorrect;
                          if (e.target.checked) {
                            newCorrect = [...currentCorrect, opt];
                          } else {
                            newCorrect = currentCorrect.filter(
                              (c) => c !== opt,
                            );
                          }
                          setFormData({ ...formData, correct: newCorrect });
                        }}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm text-slate-700">
                        {opt || `Option ${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                required
                value={formData.correct}
                onChange={(e) =>
                  setFormData({ ...formData, correct: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                placeholder="Exact answer text"
              />
            )}
            <p className="text-xs text-slate-400 mt-1">
              {formData.type === "multi_select"
                ? "Select all that apply."
                : "For MCQ/Boolean, ensure the value matches one option exactly."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={formData.hint || ""}
              onChange={(e) =>
                setFormData({ ...formData, hint: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              placeholder="Helpful hint for students..."
            />
          </div>
        </form>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Save Question"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
