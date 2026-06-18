// ============================================================
// Batur Tani — Farmer Dashboard
// Overview page with stats, weather, recent orders & alerts
// ============================================================

import {
  Package,
  ShoppingCart,
  Wallet,
  Lock,
  Calendar,
  AlertTriangle,
  CloudRain,
  Snowflake,
  Sun,
  Eye,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus, Severity, AlertType } from '@/types';

// ── Mock data ──

const mockOrders = [
  {
    id: 'ORD-001',
    buyer_name: 'RM Sari Rasa',
    commodity: 'Kentang Granola',
    quantity: '500 kg',
    total: 4500000,
    status: 'paid' as OrderStatus,
    date: '2026-06-14T08:00:00Z',
  },
  {
    id: 'ORD-002',
    buyer_name: 'Hotel Grand Aston',
    commodity: 'Wortel Baby',
    quantity: '200 kg',
    total: 2400000,
    status: 'in_delivery' as OrderStatus,
    date: '2026-06-13T14:30:00Z',
  },
  {
    id: 'ORD-003',
    buyer_name: 'Catering Sehat Nusantara',
    commodity: 'Brokoli',
    quantity: '100 kg',
    total: 3000000,
    status: 'pending_payment' as OrderStatus,
    date: '2026-06-12T10:15:00Z',
  },
  {
    id: 'ORD-004',
    buyer_name: 'Superindo Purwokerto',
    commodity: 'Kubis',
    quantity: '300 kg',
    total: 1800000,
    status: 'completed' as OrderStatus,
    date: '2026-06-10T09:00:00Z',
  },
  {
    id: 'ORD-005',
    buyer_name: 'Warung Bu Darmi',
    commodity: 'Daun Bawang',
    quantity: '50 kg',
    total: 750000,
    status: 'delivered' as OrderStatus,
    date: '2026-06-09T16:45:00Z',
  },
];

const mockAlerts: {
  id: string;
  type: AlertType;
  severity: Severity;
  message: string;
  date: string;
  isRead: boolean;
}[] = [
  {
    id: 'ALR-001',
    type: 'heavy_rain',
    severity: 'high',
    message:
      'Curah hujan tinggi diprediksi 3 hari ke depan. Pertimbangkan percepatan panen kentang.',
    date: '2026-06-16T06:00:00Z',
    isRead: false,
  },
  {
    id: 'ALR-002',
    type: 'frost',
    severity: 'critical',
    message:
      'Suhu mendekati titik beku malam ini (2°C). Lindungi tanaman brokoli dan wortel.',
    date: '2026-06-15T18:00:00Z',
    isRead: false,
  },
  {
    id: 'ALR-003',
    type: 'early_harvest',
    severity: 'medium',
    message:
      'Kondisi optimal untuk panen wortel baby terdeteksi. Pertimbangkan panen lebih awal.',
    date: '2026-06-14T07:00:00Z',
    isRead: true,
  },
];

const alertIcons: Record<AlertType, React.ReactNode> = {
  heavy_rain: <CloudRain className="h-4 w-4" />,
  frost: <Snowflake className="h-4 w-4" />,
  drought: <Sun className="h-4 w-4" />,
  early_harvest: <Calendar className="h-4 w-4" />,
};

const severityColors: Record<Severity, string> = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

// ── Main Component ──

export default function FarmerDashboard() {
  const { profile } = useAuth();

  const farmerName = profile?.full_name || 'Petani';
  const lat = profile?.latitude ?? -7.23;
  const lon = profile?.longitude ?? 109.9;

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DashboardLayout>
      {/* ── Welcome ── */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Selamat Datang,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {farmerName}
          </span>{' '}
          👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">{today}</p>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatsCard
          icon={<Package className="h-5 w-5" />}
          title="Total Komoditas"
          value="12"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatsCard
          icon={<ShoppingCart className="h-5 w-5" />}
          title="Pesanan Aktif"
          value="5"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatsCard
          icon={<Wallet className="h-5 w-5" />}
          title="Total Pendapatan"
          value={formatCurrency(28750000)}
          trend={{ value: 15, direction: 'up' }}
        />
        <StatsCard
          icon={<Lock className="h-5 w-5" />}
          title="Dana Escrow Tertahan"
          value={formatCurrency(6900000)}
        />
      </div>

      {/* ── Weather & Alerts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weather widget */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <WeatherWidget latitude={lat} longitude={lon} />
        </div>

        {/* Weather alerts */}
        <div
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden animate-slide-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Peringatan Cuaca
            </h3>
            <span className="text-xs text-slate-500">
              {mockAlerts.filter((a) => !a.isRead).length} belum dibaca
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-6 py-4 flex items-start gap-3 transition-colors hover:bg-white/[0.02] ${
                  !alert.isRead ? 'bg-white/[0.01]' : ''
                }`}
              >
                <div
                  className={`shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center border ${severityColors[alert.severity]}`}
                >
                  {alertIcons[alert.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-relaxed ${
                      !alert.isRead
                        ? 'text-slate-200 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatDate(alert.date)}
                  </p>
                </div>
                {!alert.isRead && (
                  <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-400 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent orders table ── */}
      <div
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-cyan-400" />
            Pesanan Terbaru
          </h3>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Pembeli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Komoditas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                    {order.buyer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {order.commodity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-400 tabular-nums">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(order.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
