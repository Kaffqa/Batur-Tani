import { useState, useEffect } from 'react';
import { ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function FarmerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          commodity:commodities!orders_commodity_id_fkey (name, unit),
          buyer:profiles!orders_buyer_id_fkey (business_name, full_name, phone, address)
        `)
        .eq('farmer_id', user!.id)
        .neq('status', 'pending_payment') // Farmer shouldn't process unpaid orders
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      alert('Status pesanan berhasil diperbarui!');
      fetchOrders();
    } catch (error) {
      console.error('Update status error:', error);
      alert('Gagal memperbarui status pesanan.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat Pesanan..." />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
            Manajemen Pesanan
          </h1>
          <p className="text-slate-400 mt-1">
            Kelola pesanan yang masuk dan perbarui status pengiriman komoditas.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Belum ada pesanan aktif yang sudah dibayar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col lg:flex-row lg:items-start justify-between p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 gap-6"
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-100 text-lg">
                        {order.commodity?.name}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Data Pembeli</span>
                        <p className="font-medium">{order.buyer?.business_name || order.buyer?.full_name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{order.buyer?.phone}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{order.buyer?.address}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Rincian Pesanan</span>
                        <p>Kuantitas: {order.quantity} {order.commodity?.unit}</p>
                        <p className="text-emerald-400 font-medium">Total: {formatCurrency(order.total_amount)}</p>
                        <p className="text-slate-500 text-xs mt-1">Dipesan: {formatRelativeTime(order.created_at)}</p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <p className="text-amber-200/80">Catatan: {order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col gap-3 lg:w-48">
                    {order.status === 'on_hold' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-emerald-400 text-center font-medium bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                          Dana diamankan Escrow
                        </p>
                        <Button 
                          variant="primary" 
                          className="w-full"
                          icon={<Truck className="w-4 h-4" />}
                          onClick={() => handleUpdateStatus(order.id, 'in_delivery')}
                        >
                          Kirim Pesanan
                        </Button>
                      </div>
                    ) : order.status === 'in_delivery' ? (
                      <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700/50">
                        <Truck className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-300">Dalam Pengiriman</p>
                        <p className="text-xs text-slate-500 mt-1">Menunggu E-QC dari pembeli</p>
                      </div>
                    ) : order.status === 'completed' ? (
                      <div className="text-center p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
                        <ShoppingCart className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-emerald-400">Selesai</p>
                        <p className="text-xs text-slate-400 mt-1">Dana telah cair</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
