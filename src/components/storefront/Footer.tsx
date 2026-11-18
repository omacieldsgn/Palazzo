import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
import { scrollToSection } from '../../lib/scroll';
import type { Category, SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
}

export function Footer({ settings, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to === '/' && location.pathname === '/') {
      e.preventDefault();
      if (location.hash) navigate('/', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const targetHash = to.slice(1);
      if (location.hash !== targetHash) navigate(to);
      scrollToSection(targetHash);
    }
  };

  return (
    <footer
      id="contato-rodape"
      className="bg-canvas border-t border-line-subtle text-ink-secondary"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              onClick={(e) => handleAnchorClick(e, '/')}
              className="inline-block"
            >
              <img
                src={settings.logoUrl || PALAZZO_LOGO_PATH}
                alt={settings.companyName || 'Palazzo Motos'}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Showroom digital e revenda especializada em motocicletas selecionadas.
              Performance, procedência e negociação transparente.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-ink">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  onClick={(e) => handleAnchorClick(e, '/')}
                  className="hover:text-accent-ink transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link to="/motos" className="hover:text-accent-ink transition-colors">
                  Nosso Estoque
                </Link>
              </li>
              <li>
                <Link
                  to="/#sobre"
                  onClick={(e) => handleAnchorClick(e, '/#sobre')}
                  className="hover:text-accent-ink transition-colors"
                >
                  Sobre a Palazzo
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent-ink transition-colors">
                  Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-ink">
              Categorias
            </h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="hover:text-accent-ink transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.15em] text-ink">
              Atendimento &amp; Loja
            </h3>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings.instagram && (
                <li className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                  <span>{settings.instagram}</span>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.openingHours && (
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{settings.openingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>
            © {currentYear} {settings.companyName || 'Palazzo Motos'}. Todos os direitos reservados.
          </p>
          <p>Performance · Motion · Machine</p>
        </div>
      </div>
    </footer>
  );
}
