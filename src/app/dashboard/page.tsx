"use client";

import { useEffect, useState } from "react";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    appointments: 0,
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/overview");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch overview stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total AI Calls</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : stats.totalCalls}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Appointments Booked</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{loading ? "-" : stats.appointments}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">New Leads Captured</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : stats.totalLeads}</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
