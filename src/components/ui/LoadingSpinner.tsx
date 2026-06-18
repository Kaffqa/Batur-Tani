type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: string;
  fullPage?: boolean;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const textSizeClasses: Record<SpinnerSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function SpinnerSVG({ size }: { size: SpinnerSize }) {
  return (
    <svg
      className={`${sizeClasses[size]} animate-spin text-emerald-500`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullPage = false,
  className = '',
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={text || 'Loading'}
    >
      <SpinnerSVG size={size} />
      {text && (
        <p className={`${textSizeClasses[size]} text-slate-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
