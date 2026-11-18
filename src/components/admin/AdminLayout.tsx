import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bike,
  ExternalLink,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Paintbrush,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/motos', label: 'Estoque de Motos', icon: Bike, end: false },
  { to: '/admin/categorias', label: 'Categorias', icon: FolderTree, end: false },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon, end: false },
  { to: '/admin/site', label: 'Personalizar Vitrine', icon: Paintbrush, end: false },
  { to: '/admin/configuracoes', label: 'Configurações Gerais', icon: Settings, end: false },
];

export function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D0F0F] border-r border-[#242727]">
      <div className="h-16 px-5 border-b border-[#242727] flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <img
            src={PALAZZO_LOGO_PATH}
            alt="Palazzo Motos"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu administrativo"
          className="lg:hidden p-1.5 text-[#858989] hover:text-[#F3F3F3]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <Link
          to="/admin/motos/nova"
          onClick={() => setSidebarOpen(false)}
          className="w-full h-11 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#D0FF36] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Moto</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Menu administrativo">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#B7F21B]/12 text-[#B7F21B] border border-[#B7F21B]/30'
                    : 'text-[#858989] hover:text-[#F3F3F3] hover:bg-[#141515] border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#242727] space-y-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 px-3 rounded-lg border border-[#303434] bg-[#141515] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ver Vitrine Pública</span>
        </Link>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F3F3F3] truncate">
              {user?.displayName || 'Administrador'}
            </p>
            <p className="text-[11px] text-[#858989] truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair do painel administrativo"
            title="Sair"
            className="p-2 rounded-lg border border-[#242727] bg-[#141515] text-[#858989] hover:text-[#F15B5B] hover:border-[#F15B5B]/40 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dark min-h-screen bg-[#080909] text-[#F3F3F3] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[270px] max-w-[85vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[#080909]/95 backdrop-blur-md border-b border-[#242727] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu administrativo"
              className="lg:hidden w-10 h-10 rounded-lg border border-[#303434] bg-[#141515] inline-flex items-center justify-center shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-[#F3F3F3] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs text-[#858989] truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
