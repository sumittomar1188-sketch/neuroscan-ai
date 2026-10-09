import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({
  title = 'API Error Occurred',
  message = 'Failed to connect to the backend server. Make sure FastAPI server is running.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 text-rose-900 my-4 shadow-2xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-rose-950 mb-0.5">{title}</h4>
          <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
