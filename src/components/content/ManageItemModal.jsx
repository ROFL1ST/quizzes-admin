"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { itemService } from "@/services/itemService";
import toast from "react-hot-toast";

const ITEM_TYPES = ["avatar", "frame", "background", "badge"];

export default function ManageItemModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    type: "avatar",
    asset_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        description: editData.description || "",
        price: editData.price || 0,
        type: editData.type || "avatar",
        asset_url: editData.asset_url || "",
        is_active: editData.is_active ?? true,
      });
    } else {
      setForm({ name: "", description: "", price: 0, type: "avatar", asset_url: "", is_active: true });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.asset_url.trim()) return toast.error("Asset URL is required");

    setLoading(true);
    try {
      if (editData) {
        await itemService.update(editData.ID, form);
        toast.success("Item updated!");
      } else {
        await itemService.create(form);
        toast.success("Item created!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {editData ? "Edit Item" : "Create New Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Preview */}
          {form.asset_url && (
            <div className="flex justify-center">
              <img
                src={form.asset_url}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Golden Frame"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Item description..."
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Type & Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Price (coins) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Asset URL */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Asset URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.asset_url}
              onChange={(e) => setForm({ ...form, asset_url: e.target.value })}
              placeholder="https://..."
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-700">Active</p>
              <p className="text-xs text-slate-400">Item visible in shop</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editData ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
