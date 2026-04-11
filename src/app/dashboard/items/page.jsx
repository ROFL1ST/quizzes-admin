"use client";

import { useState, useEffect } from "react";
import { itemService } from "@/services/itemService";
import {
  Loader2,
  Plus,
  Edit,
  Trash,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ManageItemModal from "@/components/content/ManageItemModal";

const TYPE_COLORS = {
  avatar: "bg-violet-100 text-violet-700",
  frame: "bg-amber-100 text-amber-700",
  background: "bg-sky-100 text-sky-700",
  badge: "bg-emerald-100 text-emerald-700",
};

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await itemService.getAll(page, limit);
      if (res.data) {
        setItems(res.data.data || []);
        const meta = res.data.meta;
        if (meta) {
          setTotalPages(meta.total_pages || 1);
          setTotalItems(meta.total_items || 0);
        }
      }
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete item "${name}"? This cannot be undone.`)) return;
    try {
      await itemService.delete(id);
      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await itemService.update(item.ID, { ...item, is_active: !item.is_active });
      toast.success(`Item ${!item.is_active ? "activated" : "deactivated"}`);
      fetchItems();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleOpenModal = (item = null) => {
    setEditData(item);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <ShoppingBag className="text-indigo-500" size={28} />
            Shop Items
          </h1>
          <p className="text-slate-500 mt-1">
            Manage items available in the user shop. ({totalItems} total)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-colors"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.ID} className="hover:bg-slate-50 transition-colors">
                      {/* Preview */}
                      <td className="px-6 py-4">
                        {item.asset_url ? (
                          <img
                            src={item.asset_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ShoppingBag size={16} className="text-slate-400" />
                          </div>
                        )}
                      </td>

                      {/* Name & Description */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Type badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${TYPE_COLORS[item.type] || "bg-slate-100 text-slate-600"}`}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-600">
                          💰 {item.price.toLocaleString()}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="flex items-center gap-1.5 text-sm font-bold transition-colors"
                        >
                          {item.is_active ? (
                            <>
                              <ToggleRight size={22} className="text-emerald-500" />
                              <span className="text-emerald-600">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={22} className="text-slate-400" />
                              <span className="text-slate-400">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.ID, item.name)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <ShoppingBag size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No items found.</p>
                      <p className="text-sm mt-1">Create your first shop item!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages} ({totalItems} items)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ManageItemModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        onSuccess={fetchItems}
        editData={editData}
      />
    </div>
  );
}
