"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import {
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import CreateUserModal from "@/components/users/CreateUserModal";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      if (res.data && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanToggle = async (user) => {
    if (
      !confirm(
        `Are you sure you want to ${user.is_banned ? "unban" : "ban"} ${user.username}?`,
      )
    )
      return;

    try {
      if (user.is_banned) {
        await userService.unbanUser(user.id);
        toast.success("User unbanned");
      } else {
        await userService.banUser(user.id);
        toast.success("User banned");
      }
      fetchUsers();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role_name === roleFilter; // Backend might return 'role_name' or similar, strict check needed later
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">
            Manage students, instructors, and system admins.
          </p>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by username or name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Student</option>
          <option value="pengajar">Instructor</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-sm text-slate-400">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                        ${
                                          u.role_name === "supervisor"
                                            ? "bg-purple-100 text-purple-700"
                                            : u.role_name === "admin"
                                              ? "bg-blue-100 text-blue-700"
                                              : u.role_name === "pengajar"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-green-100 text-green-700"
                                        }
                                    `}
                        >
                          {u.role_name || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_banned ? (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
                            <ShieldAlert size={14} /> BANNED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                            <ShieldCheck size={14} /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleBanToggle(u)}
                          className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${u.is_banned ? "text-green-600" : "text-red-500"}`}
                          title={u.is_banned ? "Unban User" : "Ban User"}
                        >
                          {u.is_banned ? (
                            <ShieldCheck size={18} />
                          ) : (
                            <ShieldAlert size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CreateUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
