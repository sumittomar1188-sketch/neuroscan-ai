import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings as SettingsIcon,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenSidebar, searchQuery, setSearchQuery }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return { title: 'Dashboard Overview', subtitle: 'MRI analytics and classification center' };
      case '/upload':
        return { title: 'Upload MRI Scan', subtitle: 'Ingest new brain MRI DICOM/Image files' };
      case '/scans':
        return { title: 'My Scan Records', subtitle: 'Archive of uploaded scans and demo records' };
      case '/about':
        return { title: 'About AI Model', subtitle: 'ResNet50 model specs, categories, and workflow' };
      case '/settings':
        return { title: 'Application Settings', subtitle: 'UI preferences, API configuration, and info' };
      default:
        if (path.startsWith('/results')) {
          return { title: 'Scan Analysis Results', subtitle: 'Detailed scan feedback and model status' };
        }
        return { title: 'NeuroScan AI', subtitle: 'Medical Imaging Platform' };
    }
  };

  const pageInfo = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{pageInfo.title}</span>
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Search, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scans, categories..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-amber-400 rounded-xl outline-hidden text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <button
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2.5 pl-1 cursor-pointer">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-slate-100"
                  />
                ) : (
                  <img
                    src="/avatar_robot.png"
                    alt="Profile avatar"
                    className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-slate-100"
                  />
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {user.title || 'User'}
                  </div>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Search className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/scans" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <FolderOpen className="w-4 h-4" /> My Scans
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <SettingsIcon className="w-4 h-4" /> Settings
                  </Link>
                  <hr className="my-2 border-slate-100" />
                  <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold rounded-xl shadow-xs transition-all text-sm ml-2">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
