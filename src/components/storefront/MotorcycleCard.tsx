import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import type { Category, Motorcycle } from '../../types';
import { isOpportunityMotorcycle } from '../../lib/catalog';
import {
  buildMotorcycleWhatsAppMessage,
  buildWhatsAppUrl,
  formatEngineCc,
  formatMileage,
  formatPriceBRL,
  getMotorcycleCoverImage,
  getStatusLabel,
} from '../../lib/formatters';
import { ResilientImage } from '../ui/ResilientImage';

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  whatsappNumber: string;
  categories?: Category[];
}

export function MotorcycleCard({
  motorcycle,
  whatsappNumber,
  categories,
}: MotorcycleCardProps) {
  const coverImg = getMotorcycleCoverImage(motorcycle);
  const hasPromo =
    motorcycle.oldPrice !== null &&
    motorcycle.oldPrice !== undefined &&
    motorcycle.oldPrice > motorcycle.price;

  const isOpportunity = isOpportunityMotorcycle(motorcycle, categories);
  const coverFit = motorcycle.coverFit || 'cover';
  const coverPosition = motorcycle.coverPosition || '50% 50%';

  const whatsappHref = buildWhatsAppUrl(
    whatsappNumber,
    buildMotorcycleWhatsAppMessage(motorcycle, 'interest'),
  );

  const statusTag =
    motorcycle.status === 'reserved'
      ? 'RESERVADA'
      : motorcycle.status === 'sold'
        ? 'VENDIDA'
        : isOpportunity
          ? motorcycle.badge || 'ÚLTIMA UNIDADE · OFERTA'
          : motorcycle.badge || (motorcycle.isDemo ? 'DEMO' : null);

  return (
    <article className="group bg-[#141515] border border-[#242727] hover:border-[#303434] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      {/* 4:3 Standardized Showroom Media Container */}
      <Link
        to={`/motos/${motorcycle.slug}`}
        className="relative block aspect-[4/3] bg-[#0D0F0F] overflow-hidden"
      >
        <ResilientImage
          src={coverImg}
          alt={`${motorcycle.brand} ${motorcycle.model} ${motorcycle.yearModel}`}
          fallbackLabel={motorcycle.name}
          className={`w-full h-full transition-transform duration-300 group-hover:scale-[1.03] ${
            coverFit === 'contain' ? 'object-contain p-2' : 'object-cover'
          }`}
          style={{ objectPosition: coverPosition }}
        />

        {/* Subtle Top-Left Tag (Max 1 tag, never badge sandwiches) */}
        {statusTag && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
              motorcycle.status === 'sold'
                ? 'bg-[#F15B5B] text-white'
                : motorcycle.status === 'reserved'
                  ? 'bg-[#F3B43C] text-[#101010]'
                  : isOpportunity
                    ? 'bg-[#B7F21B] text-[#101010] shadow-sm'
                    : 'bg-[#080909]/85 border border-[#B7F21B]/60 text-[#B7F21B] backdrop-blur-sm'
            }`}
          >
            {statusTag}
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Clean Unboxed Metadata Line */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#858989] uppercase tracking-wider truncate">
          <span>{motorcycle.brand}</span>
          {motorcycle.categoryName && (
            <>
              <span aria-hidden="true">·</span>
              <span>{motorcycle.categoryName}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{motorcycle.yearModel}</span>
        </div>

        <Link
          to={`/motos/${motorcycle.slug}`}
          className="mt-2 font-display text-lg sm:text-xl font-semibold text-[#F3F3F3] group-hover:text-[#B7F21B] transition-colors leading-snug line-clamp-2"
        >
          {motorcycle.name}
        </Link>

        {/* Technical Spec Row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#858989] font-mono-tabular">
          <span>{formatMileage(motorcycle.mileage)}</span>
          {motorcycle.engineCc ? (
            <>
              <span aria-hidden="true">/</span>
              <span>{formatEngineCc(motorcycle.engineCc)}</span>
            </>
          ) : null}
          <span aria-hidden="true">/</span>
          <span
            className={
              motorcycle.status === 'available'
                ? 'text-[#B7F21B]'
                : motorcycle.status === 'reserved'
                  ? 'text-[#F3B43C]'
                  : 'text-[#F15B5B]'
            }
          >
            {getStatusLabel(motorcycle.status)}
          </span>
        </div>

        {/* Price & Actions Footer */}
        <div className="mt-auto pt-4 border-t border-[#242727] flex flex-col gap-3.5">
          <div className="min-w-0">
            {hasPromo && (
              <p className="text-xs text-[#858989] line-through font-mono-tabular mb-0.5">
                {formatPriceBRL(motorcycle.oldPrice)}
              </p>
            )}
            <p
              className={`font-display text-2xl font-bold font-mono-tabular tracking-tight whitespace-nowrap ${
                hasPromo ? 'text-[#B7F21B]' : 'text-[#F3F3F3]'
              }`}
            >
              {formatPriceBRL(motorcycle.price)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Falar no WhatsApp sobre ${motorcycle.name}`}
              title="Tenho interesse no WhatsApp"
              className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-lg border border-[#303434] bg-[#1C1F1F] text-[#B7F21B] hover:border-[#B7F21B] hover:bg-[#B7F21B]/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <Link
              to={`/motos/${motorcycle.slug}`}
              className="flex-1 h-10 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wide hover:bg-[#D0FF36] transition-colors whitespace-nowrap"
            >
              <span>Ver detalhes</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
