import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ScanProvider } from './context/ScanContext';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import UploadMRI from './pages/UploadMRI';
import ScanResults from './pages/ScanResults';
import MyScans from './pages/MyScans';
import AboutModel from './pages/AboutModel';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ScanProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={
                <DashboardLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
                  <Routes>
                    <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
                    <Route path="/upload" element={<ProtectedRoute><UploadMRI /></ProtectedRoute>} />
                    <Route path="/results" element={<ProtectedRoute><ScanResults /></ProtectedRoute>} />
                    <Route path="/scans" element={<ProtectedRoute><MyScans searchQuery={searchQuery} setSearchQuery={setSearchQuery} /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/about" element={<AboutModel />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </DashboardLayout>
              } />
            </Routes>
          </Router>
        </ScanProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
