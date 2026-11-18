import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../../components/storefront/Header';
import { HeroSection } from '../../components/storefront/HeroSection';
import { CategorySection } from '../../components/storefront/CategorySection';
import { MotorcycleCard } from '../../components/storefront/MotorcycleCard';
import { BannerSection } from '../../components/storefront/BannerSection';
import { AboutSection } from '../../components/storefront/AboutSection';
import { CTASection } from '../../components/storefront/CTASection';
import { Footer } from '../../components/storefront/Footer';
import { SearchBar } from '../../components/storefront/SearchBar';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import {
  filterMotorcycles,
  isOpportunityMotorcycle,
  sortMotorcycles,
} from '../../lib/catalog';
import { scrollToSection } from '../../lib/scroll';
import { useStorefrontData } from '../../hooks/useStorefrontData';
import type { SortOption, StorefrontSectionKey } from '../../types';

export function HomePage() {
  const { motorcycles, categories, banners, settings, loading, error, retry } =
    useStorefrontData();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    document.title = settings.seoTitle || 'Palazzo Motos — Digital Showroom';
  }, [settings.seoTitle]);

  useEffect(() => {
    if (!loading && location.hash) {
      const raf = requestAnimationFrame(() => scrollToSection(location.hash));
      return () => cancelAnimationFrame(raf);
    }
  }, [loading, location.hash]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of motorcycles) {
      if (m.published && m.status !== 'hidden') {
        counts[m.categoryId] = (counts[m.categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [motorcycles]);

  const opportunityMotorcycles = useMemo(
    () =>
      sortMotorcycles(
        motorcycles.filter(
          (m) =>
            m.published &&
            m.status !== 'hidden' &&
            m.status !== 'sold' &&
            isOpportunityMotorcycle(m, categories),
        ),
        'recent',
        categories,
      ).slice(0, 6),
    [motorcycles, categories],
  );

  const featuredMotorcycles = useMemo(
    () =>
      sortMotorcycles(
        motorcycles.filter(
          (m) => m.published && m.status === 'available' && m.featured,
        ),
        'recent',
        categories,
      ).slice(0, 6),
    [motorcycles, categories],
  );

  const filteredCatalog = useMemo(() => {
    const filtered = filterMotorcycles(motorcycles, {
      search: searchQuery,
      categoryId: selectedCategory,
    });
    return sortMotorcycles(filtered, sortBy, categories).slice(0, 9);
  }, [motorcycles, searchQuery, selectedCategory, sortBy, categories]);

  const handleCategoryPick = (catId: string) => {
    setSelectedCategory(catId);
    const catalogEl = document.getElementById('estoque');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderSection = (key: StorefrontSectionKey) => {
    if (!settings.activeSections[key]) return null;

    switch (key) {
      case 'hero':
        return <HeroSection key="hero" settings={settings} />;

      case 'categories':
        return (
          <div key="categories">
            <CategorySection
              categories={categories}
              selectedCategoryId={selectedCategory}
              onSelectCategory={handleCategoryPick}
              countsByCategory={countsByCategory}
            />
            {!loading && opportunityMotorcycles.length > 0 && (
              <section
                id="ofertas-imperdiveis"
                className="py-12 sm:py-18 bg-canvas-alt border-b border-[#4A6800]/25 dark:border-[#B7F21B]/25"
              >
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
                        Oportunidades de Showroom · Estoque Limitado
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-ink mt-1">
                        OFERTAS IMPERDÍVEIS
                      </h2>
                      <p className="text-sm text-ink-secondary mt-2">
                        Condições especiais por tempo limitado. Unidades únicas sujeitas à venda imediata.
                      </p>
                    </div>
                    <Link
                      to="/categoria/ofertas-imperdiveis"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-accent-ink hover:opacity-80 transition-opacity whitespace-nowrap"
                    >
                      <span>Ver todas as ofertas</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunityMotorcycles.map((moto) => (
                      <MotorcycleCard
                        key={moto.id}
                        motorcycle={moto}
                        whatsappNumber={settings.whatsappNumber}
                        categories={categories}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        );

      case 'featured':
        if (!loading && featuredMotorcycles.length === 0) return null;
        return (
          <section
            key="featured"
            className="py-12 sm:py-20 bg-canvas border-b border-line-subtle"
          >
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
                    02. Seleção Palazzo
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-ink mt-1">
                    MÁQUINAS EM DESTAQUE
                  </h2>
                </div>
                <Link
                  to="/motos"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-accent-ink hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  <span>Explorar todas</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              {loading ? (
                <LoadingState count={3} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredMotorcycles.map((moto) => (
                    <MotorcycleCard
                      key={moto.id}
                      motorcycle={moto}
                      whatsappNumber={settings.whatsappNumber}
                      categories={categories}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'banners':
        return <BannerSection key="banners" banners={banners} />;

      case 'catalog':
        return (
          <section
            key="catalog"
            id="estoque"
            className="py-12 sm:py-20 bg-canvas border-b border-line-subtle"
          >
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
                    03. Catálogo Atualizado
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-ink mt-1">
                    NOSSO ESTOQUE
                  </h2>
                  <p className="text-sm sm:text-base text-ink-secondary mt-2">
                    Explore as máquinas disponíveis na Palazzo.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:min-w-[480px]">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <select
                    aria-label="Ordenar estoque"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-11 px-3.5 rounded-lg bg-card border border-line text-sm text-ink focus:outline-none focus:border-[#B7F21B] shrink-0"
                  >
                    <option value="recent">Mais recentes</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="mileage_asc">Menor KM</option>
                    <option value="year_desc">Ano mais novo</option>
                  </select>
                </div>
              </div>

              {error ? (
                <ErrorState message={error} onRetry={retry} />
              ) : loading ? (
                <LoadingState count={6} />
              ) : filteredCatalog.length === 0 ? (
                <EmptyState
                  whatsappNumber={settings.whatsappNumber}
                  onResetFilters={
                    searchQuery || selectedCategory !== 'all'
                      ? () => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }
                      : undefined
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCatalog.map((moto) => (
                      <MotorcycleCard
                        key={moto.id}
                        motorcycle={moto}
                        whatsappNumber={settings.whatsappNumber}
                        categories={categories}
                      />
                    ))}
                  </div>

                  <div className="mt-10 flex justify-center">
                    <Link
                      to="/motos"
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border border-line bg-card hover:border-[#B7F21B] hover:text-accent-ink text-sm font-bold uppercase tracking-wider text-ink transition-colors"
                    >
                      <span>VER TODAS AS MOTOS</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        );

      case 'about':
        return <AboutSection key="about" settings={settings} />;

      case 'final_cta':
        return <CTASection key="final_cta" settings={settings} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Header settings={settings} />
      <main className="flex-1">
        {settings.sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
      </main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
