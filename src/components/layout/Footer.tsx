import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden="true">
              🌾
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Batur Tani
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-slate-500 text-center">
            Platform B2B Agritech — Menghubungkan Petani dengan Pasar Modern
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/about"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Tentang
            </Link>
            <Link
              to="/terms"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              to="/privacy"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privasi
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            © 2026 Batur Tani. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
