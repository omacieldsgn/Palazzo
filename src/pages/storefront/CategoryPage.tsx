import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/storefront/Header';
import { Footer } from '../../components/storefront/Footer';
import { MotorcycleCard } from '../../components/storefront/MotorcycleCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { filterMotorcycles, sortMotorcycles } from '../../lib/catalog';
import { useStorefrontData } from '../../hooks/useStorefrontData';
import type { SortOption } from '../../types';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { motorcycles, categories, settings, loading, error, retry } =
    useStorefrontData();
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug],
  );

  useEffect(() => {
    document.title = category
      ? `${category.name} — ${settings.companyName || 'Palazzo Motos'}`
      : `Categoria — ${settings.companyName || 'Palazzo Motos'}`;
  }, [category, settings.companyName]);

  const items = useMemo(() => {
    if (!category) return [];
    const filtered = filterMotorcycles(motorcycles, { categoryId: category.id });
    return sortMotorcycles(filtered, sortBy);
  }, [motorcycles, category, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080909] text-[#F3F3F3]">
      <Header settings={settings} />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/motos"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#858989] hover:text-[#B7F21B] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao estoque completo</span>
          </Link>

          <div className="pb-8 border-b border-[#242727] mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
                Categoria
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-1">
                {category ? category.name : 'Categoria não encontrada'}
              </h1>
              {category?.description && (
                <p className="text-sm sm:text-base text-[#858989] mt-2 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>

            <select
              aria-label="Ordenar motocicletas da categoria"
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

          {/* Quick Category Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-colors ${
                  cat.slug === slug
                    ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                    : 'bg-[#141515] border-[#242727] text-[#858989] hover:text-[#F3F3F3] hover:border-[#303434]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : loading ? (
            <LoadingState count={6} />
          ) : items.length === 0 ? (
            <EmptyState
              title={`NENHUMA ${category?.name?.toUpperCase() || 'MOTO'} DISPONÍVEL NO MOMENTO.`}
              description="Novas unidades desta categoria entram constantemente no showroom. Fale conosco pelo WhatsApp para encomendar ou consultar próximas chegadas."
              whatsappNumber={settings.whatsappNumber}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((moto) => (
                <MotorcycleCard
                  key={moto.id}
                  motorcycle={moto}
                  whatsappNumber={settings.whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
