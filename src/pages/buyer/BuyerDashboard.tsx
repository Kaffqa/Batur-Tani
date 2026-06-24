// ============================================================
// Batur Tani — Buyer Dashboard Overview
// Dashboard utama untuk pembeli bisnis (HORECA)
// ============================================================

import { useState } from 'react';
import {
  ShoppingCart,
  Clock,
  Wallet,
  Truck,
  ArrowRight,
  Package,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockOrders: (Order & { commodity_name: string; farmer_name: string })[] = [
  {
    id: '1',
    buyer_id: 'b1',
    farmer_id: 'f1',
    commodity_id: 'c1',
    quantity: 200,
    locked_price: 35000,
    total_amount: 7000000,
    status: 'on_hold' as OrderStatus,
    delivery_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Tomat Cherry Premium',
    farmer_name: 'Kebun Sejahtera',
  },
  {
    id: '2',
    buyer_id: 'b1',
    farmer_id: 'f2',
    commodity_id: 'c2',
    quantity: 50,
    locked_price: 12000,
    total_amount: 600000,
    status: 'in_delivery' as OrderStatus,
    delivery_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    notes: 'Susu segar pagi, pastikan suhu < 4°C',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Susu Sapi Segar',
    farmer_name: 'Peternakan Batur Jaya',
  },
  {
    id: '3',
    buyer_id: 'b1',
    farmer_id: 'f3',
    commodity_id: 'c3',
    quantity: 100,
    locked_price: 80000,
    total_amount: 8000000,
    status: 'pending_payment' as OrderStatus,
    delivery_deadline: null,
    notes: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Cabai Rawit Merah',
    farmer_name: 'Tani Makmur Dieng',
  },
  {
    id: '4',
    buyer_id: 'b1',
    farmer_id: 'f1',
    commodity_id: 'c4',
    quantity: 500,
    locked_price: 15000,
    total_amount: 7500000,
    status: 'completed' as OrderStatus,
    delivery_deadline: null,
    notes: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Kentang Granola',
    farmer_name: 'Kebun Sejahtera',
  },
  {
    id: '5',
    buyer_id: 'b1',
    farmer_id: 'f4',
    commodity_id: 'c5',
    quantity: 300,
    locked_price: 45000,
    total_amount: 13500000,
    status: 'completed' as OrderStatus,
    delivery_deadline: null,
    notes: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Bawang Merah Brebes',
    farmer_name: 'Petani Bawang Sejati',
  },
];

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const [orders] = useState(mockOrders);

  // Calculate stats from mock data
  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingDeliveries = orders.filter(
    (o) => o.status === 'in_delivery'
  ).length;

  const activeOrdersList = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );

  // Current date formatted
  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
              Selamat Datang,{' '}
              <span className="text-gradient-primary">
                {profile?.business_name || profile?.full_name || 'Pembeli'}
              </span>
            </h1>
            <p className="text-slate-400 mt-1">{today}</p>
          </div>
          <Link to="/buyer/marketplace">
            <Button variant="primary" icon={<ShoppingCart className="w-4 h-4" />}>
              Jelajahi Marketplace
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Total Pesanan"
            value={totalOrders.toString()}
            trend={{ value: 12, direction: 'up' }}
          />
          <StatsCard
            icon={<Clock className="w-6 h-6" />}
            title="Pesanan Aktif"
            value={activeOrders.toString()}
          />
          <StatsCard
            icon={<Wallet className="w-6 h-6" />}
            title="Total Pengeluaran"
            value={formatCurrency(totalSpent)}
            trend={{ value: 8, direction: 'up' }}
          />
          <StatsCard
            icon={<Truck className="w-6 h-6" />}
            title="Menunggu Pengiriman"
            value={pendingDeliveries.toString()}
          />
        </div>

        {/* Active Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Orders */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Pesanan Aktif
              </h2>
              <span className="text-sm text-slate-400">
                {activeOrders} pesanan
              </span>
            </div>

            {activeOrdersList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Belum ada pesanan aktif</p>
                <Link to="/buyer/marketplace">
                  <Button variant="primary" size="sm" className="mt-4">
                    Mulai Belanja
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrdersList.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-slate-100 truncate">
                          {order.commodity_name}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                        <span>dari {order.farmer_name}</span>
                        <span>{order.quantity} unit</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(order.created_at)}
                      </span>
                      <Link to="/buyer/orders" className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Aksi Cepat
              </h2>
              <div className="space-y-3">
                <Link to="/buyer/marketplace" className="block">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all group">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-sm font-medium">Cari Komoditas</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/buyer/orders" className="block">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 transition-all group">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Lacak Pesanan</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/buyer/history" className="block">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 transition-all group">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Riwayat Transaksi</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Completed */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Terakhir Selesai
              </h2>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === 'completed')
                  .slice(0, 3)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {order.commodity_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 shrink-0 ml-2">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
