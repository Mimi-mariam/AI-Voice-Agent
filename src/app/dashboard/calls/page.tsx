"use client";

import { useEffect, useState } from "react";

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, we mock fetching calls from an API route. 
    // You would create `app/api/calls/route.ts` to fetch from Prisma
    const fetchCalls = async () => {
      try {
        const res = await fetch("/api/calls");
        if (res.ok) {
          const data = await res.json();
          setCalls(data);
        }
      } catch (error) {
        console.error("Failed to fetch calls", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Call History</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading calls...</td></tr>
            ) : calls.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No calls found.</td></tr>
            ) : (
              calls.map((call: any) => (
                <tr key={call.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(call.startedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.phoneNumber || "Unknown"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.duration}s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {call.outcome || "Completed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
