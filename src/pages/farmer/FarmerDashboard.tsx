// ============================================================
// Batur Tani — Farmer Dashboard
// Overview page with stats, weather, recent orders & alerts
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Severity, AlertType } from '@/types';
import toast from 'react-hot-toast';

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
  const { user, profile } = useAuth();

  const farmerName = profile?.full_name || 'Petani';
  
  // Local state for weather coordinates so it updates immediately when changed
  const [lat, setLat] = useState<number>(-7.23);
  const [lon, setLon] = useState<number>(109.9);

  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      setLat(profile.latitude);
      setLon(profile.longitude);
    }
  }, [profile]);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Data States
  const [loading, setLoading] = useState(true);
  const [totalCommodities, setTotalCommodities] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Commodities Count
      const { count: commoditiesCount } = await supabase
        .from('commodities')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', user!.id);
      
      setTotalCommodities(commoditiesCount || 0);

      // 2. Fetch Orders (for stats & recent list)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, quantity, total_amount, status, created_at,
          buyer:profiles!orders_buyer_id_fkey (business_name, full_name),
          commodity:commodities!orders_commodity_id_fkey (name, unit)
        `)
        .eq('farmer_id', user!.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        // Calculate Stats
        const active = ordersData.filter(o => !['completed', 'cancelled', 'pending_payment'].includes(o.status)).length;
        const income = ordersData.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);
        const escrow = ordersData.filter(o => ['on_hold', 'in_delivery', 'delivered'].includes(o.status)).reduce((sum, o) => sum + o.total_amount, 0);

        setActiveOrdersCount(active);
        setTotalIncome(income);
        setEscrowAmount(escrow);

        // Top 5 recent
        setRecentOrders(ordersData.slice(0, 5));
      }

      // 3. Fetch Weather Alerts
      const { data: alertsData } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('farmer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (newLat: number, newLon: number) => {
    if (!user) return;
    try {
      setLat(newLat);
      setLon(newLon);
      const { error } = await supabase
        .from('profiles')
        .update({ latitude: newLat, longitude: newLon })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Lokasi berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Gagal menyimpan lokasi ke profil.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat Dashboard..." />;

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
          value={totalCommodities.toString()}
        />
        <StatsCard
          icon={<ShoppingCart className="h-5 w-5" />}
          title="Pesanan Aktif"
          value={activeOrdersCount.toString()}
        />
        <StatsCard
          icon={<Wallet className="h-5 w-5" />}
          title="Total Pendapatan"
          value={formatCurrency(totalIncome)}
        />
        <StatsCard
          icon={<Lock className="h-5 w-5" />}
          title="Dana Escrow Tertahan"
          value={formatCurrency(escrowAmount)}
        />
      </div>

      {/* ── Weather & Alerts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weather widget */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <WeatherWidget 
            latitude={lat} 
            longitude={lon} 
            farmerId={user?.id}
            onUpdateLocation={handleUpdateLocation}
          />
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
              {alerts.filter((a) => !a.is_read).length} belum dibaca
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {alerts.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                Tidak ada peringatan cuaca saat ini.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`px-6 py-4 flex items-start gap-3 transition-colors hover:bg-white/[0.02] ${
                    !alert.is_read ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <div
                    className={`shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center border ${severityColors[alert.severity as Severity] || severityColors.low}`}
                  >
                    {alertIcons[alert.alert_type as AlertType] || <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        !alert.is_read
                          ? 'text-slate-200 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatDate(alert.created_at)}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-400 mt-2" />
                  )}
                </div>
              ))
            )}
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
          <Link to="/farmer/orders" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Lihat Semua
          </Link>
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      BATUR-{order.id.substring(0,6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                      {order.buyer?.business_name || order.buyer?.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {order.commodity?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {order.quantity} {order.commodity?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-400 tabular-nums">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
