"use client";

import { useState, useEffect } from "react";
import { contentService } from "@/services/contentService";
import {
  Loader2,
  Plus,
  Edit,
  Trash,
  BookOpen,
  Layers,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import ManageContentModal from "@/components/content/ManageContentModal";
import ManageQuestionModal from "@/components/content/ManageQuestionModal";
import ImportPreviewModal from "@/components/content/ImportPreviewModal";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("topics");

  // Data States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Aux Data (for dropdowns)
  const [allTopics, setAllTopics] = useState([]); // Needed for creating quizzes
  const [allQuizzes, setAllQuizzes] = useState([]); // Needed for creating questions

  // Modals
  const [showContentModal, setShowContentModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch Aux Data once
  useEffect(() => {
    contentService
      .getAllTopics(1, 100)
      .then((res) => setAllTopics(res.data?.data || []))
      .catch(() => {});
    contentService
      .getAllQuizzes(1, 100)
      .then((res) => setAllQuizzes(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Fetch Main Data on changes
  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "topics") {
        res = await contentService.getAllTopics(page, limit);
      } else if (activeTab === "quizzes") {
        res = await contentService.getAllQuizzes(page, limit);
      } else {
        res = await contentService.getAllQuestions(page, limit);
      }

      if (res.data) {
        setData(res.data.data || []);
        // Backend returns { meta: { current_page, page_size, total_items, total_pages } }
        if (res.data.meta) {
          const meta = res.data.meta;
          setTotalPages(meta.total_pages || 1);
          setTotalItems(meta.total_items || 0);
        } else {
          setTotalPages(1);
          setTotalItems(res.data.data?.length || 0);
        }
      }
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      if (activeTab === "topics")
        await contentService.deleteTopic(id); // Slug
      else if (activeTab === "quizzes") await contentService.deleteQuiz(id);
      else await contentService.deleteQuestion(id);

      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleOpenModal = (item = null) => {
    setEditData(item);
    if (activeTab === "questions") {
      setShowQuestionModal(true);
    } else {
      setShowContentModal(true);
    }
  };

  const handleDownloadTemplate = () => {
    import("@/lib/csvUtils").then((mod) => mod.downloadCSVTemplate());
  };

  const [importing, setImporting] = useState(false);

  const [previewData, setPreviewData] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const { parseCSV } = await import("@/lib/csvUtils");

    parseCSV(file, async (rows) => {
      if (!rows || rows.length === 0) {
        toast.error("Empty CSV");
        setImporting(false);
        e.target.value = null;
        return;
      }

      // Check duplicates again if needed, or do it during preview?
      // User said "ada preview data nya ada apa aja sebelum di upload"
      // Let's filter first then show preview logic.

      let existingQuestions = new Set();
      try {
        const allQ = await contentService.getAllQuestions(1, 1000);
        if (allQ.data && allQ.data.data) {
          allQ.data.data.forEach((q) =>
            existingQuestions.add(q.question.toLowerCase().trim()),
          );
        }
      } catch (err) {}

      // Filter Rows
      const newRows = rows.filter(
        (r) =>
          r.question && !existingQuestions.has(r.question.toLowerCase().trim()),
      );

      if (newRows.length === 0) {
        toast.success("No new questions found (all duplicates).");
        setImporting(false);
        e.target.value = null;
        return;
      }

      setPreviewData(newRows);
      setShowPreviewModal(true);
      setImporting(false);
      e.target.value = null;
    });
  };

  const handleConfirmImport = async (quizId, rowsToImport) => {
    // Logic to actually import
    // Convert rows back to CSV and upload
    try {
      // Construct CSV
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
      fd.append("quiz_id", quizId); // Use selected quizId

      await contentService.bulkCreateQuestions(fd);

      toast.success(`Successfully imported ${rowsToImport.length} questions`);
      setShowPreviewModal(false);
      setPreviewData([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {activeTab} Management
          </h1>
          <p className="text-slate-500">Manage your {activeTab}.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            id="csvInput"
            className="hidden"
            onChange={handleImportCSV}
          />
          {activeTab === "questions" && (
            <>
              <button
                onClick={handleDownloadTemplate}
                className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <Download size={18} /> Template
              </button>
              <button
                onClick={() => document.getElementById("csvInput").click()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-colors"
              >
                {importing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Upload size={18} />
                )}
                Import CSV
              </button>
            </>
          )}
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-colors"
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} />
            Create New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: "topics", label: "Topics", icon: Layers },
          { id: "quizzes", label: "Quizzes", icon: BookOpen },
          { id: "questions", label: "Questions", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  {activeTab === "topics" && (
                    <>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Slug</th>
                    </>
                  )}
                  {activeTab === "quizzes" && (
                    <>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Topic</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}
                  {activeTab === "questions" && (
                    <>
                      <th className="px-6 py-4">Question</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Quiz</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={item.ID || item.slug}
                      className="hover:bg-slate-50"
                    >
                      {activeTab === "topics" && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-500">
                            {item.slug}
                          </td>
                        </>
                      )}
                      {activeTab === "quizzes" && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {item.title}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">
                              {item.Topic?.title || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                item.status === "published"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.status || "Draft"}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === "questions" && (
                        <>
                          <td
                            className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate"
                            title={item.question}
                          >
                            {item.question}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 capitalize">
                            {(item.type || "").replace("_", " ")}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                            {item.difficulty <= 0.3
                              ? "Easy"
                              : item.difficulty <= 0.7
                                ? "Medium"
                                : "Hard"}{" "}
                            ({item.difficulty})
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {item.quiz?.title || "Unknown"}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              activeTab === "topics" ? item.slug : item.ID,
                              item.title || item.question,
                            )
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages} ({totalItems} items)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ManageContentModal
        isOpen={showContentModal}
        onClose={() => {
          setShowContentModal(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        type={activeTab === "quizzes" ? "quiz" : "topic"}
        topics={allTopics}
        editData={editData}
      />

      <ManageQuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        quizzes={allQuizzes}
        editData={editData}
      />

      <ImportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmImport}
        data={previewData}
        quizzes={allQuizzes}
      />
    </div>
  );
}
