import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { CommodityCategory } from '@/types';

export default function CommodityFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'hortikultura' as CommodityCategory,
    description: '',
    price_per_unit: '',
    unit: 'kg',
    stock_projection: '',
    harvest_date: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchCommodity(id);
    }
  }, [isEdit, id]);

  const fetchCommodity = async (commodityId: string) => {
    try {
      const { data, error } = await supabase
        .from('commodities')
        .select('*')
        .eq('id', commodityId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          category: data.category,
          description: data.description || '',
          price_per_unit: data.price_per_unit.toString(),
          unit: data.unit,
          stock_projection: data.stock_projection.toString(),
          harvest_date: data.harvest_date || '',
          image_url: data.image_url || '',
          is_available: data.is_available,
        });
      }
    } catch (error) {
      console.error('Error fetching commodity:', error);
      alert('Gagal memuat data komoditas.');
      navigate('/farmer/commodities');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG with 70% quality to save space in database
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData((prev) => ({ ...prev, image_url: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const payload = {
        farmer_id: user.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price_per_unit: parseInt(formData.price_per_unit, 10),
        unit: formData.unit,
        stock_projection: parseInt(formData.stock_projection, 10),
        harvest_date: formData.harvest_date || null,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('commodities')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        alert('Komoditas berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('commodities').insert([payload]);
        if (error) throw error;
        alert('Komoditas berhasil ditambahkan!');
      }

      navigate('/farmer/commodities');
    } catch (error: any) {
      console.error('Error saving commodity:', error);
      alert(error.message || 'Gagal menyimpan komoditas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            to="/farmer/commodities"
            className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-50">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Nama Produk <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Cth: Kentang Granola Super"
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="hortikultura">Hortikultura (Sayur/Buah)</option>
                <option value="susu">Susu Segar</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Foto Produk</label>
            <div className="relative w-full h-48 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-600 hover:border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden group transition-colors cursor-pointer">
              {formData.image_url ? (
                <>
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain bg-black/20" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                    <Upload className="w-8 h-8 text-white mb-2" />
                    <span className="text-sm text-white font-medium">Ganti Foto Produk</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-500/20">
                    <ImageIcon className="w-7 h-7 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Klik area ini untuk mengunggah foto</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">Format: JPG, PNG. Gambar akan otomatis dikompresi agar ringan dan tidak membebani sistem.</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Deskripsikan kualitas, ukuran, atau keunggulan produk Anda..."
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Harga <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  Rp
                </span>
                <input
                  required
                  type="number"
                  min="1"
                  name="price_per_unit"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Satuan <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Cth: kg, liter, ikat"
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Estimasi Stok <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                name="stock_projection"
                value={formData.stock_projection}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Tanggal Panen (Opsional)
              </label>
              <input
                type="date"
                name="harvest_date"
                value={formData.harvest_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/50 bg-slate-700"
                />
                <span className="text-sm font-medium text-slate-200">
                  Tandai sebagai Tersedia
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-700/50 flex justify-end gap-3">
            <Link to="/farmer/commodities">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              loading={loading}
            >
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
