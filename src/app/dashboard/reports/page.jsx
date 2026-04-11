"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import {
  Loader2,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-amber-100 text-amber-700",   icon: Clock },
  resolved:  { label: "Resolved",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", color: "bg-slate-100 text-slate-500",   icon: XCircle },
};

const TYPE_COLOR = {
  user:     "bg-blue-100 text-blue-700",
  question: "bg-violet-100 text-violet-700",
  quiz:     "bg-orange-100 text-orange-700",
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let result = reports;
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    if (typeFilter !== "all") result = result.filter((r) => r.target_type === typeFilter);
    setFiltered(result);
    setPage(1);
  }, [statusFilter, typeFilter, reports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports();
      setReports(res.data?.data || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, status) => {
    try {
      await adminService.resolveReport(id, status);
      toast.success(`Report marked as ${status}`);
      fetchReports();
    } catch {
      toast.error("Failed to update report");
    }
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Flag className="text-red-500" size={26} />
            Reports
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Review and moderate user-submitted reports.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-slate-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Types</option>
          <option value="user">User</option>
          <option value="question">Question</option>
          <option value="quiz">Quiz</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length > 0 ? (
                  paginated.map((r) => {
                    const statusInfo = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={r.ID} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-700 text-sm">
                              {r.reporter?.username || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400">#{r.reporter_id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${TYPE_COLOR[r.target_type] || "bg-slate-100 text-slate-600"}`}>
                            {r.target_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-[160px]">
                          <p className="text-sm text-slate-600 truncate" title={r.target_detail}>
                            {r.target_detail || `#${r.target_id}`}
                          </p>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <p className="text-sm text-slate-600 line-clamp-2" title={r.reason}>
                            {r.reason || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(r.CreatedAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          {r.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleResolve(r.ID, "resolved")}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                <CheckCircle2 size={13} /> Resolve
                              </button>
                              <button
                                onClick={() => handleResolve(r.ID, "dismissed")}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                              >
                                <XCircle size={13} /> Dismiss
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <Flag size={36} className="mx-auto mb-2 text-slate-200" />
                      <p>No reports found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages || 1} ({filtered.length} items)
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
