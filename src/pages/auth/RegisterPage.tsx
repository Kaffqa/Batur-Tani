// ============================================================
// Batur Tani — Register Page
// Multi-step registration with role selection
// ============================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  User,
  Phone,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Leaf,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ── Role selection card ──
interface RoleCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ emoji, title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative text-left p-6 rounded-2xl border transition-all duration-300
        ${
          selected
            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/80 hover:bg-slate-800/60'
        }
      `.trim()}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
      )}

      <span className="text-4xl mb-3 block" aria-hidden="true">
        {emoji}
      </span>
      <h3
        className={`text-lg font-bold mb-1 ${
          selected ? 'text-emerald-400' : 'text-slate-200'
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </button>
  );
}

// ── Main Register Page ──
export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
  };

  const goToStep2 = () => {
    if (!role) {
      setError('Pilih peran Anda terlebih dahulu.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (!businessName) {
      setError(
        role === 'farmer'
          ? 'Nama usaha tani wajib diisi.'
          : 'Nama bisnis wajib diisi.'
      );
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, role!, fullName, businessName);
      navigate(role === 'farmer' ? '/farmer' : '/buyer', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Pendaftaran gagal. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #022c22 0%, #0f172a 50%, #020617 100%)',
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Floating dots */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-400 animate-float"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                opacity: Math.random() * 0.3 + 0.05,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 3 + 3}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md px-10 text-center">
          <span className="text-6xl mb-6 block" aria-hidden="true">
            🌱
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Mulai Perjalanan Anda
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Daftarkan diri Anda dan akses ekosistem agribisnis digital terdepan
            di dataran tinggi Indonesia.
          </p>

          {/* Step indicator */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                step === 1
                  ? 'w-10 bg-emerald-500'
                  : 'w-2.5 bg-slate-600'
              }`}
            />
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                step === 2
                  ? 'w-10 bg-emerald-500'
                  : 'w-2.5 bg-slate-600'
              }`}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Langkah {step} dari 2
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <span className="text-3xl" aria-hidden="true">🌾</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Batur Tani
            </span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 shadow-2xl shadow-black/20">
            {/* ──────── STEP 1: Role selection ──────── */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white">Daftar</h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Pilih peran Anda di platform
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6 animate-slide-down">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <RoleCard
                    emoji="🌾"
                    title="Petani / Peternak"
                    description="Jual hasil panen langsung ke pembeli bisnis tanpa tengkulak."
                    selected={role === 'farmer'}
                    onClick={() => handleRoleSelect('farmer')}
                  />
                  <RoleCard
                    emoji="🏪"
                    title="Pembeli Bisnis (HORECA)"
                    description="Beli komoditas segar langsung dari petani dengan harga stabil."
                    selected={role === 'buyer'}
                    onClick={() => handleRoleSelect('buyer')}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="h-4 w-4" />}
                  className="w-full"
                  onClick={goToStep2}
                >
                  Lanjutkan
                </Button>
              </div>
            )}

            {/* ──────── STEP 2: Registration form ──────── */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    aria-label="Kembali"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Lengkapi Data
                    </h1>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-emerald-400" />
                      {role === 'farmer'
                        ? 'Pendaftaran Petani'
                        : 'Pendaftaran Pembeli'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6 animate-slide-down">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    icon={<User className="h-4 w-4" />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      icon={<KeyRound className="h-4 w-4" />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <Input
                      label="Konfirmasi Password"
                      type="password"
                      placeholder="Ulangi password"
                      icon={<KeyRound className="h-4 w-4" />}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <Input
                    label="Nomor Telepon"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    icon={<Phone className="h-4 w-4" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  {/* Divider */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      {role === 'farmer'
                        ? 'Informasi Usaha Tani'
                        : 'Informasi Bisnis'}
                    </p>
                  </div>

                  <Input
                    label={
                      role === 'farmer'
                        ? 'Nama Usaha Tani'
                        : 'Nama Bisnis / Restoran'
                    }
                    type="text"
                    placeholder={
                      role === 'farmer'
                        ? 'Contoh: Tani Makmur Batur'
                        : 'Contoh: Warung Segar Nusantara'
                    }
                    icon={<Building2 className="h-4 w-4" />}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />

                  <Input
                    label={
                      role === 'farmer' ? 'Alamat Lahan' : 'Alamat Bisnis'
                    }
                    type="text"
                    placeholder={
                      role === 'farmer'
                        ? 'Contoh: Desa Batur, Kec. Batur, Banjarnegara'
                        : 'Contoh: Jl. Sudirman No.10, Purwokerto'
                    }
                    icon={<MapPin className="h-4 w-4" />}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    icon={<UserPlus className="h-4 w-4" />}
                    className="w-full mt-2"
                  >
                    Daftar
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
