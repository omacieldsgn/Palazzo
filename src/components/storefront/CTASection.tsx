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
      className="py-16 sm:py-24 bg-[#080909] relative overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#141515] border border-[#303434] rounded-2xl p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B7F21B] via-[#D0FF36] to-transparent"
          />

          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
              Atendimento Direto
            </span>
            <h2
              className="font-display font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-2 leading-tight"
              style={{
                fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                textWrap: 'balance',
              }}
            >
              {settings.finalCtaTitle || 'PRONTO PARA ACELERAR SUA PRÓXIMA CONQUISTA?'}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#858989] max-w-2xl leading-relaxed">
              {settings.finalCtaSubtitle ||
                'Fale diretamente com um especialista Palazzo Motos no WhatsApp e receba avaliação personalizada, simulação e disponibilidade imediata.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <WhatsAppButton
                phone={settings.whatsappNumber}
                message="Olá! Gostaria de conversar com um consultor da Palazzo Motos sobre o estoque disponível."
                label={settings.finalCtaButtonText || 'FALAR NO WHATSAPP'}
                size="lg"
              />
              <Link
                to="/motos"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#303434] bg-[#1C1F1F] text-sm font-semibold uppercase tracking-wide text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] transition-colors whitespace-nowrap"
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
