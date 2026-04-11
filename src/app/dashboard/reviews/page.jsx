"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import {
  Loader2,
  Star,
  Trash,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    let result = reviews;
    if (ratingFilter !== "all") result = result.filter((r) => r.rating === parseInt(ratingFilter));
    setFiltered(result);
    setPage(1);
  }, [ratingFilter, reviews]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReviews();
      setReviews(res.data?.data || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await adminService.deleteReview(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={26} />
          Quiz Reviews
        </h1>
        <p className="text-slate-500 mt-1">Monitor and moderate user reviews across all quizzes.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center">
          <p className="text-4xl font-black text-amber-500">{avgRating}</p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-xs text-slate-400 mt-1">Average Rating</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center">
          <p className="text-4xl font-black text-slate-800">{reviews.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Reviews</p>
        </div>
        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Rating Distribution</p>
          <div className="space-y-1.5">
            {ratingDist.map(({ star, count }) => {
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-slate-400" />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
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
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Quiz</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length > 0 ? (
                  paginated.map((r) => (
                    <tr key={r.ID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {(r.user?.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            {r.user?.username || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600 max-w-[140px] truncate">
                          {r.quiz?.title || `Quiz #${r.quiz_id}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StarRating rating={r.rating} />
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-sm text-slate-600 line-clamp-2 italic">
                          {r.comment || <span className="text-slate-300 not-italic">No comment</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(r.CreatedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(r.ID)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Star size={36} className="mx-auto mb-2 text-slate-200" />
                      <p>No reviews found.</p>
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
