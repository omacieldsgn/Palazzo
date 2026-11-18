import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useStorefrontData } from '../../hooks/useStorefrontData';
import type { SortOption, StorefrontSectionKey } from '../../types';

export function HomePage() {
  const { motorcycles, categories, banners, settings, loading, error, retry } =
    useStorefrontData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    document.title = settings.seoTitle || 'Palazzo Motos — Digital Showroom';
  }, [settings.seoTitle]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of motorcycles) {
      if (m.published && m.status !== 'hidden') {
        counts[m.categoryId] = (counts[m.categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [motorcycles]);

  const availableCount = useMemo(
    () => motorcycles.filter((m) => m.published && m.status === 'available').length,
    [motorcycles],
  );

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
        return (
          <HeroSection
            key="hero"
            settings={settings}
            availableCount={availableCount}
          />
        );

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
                className="py-14 sm:py-18 bg-[#0B0D0D] border-b border-[#B7F21B]/25"
              >
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
                        Oportunidades de Showroom · Estoque Limitado
                      </span>
                      <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-1">
                        OFERTAS IMPERDÍVEIS
                      </h2>
                      <p className="text-sm text-[#858989] mt-2">
                        Condições especiais por tempo limitado. Unidades únicas sujeitas à venda imediata.
                      </p>
                    </div>
                    <Link
                      to="/categoria/ofertas-imperdiveis"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#B7F21B] hover:text-[#D0FF36] transition-colors whitespace-nowrap"
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
            className="py-16 sm:py-20 bg-[#080909] border-b border-[#242727]"
          >
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
                    02. Seleção Palazzo
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-1">
                    MÁQUINAS EM DESTAQUE
                  </h2>
                </div>
                <Link
                  to="/motos"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#B7F21B] hover:text-[#D0FF36] transition-colors whitespace-nowrap"
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
            className="py-16 sm:py-20 bg-[#080909] border-b border-[#242727]"
          >
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
                    03. Catálogo Atualizado
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-1">
                    NOSSO ESTOQUE
                  </h2>
                  <p className="text-sm sm:text-base text-[#858989] mt-2">
                    Explore as máquinas disponíveis na Palazzo.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:min-w-[480px]">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <select
                    aria-label="Ordenar estoque"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-11 px-3.5 rounded-lg bg-[#141515] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B] shrink-0"
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
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border border-[#303434] bg-[#141515] hover:border-[#B7F21B] hover:text-[#B7F21B] text-sm font-bold uppercase tracking-wider text-[#F3F3F3] transition-colors"
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
    <div className="min-h-screen flex flex-col bg-[#080909] text-[#F3F3F3]">
      <Header settings={settings} />
      <main className="flex-1">
        {settings.sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
      </main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
