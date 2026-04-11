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
  Activity,
  HelpCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`p-4 rounded-xl text-white shadow-lg ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">{value ?? "—"}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Weekly Bar Chart ──────────────────────────────────────────────
function WeeklyBarChart({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="h-52 flex items-center justify-center text-slate-300 italic text-sm">
        No activity data available
      </div>
    );

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="h-52 flex items-end justify-between gap-2 pt-4">
      {data.map((day, i) => {
        const heightPct = Math.max((day.count / maxVal) * 100, 3);
        const label = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
        const dateLabel = new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {day.count}
            </span>
            <div
              className="w-full bg-indigo-100 group-hover:bg-indigo-400 rounded-t-lg transition-all duration-300"
              style={{ height: `${heightPct * 1.8}px`, minHeight: "6px" }}
            />
            <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
            <span className="text-[9px] text-slate-300 hidden group-hover:block">{dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Topic Distribution ────────────────────────────────────────────
function TopicDistribution({ data }) {
  if (!data || data.length === 0)
    return <p className="text-slate-300 text-sm italic text-center py-8">No topic data</p>;

  const total = data.reduce((s, t) => s + t.value, 0);
  const COLORS = ["bg-indigo-500", "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
  const BAR_COLORS = ["bg-indigo-400", "bg-violet-400", "bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((t, i) => {
        const pct = total > 0 ? ((t.value / total) * 100).toFixed(1) : 0;
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COLORS[i % COLORS.length]}`} />
                <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">{t.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{t.value} quizzes</span>
                <span className="text-xs font-bold text-slate-600 w-10 text-right">{pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Hardest Question Card ─────────────────────────────────────────
function HardestQuestionCard({ q, rank }) {
  const total = q.correct + q.incorrect;
  const incorrectPct = total > 0 ? Math.round((q.incorrect / total) * 100) : 0;
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 line-clamp-2">{q.question_text}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-red-500 font-bold">✗ {q.incorrect}</span>
          <span className="text-xs text-green-500 font-bold">✓ {q.correct}</span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: `${incorrectPct}%` }} />
          </div>
          <span className="text-xs text-slate-400">{incorrectPct}% fail</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getAnalytics();
        if (res.data?.data) setData(res.data.data);
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">
          Welcome back, <span className="font-semibold text-slate-700">{user.name || user.username}</span>. Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Total Users" value={data?.total_users?.toLocaleString()} icon={Users} color="bg-blue-500 shadow-blue-200" />
        <StatCard label="Active Users (7d)" value={data?.active_users?.toLocaleString()} icon={Activity} color="bg-emerald-500 shadow-emerald-200" sub="Unique users who played a quiz" />
        <StatCard label="Total Quizzes" value={data?.total_quizzes?.toLocaleString()} icon={BookOpen} color="bg-indigo-500 shadow-indigo-200" />
        <StatCard label="Total Questions" value={data?.total_questions?.toLocaleString()} icon={HelpCircle} color="bg-violet-500 shadow-violet-200" />
        <StatCard label="Total Attempts" value={data?.total_attempts?.toLocaleString()} icon={Zap} color="bg-amber-500 shadow-amber-200" />
        <StatCard
          label="Avg Score"
          value={data?.average_score != null ? `${data.average_score.toFixed(1)}%` : "—"}
          icon={Target}
          color="bg-rose-500 shadow-rose-200"
          sub="Across all quiz attempts"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" />
                Quiz Attempts — Last 7 Days
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Number of quiz completions per day</p>
            </div>
            {data?.weekly_stats?.length > 0 && (
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full">
                Total: {data.weekly_stats.reduce((s, d) => s + d.count, 0)}
              </span>
            )}
          </div>
          <WeeklyBarChart data={data?.weekly_stats} />
        </div>

        {/* Topic Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-violet-500" />
            Quiz by Topic
          </h3>
          <TopicDistribution data={data?.topic_stats} />
        </div>
      </div>

      {/* Hardest Questions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Hardest Questions
          </h3>
          <span className="text-xs text-slate-400">Top 5 most failed questions</span>
        </div>
        {data?.hardest_questions?.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.hardest_questions.map((q, i) => (
              <HardestQuestionCard key={i} q={q} rank={i + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-300">
            <HelpCircle size={36} className="mx-auto mb-2" />
            <p className="text-sm italic">No question data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
