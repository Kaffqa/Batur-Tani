import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface NavbarProps {
  isDashboard?: boolean;
}

export default function Navbar({ isDashboard = false }: NavbarProps = {}) {
  const { user, profile, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ── Scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    // openAuthModal is handled in UI directly
  };

  const roleBadgeVariant = profile?.role === 'farmer' ? 'success' : 'info';
  const roleLabel = profile?.role === 'farmer' ? 'Petani' : 'Pembeli';

  return (
    <header
      className={`
        fixed top-0 right-0 z-40
        bg-slate-900/70 backdrop-blur-xl border-b
        transition-all duration-300
        ${isDashboard ? 'left-0 lg:left-64' : 'left-0'}
        ${scrolled ? 'border-slate-700/60 shadow-lg shadow-black/20' : 'border-transparent'}
      `.trim()}
    >
      <div className={isDashboard ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link to="/" className={`flex items-center gap-2.5 group ${isDashboard ? 'lg:hidden' : ''}`}>
            <span className="text-2xl" aria-hidden="true">
              🌾
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Batur Tani
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 mr-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-200 font-medium leading-tight">
                      {profile?.full_name || 'User'}
                    </p>
                    <Badge variant={roleBadgeVariant} size="sm">
                      {roleLabel}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={<LogOut className="h-4 w-4" />}
                  onClick={handleLogout}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal('login')}
                >
                  Masuk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAuthModal('register')}
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-out
          ${mobileOpen ? 'max-h-64 border-t border-slate-700/50' : 'max-h-0'}
        `.trim()}
      >
        <div className="px-4 py-4 space-y-3 bg-slate-900/90 backdrop-blur-xl">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">
                    {profile?.full_name || 'User'}
                  </p>
                  <Badge variant={roleBadgeVariant} size="sm">
                    {roleLabel}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<LogOut className="h-4 w-4" />}
                onClick={handleLogout}
                className="w-full justify-start"
              >
                Keluar
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  openAuthModal('login');
                  setMobileOpen(false);
                }}
                className="w-full"
              >
                Masuk
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  openAuthModal('register');
                  setMobileOpen(false);
                }}
                className="w-full"
              >
                Daftar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
