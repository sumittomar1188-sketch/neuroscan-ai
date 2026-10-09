import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">User Profile</h2>
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-6">
        {user.picture ? (
          <img src={user.picture} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-50" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-3xl font-bold text-zinc-950">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
          <p className="text-slate-500">{user.email}</p>
          <p className="text-sm text-slate-400 mt-2">Account created: {user.created_at || 'Recently'}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
