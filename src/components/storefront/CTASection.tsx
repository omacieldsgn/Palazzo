import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { SiteSettings } from '../../types';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface CTASectionProps {
  settings: SiteSettings;
}

export function CTASection({ settings }: CTASectionProps) {
  return (
    <section
      id="contato"
      className="py-12 sm:py-24 bg-canvas relative overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-card border border-line rounded-2xl p-6 sm:p-12 lg:p-16 overflow-hidden shadow-xs dark:shadow-none">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B7F21B] via-[#D0FF36] to-transparent"
          />

          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
              Atendimento Direto
            </span>
            <h2
              className="font-display font-extrabold uppercase tracking-tight text-ink mt-2 leading-tight"
              style={{
                fontSize: 'clamp(1.6rem, 3.6vw, 3rem)',
                textWrap: 'balance',
              }}
            >
              {settings.finalCtaTitle || 'PRONTO PARA ACELERAR SUA PRÓXIMA CONQUISTA?'}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-ink-secondary max-w-2xl leading-relaxed">
              {settings.finalCtaSubtitle ||
                'Fale diretamente com um especialista Palazzo Motos no WhatsApp e receba avaliação personalizada, simulação e disponibilidade imediata.'}
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <WhatsAppButton
                phone={settings.whatsappNumber}
                message="Olá! Gostaria de conversar com um consultor da Palazzo Motos sobre o estoque disponível."
                label={settings.finalCtaButtonText || 'FALAR NO WHATSAPP'}
                size="lg"
              />
              <Link
                to="/motos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-line bg-card-elevated text-sm font-semibold uppercase tracking-wide text-ink hover:border-[#B7F21B] hover:text-accent-ink transition-colors whitespace-nowrap"
              >
                <span>VER TODAS AS MOTOS</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
