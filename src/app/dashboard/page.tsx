"use client";

import { useEffect, useState } from "react";
import LinkNext from "next/link";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    businessName: "Loading...",
    slug: "",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
          <p className="text-gray-500 text-sm">{stats.businessName}</p>
        </div>
        
        {stats.slug && (
          <LinkNext 
            href={`/book/${stats.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            View Public Storefront →
          </LinkNext>
        )}
      </div>
      
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
