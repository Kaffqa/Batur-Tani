import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: number; // percentage
    direction: 'up' | 'down';
  };
  className?: string;
}

export default function StatsCard({
  icon,
  title,
  value,
  trend,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden
        bg-slate-800/50 backdrop-blur-xl border border-slate-700/50
        rounded-2xl p-5
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5
        hover:border-slate-600/80
        ${className}
      `.trim()}
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-white tabular-nums">
            {value}
          </p>

          {trend && (
            <div
              className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
                trend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-500 ml-0.5">vs bulan lalu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
