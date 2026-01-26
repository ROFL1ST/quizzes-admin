"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Shield, User, Lock } from "lucide-react";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role_id: "2", // Default to Pengajar/Instructor usually
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch roles for dropdown
      userService
        .getAllRoles()
        .then((res) => {
          if (res.data && res.data.data) setRoles(res.data.data);
        })
        .catch((err) => console.error("Failed to load roles"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.createAdmin({
        ...formData,
        role_id: parseInt(formData.role_id),
      });
      toast.success("User created successfully");
      onSuccess();
      onClose();
      setFormData({ name: "", username: "", password: "", role_id: "2" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Create New User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. John Doe"
              />
              <User
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. johndoe"
              />
              <User
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
              <Lock
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Role
            </label>
            <div className="relative">
              <select
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({ ...formData, role_id: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.ID} value={r.ID}>
                      {r.Name.toUpperCase()}
                    </option>
                  ))
                ) : (
                  <option value="2">Loading roles...</option>
                )}
              </select>
              <Shield
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
