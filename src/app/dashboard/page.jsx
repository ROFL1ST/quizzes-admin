"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import {
  Users,
  BookOpen,
  FileCheck,
  Target,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getAnalytics();
        if (res.data && res.data.data) {
          setData(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // Fallback if data is empty (API not ready)
  const stats = data
    ? [
        {
          label: "Total Users",
          value: data.total_users,
          icon: Users,
          color: "bg-blue-500",
        },
        {
          label: "Active Quizzes",
          value: data.total_quizzes,
          icon: BookOpen,
          color: "bg-indigo-500",
        },
        {
          label: "Total Questions",
          value: data.total_questions,
          icon: FileCheck,
          color: "bg-green-500",
        },
        {
          label: "Avg Score",
          value: `${data.average_score ? data.average_score.toFixed(1) : "0"}%`,
          icon: Target,
          color: "bg-orange-500",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Overview
        </h1>
        <p className="text-slate-500">
          Welcome back, {user.name}. Here is what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`p-4 rounded-xl text-white shadow-lg shadow-indigo-100 ${stat.color}`}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart (Weekly Stats) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                Activity Trends (7 Days)
              </h3>
              <p className="text-sm text-slate-400">
                Number of quiz attempts per day
              </p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2">
            {data?.weekly_stats?.length > 0 ? (
              data.weekly_stats.map((day, i) => {
                // Normalize height (assuming max 20 for scaling or find max)
                const maxVal = Math.max(
                  ...data.weekly_stats.map((d) => d.count),
                  1,
                );
                const heightPct = (day.count / maxVal) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-full bg-indigo-100 rounded-t-lg relative group-hover:bg-indigo-200 transition-all"
                      style={{ height: `${heightPct}%`, minHeight: "4px" }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                        {day.count}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium truncate w-full text-center">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                No activity data available
              </div>
            )}
          </div>
        </div>

        {/* Hardest Questions / Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Hardest Questions
          </h3>
          <div className="space-y-4">
            {data?.hardest_questions?.length > 0 ? (
              data.hardest_questions.map((q, i) => (
                <div
                  key={i}
                  className="pb-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <p
                    className="text-sm font-medium text-slate-700 line-clamp-2"
                    title={q.question_text}
                  >
                    {q.question_text}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-red-500 font-bold">
                      {q.incorrect} Incorrect
                    </span>
                    <span className="text-green-500">{q.correct} Correct</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No data yet.</p>
            )}
          </div>
          <button className="w-full mt-4 text-sm text-indigo-600 font-bold hover:underline">
            View All Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
