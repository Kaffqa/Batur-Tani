// ============================================================
// Batur Tani — Marketplace Page
// Browse and search available commodities from farmers
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Package,
  Leaf,
  Milk,
  ArrowUpDown,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CommodityCard from '@/components/dashboard/CommodityCard';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';
import { supabase } from '@/lib/supabase';
import type { Commodity, CommodityCategory } from '@/types';

type SortOption = 'newest' | 'cheapest' | 'expensive' | 'stock';
type CategoryFilter = 'all' | CommodityCategory;

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commodities')
        .select(`
          *,
          farmer:profiles!commodities_farmer_id_fkey (
            id, role, full_name, business_name, address
          )
        `)
        .eq('is_available', true);

      if (error) throw error;
      setCommodities((data as any) || []);
    } catch (error) {
      console.error('Error fetching commodities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter & sort commodities
  const filteredCommodities = useMemo(() => {
    let result = [...commodities];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)) ||
          (c.farmer?.business_name && c.farmer.business_name.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'cheapest':
        result.sort((a, b) => a.price_per_unit - b.price_per_unit);
        break;
      case 'expensive':
        result.sort((a, b) => b.price_per_unit - a.price_per_unit);
        break;
      case 'stock':
        result.sort((a, b) => b.stock_projection - a.stock_projection);
        break;
    }

    return result;
  }, [searchQuery, categoryFilter, sortBy, commodities]);

  const handlePreOrder = (commodity: Commodity) => {
    navigate(`/buyer/marketplace/${commodity.id}`);
  };

  if (loading) {
    return <CardGridSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" />
            Marketplace Komoditas
          </h1>
          <p className="text-slate-400 mt-1">
            Temukan bahan baku segar langsung dari petani dataran tinggi
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="glass rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari komoditas, petani, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setCategoryFilter('hortikultura')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    categoryFilter === 'hortikultura'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  Hortikultura
                </button>
                <button
                  onClick={() => setCategoryFilter('susu')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    categoryFilter === 'susu'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Milk className="w-3.5 h-3.5" />
                  Susu
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-9 pr-8 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  <option value="newest">Terbaru</option>
                  <option value="cheapest">Termurah</option>
                  <option value="expensive">Termahal</option>
                  <option value="stock">Stok Terbanyak</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters (expanded) */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700/50 space-y-3 animate-slide-down">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Kategori
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      categoryFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setCategoryFilter('hortikultura')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      categoryFilter === 'hortikultura'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    Hortikultura
                  </button>
                  <button
                    onClick={() => setCategoryFilter('susu')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      categoryFilter === 'susu'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    <Milk className="w-3.5 h-3.5" />
                    Susu
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Urutkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="newest">Terbaru</option>
                  <option value="cheapest">Termurah</option>
                  <option value="expensive">Termahal</option>
                  <option value="stock">Stok Terbanyak</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Menampilkan{' '}
            <span className="text-emerald-400 font-semibold">
              {filteredCommodities.length}
            </span>{' '}
            komoditas
          </p>
        </div>

        {/* Commodity Grid */}
        {filteredCommodities.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              Tidak Ada Komoditas Ditemukan
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau filter kategori untuk menemukan
              komoditas yang Anda cari.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommodities.map((commodity) => (
              <CommodityCard 
                key={commodity.id} 
                commodity={commodity} 
                onPreOrder={handlePreOrder} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
