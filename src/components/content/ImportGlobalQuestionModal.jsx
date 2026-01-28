"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, X, Check, Globe } from "lucide-react";
import { contentService } from "@/services/contentService";
import toast from "react-hot-toast";

export default function ImportGlobalQuestionModal({
  isOpen,
  onClose,
  targetQuizID,
  onSuccess,
}) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTopics();
      // Reset state
      setSelectedTopic("");
      setQuestions([]);
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions(selectedTopic);
    } else {
      setQuestions([]);
    }
  }, [selectedTopic]);

  const loadTopics = async () => {
    try {
      const res = await contentService.getAllTopics(1, 100);
      setTopics(res.data?.data || []);
      if (res.data?.data?.length > 0) {
        setSelectedTopic(res.data.data[0].slug); // Auto select first
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestions = async (topicSlug) => {
    setLoadingQuestions(true);
    try {
      // We need to fetch quizzes by topic first, then questions?
      // Or search questions by key?
      // Actually `getAllQuestions` filters by QuizID.
      // We don't have a direct "Get Questions by Topic" endpoint.
      // But we can GetQuizzes by Topic -> Then Get Questions.
      // This is a bit complex.
      // PROPOSAL: Use `only_global=true` on GetQuizzes, then let user select a Quiz, then show questions.
    } catch (err) {}
    // Let's change UI: Select Quiz (Global) -> Select Questions.
    setLoadingQuestions(false);
  };

  // REVISED LOGIC: Select Global Quiz -> Select Questions
  const [globalQuizzes, setGlobalQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");

  const loadGlobalQuizzes = async () => {
    setLoading(true);
    try {
      const res = await contentService.getAllQuizzes(1, 100, {
        only_global: true,
      });
      setGlobalQuizzes(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load global quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadGlobalQuizzes();
  }, [isOpen]);

  useEffect(() => {
    if (selectedQuizId) {
      setLoadingQuestions(true);
      contentService
        .getAllQuestions(1, 1000, selectedQuizId)
        .then((res) => setQuestions(res.data?.data || []))
        .catch(() => toast.error("Failed to load questions"))
        .finally(() => setLoadingQuestions(false));
    } else {
      setQuestions([]);
    }
  }, [selectedQuizId]);

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.ID)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    setImporting(true);
    try {
      await contentService.copyQuestions({
        target_quiz_id: parseInt(targetQuizID),
        question_ids: Array.from(selectedIds),
      });
      toast.success(`Imported ${selectedIds.size} questions!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Globe className="text-blue-500" />
              Import from Global Quiz
            </h3>
            <p className="text-slate-500 text-sm">
              Select questions to copy to your class quiz.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-white border-b border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Source Global Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
          >
            <option value="">-- Select a Global Quiz --</option>
            {globalQuizzes.map((q) => (
              <option key={q.ID} value={q.ID}>
                {q.title} ({q.Topic?.title})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {loadingQuestions ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              {selectedQuizId
                ? "No questions in this quiz."
                : "Please select a quiz first."}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <p className="text-sm font-bold text-slate-500">
                  {selectedIds.size} Selected
                </p>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 font-bold hover:underline"
                >
                  {selectedIds.size === questions.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              {questions.map((q) => (
                <div
                  key={q.ID}
                  onClick={() => toggleSelection(q.ID)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-3 items-start ${
                    selectedIds.has(q.ID)
                      ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedIds.has(q.ID)
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selectedIds.has(q.ID) && <Check size={12} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{q.question}</p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      {q.type} • {q.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || selectedIds.size === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {importing ? <Loader2 className="animate-spin" size={18} /> : null}
            Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
