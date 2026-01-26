"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <h2 className="text-lg font-bold text-slate-700">
        Welcome back, {user?.username}
      </h2>
      <div className="text-sm font-medium text-slate-500">
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </header>
  );
}
