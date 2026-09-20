import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Cloud,
  Wallet,
  Store,
  History,
  ClipboardCheck,
  X,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const farmerMenu: MenuItem[] = [
  { label: 'Overview', path: '/farmer', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Komoditas', path: '/farmer/commodities', icon: <Package className="h-5 w-5" /> },
  { label: 'Pesanan', path: '/farmer/orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'Cuaca', path: '/farmer/weather', icon: <Cloud className="h-5 w-5" /> },
  { label: 'Keuangan', path: '/farmer/finance', icon: <Wallet className="h-5 w-5" /> },
];

const buyerMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/buyer', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Marketplace', path: '/buyer/marketplace', icon: <Store className="h-5 w-5" /> },
  { label: 'Pesanan Saya', path: '/buyer/orders', icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: 'Riwayat', path: '/buyer/history', icon: <History className="h-5 w-5" /> },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const menuItems = profile?.role === 'farmer' ? farmerMenu : buyerMenu;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Gagal keluar akun.');
    }
  };

  return (
    <>
      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64
          bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50
          transition-transform duration-300 ease-out flex flex-col
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `.trim()}
      >
        {/* Sidebar Header / Logo */}
        <div className="hidden lg:flex items-center shrink-0 h-16 px-6 border-b border-slate-700/50">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl" aria-hidden="true">🌾</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Batur Tani
            </span>
          </Link>
        </div>
        {/* Mobile close button */}
        <div className="flex items-center shrink-0 justify-end p-3 lg:hidden">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/farmer' || item.path === '/buyer'}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-[10px]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border-l-2 border-transparent pl-[10px]'
                  }
                `.trim()
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom section (Help & Logout) */}
        <div className="shrink-0 p-3 border-t border-slate-700/50 bg-slate-900/50 space-y-1">
          <NavLink
            to={`/${profile?.role}/help`}
            onClick={() => {
              if (window.innerWidth < 1024) onToggle();
            }}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-[10px]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border-l-2 border-transparent pl-[10px]'
              }
            `.trim()
            }
          >
            <span className="shrink-0"><HelpCircle className="h-5 w-5" /></span>
            <span>Panduan</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-l-2 border-transparent pl-[10px] transition-all duration-200"
          >
            <span className="shrink-0"><LogOut className="h-5 w-5" /></span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
