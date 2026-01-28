"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash,
  Upload,
  Download,
  Globe,
  X,
  FileText,
} from "lucide-react";
import { contentService } from "@/services/contentService";
import toast from "react-hot-toast";
import ManageQuestionModal from "./ManageQuestionModal";
import ImportGlobalQuestionModal from "./ImportGlobalQuestionModal";
import ImportPreviewModal from "./ImportPreviewModal";

export default function QuizQuestionsManager({
  isOpen,
  onClose,
  quiz,
  onUpdate,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showGlobalImportModal, setShowGlobalImportModal] = useState(false);

  // CSV States
  const [importing, setImporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (isOpen && quiz) {
      setPage(1); // Reset to page 1 on open
    }
  }, [isOpen, quiz]);

  useEffect(() => {
    if (isOpen && quiz) {
      fetchQuestions();
    }
  }, [isOpen, quiz, page]); // Re-fetch on page change

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await contentService.getAllQuestions(page, limit, quiz.ID);
      setQuestions(res.data?.data || []);
      if (res.data?.meta) {
        setTotalItems(res.data.meta.total_items || 0);
        setTotalPages(res.data.meta.total_pages || 1);
      }
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await contentService.deleteQuestion(id);
      toast.success("Deleted");
      fetchQuestions();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // --- CSV Handlers ---
  const handleDownloadTemplate = () => {
    import("@/lib/csvUtils").then((mod) => mod.downloadCSVTemplate());
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const { parseCSV } = await import("@/lib/csvUtils");

    parseCSV(file, (rows) => {
      if (!rows || rows.length === 0) {
        toast.error("Empty CSV");
        setImporting(false);
        e.target.value = null;
        return;
      }
      setPreviewData(rows); // Showing all rows for simplicity, or could filter duplicates locally
      setShowPreviewModal(true);
      setImporting(false);
      e.target.value = null;
    });
  };

  const handleConfirmCSVImport = async (_, rowsToImport) => {
    try {
      // Reconstruct CSV
      const header = [
        "Question",
        "Type",
        "Options",
        "Correct",
        "Hint",
        "Difficulty",
      ];
      const Papa = (await import("papaparse")).default;

      const csvData = Papa.unparse([
        header,
        ...rowsToImport.map((row) => [
          row.question,
          row.type || "mcq",
          (row.options || "").replace(/\|/g, ","),
          row.correct,
          row.hint || "",
          row.difficulty || "0.5",
        ]),
      ]);

      const blob = new Blob([csvData], { type: "text/csv" });
      const fd = new FormData();
      fd.append("file", blob, "import.csv");
      fd.append("quiz_id", quiz.ID);

      await contentService.bulkCreateQuestions(fd);
      toast.success(`Imported ${rowsToImport.length} questions`);
      setShowPreviewModal(false);
      setPreviewData([]);
      fetchQuestions();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("CSV Import failed");
    }
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
              <FileText className="text-indigo-600" />
              Manage Questions
            </h3>
            <p className="text-slate-500 text-sm">
              Target: <span className="font-bold">{quiz.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditData(null);
                setShowCreateModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
            >
              <Plus size={16} /> Add Manual
            </button>
            <button
              onClick={() => setShowGlobalImportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
            >
              <Globe size={16} /> From Global
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              id="csvManagerInput"
              className="hidden"
              onChange={handleImportCSV}
            />
            <button
              onClick={handleDownloadTemplate}
              className="border border-slate-300 text-slate-600 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition"
            >
              <Download size={16} /> Template
            </button>
            <button
              onClick={() => document.getElementById("csvManagerInput").click()}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
            >
              {importing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Upload size={16} />
              )}
              Import CSV
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center p-10 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white">
              No questions yet. Add one via the toolbar!
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.ID}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start group hover:border-indigo-200 transition"
                >
                  <span className="bg-slate-100 text-slate-500 font-bold w-8 h-8 flex items-center justify-center rounded-lg text-sm shrink-0">
                    {(page - 1) * limit + idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 line-clamp-2">
                      {q.question}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize">
                        {q.type.replace("_", " ")}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-bold ${
                          q.difficulty <= 0.3
                            ? "bg-green-100 text-green-700"
                            : q.difficulty <= 0.7
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {q.difficulty <= 0.3
                          ? "Easy"
                          : q.difficulty <= 0.7
                            ? "Medium"
                            : "Hard"}{" "}
                        ({q.difficulty})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(q.ID)}
                    className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages} ({totalItems} items)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-bold text-slate-600"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-bold text-slate-600"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modals */}
        <ManageQuestionModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditData(null);
          }}
          onSuccess={() => {
            fetchQuestions();
            if (onUpdate) onUpdate();
          }}
          quizzes={[quiz]} // Lock to this quiz
          editData={editData}
        />

        <ImportGlobalQuestionModal
          isOpen={showGlobalImportModal}
          onClose={() => setShowGlobalImportModal(false)}
          targetQuizID={quiz.ID}
          onSuccess={() => {
            fetchQuestions();
            if (onUpdate) onUpdate();
          }}
        />

        <ImportPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleConfirmCSVImport}
          data={previewData}
          quizzes={[quiz]} // Context is just this quiz
        />
      </div>
    </div>
  );
}
