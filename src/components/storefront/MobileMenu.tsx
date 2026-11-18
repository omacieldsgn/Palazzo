import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
import { scrollToSection } from '../../lib/scroll';
import type { SiteSettings } from '../../types';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
  navLinks: Array<{ label: string; to: string }>;
}

export function MobileMenu({ open, onClose, settings, navLinks }: MobileMenuProps) {
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(query.trim() ? `/motos?q=${encodeURIComponent(query.trim())}` : '/motos');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    onClose();
    if (to === '/' && location.pathname === '/') {
      e.preventDefault();
      if (location.hash) navigate('/', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const targetHash = to.slice(1);
      if (location.hash !== targetHash) {
        navigate(to);
      }
      requestAnimationFrame(() => scrollToSection(targetHash));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] lg:hidden flex flex-col bg-canvas text-ink"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="h-16 px-4 border-b border-line-subtle flex items-center justify-between">
        <img
          src={settings.logoUrl || PALAZZO_LOGO_PATH}
          alt={settings.companyName || 'Palazzo Motos'}
          className="h-9 w-auto object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-line bg-card text-ink"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-ink-secondary absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar moto no estoque..."
              className="w-full h-11 pl-10 pr-3 rounded-lg bg-card border border-line text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-[#B7F21B]"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-semibold shrink-0"
          >
            Ir
          </button>
        </form>

        <nav className="flex flex-col divide-y divide-line-subtle" aria-label="Links móveis">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(e) => handleLinkClick(e, item.to)}
              className="py-4 flex items-center justify-between text-base font-semibold text-ink hover:text-accent-ink transition-colors"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-line-subtle">
          <span className="text-sm font-medium text-ink">Aparência da vitrine</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-card-elevated text-xs font-semibold text-ink"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-line-subtle space-y-4">
          <WhatsAppButton
            phone={settings.whatsappNumber}
            message="Olá! Gostaria de falar com a equipe da Palazzo Motos."
            label="FALAR COM A PALAZZO"
            size="lg"
            className="w-full"
          />
          {settings.address && (
            <p className="text-xs text-ink-secondary text-center">{settings.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
