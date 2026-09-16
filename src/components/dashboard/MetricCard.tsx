import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-[#0099ff]/15',
  iconColor = 'text-[#0099ff]',
  badge,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 border border-[#22324b] relative overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:border-[#2d4160] hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">{title}</div>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">{value}</div>

          {(change || subtitle || badge) && (
            <div className="flex items-center gap-2 mt-2">
              {change && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{change}</span>
                </span>
              )}

              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0099ff]/15 text-[#0099ff] border border-[#0099ff]/30">
                  {badge}
                </span>
              )}

              {subtitle && <span className="text-[11px] text-[#8e9db5] font-medium">{subtitle}</span>}
            </div>
          )}
        </div>

        <div className={`w-11 h-11 rounded-2xl ${iconBgColor} flex items-center justify-center ${iconColor} shrink-0`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      </div>
    </div>
  );
};
