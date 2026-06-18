import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children?: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ── Enter / exit orchestration ── */
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  /* ── Close on Escape ── */
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        backdrop-blur-sm transition-all duration-200
        ${animating ? 'bg-black/60' : 'bg-black/0'}
      `.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`
          w-full ${sizeClasses[size]}
          bg-slate-800/95 backdrop-blur-xl border border-slate-700/60
          rounded-2xl shadow-2xl shadow-black/40
          transition-all duration-200 ease-out
          ${
            animating
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }
        `.trim()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Close button (no title) */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
