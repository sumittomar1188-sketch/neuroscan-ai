import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No Scans Found',
  description = 'You have not uploaded any MRI scans yet. Upload an MRI to get started.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-xl mx-auto my-6 flex flex-col items-center justify-center">
      <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-slate-200 mb-4">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
