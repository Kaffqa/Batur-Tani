import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import type { Commodity } from '@/types';
import toast from 'react-hot-toast';

// Declare Midtrans Snap globally
declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: any) => void;
    };
  }
}

export default function CheckoutPage() {
  const { commodityId } = useParams<{ commodityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  
  const totalAmount = (commodity?.price_per_unit || 0) * quantity;

  useEffect(() => {
    if (commodityId) {
      fetchCommodity(commodityId);
    }
  }, [commodityId]);

  const fetchCommodity = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('commodities')
        .select(`
          *,
          farmer:profiles!commodities_farmer_id_fkey (
            id, full_name, business_name, address, phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setCommodity(data as any);
    } catch (error) {
      console.error('Error fetching commodity:', error);
      toast.error('Gagal memuat data komoditas.');
      navigate('/buyer/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!commodity || !user) return;
    
    if (quantity > commodity.stock_projection) {
      toast.error('Kuantitas melebihi stok yang tersedia.');
      return;
    }

    try {
      setProcessing(true);
      
      // 1. Create Order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          farmer_id: commodity.farmer_id,
          commodity_id: commodity.id,
          quantity,
          locked_price: commodity.price_per_unit,
          total_amount: totalAmount,
          status: 'pending_payment',
          notes: notes || null
        }])
        .select('id')
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 2. Create Midtrans Transaction (via Vite Proxy)
      const payload = {
        transaction_details: {
          order_id: `BATUR-${orderId.substring(0, 8)}-${Date.now()}`,
          gross_amount: totalAmount
        },
        credit_card: { secure: true },
        customer_details: {
          first_name: "Buyer", // In a real app, pass buyer details
          email: user.email,
        }
      };

      const response = await fetch('/api/midtrans/snap/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi layanan pembayaran (Midtrans).');
      }

      const snapData = await response.json();
      const token = snapData.token;

      // 3. Save Escrow record
      const { error: escrowError } = await supabase
        .from('escrow_transactions')
        .insert([{
          order_id: orderId,
          midtrans_order_id: payload.transaction_details.order_id,
          snap_token: token,
          amount: totalAmount,
          status: 'pending'
        }]);

      if (escrowError) throw escrowError;

      // 4. Open Snap Popup
      window.snap.pay(token, {
        onSuccess: async function (result: any) {
          // In a real app, a webhook handles this to prevent tampering.
          // For sandbox demo, we simulate success from the frontend.
          await supabase.from('escrow_transactions').update({
            status: 'on_hold',
            payment_type: result.payment_type,
            paid_at: new Date().toISOString()
          }).eq('order_id', orderId);
          
          await supabase.from('orders').update({
            status: 'on_hold'
          }).eq('id', orderId);

          toast.success('Pembayaran berhasil! Dana ditahan di sistem Escrow.');
          navigate('/buyer/orders');
        },
        onPending: function (result: any) {
          toast('Menunggu pembayaran Anda...');
          navigate('/buyer/orders');
        },
        onError: function (result: any) {
          toast.error('Pembayaran gagal.');
          setProcessing(false);
        },
        onClose: function () {
          toast('Anda menutup popup tanpa menyelesaikan pembayaran.');
          setProcessing(false);
          navigate('/buyer/orders');
        }
      });

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat memproses pesanan.');
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Menyiapkan Checkout..." />;
  if (!commodity) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to={`/buyer/marketplace/${commodity.id}`}
            className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-50">Checkout Pre-Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Kontrak Pembelian Aman
              </h2>
              
              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                {commodity.image_url ? (
                  <img src={commodity.image_url} alt={commodity.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">🌱</div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-200">{commodity.name}</h3>
                  <p className="text-emerald-400 font-medium">
                    {formatCurrency(commodity.price_per_unit)} / {commodity.unit}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Sisa Stok: {commodity.stock_projection} {commodity.unit}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Kuantitas ({commodity.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={commodity.stock_projection}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Catatan untuk Petani (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong pilihkan ukuran yang seragam..."
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 flex gap-4 bg-emerald-900/10 border-emerald-500/20">
              <AlertCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Dana Anda akan ditahan dengan aman oleh sistem <strong>Escrow Batur Tani</strong>. Dana baru akan diteruskan ke petani setelah Anda menerima dan menyetujui kondisi barang (E-QC) saat pengiriman.
              </p>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 sticky top-24 space-y-6">
              <h3 className="font-semibold text-slate-100">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Harga Satuan</span>
                  <span>{formatCurrency(commodity.price_per_unit)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Kuantitas</span>
                  <span>{quantity} {commodity.unit}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Biaya Layanan Escrow</span>
                  <span className="text-emerald-400">Gratis</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-slate-100">Total Harga</span>
                  <span className="text-emerald-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full py-3"
                  icon={<CreditCard className="w-5 h-5" />}
                  onClick={handlePayment}
                  loading={processing}
                >
                  Bayar via Midtrans
                </Button>
              </div>

              {commodity.farmer && (
                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dikirim Oleh</h4>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <p>{commodity.farmer.business_name}<br/>{commodity.farmer.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
