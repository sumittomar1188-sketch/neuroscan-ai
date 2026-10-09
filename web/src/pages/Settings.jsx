import React, { useState, useEffect } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Server,
  Palette,
  Bell,
  Shield,
  Info,
  CheckCircle2,
  HardDrive,
  Globe,
  Sliders
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DisclaimerBanner from '../components/common/Disclaimer';
import { getApiBaseUrl, checkHealth } from '../services/api';

export const Settings = () => {
  // Local UI Preferences stored in localStorage safely
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem('neuroscan_compact') === 'true';
  });

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('neuroscan_notifications') !== 'false';
  });

  const [savedNotice, setSavedNotice] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('neuroscan_compact', compactView.toString());
    localStorage.setItem('neuroscan_notifications', notifications.toString());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Application Settings & System Info"
        description="Local browser UI preferences and backend service connection parameters."
      />

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Local UI preferences saved successfully in browser storage!</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">User Profile Display</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 text-zinc-950 flex items-center justify-center text-xl font-bold shadow-md shadow-yellow-500/20">
            ST
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-extrabold text-slate-900">Dr. Sumit Tomar, MD</h3>
            <p className="text-xs text-slate-500 font-medium">
              Senior Neuro-Radiologist & Clinical AI Research Lead
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-mono text-slate-400">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                Department of Radiology
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                Local Client Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Connection & Backend Server Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">FastAPI Backend Connection</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            VITE_API_BASE_URL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] block">Target Server URL</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {getApiBaseUrl()}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] block">Endpoint Status</span>
            <div className="flex items-center gap-2 pt-0.5">
              {apiStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  FastAPI Server Reachable (HTTP 200)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-bold text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  FastAPI Disconnected (Offline / Local)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local UI Preferences Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Browser Display Preferences</h2>
          </div>
          <span className="text-xs text-slate-400">Stored in browser localStorage</span>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-sm">Compact View Mode</div>
              <div className="text-xs text-slate-500">Reduce card padding for dense scan lists</div>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-sm">System Status Alerts</div>
              <div className="text-xs text-slate-500">Show notification banners for backend connection events</div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-xs shadow-yellow-500/20 transition-colors cursor-pointer"
          >
            Save UI Preferences
          </button>
        </div>
      </div>

      <DisclaimerBanner compact={true} />
    </div>
  );
};

export default Settings;
