import React from 'react';
import { ArrowUpRight, Info } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  isDemo = false,
  trend,
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      bar: 'bg-blue-500',
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      bar: 'bg-teal-500',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      bar: 'bg-indigo-500',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      bar: 'bg-purple-500',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
    },
  }[color] || colorStyles.blue;

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorStyles.bar} opacity-80`} />
      
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
            {isDemo && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500 rounded border border-slate-200">
                Demo
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles.iconBg} transition-transform group-hover:scale-105 shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{subtitle}</span>
        </p>
      )}
    </div>
  );
};

export default StatCard;
