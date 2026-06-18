import type { Commodity } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ShoppingCart, Calendar, User } from 'lucide-react';

interface CommodityCardProps {
  commodity: Commodity;
  onPreOrder?: (commodity: Commodity) => void;
}

export default function CommodityCard({
  commodity,
  onPreOrder,
}: CommodityCardProps) {
  const hasImage = commodity.image_url && commodity.image_url.length > 0;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-slate-600/80">
      {/* Image / Placeholder */}
      <div className="relative h-48 overflow-hidden">
        {hasImage ? (
          <img
            src={commodity.image_url!}
            alt={commodity.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-900/60 to-slate-800 flex items-center justify-center">
            <span className="text-5xl opacity-40" aria-hidden="true">
              🌱
            </span>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant="info" size="sm">
            {commodity.category}
          </Badge>
        </div>

        {/* Stock indicator */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={commodity.stock_projection > 0 ? 'success' : 'danger'}
            size="sm"
            dot
          >
            {commodity.stock_projection > 0 ? `${commodity.stock_projection} ${commodity.unit}` : 'Habis'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-base font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
          {commodity.name}
        </h3>

        {/* Price */}
        <p className="text-xl font-bold text-emerald-400">
          {formatCurrency(commodity.price_per_unit)}
          <span className="text-xs font-normal text-slate-500 ml-1">
            / {commodity.unit}
          </span>
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          {commodity.harvest_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Panen:{' '}
                {new Date(commodity.harvest_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {commodity.farmer?.business_name && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{commodity.farmer.business_name}</span>
            </div>
          )}
        </div>

        {/* Pre-order button */}
        <Button
          variant="primary"
          size="sm"
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          className="w-full mt-1"
          disabled={commodity.stock_projection <= 0}
          onClick={() => onPreOrder?.(commodity)}
        >
          Pre-Order
        </Button>
      </div>
    </div>
  );
}
