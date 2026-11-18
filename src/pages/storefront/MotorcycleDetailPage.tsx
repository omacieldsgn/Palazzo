import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { MotorcycleGallery } from '../../components/storefront/MotorcycleGallery';
import { MotorcycleCard } from '../../components/storefront/MotorcycleCard';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
import { EmptyState, LoadingState } from '../../components/ui/States';
import { getRelatedMotorcycles, isOpportunityMotorcycle } from '../../lib/catalog';
import {
  buildMotorcycleWhatsAppMessage,
  formatEngineCc,
  formatMileage,
  formatPriceBRL,
  getStatusLabel,
} from '../../lib/formatters';
import { useStorefrontData } from '../../hooks/useStorefrontData';
import type { MotorcycleImage } from '../../types';

export function MotorcycleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { motorcycles, categories, settings, loading } = useStorefrontData();

  const motorcycle = useMemo(
    () => motorcycles.find((m) => m.slug === slug),
    [motorcycles, slug],
  );

  const related = useMemo(() => {
    if (!motorcycle) return [];
    return getRelatedMotorcycles(motorcycle, motorcycles, 3);
  }, [motorcycle, motorcycles]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (motorcycle) {
      document.title = `${motorcycle.name} (${motorcycle.yearModel}) — ${settings.companyName || 'Palazzo Motos'}`;
    } else {
      document.title = `Detalhes da Motocicleta — ${settings.companyName || 'Palazzo Motos'}`;
    }
  }, [motorcycle, settings.companyName]);

  const galleryImages: MotorcycleImage[] = useMemo(() => {
    if (!motorcycle) return [];
    if (motorcycle.images && motorcycle.images.length > 0) {
      return motorcycle.images;
    }
    if (motorcycle.coverImage) {
      return [
        {
          id: 'cover',
          storagePath: motorcycle.coverImage,
          altText: motorcycle.name,
          sortOrder: 0,
          isCover: true,
        },
      ];
    }
    return [];
  }, [motorcycle]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink">
        <Header settings={settings} />
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingState count={3} />
        </main>
        <Footer settings={settings} categories={categories} />
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink">
        <Header settings={settings} />
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EmptyState
            title="MOTOCICLETA NÃO ENCONTRADA."
            description="Esta unidade pode ter sido vendida ou removida do catálogo. Confira outras máquinas disponíveis na Palazzo."
            whatsappNumber={settings.whatsappNumber}
          />
          <div className="mt-6 text-center">
            <Link
              to="/motos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o catálogo
            </Link>
          </div>
        </main>
        <Footer settings={settings} categories={categories} />
      </div>
    );
  }

  const hasPromo =
    motorcycle.oldPrice !== null &&
    motorcycle.oldPrice !== undefined &&
    motorcycle.oldPrice > motorcycle.price;
  const isOpportunity = isOpportunityMotorcycle(motorcycle, categories);
  const displayBadge =
    motorcycle.badge ||
    (isOpportunity && motorcycle.status === 'available'
      ? 'ÚLTIMA UNIDADE · OFERTA'
      : undefined);

  const specs = [
    { label: 'Marca', value: motorcycle.brand },
    { label: 'Modelo', value: motorcycle.model },
    motorcycle.version ? { label: 'Versão', value: motorcycle.version } : null,
    {
      label: 'Ano Fab / Mod',
      value: motorcycle.yearManufacture
        ? `${motorcycle.yearManufacture} / ${motorcycle.yearModel}`
        : String(motorcycle.yearModel),
    },
    { label: 'Quilometragem', value: formatMileage(motorcycle.mileage) },
    motorcycle.engineCc
      ? { label: 'Cilindrada', value: formatEngineCc(motorcycle.engineCc) }
      : null,
    motorcycle.power ? { label: 'Potência', value: motorcycle.power } : null,
    motorcycle.cylinders
      ? { label: 'Cilindros', value: `${motorcycle.cylinders} cilindros` }
      : null,
    motorcycle.transmission ? { label: 'Transmissão', value: motorcycle.transmission } : null,
    motorcycle.fuel ? { label: 'Combustível', value: motorcycle.fuel } : null,
    motorcycle.color ? { label: 'Cor', value: motorcycle.color } : null,
    motorcycle.condition
      ? { label: 'Condição', value: motorcycle.condition === 'new' ? '0 KM' : 'Seminova' }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const interestMessage = buildMotorcycleWhatsAppMessage(motorcycle, 'interest');
  const financingMessage = buildMotorcycleWhatsAppMessage(motorcycle, 'financing');

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink pb-20 lg:pb-0">
      <Header settings={settings} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary mb-6"
          >
            <Link to="/" className="hover:text-ink">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/motos" className="hover:text-ink">
              Estoque
            </Link>
            {motorcycle.categoryName && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-ink">{motorcycle.categoryName}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-accent-ink truncate">{motorcycle.name}</span>
          </nav>

          {/* Main 2-Column PDP Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Gallery + Details */}
            <div className="lg:col-span-7 space-y-8">
              <MotorcycleGallery
                images={galleryImages}
                motorcycleName={motorcycle.name}
                coverPosition={motorcycle.coverPosition}
                coverFit={motorcycle.coverFit}
              />

              {/* Description */}
              {motorcycle.description && (
                <section className="bg-card border border-line-subtle rounded-xl p-6 sm:p-8 shadow-xs dark:shadow-none">
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-3">
                    Sobre esta Máquina
                  </h2>
                  <p className="text-sm sm:text-base text-ink-secondary leading-relaxed whitespace-pre-line">
                    {motorcycle.description}
                  </p>
                </section>
              )}

              {/* Technical Specifications Table */}
              <section className="bg-card border border-line-subtle rounded-xl p-6 sm:p-8 shadow-xs dark:shadow-none">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-5">
                  Ficha Técnica
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between gap-4 py-2.5 border-b border-line-subtle"
                    >
                      <dt className="text-xs uppercase tracking-wider text-ink-secondary">
                        {spec.label}
                      </dt>
                      <dd className="text-sm font-semibold text-ink font-mono-tabular text-right">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Features List */}
              {motorcycle.features && motorcycle.features.length > 0 && (
                <section className="bg-card border border-line-subtle rounded-xl p-6 sm:p-8 shadow-xs dark:shadow-none">
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-4">
                    Equipamentos e Diferenciais
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {motorcycle.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-ink/90"
                      >
                        <Check
                          className="w-4 h-4 text-accent-ink shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Right Column: Sticky Commercial Conversion Module */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
              <div className="bg-card border border-line rounded-xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-secondary">
                    <span>{motorcycle.brand}</span>
                    {motorcycle.categoryName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{motorcycle.categoryName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{motorcycle.yearModel}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        motorcycle.status === 'available'
                          ? 'text-accent-ink font-semibold'
                          : motorcycle.status === 'reserved'
                            ? 'text-[#B47200] dark:text-[#F3B43C] font-semibold'
                            : 'text-[#D93838] dark:text-[#F15B5B] font-semibold'
                      }
                    >
                      {getStatusLabel(motorcycle.status)}
                    </span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-ink mt-2 leading-tight">
                    {motorcycle.name}
                  </h1>

                  {displayBadge && (
                    <p
                      className={`mt-2 inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        isOpportunity && motorcycle.status === 'available'
                          ? 'bg-[#B7F21B] text-[#101010]'
                          : 'bg-[#B7F21B]/20 text-accent-ink'
                      }`}
                    >
                      {displayBadge}
                    </p>
                  )}
                </div>

                {/* Price Block */}
                <div className="pt-5 border-t border-line-subtle">
                  {hasPromo && (
                    <p className="text-sm text-ink-secondary line-through font-mono-tabular">
                      De {formatPriceBRL(motorcycle.oldPrice)}
                    </p>
                  )}
                  <p
                    className={`font-display text-3xl sm:text-4xl font-extrabold font-mono-tabular tracking-tight mt-0.5 ${
                      hasPromo || isOpportunity ? 'text-accent-ink' : 'text-ink'
                    }`}
                  >
                    {formatPriceBRL(motorcycle.price)}
                  </p>
                  {(motorcycle.promoText || (isOpportunity && motorcycle.status === 'available')) && (
                    <p className="text-xs font-semibold text-accent-ink mt-1.5">
                      {motorcycle.promoText ||
                        'Condição imperdível por tempo limitado — unidade sujeita à venda imediata.'}
                    </p>
                  )}
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-3 py-4 border-y border-line-subtle text-center">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-ink-secondary">
                      Ano
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-ink mt-0.5 block">
                      {motorcycle.yearModel}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-ink-secondary">
                      KM
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-ink mt-0.5 block">
                      {formatMileage(motorcycle.mileage)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-ink-secondary">
                      Motor
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-ink mt-0.5 block">
                      {formatEngineCc(motorcycle.engineCc)}
                    </span>
                  </div>
                </div>

                {/* Payment & Financing Details */}
                {(motorcycle.paymentInfo ||
                  motorcycle.downPaymentInfo ||
                  motorcycle.installmentInfo) && (
                  <div className="space-y-2 text-xs sm:text-sm text-ink-secondary">
                    <div className="flex items-center gap-2 text-ink font-semibold">
                      <CreditCard className="w-4 h-4 text-accent-ink" aria-hidden="true" />
                      <span>Condições Comerciais</span>
                    </div>
                    {motorcycle.downPaymentInfo && <p>{motorcycle.downPaymentInfo}</p>}
                    {motorcycle.installmentInfo && <p>{motorcycle.installmentInfo}</p>}
                    {motorcycle.paymentInfo && <p>{motorcycle.paymentInfo}</p>}
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <WhatsAppButton
                    phone={settings.whatsappNumber}
                    message={interestMessage}
                    label="TENHO INTERESSE NO WHATSAPP"
                    size="lg"
                    className="w-full"
                  />
                  <WhatsAppButton
                    phone={settings.whatsappNumber}
                    message={financingMessage}
                    label="CONSULTAR FINANCIAMENTO"
                    variant="subtle"
                    size="md"
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-line-subtle flex items-center gap-2.5 text-xs text-ink-secondary">
                  <ShieldCheck className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                  <span>Procedência verificada e atendimento consultivo Palazzo Motos.</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Motorcycles */}
          {related.length > 0 && (
            <section className="mt-16 pt-12 border-t border-line-subtle">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
                    Sugestões do Showroom
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-ink mt-1">
                    Motos Relacionadas
                  </h2>
                </div>
                <Link
                  to="/motos"
                  className="text-xs sm:text-sm font-semibold text-accent-ink hover:underline"
                >
                  Ver todo estoque
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((item) => (
                  <MotorcycleCard
                    key={item.id}
                    motorcycle={item}
                    whatsappNumber={settings.whatsappNumber}
                    categories={categories}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Fixed Mobile Bottom Conversion Bar (strictly compact <= 72px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-canvas-alt/95 backdrop-blur-md border-t border-line-subtle px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[10px] uppercase tracking-wider text-ink-secondary truncate">
            {motorcycle.brand} {motorcycle.model}
          </span>
          <span className="font-display text-base font-bold font-mono-tabular text-accent-ink">
            {formatPriceBRL(motorcycle.price)}
          </span>
        </div>
        <WhatsAppButton
          phone={settings.whatsappNumber}
          message={interestMessage}
          label="TENHO INTERESSE"
          size="sm"
        />
      </div>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
