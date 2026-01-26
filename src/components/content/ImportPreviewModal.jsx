"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function ImportPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  data = [],
  quizzes = [],
}) {
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedQuizId) {
      alert("Please select a target Quiz.");
      return;
    }
    setLoading(true);
    await onConfirm(selectedQuizId, data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Preview Import Data
            </h3>
            <p className="text-sm text-slate-500">
              Review questions before importing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Quiz Selection */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
            <AlertCircle className="text-indigo-600" size={24} />
            <div className="flex-1">
              <label className="block text-sm font-bold text-indigo-900 mb-1">
                Target Quiz
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a Quiz --</option>
                {quizzes.map((q) => (
                  <option key={q.ID} value={q.ID}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Preview Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{idx + 1}</td>
                    <td
                      className="p-3 font-medium text-slate-800 max-w-xs truncate"
                      title={row.question}
                    >
                      {row.question}
                    </td>
                    <td className="p-3 capitalize">{row.type || "mcq"}</td>
                    <td className="p-3">
                      {row.difficulty <= 0.3
                        ? "Easy"
                        : row.difficulty <= 0.7
                          ? "Medium"
                          : "Hard"}
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">
                      {(row.options || "").replace(/\|/g, ", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 text-right">
            Total Questions: {data.length}
          </p>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedQuizId}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
}
