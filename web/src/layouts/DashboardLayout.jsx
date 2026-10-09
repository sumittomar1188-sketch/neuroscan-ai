import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { HeartPulse } from 'lucide-react';

export const DashboardLayout = ({ children, searchQuery, setSearchQuery }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Wrapper offset by sidebar width on desktop */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen transition-all">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <HeartPulse className="w-4 h-4 text-amber-500" />
              <span>NeuroScan AI — Brain Tumor Detection &amp; ResNet50 Classifier Prototype</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>Version 1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
