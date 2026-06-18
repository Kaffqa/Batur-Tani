import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success:
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning:
    'bg-amber-500/15 text-amber-400 border-amber-500/25',
  danger:
    'bg-rose-500/15 text-rose-400 border-rose-500/25',
  info:
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  neutral:
    'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-cyan-400',
  neutral: 'bg-slate-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        transition-colors duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      {...rest}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
