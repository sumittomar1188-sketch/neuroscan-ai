import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FolderOpen,
  BrainCircuit,
  Settings as SettingsIcon,
  X,
  ShieldCheck,
  ChevronRight,
  Server
} from 'lucide-react';
import { checkHealth, checkApiRoot } from '../../services/api';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const verifyApi = async () => {
      try {
        await checkHealth();
        if (isMounted) setApiOnline(true);
      } catch (err) {
        try {
          await checkApiRoot();
          if (isMounted) setApiOnline(true);
        } catch (e) {
          if (isMounted) setApiOnline(false);
        }
      }
    };

    verifyApi();
    const interval = setInterval(verifyApi, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      name: 'Upload MRI',
      path: '/upload',
      icon: UploadCloud,
      description: 'Image Upload & Ingestion'
    },
    {
      name: 'My Scans',
      path: '/scans',
      icon: FolderOpen,
      description: 'Scan Archive & History'
    },
    {
      name: 'About Model',
      path: '/about',
      icon: BrainCircuit,
      description: 'ResNet50 Architecture'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: SettingsIcon,
      description: 'Preferences & System'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col border-r border-yellow-900/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-yellow-900/25">
          <div className="flex items-center gap-3">
            {/* Gold ring logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
                NeuroScan <span className="text-yellow-400 font-semibold">AI</span>
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium">MRI Diagnostic Prototype</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-3">
            <p className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest">
              Main Menu
            </p>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                {/* Active left indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-yellow-400 rounded-r-full" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-yellow-400' : 'text-zinc-500 group-hover:text-yellow-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div
                    className={`text-[11px] truncate font-normal ${
                      isActive ? 'text-yellow-400/60' : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-yellow-500/70 shrink-0" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Compliance Badge */}
        <div className="p-4 border-t border-yellow-900/20 space-y-3" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="text-[11px] text-zinc-600 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-600/70" />
            <span>Educational Research Prototype</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
