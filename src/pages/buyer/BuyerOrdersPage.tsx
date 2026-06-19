import { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OrderStatusBadge from '@/components/dashboard/OrderStatusBadge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import EqcFormModal from '@/components/dashboard/EqcFormModal';
import type { Order } from '@/types';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eqcOrder, setEqcOrder] = useState<any | null>(null);

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
          farmer:profiles!orders_farmer_id_fkey (business_name, full_name)
        `)
        .eq('buyer_id', user!.id)
        .not('status', 'in', '("completed","cancelled","delivered")')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order: any) => {
    if (order.status === 'pending_payment') {
      try {
        const { data, error } = await supabase
          .from('escrow_transactions')
          .select('snap_token')
          .eq('order_id', order.id)
          .single();
          
        if (error || !data) {
          alert('Token pembayaran tidak ditemukan. Silakan buat pesanan baru.');
          return;
        }
        
        window.snap.pay(data.snap_token, {
          onSuccess: async function (result: any) {
            await supabase.from('escrow_transactions').update({
              status: 'on_hold',
              payment_type: result.payment_type,
              paid_at: new Date().toISOString()
            }).eq('order_id', order.id);
            
            await supabase.from('orders').update({
              status: 'on_hold'
            }).eq('id', order.id);

            alert('Pembayaran berhasil!');
            fetchOrders();
          },
          onPending: function (_result: any) {
            alert('Menunggu pembayaran Anda...');
          },
          onError: function (_result: any) {
            alert('Pembayaran gagal.');
          },
          onClose: function () {
            alert('Anda menutup popup tanpa menyelesaikan pembayaran.');
          }
        });
      } catch (err) {
        console.error(err);
      }
    } else if (order.status === 'in_delivery') {
      setEqcOrder(order);
    } else {
      alert(`Status pesanan ini: ${order.status}`);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat Pesanan..." />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
            Pesanan Saya
          </h1>
          <p className="text-slate-400 mt-1">
            Pantau status pesanan dan pengiriman komoditas Anda.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Anda belum memiliki pesanan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors gap-4 border border-slate-700/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-100 text-lg truncate">
                        {order.commodity?.name}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Petani</span>
                        <span className="text-slate-300">{order.farmer?.business_name || order.farmer?.full_name}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Kuantitas</span>
                        <span className="text-slate-300">{order.quantity} {order.commodity?.unit}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-0.5">Total Harga</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-700/50">
                    <div className="text-right">
                      <span className="block text-xs text-slate-500 mb-0.5">Dipesan pada</span>
                      <span className="text-sm text-slate-300">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    {order.status === 'in_delivery' ? (
                      <button 
                        onClick={() => handleOrderClick(order)}
                        className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                      >
                        Terima & E-QC
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOrderClick(order)}
                        className="p-2.5 bg-slate-700/50 rounded-xl hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {eqcOrder && (
          <EqcFormModal
            orderId={eqcOrder.id}
            commodityName={eqcOrder.commodity.name}
            commodityCategory={eqcOrder.commodity.category || 'hortikultura'}
            onClose={() => setEqcOrder(null)}
            onSuccess={() => {
              setEqcOrder(null);
              fetchOrders();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
