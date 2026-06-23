// ============================================================
// Batur Tani — Landing Page
// Premium B2B Agritech Marketplace Landing
// ============================================================

import { Link } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import {
  ArrowRight,
  Users,
  ShoppingCart,
  TrendingUp,
  Leaf,
  CloudLightning,
  ShieldCheck,
  Wallet,
  Truck,
  Sprout,
  BarChart3,
  LineChart
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// ── Floating particle component (CSS-driven) ──
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 3,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-emerald-400 animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Stat item ──
interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

// ── Feature card ──
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  colorClass: string;
}

function FeatureCard({ icon, title, description, delay, colorClass }: FeatureCardProps) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className={`mb-6 h-14 w-14 rounded-xl flex items-center justify-center ${colorClass} transition-transform duration-500 group-hover:scale-110`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Step item ──
interface StepItemProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

function StepItem({ step, title, description, isLast = false }: StepItemProps) {
  return (
    <div className="flex flex-col items-center text-center relative group">
      {/* Connecting line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] border-t-2 border-dashed border-emerald-500/30 group-hover:border-emerald-400 transition-colors duration-500" />
      )}
      {/* Number circle */}
      <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-all duration-300 mb-4">
        {step}
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-1.5 max-w-[180px]">{title}</h4>
      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">{description}</p>
    </div>
  );
}



// ── Main Landing Page ──
export default function LandingPage() {
  const { openAuthModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      {/* ============================================================
         HERO SECTION
         ============================================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #020617 0%, #022c22 30%, #0f172a 60%, #020617 100%)',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <FloatingParticles />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Leaf className="h-3.5 w-3.5" />
              Platform Agregator B2B Agritech
            </div>

            {/* Heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 animate-slide-up tracking-tight"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="block text-white mb-2">Revolusi Rantai Pasok</span>
              <span
                className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent pb-2"
              >
                Agribisnis Dataran Tinggi
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-400 leading-relaxed mb-10 animate-slide-up font-medium"
              style={{ animationDelay: '0.2s' }}
            >
              Platform agregator B2B yang memotong rantai tengkulak, menstabilkan harga
              melalui Smart Pre-Order, dan mencegah gagal panen dengan teknologi
              mitigasi cuaca hibrida.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <button
                onClick={() => openAuthModal('register')}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                Mulai Sebagai Petani
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                Masuk Sebagai Pembeli
              </button>
            </div>

            {/* Stats bar */}
            <div
              className="inline-flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <StatItem
                icon={<Users className="h-5 w-5" />}
                value="500+"
                label="Petani"
              />
              <StatItem
                icon={<ShoppingCart className="h-5 w-5" />}
                value="1.2K+"
                label="Transaksi"
              />
              <StatItem
                icon={<TrendingUp className="h-5 w-5" />}
                value="Rp 2.5M+"
                label="Volume"
              />
            </div>
          </div>

          {/* Concrete Information Panel */}
          <div className="hidden lg:flex flex-1 flex-col justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="glass p-8 rounded-3xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                Mengapa Memilih Batur Tani?
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Harga Langsung Petani</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">Dapatkan harga 15-20% lebih stabil dengan memotong rantai tengkulak. Akses langsung ke sumber panen utama.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Keamanan Escrow 100%</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">Dana ditahan di rekening bersama. Hanya diteruskan ke petani setelah kualitas dan kuantitas pengiriman divalidasi oleh Anda.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Kapasitas B2B Skala Tonase</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">Didesain khusus untuk pembeli bisnis (HOREKA & Supermarket). Pesan dari ratusan kilogram hingga puluhan ton dengan mudah.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         FEATURES SECTION
         ============================================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Mengapa{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Batur Tani
              </span>
              ?
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              Empat pilar teknologi yang melindungi rantai pasok Anda dari hulu ke hilir.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<CloudLightning className="h-7 w-7" />}
              colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              title="Mitigasi Cuaca Hibrida"
              description="Sistem peringatan panen dini yang menggabungkan data satelit Open-Meteo dengan sensor IoT di lahan Anda."
              delay="0s"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-7 w-7" />}
              colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              title="Smart Pre-Order"
              description="Kunci harga dan kuantitas sebelum panen. Lindungi pendapatan dari permainan harga tengkulak."
              delay="0.1s"
            />
            <FeatureCard
              icon={<Wallet className="h-7 w-7" />}
              colorClass="bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              title="Escrow Payment"
              description="Dana pembeli ditahan aman di rekening bersama. Pencairan otomatis setelah validasi kualitas."
              delay="0.2s"
            />
            <FeatureCard
              icon={<Truck className="h-7 w-7" />}
              colorClass="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              title="Logistik E-QC"
              description="Penjadwalan pengiriman cerdas dengan countdown basi real-time dan quality control digital."
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
         HOW IT WORKS
         ============================================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              Alur Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">
              Cara{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Kerja
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-slate-400 text-lg">
              Lima langkah sederhana dari ladang ke meja bisnis Anda.
            </p>
          </div>

          {/* Steps — desktop: horizontal, mobile: vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-4">
            <StepItem
              step={1}
              title="Petani Mendaftar"
              description="Publikasi proyeksi panen dan komoditas tersedia di marketplace."
            />
            <StepItem
              step={2}
              title="Pembeli Pre-Order"
              description="Pembeli B2B mencari dan pre-order komoditas dengan harga terkunci."
            />
            <StepItem
              step={3}
              title="Pembayaran Escrow"
              description="Pembayaran aman via QRIS. Dana ditahan hingga validasi selesai."
            />
            <StepItem
              step={4}
              title="Pengiriman Langsung"
              description="Pengiriman ladang-ke-pintu dengan tracking dan countdown basi."
            />
            <StepItem
              step={5}
              title="Validasi & Pencairan"
              description="Quality control digital, lalu dana otomatis dicairkan ke petani."
              isLast
            />
          </div>
        </div>
      </section>

      {/* ============================================================
         CTA SECTION
         ============================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden group">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-[1px] rounded-[2.5rem] bg-slate-900/95 backdrop-blur-3xl z-10"></div>
            
            {/* Content */}
            <div className="relative z-20 p-10 sm:p-16 text-center">
              {/* Glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="relative">
                <div className="mb-6 mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Sprout className="h-8 w-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                  Siap Memulai Perjalanan{' '}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Agribisnis Digital
                  </span>
                  ?
                </h2>
                <p className="max-w-xl mx-auto text-slate-400 mb-10 text-lg">
                  Bergabunglah dengan ratusan petani dan pembeli bisnis yang telah
                  bertransformasi bersama Batur Tani.
                </p>
                <button
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1 scale-100 hover:scale-105"
                >
                  Daftar Sekarang Secara Gratis
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
