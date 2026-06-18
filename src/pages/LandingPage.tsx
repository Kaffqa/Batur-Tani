// ============================================================
// Batur Tani — Landing Page
// Premium B2B Agritech Marketplace Landing
// ============================================================

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  ShoppingCart,
  TrendingUp,
  Leaf,
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
      <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors duration-300">
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
  emoji: string;
  title: string;
  description: string;
  delay: string;
}

function FeatureCard({ emoji, title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 animate-slide-up"
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
        <span className="text-4xl mb-4 block" aria-hidden="true">
          {emoji}
        </span>
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
        <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] border-t-2 border-dashed border-emerald-500/30" />
      )}
      {/* Number circle */}
      <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/50 transition-shadow duration-300 mb-4">
        {step}
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-1.5 max-w-[180px]">{title}</h4>
      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">{description}</p>
    </div>
  );
}

// ── Main Landing Page ──
export default function LandingPage() {
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
              'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <FloatingParticles />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8 animate-fade-in">
            <Leaf className="h-3.5 w-3.5" />
            Platform Agregator B2B Agritech
          </div>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="block text-white">Revolusi Rantai Pasok</span>
            <span
              className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
            >
              Agribisnis Dataran Tinggi
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Platform agregator B2B yang memotong rantai tengkulak, menstabilkan harga
            melalui Smart Pre-Order, dan mencegah gagal panen dengan teknologi
            mitigasi cuaca hibrida.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              Mulai Sebagai Petani
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              Masuk Sebagai Pembeli
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="inline-flex flex-wrap justify-center gap-6 sm:gap-10 p-6 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <StatItem
              icon={<Users className="h-5 w-5" />}
              value="500+"
              label="Petani"
            />
            <StatItem
              icon={<ShoppingCart className="h-5 w-5" />}
              value="1.200+"
              label="Transaksi"
            />
            <StatItem
              icon={<TrendingUp className="h-5 w-5" />}
              value="Rp 2.5M+"
              label="Volume"
            />
            <StatItem
              icon={<Leaf className="h-5 w-5" />}
              value="15+"
              label="Komoditas"
            />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-950 to-transparent pointer-events-none" />
      </section>

      {/* ============================================================
         FEATURES SECTION
         ============================================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Mengapa{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Batur Tani
              </span>
              ?
            </h2>
            <p className="max-w-xl mx-auto text-slate-400">
              Empat pilar teknologi yang melindungi rantai pasok Anda dari hulu ke hilir.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              emoji="🌤️"
              title="Mitigasi Cuaca Hibrida"
              description="Sistem peringatan panen dini yang menggabungkan data satelit Open-Meteo dengan sensor IoT di lahan Anda."
              delay="0s"
            />
            <FeatureCard
              emoji="🔒"
              title="Smart Pre-Order & Price Locking"
              description="Kunci harga dan kuantitas sebelum panen. Lindungi pendapatan dari permainan harga tengkulak."
              delay="0.1s"
            />
            <FeatureCard
              emoji="💰"
              title="Escrow Payment System"
              description="Dana pembeli ditahan aman di rekening bersama. Pencairan otomatis setelah validasi kualitas."
              delay="0.2s"
            />
            <FeatureCard
              emoji="🚛"
              title="Logistik Dinamis & E-QC"
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
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
              Alur Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Cara{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Kerja
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-slate-400">
              Lima langkah sederhana dari ladang ke meja bisnis Anda.
            </p>
          </div>

          {/* Steps — desktop: horizontal, mobile: vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-4">
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
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 p-[1px]">
              <div className="h-full w-full rounded-3xl bg-slate-900" />
            </div>

            {/* Content */}
            <div className="relative p-10 sm:p-14 text-center">
              {/* Glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="relative">
                <span className="text-4xl mb-4 block" aria-hidden="true">🌾</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  Siap Memulai Perjalanan{' '}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Agribisnis Digital
                  </span>
                  ?
                </h2>
                <p className="max-w-lg mx-auto text-slate-400 mb-8">
                  Bergabunglah dengan ratusan petani dan pembeli bisnis yang telah
                  bertransformasi bersama Batur Tani.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
