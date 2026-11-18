import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { SiteSettings } from '../../types';
import { buildWhatsAppUrl } from '../../lib/formatters';
import { ResilientImage } from '../ui/ResilientImage';

interface HeroSectionProps {
  settings: SiteSettings;
  availableCount: number;
}

export function HeroSection({ settings, availableCount }: HeroSectionProps) {
  const desktopImg = settings.heroImageDesktop;
  const mobileImg = settings.heroImageMobile || settings.heroImageDesktop;
  const showShadow = settings.heroOverlayShadow !== false;
  const desktopFitClass =
    settings.heroImageFit === 'contain' ? 'object-contain' : 'object-cover';
  const desktopPos = settings.heroImagePosition || '50% 50%';
  const mobileFitClass =
    (settings.heroMobileImageFit || settings.heroImageFit) === 'contain'
      ? 'object-contain'
      : 'object-cover';
  const mobilePos = settings.heroMobileImagePosition || desktopPos;
  const primaryText = settings.heroPrimaryCtaText || 'EXPLORAR MOTOS';
  const primaryUrl = settings.heroPrimaryCtaUrl || '/motos';
  const secondaryText = settings.heroSecondaryCtaText || 'FALAR COM A PALAZZO';
  const secondaryUrl = settings.heroSecondaryCtaUrl || 'whatsapp';

  const secondaryHref =
    secondaryUrl === 'whatsapp'
      ? buildWhatsAppUrl(
          settings.whatsappNumber,
          'Olá! Gostaria de conhecer as motos disponíveis na Palazzo Motos.',
        )
      : secondaryUrl;

  return (
    <section className="relative overflow-hidden bg-[#080909] border-b border-[#242727]">
      {/* Background Image & Controlled Motorsport Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {desktopImg ? (
          <>
            <div className="hidden md:block w-full h-full">
              <ResilientImage
                src={desktopImg}
                alt="Showroom Palazzo Motos"
                loading="eager"
                className={`w-full h-full ${desktopFitClass} ${
                  showShadow ? 'opacity-70' : 'opacity-100'
                }`}
                style={{ objectPosition: desktopPos }}
              />
            </div>
            <div className="md:hidden w-full h-full">
              <ResilientImage
                src={mobileImg}
                alt="Showroom Palazzo Motos"
                loading="eager"
                className={`w-full h-full ${mobileFitClass} ${
                  showShadow ? 'opacity-55' : 'opacity-100'
                }`}
                style={{ objectPosition: mobilePos }}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full palazzo-grid-bg opacity-80" />
        )}

        {/* Scrims ensuring >= 4.5:1 text legibility when enabled */}
        {showShadow && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#080909] via-[#080909]/85 to-[#080909]/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-[#080909]/40" />
          </>
        )}

        {/* Subtle controlled lime architectural edge */}
        <div
          className="absolute -bottom-24 right-12 w-[420px] h-[420px] rounded-full blur-[140px] opacity-15"
          style={{ background: '#B7F21B' }}
        />
      </div>

      {/* Angular Motorsport Decorative Line */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 right-16 w-px h-28 bg-gradient-to-b from-[#B7F21B] to-transparent opacity-60"
      />

      <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-22 min-h-[480px] lg:min-h-[550px] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="h-[2px] w-8 bg-[#B7F21B]" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#B7F21B]">
              Palazzo Motos · Performance &amp; Procedência
            </span>
          </div>

          <h1
            className="font-display font-extrabold uppercase text-[#F3F3F3] leading-[1.08] tracking-[-0.03em]"
            style={{
              fontSize: 'clamp(2.25rem, 5.2vw, 5rem)',
              textWrap: 'balance',
            }}
          >
            {settings.heroHeadline}
          </h1>

          {settings.heroSubheadline && (
            <p className="mt-5 text-base sm:text-xl text-[#F3F3F3]/80 max-w-xl leading-relaxed font-normal">
              {settings.heroSubheadline}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={primaryUrl}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] active:bg-[#8AB90B] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{primaryText}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            {secondaryUrl === 'whatsapp' ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#303434] bg-[#141515]/85 backdrop-blur-sm text-[#F3F3F3] text-sm font-semibold uppercase tracking-wide hover:border-[#B7F21B] hover:text-[#B7F21B] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{secondaryText}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={secondaryHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#303434] bg-[#141515]/85 backdrop-blur-sm text-[#F3F3F3] text-sm font-semibold uppercase tracking-wide hover:border-[#B7F21B] hover:text-[#B7F21B] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{secondaryText}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {/* Clean Unboxed Showroom Bar */}
          <div className="mt-10 pt-5 border-t border-[#242727] flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1.5 sm:gap-x-6 text-xs sm:text-sm text-[#858989]">
            <span className="font-mono-tabular text-[#F3F3F3] font-medium">
              {availableCount} máquinas prontas para entrega
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Vistoria técnica rigorosa</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Atendimento consultivo direto</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
