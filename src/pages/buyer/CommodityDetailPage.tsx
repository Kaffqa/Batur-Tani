import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, User, Calendar, MapPin, Package } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DetailSkeleton from '@/components/skeletons/DetailSkeleton';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Commodity } from '@/types';
import toast from 'react-hot-toast';

export default function CommodityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCommodityDetail(id);
    }
  }, [id]);

  const fetchCommodityDetail = async (commodityId: string) => {
    try {
      setLoading(true);
      // Fetch commodity with farmer profile via join
      const { data, error } = await supabase
        .from('commodities')
        .select(`
          *,
          farmer:profiles!commodities_farmer_id_fkey (
            id, role, full_name, business_name, address, phone
          )
        `)
        .eq('id', commodityId)
        .single();

      if (error) throw error;
      if (data) {
        setCommodity(data as any); // Casting since query results shape is a bit loose
      } else {
        navigate('/buyer/marketplace');
      }
    } catch (error) {
      console.error('Error fetching commodity detail:', error);
      toast.error('Gagal memuat detail komoditas.');
      navigate('/buyer/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handlePreOrder = () => {
    navigate(`/buyer/checkout/${commodity?.id}`);
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!commodity) {
    return null;
  }

  const hasImage = commodity.image_url && commodity.image_url.length > 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Link
          to="/buyer/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Marketplace</span>
        </Link>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-64 md:h-full min-h-[300px] bg-slate-800">
              {hasImage ? (
                <img
                  src={commodity.image_url!}
                  alt={commodity.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-800 flex items-center justify-center">
                  <Package className="w-24 h-24 text-emerald-500/20" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="info">{commodity.category}</Badge>
                <Badge variant={commodity.is_available ? 'success' : 'danger'}>
                  {commodity.is_available ? 'Tersedia' : 'Habis'}
                </Badge>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
                  {commodity.name}
                </h1>
                <p className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(commodity.price_per_unit)}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    / {commodity.unit}
                  </span>
                </p>
              </div>

              <div className="prose prose-invert prose-emerald max-w-none">
                <p className="text-slate-300 leading-relaxed">
                  {commodity.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700/50">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Estimasi Stok</p>
                  <p className="font-semibold text-slate-200 text-lg">
                    {commodity.stock_projection} {commodity.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Tanggal Panen</p>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {commodity.harvest_date
                      ? new Date(commodity.harvest_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Farmer Info */}
              {commodity.farmer && (
                <div className="bg-slate-800/40 rounded-xl p-4 space-y-3 border border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Informasi Petani
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-700/50 rounded-lg text-emerald-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        {commodity.farmer.business_name || commodity.farmer.full_name}
                      </p>
                      <p className="text-sm text-slate-400">{commodity.farmer.full_name}</p>
                    </div>
                  </div>
                  {commodity.farmer.address && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg text-emerald-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {commodity.farmer.address}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  icon={<ShoppingCart className="w-5 h-5" />}
                  disabled={!commodity.is_available || commodity.stock_projection <= 0}
                  onClick={handlePreOrder}
                >
                  {commodity.stock_projection > 0
                    ? 'Lanjutkan ke Pre-Order'
                    : 'Stok Habis'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
