import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type InputVariant = 'default' | 'filled';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  variant?: InputVariant;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = 'default',
      containerClassName = '',
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseInputClasses = `
      w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses: Record<InputVariant, string> = {
      default:
        'bg-slate-800/50 border border-slate-700 hover:border-slate-600',
      filled:
        'bg-slate-800 border border-transparent hover:bg-slate-700/80',
    };

    const errorClasses = error
      ? 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500'
      : '';

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              ${baseInputClasses}
              ${variantClasses[variant]}
              ${errorClasses}
              ${icon ? 'pl-10' : ''}
              ${className}
            `.trim()}
            {...rest}
          />
        </div>

        {error && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
