import Badge from '@/components/ui/Badge';
import type { OrderStatus } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const statusMap: Record<OrderStatus, StatusConfig> = {
  pending_payment: { label: 'Menunggu Pembayaran', variant: 'warning' },
  paid: { label: 'Dibayar', variant: 'info' },
  on_hold: { label: 'Dana Ditahan', variant: 'warning' },
  in_delivery: { label: 'Dalam Pengiriman', variant: 'info' },
  delivered: { label: 'Terkirim', variant: 'success' },
  completed: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className = '',
}: OrderStatusBadgeProps) {
  const config = statusMap[status] || {
    label: status,
    variant: 'neutral' as const,
  };

  return (
    <Badge variant={config.variant} dot size="md" className={className}>
      {config.label}
    </Badge>
  );
}
