"use client";

import { useEffect, useState } from "react";

type BusinessSettings = {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  timezone: string;
  vapiAssistantId: string;
  calApiKeyEncryptedOrSecureReference: string;
  calEventTypeId: string;
  humanHandoffNumber: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/business");
      const data = await res.json();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      setMessage("Settings saved successfully.");
    } else {
      const data = await res.json();
      setMessage(`Failed to save settings: ${data.error || 'Unknown error'}`);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Business Settings</h2>

      <form onSubmit={handleSave} className="space-y-8 divide-y divide-gray-200">
        
        {/* Business Profile */}
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Business Profile</h3>
            <p className="mt-1 text-sm text-gray-500">Basic information about your business.</p>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                value={settings.name || ""}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={settings.description || ""}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="space-y-6 pt-8">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Integrations & AI</h3>
            <p className="mt-1 text-sm text-gray-500">Configure Vapi and Cal.com connections.</p>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Vapi Assistant ID</label>
              <input
                type="text"
                value={settings.vapiAssistantId || ""}
                onChange={(e) => setSettings({ ...settings, vapiAssistantId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Cal.com API Key</label>
              <input
                type="password"
                value={settings.calApiKeyEncryptedOrSecureReference || ""}
                onChange={(e) => setSettings({ ...settings, calApiKeyEncryptedOrSecureReference: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Cal.com Event Type ID</label>
              <input
                type="text"
                value={settings.calEventTypeId || ""}
                onChange={(e) => setSettings({ ...settings, calEventTypeId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Human Handoff Number</label>
              <input
                type="text"
                placeholder="+1234567890"
                value={settings.humanHandoffNumber || ""}
                onChange={(e) => setSettings({ ...settings, humanHandoffNumber: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end items-center">
          {message && <span className="text-sm mr-4 text-green-600">{message}</span>}
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
