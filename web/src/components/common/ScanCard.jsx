import React from 'react';
import { FileImage, Calendar, Eye, HardDrive, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const ScanCard = ({ scan, onViewDetails }) => {
  const {
    id,
    filename,
    uploadDate,
    dimensions,
    fileSize,
    status = 'uploaded',
    statusLabel,
    thumbnailUrl,
    isDemo = false,
  } = scan;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Thumbnail container */}
      <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={filename}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
            <div className="p-3 bg-slate-800 rounded-full text-slate-300">
              <FileImage className="w-8 h-8" />
            </div>
            <span className="text-xs text-slate-400 font-mono">Brain MRI Scan</span>
          </div>
        )}

        {/* Demo pill overlay */}
        {isDemo && (
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700/60 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Sample Record</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <StatusBadge status={status} label={statusLabel} size="sm" />
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors" title={filename}>
            {filename}
          </h4>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{uploadDate || 'Just now'}</span>
            </div>
            {dimensions && (
              <div className="flex items-center gap-1.5 truncate">
                <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {fileSize ? fileSize : 'Processed'}
          </span>
          <button
            onClick={() => onViewDetails && onViewDetails(scan)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;
