import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'text-teal-600'
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 relative overflow-hidden transition-all hover:border-slate-300 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-200 ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
