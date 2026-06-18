import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/40 active:from-emerald-700 active:to-emerald-600 focus-visible:ring-emerald-500/50',
  secondary:
    'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/40 active:from-amber-700 active:to-amber-600 focus-visible:ring-amber-500/50',
  outline:
    'border border-slate-600 text-slate-300 bg-transparent hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 focus-visible:ring-emerald-500/50',
  ghost:
    'text-slate-300 bg-transparent hover:bg-slate-700/50 hover:text-white active:bg-slate-700/80 focus-visible:ring-slate-500/50',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 hover:to-rose-400 hover:shadow-rose-500/40 active:from-rose-700 active:to-rose-600 focus-visible:ring-rose-500/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

function Spinner({ size }: { size: ButtonSize }) {
  const spinnerSize: Record<ButtonSize, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <svg
      className={`${spinnerSize[size]} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Spinner size={size} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
