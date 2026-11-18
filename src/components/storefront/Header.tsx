import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageCircle, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
import { buildWhatsAppUrl } from '../../lib/formatters';
import { scrollToSection } from '../../lib/scroll';
import type { SiteSettings } from '../../types';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  settings: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.hash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    navigate(q ? `/motos?q=${encodeURIComponent(q)}` : '/motos');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to === '/' && location.pathname === '/') {
      e.preventDefault();
      if (location.hash) {
        navigate('/', { replace: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const targetHash = to.slice(1);
      if (location.hash !== targetHash) {
        navigate(to);
      }
      scrollToSection(targetHash);
    }
  };

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Olá! Gostaria de conhecer as motos disponíveis na Palazzo Motos.',
  );

  const navLinks = [
    { label: 'Início', to: '/' },
    { label: 'Motos', to: '/motos' },
    { label: 'Categorias', to: '/#categorias' },
    { label: 'Sobre', to: '/#sobre' },
    { label: 'Contato', to: '/#contato' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
          scrolled
            ? 'bg-canvas/95 backdrop-blur-md border-line-subtle'
            : 'bg-canvas/85 backdrop-blur-sm border-transparent'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Original Palazzo Motos Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            aria-label="Palazzo Motos — Página inicial"
            className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B7F21B] rounded"
          >
            <img
              src={settings.logoUrl || PALAZZO_LOGO_PATH}
              alt={settings.companyName || 'Palazzo Motos'}
              className="h-9 sm:h-10 lg:h-11 w-auto object-contain select-none"
            />
          </Link>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-7"
          >
            {navLinks.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/' && !location.hash
                  : item.to.startsWith('/#')
                    ? location.pathname === '/' && location.hash === item.to.slice(1)
                    : location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(e) => handleNavClick(e, item.to)}
                  className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-accent-ink'
                      : 'text-ink/85 hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Theme Switch, Search Trigger & Primary WhatsApp Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-lg border border-line-subtle bg-card text-ink hover:border-line hover:bg-card-elevated transition-colors shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar motocicletas"
              aria-expanded={searchOpen}
              className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-lg border border-line-subtle bg-card text-ink hover:border-line hover:bg-card-elevated transition-colors shrink-0"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B7F21B] text-[#101010] text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-[#D0FF36] active:bg-[#8AB90B] transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-lg border border-line-subtle bg-card text-ink hover:bg-card-elevated transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-line-subtle bg-canvas-alt px-4 sm:px-6 lg:px-8 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-[1360px] mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-ink-secondary absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por marca, modelo, cilindrada ou ano..."
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-line text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-[#B7F21B]"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-semibold hover:bg-[#D0FF36] transition-colors whitespace-nowrap shrink-0"
              >
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        settings={settings}
        navLinks={navLinks}
      />
    </>
  );
}
