// ============================================================
// Batur Tani — Marketplace Page
// Browse and search available commodities from farmers
// ============================================================

import { useState, useMemo } from 'react';
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
import type { Commodity, CommodityCategory } from '@/types';

// Mock data — realistic Indonesian agricultural products
const mockCommodities: Commodity[] = [
  {
    id: '1',
    farmer_id: 'f1',
    farmer: {
      id: 'f1',
      role: 'farmer',
      full_name: 'Pak Ahmad Yusuf',
      business_name: 'Kebun Sejahtera',
      phone: '081234567890',
      address: 'Desa Batur, Kab. Banjarnegara',
      latitude: -7.2321,
      longitude: 109.9029,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-01-15',
    },
    name: 'Tomat Cherry Premium',
    category: 'hortikultura',
    description:
      'Tomat cherry organik dataran tinggi Batur, ditanam di ketinggian 1.500 mdpl. Rasa manis alami dengan kadar gula tinggi, cocok untuk salad premium dan garnish restoran fine dining.',
    price_per_unit: 35000,
    unit: 'kg',
    stock_projection: 500,
    harvest_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    farmer_id: 'f1',
    farmer: {
      id: 'f1',
      role: 'farmer',
      full_name: 'Pak Ahmad Yusuf',
      business_name: 'Kebun Sejahtera',
      phone: '081234567890',
      address: 'Desa Batur, Kab. Banjarnegara',
      latitude: -7.2321,
      longitude: 109.9029,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-01-15',
    },
    name: 'Kentang Granola',
    category: 'hortikultura',
    description:
      'Kentang varietas Granola kualitas super dari dataran tinggi Dieng. Ukuran seragam, cocok untuk industri makanan olahan, restoran, dan katering skala besar.',
    price_per_unit: 15000,
    unit: 'kg',
    stock_projection: 2000,
    harvest_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    farmer_id: 'f2',
    farmer: {
      id: 'f2',
      role: 'farmer',
      full_name: 'Bu Sri Lestari',
      business_name: 'Peternakan Batur Jaya',
      phone: '089876543210',
      address: 'Desa Sumberejo, Kab. Banjarnegara',
      latitude: -7.2115,
      longitude: 109.8945,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-02-10',
    },
    name: 'Susu Sapi Segar',
    category: 'susu',
    description:
      'Susu segar dari sapi perah Friesian Holstein, pemerahan pagi hari. Golden period 4 jam. Kadar lemak 3.8%, protein 3.2%. Wajib dijemput dengan pendingin.',
    price_per_unit: 12000,
    unit: 'liter',
    stock_projection: 100,
    harvest_date: new Date().toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    farmer_id: 'f3',
    farmer: {
      id: 'f3',
      role: 'farmer',
      full_name: 'Pak Hasan Basri',
      business_name: 'Tani Makmur Dieng',
      phone: '081298765432',
      address: 'Desa Dieng Kulon, Kab. Banjarnegara',
      latitude: -7.2091,
      longitude: 109.9147,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-03-01',
    },
    name: 'Cabai Rawit Merah',
    category: 'hortikultura',
    description:
      'Cabai rawit merah super pedas dari dataran tinggi Dieng. Tingkat kepedasan tinggi (100.000+ SHU), warna merah cerah, ideal untuk industri sambal dan restoran.',
    price_per_unit: 80000,
    unit: 'kg',
    stock_projection: 300,
    harvest_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    farmer_id: 'f4',
    farmer: {
      id: 'f4',
      role: 'farmer',
      full_name: 'Pak Suryo Wibowo',
      business_name: 'Petani Bawang Sejati',
      phone: '081376543210',
      address: 'Desa Pesurenan, Kab. Brebes',
      latitude: -6.8724,
      longitude: 109.0425,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-01-20',
    },
    name: 'Bawang Merah Brebes',
    category: 'hortikultura',
    description:
      'Bawang merah kualitas ekspor dari Brebes. Kadar air rendah, daya simpan lama, aroma tajam khas. Cocok untuk industri bumbu masak dan kebutuhan restoran besar.',
    price_per_unit: 45000,
    unit: 'kg',
    stock_projection: 800,
    harvest_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    farmer_id: 'f2',
    farmer: {
      id: 'f2',
      role: 'farmer',
      full_name: 'Bu Sri Lestari',
      business_name: 'Peternakan Batur Jaya',
      phone: '089876543210',
      address: 'Desa Sumberejo, Kab. Banjarnegara',
      latitude: -7.2115,
      longitude: 109.8945,
      bank_account: null,
      avatar_url: null,
      created_at: '2026-02-10',
    },
    name: 'Yogurt Susu Segar',
    category: 'susu',
    description:
      'Yogurt homemade dari susu sapi segar Batur. Tanpa pengawet, rasa plain natural. Cocok untuk restoran sehat, kafe, dan industri minuman.',
    price_per_unit: 25000,
    unit: 'liter',
    stock_projection: 50,
    harvest_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image_url: null,
    is_available: true,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type SortOption = 'newest' | 'cheapest' | 'expensive' | 'stock';
type CategoryFilter = 'all' | CommodityCategory;

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter & sort commodities
  const filteredCommodities = useMemo(() => {
    let result = [...mockCommodities];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.farmer?.business_name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Only show available
    result = result.filter((c) => c.is_available);

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
  }, [searchQuery, categoryFilter, sortBy]);

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
              <CommodityCard key={commodity.id} commodity={commodity} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
