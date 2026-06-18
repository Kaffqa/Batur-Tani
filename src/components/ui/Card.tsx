import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50',
  elevated:
    'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-black/20',
  outlined:
    'bg-transparent backdrop-blur-sm border border-slate-700',
};

export default function Card({
  variant = 'default',
  hover = false,
  children,
  className = '',
  ...rest
}: CardProps) {
  const hoverClasses = hover
    ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-slate-600/80'
    : '';

  return (
    <div
      className={`
        rounded-2xl transition-all duration-300 ease-out
        ${variantClasses[variant]}
        ${hoverClasses}
        ${className}
      `.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─── Sub-components ─── */

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardHeader({
  children,
  className = '',
  ...rest
}: CardSectionProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-700/50 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
  ...rest
}: CardSectionProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...rest
}: CardSectionProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-slate-700/50 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
