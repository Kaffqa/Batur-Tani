import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import type { Commodity } from '@/types';
import toast from 'react-hot-toast';

export default function CommoditiesPage() {
  const { user } = useAuth();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchCommodities();
    }
  }, [user]);

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commodities')
        .select('*')
        .eq('farmer_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommodities(data || []);
    } catch (error) {
      console.error('Error fetching commodities:', error);
      toast.error('Gagal memuat daftar komoditas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('commodities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCommodities(commodities.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting commodity:', error);
      toast.error('Gagal menghapus komoditas.');
    }
  };

  const filteredCommodities = commodities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              Komoditas Saya
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Kelola katalog produk, stok, dan estimasi panen Anda.
            </p>
          </div>
          <Link to="/farmer/commodities/new">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Tambah Produk
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama komoditas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama Produk</th>
                  <th className="px-6 py-4 font-medium">Harga</th>
                  <th className="px-6 py-4 font-medium">Stok & Panen</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredCommodities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Belum ada komoditas. Tambahkan produk pertama Anda!
                    </td>
                  </tr>
                ) : (
                  filteredCommodities.map((commodity) => (
                    <tr
                      key={commodity.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">
                          {commodity.name}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {commodity.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(commodity.price_per_unit)}
                        </span>
                        <span className="text-xs text-slate-500">
                          /{commodity.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200">
                          {commodity.stock_projection} {commodity.unit}
                        </div>
                        <div className="text-xs text-slate-500">
                          Panen:{' '}
                          {commodity.harvest_date
                            ? new Date(commodity.harvest_date).toLocaleDateString(
                                'id-ID'
                              )
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={commodity.is_available ? 'success' : 'danger'}
                          size="sm"
                        >
                          {commodity.is_available ? 'Tersedia' : 'Kosong'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/farmer/commodities/${commodity.id}/edit`}>
                            <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(commodity.id, commodity.name)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
