"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import { adminService } from "@/services/adminService";
import {
  Loader2,
  Server,
  Database,
  BrainCircuit,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Megaphone,
  SlidersHorizontal,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

// ── System Health Cards ───────────────────────────────────────────
function HealthSection({ healthData, loading, onRefresh, lastUpdated }) {
  const getIcon = (name) => {
    if (name.toLowerCase().includes("database")) return <Database className="text-white" size={24} />;
    if (name.toLowerCase().includes("ai")) return <BrainCircuit className="text-white" size={24} />;
    return <Server className="text-white" size={24} />;
  };

  const getGradient = (name) => {
    if (name.toLowerCase().includes("database")) return "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-200";
    if (name.toLowerCase().includes("ai")) return "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-200";
    return "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-indigo-500" />
          Infrastructure Status
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live · 30s
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && !healthData
          ? [1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-44" />
            ))
          : healthData?.map((service, i) => (
              <div
                key={i}
                className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 rounded-bl-[80px] -z-0 transition-transform group-hover:scale-110 origin-top-right" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getGradient(service.name)}`}>
                      {getIcon(service.name)}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${service.status === "online" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                      {service.status === "online" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {service.status}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{service.name}</h3>
                  <p className="text-xs text-slate-400">{service.message || "Operational"}</p>
                  <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Latency</span>
                    <span className="text-sm font-mono font-bold text-slate-700">{service.latency}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>
      <p className="text-xs text-slate-300 text-center">Last updated: {lastUpdated.toLocaleTimeString()}</p>
    </div>
  );
}

// ── Broadcast Section ─────────────────────────────────────────────
function BroadcastSection() {
  const [form, setForm] = useState({ title: "", content: "", type: "info" });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error("Title and content are required");
    setSending(true);
    try {
      await adminService.broadcast(form);
      toast.success("Announcement broadcast sent!");
      setForm({ title: "", content: "", type: "info" });
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const TYPE_COLORS = {
    info:    "border-blue-300 bg-blue-50",
    warning: "border-amber-300 bg-amber-50",
    success: "border-emerald-300 bg-emerald-50",
    error:   "border-red-300 bg-red-50",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Megaphone size={20} className="text-indigo-500" />
          Broadcast Announcement
        </h2>
        <p className="text-sm text-slate-400 mt-1">Send a system-wide notification to all active users.</p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error / Alert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your announcement..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Preview */}
        {(form.title || form.content) && (
          <div className={`border-l-4 rounded-r-xl p-3 ${TYPE_COLORS[form.type]}`}>
            <p className="text-xs font-black uppercase text-slate-500">{form.type} preview</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{form.title || "..."}</p>
            <p className="text-xs text-slate-500 mt-0.5">{form.content || "..."}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Send Broadcast
        </button>
      </form>
    </div>
  );
}

// ── Leveling Config Section ───────────────────────────────────────
function LevelingConfigSection() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getLevelingConfig()
      .then((res) => setValue(res.data?.data?.value || "100"))
      .catch(() => setValue("100"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!value || isNaN(Number(value))) return toast.error("Must be a valid number");
    setSaving(true);
    try {
      await adminService.updateLevelingConfig(value);
      toast.success("Leveling config updated!");
    } catch {
      toast.error("Failed to update config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-violet-500" />
          Leveling Config
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Adjust the XP factor required to level up. Higher value = harder to level up.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading config...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Leveling Factor (XP per level)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-40 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-violet-200"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Current: Level N requires <strong>{value} × N</strong> XP to unlock.
          </p>
        </form>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      const healthRes = await dashboardService.getSystemHealth();
      const latencyMs = Math.round(performance.now() - startTime);

      if (healthRes.data?.data) {
        const mapped = healthRes.data.data.map((item) =>
          item.name.includes("Backend") ? { ...item, latency: `${latencyMs}ms` } : item
        );
        setHealthData(mapped);
      }
      setLastUpdated(new Date());
    } catch {
      toast.error("Failed to load system health");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Activity size={22} />
          </span>
          System
        </h1>
        <p className="text-slate-500 mt-1">Infrastructure monitoring, broadcasting, and configuration.</p>
      </div>

      {/* Health */}
      <HealthSection
        healthData={healthData}
        loading={loading}
        onRefresh={fetchHealth}
        lastUpdated={lastUpdated}
      />

      {/* Broadcast + Config side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BroadcastSection />
        <LevelingConfigSection />
      </div>
    </div>
  );
}
