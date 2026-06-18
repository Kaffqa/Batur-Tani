import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  showCount?: boolean;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      autoResize = false,
      showCount = false,
      maxLength,
      containerClassName = '',
      className = '',
      id,
      value,
      onChange,
      ...rest
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      adjustHeight();
    };

    const errorClasses = error
      ? 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500'
      : '';

    const currentLength =
      typeof value === 'string' ? value.length : 0;

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}

        <textarea
          ref={setRefs}
          id={textareaId}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={`
            w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500
            bg-slate-800/50 border border-slate-700
            transition-all duration-200 ease-out
            hover:border-slate-600
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-${autoResize ? 'none' : 'vertical'}
            min-h-[80px]
            ${errorClasses}
            ${className}
          `.trim()}
          {...rest}
        />

        <div className="flex items-center justify-between">
          <div>
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

          {showCount && maxLength && (
            <p
              className={`text-xs tabular-nums ${
                currentLength >= maxLength
                  ? 'text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
