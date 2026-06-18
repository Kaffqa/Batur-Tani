// ============================================================
// Batur Tani — Utility Functions
// Common helpers used across the application
// ============================================================

import type { OrderStatus, Severity } from '@/types';

// ------------------------------------------------------------
// Currency Formatting
// ------------------------------------------------------------

/**
 * Format a number as Indonesian Rupiah.
 *
 * @example formatCurrency(1500000) → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ------------------------------------------------------------
// Date Formatting
// ------------------------------------------------------------

/**
 * Format an ISO date string to a human-readable Indonesian date.
 *
 * @example formatDate('2026-06-15T10:00:00Z') → "15 Juni 2026"
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format an ISO date string to a short date with time.
 *
 * @example formatDateTime('2026-06-15T10:30:00Z') → "15 Jun 2026, 10:30"
 */
export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ------------------------------------------------------------
// Relative Time
// ------------------------------------------------------------

/**
 * Format an ISO date string as relative time in Indonesian.
 *
 * @example formatRelativeTime(recentDate) → "2 menit lalu"
 * @example formatRelativeTime(oldDate) → "3 hari lalu"
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 30) return 'baru saja';
  if (diffMinutes < 1) return `${diffSeconds} detik lalu`;
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan lalu`;

  return formatDate(date);
}

// ------------------------------------------------------------
// Classname Utility
// ------------------------------------------------------------

/**
 * Merge CSS class names, filtering out falsy values.
 * A lightweight alternative to `clsx` / `classnames`.
 *
 * @example cn('p-4', isActive && 'bg-primary-500', undefined) → "p-4 bg-primary-500"
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ------------------------------------------------------------
// Order Status Helpers
// ------------------------------------------------------------

/** Tailwind color class mapping for each order status */
export function getStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    pending_payment: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20',
    paid: 'text-info-400 bg-info-400/10 border-info-400/20',
    on_hold: 'text-warning-400 bg-warning-400/10 border-warning-400/20',
    in_delivery: 'text-accent-400 bg-accent-400/10 border-accent-400/20',
    delivered: 'text-primary-400 bg-primary-400/10 border-primary-400/20',
    completed: 'text-success-400 bg-success-400/10 border-success-400/20',
    cancelled: 'text-danger-400 bg-danger-400/10 border-danger-400/20',
  };
  return colorMap[status];
}

/** Indonesian label for each order status */
export function getStatusLabel(status: OrderStatus): string {
  const labelMap: Record<OrderStatus, string> = {
    pending_payment: 'Menunggu Pembayaran',
    paid: 'Dibayar',
    on_hold: 'Ditahan',
    in_delivery: 'Dalam Pengiriman',
    delivered: 'Terkirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return labelMap[status];
}

// ------------------------------------------------------------
// Severity Helpers
// ------------------------------------------------------------

/** Tailwind color class mapping for alert severity levels */
export function getSeverityColor(severity: Severity): string {
  const colorMap: Record<Severity, string> = {
    low: 'text-success-400 bg-success-400/10 border-success-400/20',
    medium: 'text-warning-400 bg-warning-400/10 border-warning-400/20',
    high: 'text-secondary-500 bg-secondary-500/10 border-secondary-500/20',
    critical: 'text-danger-400 bg-danger-400/10 border-danger-400/20',
  };
  return colorMap[severity];
}

/** Indonesian label for severity levels */
export function getSeverityLabel(severity: Severity): string {
  const labelMap: Record<Severity, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    critical: 'Kritis',
  };
  return labelMap[severity];
}

// ------------------------------------------------------------
// Miscellaneous
// ------------------------------------------------------------

/**
 * Truncate a string to a max length, appending "..." if truncated.
 */
export function truncate(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Generate initials from a full name (max 2 characters).
 *
 * @example getInitials('Ahmad Yusuf') → "AY"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
