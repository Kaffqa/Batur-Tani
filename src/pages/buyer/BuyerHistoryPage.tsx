import { useState, useEffect } from 'react';
import { History, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export default function BuyerHistoryPage() {
  const { user } = useAuth();
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          commodity:commodities!orders_commodity_id_fkey (name, unit),
          farmer:profiles!orders_farmer_id_fkey (business_name, full_name)
        `)
        .eq('buyer_id', user!.id)
        .in('status', ['completed', 'cancelled', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistoryOrders(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TableSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <History className="w-8 h-8 text-cyan-400" />
            Riwayat Transaksi
          </h1>
          <p className="text-slate-400 mt-1">
            Catatan semua transaksi yang telah selesai atau dibatalkan.
          </p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          {/* Header/Filter Bar */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari transaksi..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-200"
              />
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/30 border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-400">ID Pesanan</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-400">Komoditas</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-400">Petani</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-400">Total Harga</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-400">Tanggal Selesai</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {historyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Belum ada riwayat transaksi yang selesai.</p>
                    </td>
                  </tr>
                ) : (
                  historyOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        BATUR-{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-200">{order.commodity?.name}</p>
                        <p className="text-xs text-slate-500">{order.quantity} {order.commodity?.unit}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {order.farmer?.business_name || order.farmer?.full_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-400 tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
