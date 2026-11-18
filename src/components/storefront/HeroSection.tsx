import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { SiteSettings } from '../../types';
import { buildWhatsAppUrl } from '../../lib/formatters';
import {
  buildHeroShadowGradient,
  getContrastInk,
  isLightColor,
  parseHeadlineSegments,
} from '../../lib/heroStyles';
import { ResilientImage } from '../ui/ResilientImage';

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const desktopImg = settings.heroImageDesktop;
  const mobileImg = settings.heroImageMobile || settings.heroImageDesktop;
  const hasImage = Boolean(desktopImg || mobileImg);
  const showShadow = settings.heroOverlayShadow !== false;

  const shadowGradient = hasImage
    ? buildHeroShadowGradient({
        enabled: showShadow,
        color: settings.heroShadowColor,
        opacity: settings.heroShadowOpacity,
        direction: settings.heroShadowDirection,
        reach: settings.heroShadowReach,
      })
    : undefined;

  const lightShadowOverlay =
    hasImage && showShadow && Boolean(shadowGradient) && isLightColor(settings.heroShadowColor);

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

  const headlineSegments = parseHeadlineSegments(settings.heroHeadline);
  const hasEmphasizedSegments = headlineSegments.some((seg) => seg.emphasized);
  const highlightBold = settings.heroHighlightBold !== false;
  const highlightItalic = settings.heroHighlightItalic === true;
  const highlightBgEnabled = settings.heroHighlightBgEnabled === true;
  const highlightBgColor = settings.heroHighlightBgColor || '#B7F21B';
  const highlightInk = getContrastInk(highlightBgColor);

  const headlineColorClass = !hasImage
    ? 'text-ink'
    : lightShadowOverlay
      ? 'text-[#101212]'
      : 'text-[#F3F3F3]';

  const subheadlineColorClass = !hasImage
    ? 'text-ink-secondary'
    : lightShadowOverlay
      ? 'text-[#101212]/80'
      : 'text-[#F3F3F3]/85';

  const secondaryBtnClass = !hasImage
    ? 'border border-line bg-card/90 backdrop-blur-sm text-ink hover:border-[#B7F21B] hover:text-accent-ink'
    : lightShadowOverlay
      ? 'border border-[#CDD2D0] bg-white/90 backdrop-blur-sm text-[#101212] hover:border-[#101212] hover:bg-white'
      : 'border border-[#303434] bg-[#141515]/85 backdrop-blur-sm text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B]';

  return (
    <section
      className={`relative overflow-hidden border-b border-line-subtle ${
        hasImage ? (lightShadowOverlay ? 'bg-[#F6F7F6]' : 'bg-[#080909]') : 'bg-canvas'
      }`}
    >
      {/* Background Image & Customizable Cover Shadow */}
      <div className="absolute inset-0 pointer-events-none">
        {hasImage ? (
          <>
            <div className="hidden md:block w-full h-full">
              <ResilientImage
                src={desktopImg || mobileImg}
                alt="Showroom Palazzo Motos"
                loading="eager"
                className={`w-full h-full opacity-100 ${desktopFitClass}`}
                style={{ objectPosition: desktopPos }}
              />
            </div>
            <div className="md:hidden w-full h-full">
              <ResilientImage
                src={mobileImg || desktopImg}
                alt="Showroom Palazzo Motos"
                loading="eager"
                className={`w-full h-full opacity-100 ${mobileFitClass}`}
                style={{ objectPosition: mobilePos }}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full palazzo-grid-bg opacity-80" />
        )}

        {shadowGradient && (
          <div
            className="absolute inset-0"
            style={{ background: shadowGradient }}
            aria-hidden="true"
          />
        )}

        {/* Subtle controlled lime architectural ambient glow */}
        <div
          className="hidden sm:block absolute -bottom-24 right-12 w-[420px] h-[420px] rounded-full blur-[140px] opacity-15"
          style={{ background: '#B7F21B' }}
          aria-hidden="true"
        />
      </div>

      {/* Angular Motorsport Decorative Line */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 right-16 w-px h-28 bg-gradient-to-b from-[#B7F21B] to-transparent opacity-60"
      />

      <div className="relative max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 min-h-[430px] sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl"
        >
          <h1
            className={`font-display ${
              hasEmphasizedSegments ? 'font-medium' : 'font-extrabold'
            } ${headlineColorClass} ${
              hasImage && !lightShadowOverlay
                ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]'
                : ''
            } leading-[1.1] tracking-[-0.025em]`}
            style={{
              fontSize: 'clamp(1.95rem, 5vw, 4.75rem)',
              textWrap: 'balance',
            }}
          >
            {headlineSegments.map((seg, idx) => {
              if (!seg.emphasized) {
                return <span key={idx}>{seg.text}</span>;
              }
              return (
                <span
                  key={idx}
                  className={`${highlightBold ? 'font-extrabold' : 'font-medium'} ${
                    highlightItalic ? 'italic' : ''
                  } ${
                    highlightBgEnabled
                      ? 'inline-block px-2.5 py-0.5 rounded-md box-decoration-clone align-baseline'
                      : ''
                  }`}
                  style={
                    highlightBgEnabled
                      ? {
                          backgroundColor: highlightBgColor,
                          color: highlightInk,
                          textShadow: 'none',
                        }
                      : undefined
                  }
                >
                  {seg.text}
                </span>
              );
            })}
          </h1>

          {settings.heroSubheadline && (
            <p
              className={`mt-4 sm:mt-5 text-[15px] sm:text-xl ${subheadlineColorClass} ${
                hasImage && !lightShadowOverlay
                  ? 'drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)]'
                  : ''
              } max-w-lg sm:max-w-xl leading-relaxed font-normal`}
            >
              {settings.heroSubheadline}
            </p>
          )}

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              to={primaryUrl}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 min-h-[46px] rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] active:bg-[#8AB90B] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{primaryText}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            {secondaryUrl === 'whatsapp' ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors whitespace-nowrap shrink-0 ${secondaryBtnClass}`}
              >
                <span>{secondaryText}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={secondaryHref}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors whitespace-nowrap shrink-0 ${secondaryBtnClass}`}
              >
                <span>{secondaryText}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
