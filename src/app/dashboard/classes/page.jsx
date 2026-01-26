"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { classService } from "@/services/classService";
import {
  Loader2,
  Plus,
  Users,
  Search,
  School,
  Trash,
  BookOpen,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateClassModal from "@/components/classes/CreateClassModal";
import ManageMembersModal from "@/components/classes/ManageMembersModal";
import api from "@/services/api";

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memberModalData, setMemberModalData] = useState(null);
  const [assignModalData, setAssignModalData] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getAllClasses();
      setClasses(res.data?.data || []);
    } catch (error) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.data) setCurrentUserRole(res.data.data.role);
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (id, name) => {
    // Is there a delete endpoint?
    // router.go says: classroomAdmin.Delete("/:id/members/:studentId")
    // But does it have DeleteClassroom?
    // I saw DeleteClassroom at line 297 in adminController or classroomController?
    // Let's assume it exists or I might haven't added it to service?
    // I checked service, I didn't add deleteClass there.
    // I'll skip delete for now or check service again.
    // Wait, router.go has: classroomAdmin.Delete("/:id/members/...")
    // I don't see a general DELETE /admin/classrooms/:id in the router snippet I read earlier...
    // wait line 301 in classroomController was DeleteClassroom but was it registered in router?
    // Re-reading router (step 2831)... "classroomAdmin" group has /, /:id (Get), /members (Post), /:id/members/:std (Del), /assignments/:id (Del).
    // It DOES NOT have Delete Classroom registered!
    // So I will just omit Delete button for now to avoid error.
    toast.error("Delete not supported yet");
  };

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const canAssign = ["admin", "supervisor"].includes(currentUserRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Class Management
          </h1>
          <p className="text-slate-500">Manage classrooms and assignments.</p>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by class name or code..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((cls) => (
            <div
              key={cls.ID}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow relative"
            >

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {cls.name}
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded mt-1 inline-block">
                    {cls.code}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <School size={20} />
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <p className="flex justify-between">
                  <span>Instructor:</span>
                  <span className="font-bold text-slate-700">
                    {cls.teacher?.name || cls.admin?.name || "N/A"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Students:</span>
                  <span className="font-bold text-slate-700">
                    {cls.members ? cls.members.length : 0}
                  </span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => router.push(`/dashboard/classes/${cls.ID}`)}
                  className="flex-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors"
                >
                  <BookOpen size={16} /> Open Class
                </button>
                <div className="w-px bg-slate-200"></div>
                <button
                  onClick={() => setMemberModalData(cls)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 font-bold text-sm transition-colors"
                  title="Quick Manage Members"
                >
                  <Users size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            No classes found.
          </div>
        )}
      </div>

      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchClasses}
      />

      <ManageMembersModal
        isOpen={!!memberModalData}
        classData={memberModalData}
        onClose={() => setMemberModalData(null)}
      />

      
    </div>
  );
}
