"use client";

import { useEffect, useState } from "react";

type KnowledgeItem = {
  id: string;
  category: string;
  title: string;
  content: string;
};

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<KnowledgeItem> | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const method = editingItem.id ? "PUT" : "POST";
    const url = editingItem.id ? `/api/knowledge/${editingItem.id}` : "/api/knowledge";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });

    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Knowledge Base</h2>
        <button
          onClick={() => setEditingItem({ category: "FAQ", title: "", content: "" })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          Add Item
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading knowledge base...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingItem(item)} className="text-gray-400 hover:text-indigo-600 text-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 text-sm">Delete</button>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm flex-1 whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem.id ? "Edit Item" : "Add Knowledge Item"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border text-black"
                >
                  <option value="INFO">Business Information</option>
                  <option value="SERVICE">Service</option>
                  <option value="FAQ">FAQ</option>
                  <option value="POLICY">Policy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title / Question</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content / Answer</label>
                <textarea
                  required
                  rows={4}
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
