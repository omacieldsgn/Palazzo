import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
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
  const navigate = useNavigate();

  if (!open) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(query.trim() ? `/motos?q=${encodeURIComponent(query.trim())}` : '/motos');
  };

  return (
    <div
      className="fixed inset-0 z-[70] lg:hidden flex flex-col bg-[#080909]"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="h-16 px-4 border-b border-[#242727] flex items-center justify-between">
        <img
          src={settings.logoUrl || PALAZZO_LOGO_PATH}
          alt={settings.companyName || 'Palazzo Motos'}
          className="h-9 w-auto object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-[#303434] bg-[#141515] text-[#F3F3F3]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#858989] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar moto no estoque..."
              className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#141515] border border-[#303434] text-sm text-[#F3F3F3] placeholder:text-[#5D6262] focus:outline-none focus:border-[#B7F21B]"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-semibold shrink-0"
          >
            Ir
          </button>
        </form>

        <nav className="flex flex-col divide-y divide-[#242727]" aria-label="Links móveis">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className="py-4 flex items-center justify-between text-base font-semibold text-[#F3F3F3] hover:text-[#B7F21B] transition-colors"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-4 h-4 text-[#858989]" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#242727] space-y-4">
          <WhatsAppButton
            phone={settings.whatsappNumber}
            message="Olá! Gostaria de falar com a equipe da Palazzo Motos."
            label="FALAR COM A PALAZZO"
            size="lg"
            className="w-full"
          />
          {settings.address && (
            <p className="text-xs text-[#858989] text-center">{settings.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
