"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gift, Plus, X, Save, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  coin_cost: number;
  sort_order: number;
  is_active: boolean;
  category: "standard" | "premium" | "luxury";
}

export default function AdminGiftsPage() {
  const router = useRouter();
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    coin_cost: 10,
    sort_order: 0,
    category: "standard" as "standard" | "premium" | "luxury",
    is_active: true,
  });

  useEffect(() => {
    fetchGiftItems();
  }, []);

  async function fetchGiftItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gifts/items");
      const data = await res.json();
      if (res.ok) {
        setGiftItems(data.giftItems || []);
      } else {
        toast.error("Failed to load gift items");
      }
    } catch (err) {
      toast.error("Error loading gift items");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    try {
      const res = await fetch("/api/admin/gifts/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Gift item created!");
        setShowAddForm(false);
        resetForm();
        fetchGiftItems();
      } else {
        toast.error(data.error || "Failed to create gift item");
      }
    } catch (err) {
      toast.error("Error creating gift item");
    }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await fetch("/api/admin/gifts/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Gift item updated!");
        setEditingId(null);
        resetForm();
        fetchGiftItems();
      } else {
        toast.error(data.error || "Failed to update gift item");
      }
    } catch (err) {
      toast.error("Error updating gift item");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this gift item?")) return;
    try {
      const res = await fetch(`/api/admin/gifts/items?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Gift item deleted!");
        fetchGiftItems();
      } else {
        toast.error(data.error || "Failed to delete gift item");
      }
    } catch (err) {
      toast.error("Error deleting gift item");
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      icon: "",
      coin_cost: 10,
      sort_order: 0,
      category: "standard",
      is_active: true,
    });
  }

  function startEdit(item: GiftItem) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      icon: item.icon,
      coin_cost: item.coin_cost,
      sort_order: item.sort_order,
      category: item.category,
      is_active: item.is_active,
    });
  }

  const standardItems = giftItems.filter((g) => g.category === "standard");
  const premiumItems = giftItems.filter((g) => g.category === "premium");
  const luxuryItems = giftItems.filter((g) => g.category === "luxury");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#A09B8C]" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold">Gift Management</h1>
            <p className="text-[#A09B8C]">Manage gift items, pricing, and categories</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Gift
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {editingId ? "Edit Gift" : "Add New Gift"}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5 text-[#A09B8C]" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rose"
                className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. 🌹"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coin Cost</label>
              <input
                type="number"
                value={formData.coin_cost}
                onChange={(e) => setFormData({ ...formData, coin_cost: parseInt(e.target.value) || 0 })}
                min={1}
                className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "standard" | "premium" | "luxury" })}
                className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => {
                if (editingId) {
                  handleUpdate(editingId);
                } else {
                  handleAdd();
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-xl font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update" : "Create"}
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-[#E11D48]"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>
      )}

      {/* Gift Items Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {standardItems.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-medium text-[#A09B8C] uppercase tracking-wider mb-4">
                Standard Gifts
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {standardItems.map((item) => (
                  <GiftItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => startEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {premiumItems.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-medium text-[#A09B8C] uppercase tracking-wider mb-4">
                Premium Gifts
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {premiumItems.map((item) => (
                  <GiftItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => startEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {luxuryItems.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-medium text-[#A09B8C] uppercase tracking-wider mb-4">
                Luxury Gifts
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {luxuryItems.map((item) => (
                  <GiftItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => startEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GiftItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: GiftItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        item.is_active
          ? "border-white/10 glass hover:bg-white/5"
          : "border-white/5 opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{item.icon}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 text-[#A09B8C]" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-[#E11D48]/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#E11D48]" />
          </button>
        </div>
      </div>
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-[#A09B8C]">{item.coin_cost} coins</p>
      {!item.is_active && (
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#A09B8C]/10 text-xs text-[#A09B8C]">
          Inactive
        </span>
      )}
    </div>
  );
}
