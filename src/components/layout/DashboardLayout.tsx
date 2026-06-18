import { useState, type ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Mobile sidebar toggle (floating button) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="
          fixed bottom-5 left-5 z-20 lg:hidden
          h-12 w-12 rounded-full
          bg-emerald-600 text-white shadow-lg shadow-emerald-500/30
          flex items-center justify-center
          hover:bg-emerald-500 active:bg-emerald-700
          transition-colors duration-200
        "
        aria-label="Open sidebar"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Main content area */}
      <main
        className="
          pt-16 lg:pl-64
          transition-all duration-300
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
