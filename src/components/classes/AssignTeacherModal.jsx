"use client";

import { useState, useEffect } from "react";
import { Loader2, X, UserCheck } from "lucide-react";
import { classService } from "@/services/classService";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";

export default function AssignTeacherModal({
  isOpen,
  onClose,
  classData,
  onSuccess,
}) {
  const [instructors, setInstructors] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch all staff and filter for instructors
      userService
        .getAllAdmins()
        .then((res) => {
          if (res.data?.data) {
            // Filter logic: assume role "pengajar"
            const allStaff = res.data.data;
            const teachers = allStaff.filter(
              (u) => u.role?.name?.toLowerCase() === "pengajar",
            );
            setInstructors(teachers);
          }
        })
        .catch(() => toast.error("Failed to load instructors"));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await classService.assignTeacher(classData.ID, selectedUsername);
      toast.success("Teacher assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Assign Instructor
            </h3>
            <p className="text-sm text-slate-500">{classData?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Select Instructor
            </label>
            <div className="relative">
              <select
                required
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 appearance-none"
              >
                <option value="">-- Choose Instructor --</option>
                {instructors.map((u) => (
                  <option key={u.ID} value={u.username}>
                    {u.name} (@{u.username})
                  </option>
                ))}
              </select>
              <UserCheck
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
            </div>
          </div>

          <button
            disabled={loading || !selectedUsername}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Assign"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
