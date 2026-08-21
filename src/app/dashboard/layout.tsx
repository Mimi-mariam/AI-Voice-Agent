"use client";
import LinkNext from "next/link";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";
import VoiceWidget from "@/app/components/VoiceWidget";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-800">AI Receptionist</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <LinkNext href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Overview
          </LinkNext>
          <LinkNext href="/dashboard/knowledge" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Knowledge Base
          </LinkNext>
          <LinkNext href="/dashboard/leads" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Leads
          </LinkNext>
          <LinkNext href="/dashboard/appointments" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Appointments
          </LinkNext>
          <LinkNext href="/dashboard/calls" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Call History
          </LinkNext>
          <LinkNext href="/dashboard/settings" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
            Settings
          </LinkNext>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div>
            <span className="text-sm text-gray-500">Mike's Business</span>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Floating AI Voice Widget */}
      <VoiceWidget />
    </div>
  );
}
