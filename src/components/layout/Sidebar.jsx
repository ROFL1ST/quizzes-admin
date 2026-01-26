"use client";

import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ShieldCheck,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const menus = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["supervisor", "admin", "pengajar"],
    },
    {
      label: "User Management",
      href: "/dashboard/users",
      icon: Users,
      roles: ["supervisor"],
    },
    {
      label: "Classes",
      href: "/dashboard/classes",
      icon: GraduationCap,
      roles: ["pengajar", "admin", "supervisor"],
    },
    {
      label: "Quizzes",
      href: "/dashboard/quizzes",
      icon: BookOpen,
      roles: ["pengajar", "admin", "supervisor"],
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["admin", "supervisor"],
    },
    {
      label: "System Health",
      href: "/dashboard/system",
      icon: ShieldCheck,
      roles: ["admin", "supervisor"],
    },
    // {
    //   label: "Settings",
    //   href: "/dashboard/settings",
    //   icon: Settings,
    //   roles: ["supervisor", "admin", "pengajar"],
    // },
  ];

  const filteredMenus = menus.filter((menu) => menu.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
          <ShieldCheck className="text-indigo-500" />
          ADMIN
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
          {user.role === "pengajar" ? "Instructor" : user.role} Panel
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenus.map((menu) => {
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <menu.icon size={20} />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate">{user.username}</h4>
            <p className="text-[10px] text-slate-400 uppercase">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2.5 rounded-lg transition-colors text-sm font-bold"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
