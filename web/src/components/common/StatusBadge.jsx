import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, Server, FileCheck } from 'lucide-react';

export const StatusBadge = ({ status = 'uploaded', label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium',
  }[size] || 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  const configs = {
    uploaded: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: FileCheck,
      text: label || 'Uploaded',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      text: label || 'Successful',
    },
    demo: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dot: 'bg-blue-500',
      icon: Clock,
      text: label || 'Sample Record',
    },
    pending_model: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: Clock,
      text: label || 'Pending AI Model',
    },
    error: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: AlertTriangle,
      text: label || 'Failed',
    },
    server_ok: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      dot: 'bg-teal-500',
      icon: Server,
      text: label || 'API Online',
    }
  };

  const config = configs[status] || configs.uploaded;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center rounded-full border shadow-2xs transition-colors ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;
