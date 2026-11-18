import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { MotorcycleCard } from '../../components/storefront/MotorcycleCard';
import { MotorcycleFilters } from '../../components/storefront/MotorcycleFilters';
import { SearchBar } from '../../components/storefront/SearchBar';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import {
  extractCatalogFacets,
  filterMotorcycles,
  paginateItems,
  sortMotorcycles,
} from '../../lib/catalog';
import { useStorefrontData } from '../../hooks/useStorefrontData';
import type { CatalogFilters, SortOption } from '../../types';

const PAGE_SIZE = 9;

export function CatalogPage() {
  const { motorcycles, categories, settings, loading, error, retry } =
    useStorefrontData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<CatalogFilters>({
    search: searchParams.get('q') || '',
    categoryId: searchParams.get('categoria') || 'all',
    brand: 'all',
    condition: 'all',
    yearMin: null,
    ccMin: null,
    priceMax: null,
    mileageMax: null,
  });
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = `Nosso Estoque — ${settings.companyName || 'Palazzo Motos'}`;
  }, [settings.companyName]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('categoria') || 'all';
    setFilters((prev) => ({
      ...prev,
      search: q,
      categoryId: cat,
    }));
  }, [searchParams]);

  const facets = useMemo(() => extractCatalogFacets(motorcycles), [motorcycles]);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterMotorcycles(motorcycles, filters);
    return sortMotorcycles(filtered, sortBy, categories);
  }, [motorcycles, filters, sortBy, categories]);

  const paginated = useMemo(
    () => paginateItems(filteredAndSorted, page, PAGE_SIZE),
    [filteredAndSorted, page],
  );

  const handleFiltersChange = (next: CatalogFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      categoryId: 'all',
      brand: 'all',
      condition: 'all',
      yearMin: null,
      ccMin: null,
      priceMax: null,
      mileageMax: null,
    });
    setSortBy('recent');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Header settings={settings} />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="pb-8 border-b border-line-subtle mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
                Catálogo Completo
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink mt-1">
                NOSSO ESTOQUE
              </h1>
              <p className="text-sm sm:text-base text-ink-secondary mt-2">
                Explore as máquinas disponíveis na Palazzo.
              </p>
            </div>
            <p className="font-mono-tabular text-xs sm:text-sm text-ink-secondary">
              {paginated.totalItems}{' '}
              {paginated.totalItems === 1 ? 'motocicleta encontrada' : 'motocicletas encontradas'}
            </p>
          </div>

          {/* Search & Mobile Filter Trigger */}
          <div className="flex items-center gap-3 mb-8">
            <SearchBar
              value={filters.search || ''}
              onChange={(val) => handleFiltersChange({ ...filters, search: val })}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden h-11 px-4 rounded-lg border border-line bg-card text-sm font-semibold text-ink inline-flex items-center gap-2 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-accent-ink" aria-hidden="true" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Grid: Sidebar + Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3">
              <MotorcycleFilters
                filters={filters}
                onChange={handleFiltersChange}
                sortBy={sortBy}
                onSortChange={(s) => {
                  setSortBy(s);
                  setPage(1);
                }}
                categories={categories}
                brands={facets.brands}
                years={facets.years}
                onReset={handleReset}
                mobileOpen={mobileFiltersOpen}
                onCloseMobile={() => setMobileFiltersOpen(false)}
              />
            </div>

            <div className="lg:col-span-9">
              {error ? (
                <ErrorState message={error} onRetry={retry} />
              ) : loading ? (
                <LoadingState count={6} />
              ) : paginated.items.length === 0 ? (
                <EmptyState
                  whatsappNumber={settings.whatsappNumber}
                  onResetFilters={handleReset}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginated.items.map((moto) => (
                      <MotorcycleCard
                        key={moto.id}
                        motorcycle={moto}
                        whatsappNumber={settings.whatsappNumber}
                        categories={categories}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {paginated.totalPages > 1 && (
                    <nav
                      aria-label="Paginação do catálogo"
                      className="mt-10 pt-6 border-t border-line-subtle flex items-center justify-between"
                    >
                      <button
                        type="button"
                        disabled={paginated.currentPage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="h-10 px-4 rounded-lg border border-line bg-card text-sm font-medium text-ink disabled:opacity-40 inline-flex items-center gap-1.5 hover:border-[#B7F21B]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <span className="font-mono-tabular text-xs sm:text-sm text-ink-secondary">
                        Página {paginated.currentPage} de {paginated.totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={paginated.currentPage >= paginated.totalPages}
                        onClick={() => setPage((p) => Math.min(paginated.totalPages, p + 1))}
                        className="h-10 px-4 rounded-lg border border-line bg-card text-sm font-medium text-ink disabled:opacity-40 inline-flex items-center gap-1.5 hover:border-[#B7F21B]"
                      >
                        <span>Próxima</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
