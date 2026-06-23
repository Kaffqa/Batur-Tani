import React, { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Mail, KeyRound, LogIn, AlertCircle, 
  User, Phone, Building2, CheckCircle2, UserPlus, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ── Role Card Component for Register Step 1 ──
interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ icon, title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative text-left p-4 rounded-2xl border transition-all duration-300 w-full
        ${selected
          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/80 hover:bg-slate-800/60'
        }
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
      )}
      <div className={`mb-3 h-10 w-10 flex items-center justify-center rounded-lg ${selected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
        {icon}
      </div>
      <h3 className={`text-base font-bold mb-1 ${selected ? 'text-emerald-400' : 'text-slate-200'}`}>
        {title}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </button>
  );
}

export default function AuthModal() {
  const { isOpen, view, closeAuthModal, switchView } = useAuthModal();
  const { signIn, signUp, profile } = useAuth();
  const navigate = useNavigate();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setLoginEmail('');
        setLoginPassword('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirm('');
        setRegName('');
        setRegPhone('');
        setRegBusiness('');
        setRegRole(null);
        setRegStep(1);
        setError('');
      }, 300);
    }
  }, [isOpen]);

  // Common State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regRole, setRegRole] = useState<UserRole | null>(null);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusiness, setRegBusiness] = useState('');

  if (!isOpen) return null;

  // Handlers
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Email dan password wajib diisi.');
      return;
    }
    try {
      setLoading(true);
      await signIn(loginEmail, loginPassword);
      closeAuthModal();
      setTimeout(() => {
        // useAuth uses onAuthStateChange which might update profile a bit later. 
        // We handle redirection generally in App.tsx or we just navigate to dashboard
        // If we want instant redirect, we can rely on ProtectedRoutes.
        // For now, we will navigate to dashboard directly if we know role, else App.tsx will handle it
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword || !regConfirm || !regPhone || !regBusiness) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Password tidak cocok.');
      return;
    }
    try {
      setLoading(true);
      await signUp(regEmail, regPassword, regRole!, regName, regBusiness);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Selamat Datang</h2>
        <p className="text-sm text-slate-400 mt-1">Masuk ke akun Batur Tani Anda</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          icon={<Mail className="h-4 w-4" />}
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<KeyRound className="h-4 w-4" />}
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300">
            Lupa password?
          </button>
        </div>
        <Button type="submit" variant="primary" className="w-full" loading={loading} icon={<LogIn className="h-4 w-4" />}>
          Masuk
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-400">
        Belum punya akun?{' '}
        <button onClick={() => switchView('register')} className="text-emerald-400 hover:text-emerald-300 font-medium">
          Daftar Sekarang
        </button>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Buat Akun</h2>
        <p className="text-sm text-slate-400 mt-1">
          {regStep === 1 ? 'Pilih peran Anda di platform' : 'Lengkapi data diri Anda'}
        </p>
      </div>

      {regStep === 1 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              icon={<User className="h-5 w-5" />}
              title="Petani"
              description="Jual hasil panen langsung dengan harga stabil"
              selected={regRole === 'farmer'}
              onClick={() => setRegRole('farmer')}
            />
            <RoleCard
              icon={<Building2 className="h-5 w-5" />}
              title="Pembeli B2B"
              description="Akses suplai sayuran jumlah besar (Tonase)"
              selected={regRole === 'buyer'}
              onClick={() => setRegRole('buyer')}
            />
          </div>
          <Button
            onClick={() => {
              if (!regRole) setError('Pilih peran terlebih dahulu');
              else { setError(''); setRegStep(2); }
            }}
            variant="primary"
            className="w-full"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Lanjutkan
          </Button>
        </div>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nama Lengkap" placeholder="Budi Santoso" icon={<User className="h-4 w-4" />} value={regName} onChange={(e) => setRegName(e.target.value)} required />
            <Input label={regRole === 'farmer' ? 'Nama Lahan' : 'Nama Bisnis'} placeholder={regRole === 'farmer' ? 'Tani Maju' : 'PT Segar Alam'} icon={<Building2 className="h-4 w-4" />} value={regBusiness} onChange={(e) => setRegBusiness(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" placeholder="email@contoh.com" icon={<Mail className="h-4 w-4" />} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            <Input label="No. WhatsApp" type="tel" placeholder="0812..." icon={<Phone className="h-4 w-4" />} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" placeholder="••••••••" icon={<KeyRound className="h-4 w-4" />} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            <Input label="Konfirmasi" type="password" placeholder="••••••••" icon={<KeyRound className="h-4 w-4" />} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setRegStep(1)} className="flex-1" icon={<ArrowLeft className="h-4 w-4" />}>
              Kembali
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="flex-1" icon={<UserPlus className="h-4 w-4" />}>
              Daftar
            </Button>
          </div>
        </form>
      )}
      
      {regStep === 1 && (
        <div className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?{' '}
          <button onClick={() => switchView('login')} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Masuk di sini
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-8">
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {view === 'login' ? renderLogin() : renderRegister()}
        </div>
      </div>
    </div>
  );
}
