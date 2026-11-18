import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { CatalogFilters, Category, SortOption } from '../../types';
import { formatPriceBRL } from '../../lib/formatters';

interface MotorcycleFiltersProps {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  sortBy: SortOption;
  onSortChange: (next: SortOption) => void;
  categories: Category[];
  brands: string[];
  years: number[];
  onReset: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function MotorcycleFilters({
  filters,
  onChange,
  sortBy,
  onSortChange,
  categories,
  brands,
  years,
  onReset,
  mobileOpen = false,
  onCloseMobile,
}: MotorcycleFiltersProps) {
  const update = (patch: Partial<CatalogFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const selectClass =
    'w-full h-11 px-3 rounded-lg bg-canvas-alt border border-line text-sm text-ink focus:outline-none focus:border-[#B7F21B]';

  const fieldsContent = (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="filter-category"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Categoria
        </label>
        <select
          id="filter-category"
          value={filters.categoryId || 'all'}
          onChange={(e) => update({ categoryId: e.target.value })}
          className={selectClass}
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-brand"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Marca
        </label>
        <select
          id="filter-brand"
          value={filters.brand || 'all'}
          onChange={(e) => update({ brand: e.target.value })}
          className={selectClass}
        >
          <option value="all">Todas as marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="filter-year"
            className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
          >
            Ano mín.
          </label>
          <select
            id="filter-year"
            value={filters.yearMin ?? ''}
            onChange={(e) =>
              update({ yearMin: e.target.value ? Number(e.target.value) : null })
            }
            className={selectClass}
          >
            <option value="">Qualquer</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-condition"
            className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
          >
            Condição
          </label>
          <select
            id="filter-condition"
            value={filters.condition || 'all'}
            onChange={(e) =>
              update({ condition: e.target.value as CatalogFilters['condition'] })
            }
            className={selectClass}
          >
            <option value="all">Todas</option>
            <option value="new">0 KM</option>
            <option value="used">Seminova</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="filter-cc"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Cilindrada mínima
        </label>
        <select
          id="filter-cc"
          value={filters.ccMin ?? ''}
          onChange={(e) =>
            update({ ccMin: e.target.value ? Number(e.target.value) : null })
          }
          className={selectClass}
        >
          <option value="">Todas as cilindradas</option>
          <option value="150">A partir de 150 cc</option>
          <option value="300">A partir de 300 cc</option>
          <option value="500">A partir de 500 cc</option>
          <option value="750">A partir de 750 cc</option>
          <option value="1000">1000 cc ou mais</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-price"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Preço máximo{' '}
          {filters.priceMax ? (
            <span className="text-accent-ink font-mono-tabular">
              ({formatPriceBRL(filters.priceMax)})
            </span>
          ) : null}
        </label>
        <select
          id="filter-price"
          value={filters.priceMax ?? ''}
          onChange={(e) =>
            update({ priceMax: e.target.value ? Number(e.target.value) : null })
          }
          className={selectClass}
        >
          <option value="">Sem limite de preço</option>
          <option value="30000">Até R$ 30.000</option>
          <option value="50000">Até R$ 50.000</option>
          <option value="80000">Até R$ 80.000</option>
          <option value="120000">Até R$ 120.000</option>
          <option value="180000">Até R$ 180.000</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-mileage"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Quilometragem máxima
        </label>
        <select
          id="filter-mileage"
          value={filters.mileageMax ?? ''}
          onChange={(e) =>
            update({ mileageMax: e.target.value ? Number(e.target.value) : null })
          }
          className={selectClass}
        >
          <option value="">Qualquer quilometragem</option>
          <option value="0">Apenas 0 KM</option>
          <option value="5000">Até 5.000 km</option>
          <option value="15000">Até 15.000 km</option>
          <option value="30000">Até 30.000 km</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-sort"
          className="block text-xs font-medium uppercase tracking-wider text-ink-secondary mb-2"
        >
          Ordenar por
        </label>
        <select
          id="filter-sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={selectClass}
        >
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="mileage_asc">Menor KM</option>
          <option value="year_desc">Ano mais novo</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-card-elevated text-xs font-semibold uppercase tracking-wider text-ink hover:bg-card-hover transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Limpar filtros</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <aside
        aria-label="Filtros do catálogo"
        className="hidden lg:block bg-card border border-line-subtle rounded-xl p-5 sticky top-24 shadow-xs dark:shadow-none"
      >
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line-subtle">
          <SlidersHorizontal className="w-4 h-4 text-accent-ink" aria-hidden="true" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
            Filtros
          </h3>
        </div>
        {fieldsContent}
      </aside>

      {/* Mobile Drawer Filters */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[75] lg:hidden bg-black/75 backdrop-blur-sm flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros do catálogo"
        >
          <div className="w-full max-w-sm bg-card border-l border-line h-full flex flex-col text-ink">
            <div className="px-5 h-16 border-b border-line-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent-ink" aria-hidden="true" />
                <span className="font-display text-sm font-bold uppercase tracking-wider">
                  Filtros e Ordenação
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Fechar filtros"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-card-elevated text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{fieldsContent}</div>
            <div className="p-4 border-t border-line-subtle">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full h-11 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
