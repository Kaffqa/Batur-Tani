import { useState, useEffect } from 'react';
import { ShoppingCart, Truck, AlertCircle, RefreshCcw, Camera, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import Button from '@/components/ui/Button';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

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
          buyer:profiles!orders_buyer_id_fkey (business_name, full_name, phone, address),
          eqc_logs (*)
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

  const handleAcceptReturn = async (orderId: string) => {
    try {
      setLoading(true);
      // 1. Update order status to cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
        
      if (orderError) throw orderError;

      // 2. Update escrow to refunded
      const { error: escrowError } = await supabase
        .from('escrow_transactions')
        .update({ status: 'refunded' })
        .eq('order_id', orderId);
        
      if (escrowError) throw escrowError;

      toast.success('Retur diterima. Dana telah dikembalikan ke pembeli.');
      fetchOrders();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('Gagal memproses pengembalian dana.');
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
      toast.success('Status pesanan berhasil diperbarui!');
      fetchOrders();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Gagal memperbarui status pesanan.');
    }
  };

  if (loading) return <TableSkeleton />;

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
              {orders.map((order) => {
                const rejectedEqc = order.eqc_logs?.find((log: any) => log.condition === 'rejected' && !log.is_approved);
                
                return (
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

                    {rejectedEqc && order.status !== 'cancelled' && (
                      <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-red-400 font-medium">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <h4>E-QC Ditolak Pembeli</h4>
                        </div>
                        <div className="text-sm text-red-200/80 space-y-1">
                          <p><span className="text-red-300">Catatan Pembeli:</span> {rejectedEqc.notes || '-'}</p>
                          {rejectedEqc.temperature && (
                            <p><span className="text-red-300">Suhu Kedatangan:</span> {rejectedEqc.temperature}°C</p>
                          )}
                        </div>
                        {rejectedEqc.photo_url && (
                          <div className="flex items-center gap-2 text-xs text-red-300/80">
                            <Camera className="w-4 h-4 shrink-0" />
                            <span>Terdapat lampiran foto bukti kerusakan</span>
                          </div>
                        )}
                        <div className="pt-2">
                          <button 
                            onClick={() => handleAcceptReturn(order.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-colors text-sm font-medium w-full sm:w-auto"
                          >
                            <RefreshCcw className="w-4 h-4 shrink-0" />
                            Terima Retur & Refund Dana
                          </button>
                        </div>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
