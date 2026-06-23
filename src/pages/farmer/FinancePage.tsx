import { useState, useEffect } from 'react';
import { Wallet, ArrowDownToLine, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import EscrowTimeline from '@/components/dashboard/EscrowTimeline';

interface EscrowRecord {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'captured' | 'on_hold' | 'released' | 'refunded';
  payment_type: string | null;
  paid_at: string | null;
  released_at: string | null;
  order: {
    id: string;
    quantity: number;
    commodity: { name: string; unit: string };
    buyer: { full_name: string; business_name: string };
  };
}

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<EscrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalOnHold, setTotalOnHold] = useState(0);
  const [totalReleased, setTotalReleased] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      // Fetch escrow transactions related to the farmer's orders
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select(`
          id, order_id, amount, status, payment_type, paid_at, released_at,
          order:orders!escrow_transactions_order_id_fkey (
            id, quantity,
            commodity:commodities!orders_commodity_id_fkey (name, unit),
            buyer:profiles!orders_buyer_id_fkey (full_name, business_name)
          )
        `)
        .eq('order.farmer_id', user!.id)
        .neq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase inner join filter hack (since we can't directly filter on joined table in JS without RPC easily, 
      // we filter out null orders which didn't match farmer_id)
      const validData = (data as any[]).filter((t) => t.order !== null);
      
      setTransactions(validData);

      // Calculate stats
      const onHold = validData
        .filter((t) => t.status === 'on_hold' || t.status === 'captured')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const released = validData
        .filter((t) => t.status === 'released')
        .reduce((sum, t) => sum + t.amount, 0);

      setTotalOnHold(onHold);
      setTotalReleased(released);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TableSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Keuangan & Escrow
          </h1>
          <p className="text-slate-400 mt-1">
            Pantau status dana yang ditahan sistem dan riwayat pencairan ke rekening Anda.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-slate-800/30">
              <Lock className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-slate-300">Dana Tertahan (On-Hold)</h3>
              </div>
              <p className="text-3xl font-bold text-amber-400 mt-4">
                {formatCurrency(totalOnHold)}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Dana aman di sistem Escrow. Akan cair otomatis setelah pembeli menerima barang.
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-slate-800/30">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-300">Total Dicairkan (Released)</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-400 mt-4">
                {formatCurrency(totalReleased)}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Total pendapatan yang telah berhasil diteruskan ke rekening bank Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-100">Riwayat Transaksi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Pembeli & Produk</th>
                  <th className="px-6 py-4 font-medium">Jumlah Dana</th>
                  <th className="px-6 py-4 font-medium">Status Escrow</th>
                  <th className="px-6 py-4 font-medium">Waktu Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Belum ada transaksi pembayaran.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">
                          {tx.order.buyer.business_name || tx.order.buyer.full_name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {tx.order.commodity.name} ({tx.order.quantity} {tx.order.commodity.unit})
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {tx.status === 'on_hold' || tx.status === 'captured' ? (
                          <Badge variant="warning" size="sm">Tertahan (Escrow)</Badge>
                        ) : tx.status === 'released' ? (
                          <Badge variant="success" size="sm">Dicairkan</Badge>
                        ) : tx.status === 'refunded' ? (
                          <Badge variant="danger" size="sm">Dikembalikan</Badge>
                        ) : (
                          <Badge variant="info" size="sm">{tx.status}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {tx.paid_at ? (
                          <div>
                            <span className="block">Dibayar: {new Date(tx.paid_at).toLocaleString('id-ID')}</span>
                            {tx.released_at && (
                              <span className="block text-emerald-400 mt-1">Dicairkan: {new Date(tx.released_at).toLocaleString('id-ID')}</span>
                            )}
                          </div>
                        ) : '-'}
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
