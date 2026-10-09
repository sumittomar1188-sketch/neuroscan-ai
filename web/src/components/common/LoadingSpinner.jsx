import React from 'react';

export const LoadingSpinner = ({ label = 'Processing request...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-3 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-700 animate-pulse">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
