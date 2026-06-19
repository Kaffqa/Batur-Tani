import { useState } from 'react';
import { X, CheckCircle, Camera, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface EqcFormModalProps {
  orderId: string;
  commodityName: string;
  commodityCategory: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EqcFormModal({
  orderId,
  commodityName,
  commodityCategory,
  onClose,
  onSuccess
}: EqcFormModalProps) {
  const { user } = useAuth();
  const [condition, setCondition] = useState<'fresh' | 'acceptable' | 'rejected'>('fresh');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isApproved && condition !== 'rejected') {
      alert('Mohon centang persetujuan pelepasan dana jika kondisi barang dapat diterima.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('eqc_logs')
        .insert([{
          order_id: orderId,
          buyer_id: user!.id,
          condition,
          temperature: temperature ? parseFloat(temperature) : null,
          notes: notes || null,
          photo_url: photoUploaded ? 'https://simulated-url.com/photo.jpg' : null,
          is_approved: isApproved
        }]);

      if (error) throw error;
      
      alert(isApproved ? 'E-QC berhasil! Dana diteruskan ke petani.' : 'E-QC disubmit. Pengajuan retur akan diproses.');
      onSuccess();
    } catch (err) {
      console.error('EQC Error:', err);
      alert('Gagal mengirim form E-QC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-50">Form E-QC (Quality Control)</h2>
            <p className="text-sm text-slate-400 mt-1">{commodityName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Kondisi Barang Saat Tiba</label>
            <div className="grid grid-cols-3 gap-3">
              {(['fresh', 'acceptable', 'rejected'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCondition(opt)}
                  className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all ${
                    condition === opt 
                      ? opt === 'rejected' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {opt === 'fresh' ? 'Sangat Baik' : opt === 'acceptable' ? 'Dapat Diterima' : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          {commodityCategory === 'susu' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Suhu Saat Kedatangan (°C)</label>
              <input 
                type="number"
                step="0.1"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Contoh: 3.5"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Bukti Foto Simulasi</label>
            <button
              type="button"
              onClick={() => setPhotoUploaded(true)}
              className={`w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                photoUploaded 
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 hover:border-slate-500 text-slate-400'
              }`}
            >
              {photoUploaded ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">Foto berhasil diunggah (Simulasi)</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Klik untuk upload foto barang</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Catatan (Opsional)</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500/50 resize-none"
              placeholder="Tambahkan catatan jika ada masalah kualitas..."
            />
          </div>

          {condition !== 'rejected' && (
            <label className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30 cursor-pointer">
              <input 
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
              />
              <div>
                <p className="text-sm font-medium text-emerald-400">Pelepasan Dana Escrow</p>
                <p className="text-xs text-emerald-100/70 mt-0.5">Saya menyatakan barang telah diterima sesuai standar dan menyetujui pelepasan dana Escrow ke rekening Petani.</p>
              </div>
            </label>
          )}

          {condition === 'rejected' && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-200/80">Barang ditolak. Dana Escrow akan tetap ditahan hingga ada kesepakatan retur dengan pihak Petani.</p>
            </div>
          )}

          <div className="pt-2">
            <Button 
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={!photoUploaded}
            >
              Submit E-QC
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
