"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import {
  FileCheck,
  Loader2,
  Server,
  Database,
  BrainCircuit,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      const healthRes = await dashboardService.getSystemHealth();
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (healthRes.data && healthRes.data.data) {
        // Override Backend Latency with Real RTT
        const mappedData = healthRes.data.data.map((item) => {
          if (item.name.includes("Backend")) {
            return { ...item, latency: `${latencyMs}ms` };
          }
          return item;
        });
        setHealthData(mappedData);
      }
      setLastUpdated(new Date());
    } catch (error) {
      toast.error("Failed to load system health status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (name) => {
    if (name.toLowerCase().includes("database"))
      return <Database className="text-white" size={24} />;
    if (name.toLowerCase().includes("ai"))
      return <BrainCircuit className="text-white" size={24} />;
    return <Server className="text-white" size={24} />;
  };

  const getGradient = (name) => {
    if (name.toLowerCase().includes("database"))
      return "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-200";
    if (name.toLowerCase().includes("ai"))
      return "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-200";
    return "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Activity size={24} />
            </span>
            System Health
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Realtime infrastructure monitoring & status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Update: 30s
          </span>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Now"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !healthData
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-48"
              />
            ))
          : healthData?.map((service, i) => (
              <div
                key={i}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110 origin-top-right" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${getGradient(
                        service.name,
                      )}`}
                    >
                      {getIcon(service.name)}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                        service.status === "online"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {service.status === "online" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {service.status}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
                    {service.name}
                  </h3>

                  {service.message ? (
                    <p className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md inline-block mt-2">
                      {service.message}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">
                      Operational
                    </p>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Latency
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-700">
                      {service.latency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="flex justify-center mt-8">
        <p className="text-xs text-slate-300 font-medium">
          Last updated: {lastUpdated.toLocaleTimeString()} • Server v2.2.0
        </p>
      </div>
    </div>
  );
}
