// ============================================================
// Batur Tani — Login Page
// Split-layout auth page with glassmorphism form
// ============================================================

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, LogIn, AlertCircle, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);

      // Small delay to let auth state propagate
      setTimeout(() => {
        if (profile?.role === 'buyer') {
          navigate('/buyer', { replace: true });
        } else {
          navigate('/farmer', { replace: true });
        }
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login gagal. Periksa email dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #022c22 0%, #0f172a 50%, #020617 100%)',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Floating decorative dots */}
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

        {/* Center content */}
        <div className="relative z-10 max-w-md px-10 text-center">
          <span className="text-6xl mb-6 block" aria-hidden="true">
            🌾
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Selamat Datang Kembali
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Masuk ke akun Anda untuk mengelola komoditas, memantau pesanan, dan
            mengakses data cuaca real-time.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4 text-left">
            {[
              'Dashboard analitik real-time',
              'Sistem escrow yang aman',
              'Peringatan cuaca cerdas',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <Leaf className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <span className="text-3xl" aria-hidden="true">🌾</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Batur Tani
            </span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 shadow-2xl shadow-black/20">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">Masuk</h1>
              <p className="text-sm text-slate-400 mt-1">
                Masuk ke akun Batur Tani Anda
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6 animate-slide-down">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                icon={<KeyRound className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  Lupa password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={<LogIn className="h-4 w-4" />}
                className="w-full"
              >
                Masuk
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Daftar di sini
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
