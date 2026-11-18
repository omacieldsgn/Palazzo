import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Banner } from '../../types';
import { ResilientImage } from '../ui/ResilientImage';

interface BannerSectionProps {
  banners: Banner[];
}

export function BannerSection({ banners }: BannerSectionProps) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-canvas border-b border-line-subtle">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {banners.map((banner) => {
          const isExternal = banner.ctaUrl?.startsWith('http');
          const hasImage = Boolean(banner.imageDesktop || banner.imageMobile);
          return (
            <div
              key={banner.id}
              className={`relative overflow-hidden rounded-2xl border border-line min-h-[240px] sm:min-h-[280px] flex items-center ${
                hasImage ? 'bg-[#141515]' : 'bg-card'
              }`}
            >
              {hasImage && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="hidden md:block w-full h-full">
                    <ResilientImage
                      src={banner.imageDesktop || banner.imageMobile}
                      alt={banner.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                  <div className="md:hidden w-full h-full">
                    <ResilientImage
                      src={banner.imageMobile || banner.imageDesktop}
                      alt={banner.title}
                      className="w-full h-full object-cover opacity-45"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080909]/95 via-[#080909]/80 to-transparent" />
                </div>
              )}

              <div className="relative p-6 sm:p-10 lg:p-12 max-w-2xl">
                <h2
                  className={`font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight ${
                    hasImage ? 'text-[#F3F3F3]' : 'text-ink'
                  }`}
                >
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p
                    className={`mt-3 text-sm sm:text-base leading-relaxed ${
                      hasImage ? 'text-[#F3F3F3]/85' : 'text-ink-secondary'
                    }`}
                  >
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && banner.ctaUrl && (
                  <div className="mt-6">
                    {isExternal ? (
                      <a
                        href={banner.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#B7F21B] text-[#101010] text-xs sm:text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] transition-colors"
                      >
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        to={banner.ctaUrl}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#B7F21B] text-[#101010] text-xs sm:text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] transition-colors"
                      >
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
