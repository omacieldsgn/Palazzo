import { Link } from 'react-router-dom';
import { ArrowUpRight, Flame, Layers } from 'lucide-react';
import { isOpportunityCategory } from '../../lib/catalog';
import type { Category } from '../../types';

interface CategorySectionProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  countsByCategory: Record<string, number>;
}

export function CategorySection({
  categories,
  selectedCategoryId,
  onSelectCategory,
  countsByCategory,
}: CategorySectionProps) {
  const totalCount = Object.values(countsByCategory).reduce((acc, n) => acc + n, 0);

  return (
    <section
      id="categorias"
      className="py-12 sm:py-16 bg-canvas-alt border-b border-line-subtle"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">
              01. Segmentação de Estoque
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
              Explore por Categoria
            </h2>
          </div>

          <Link
            to="/motos"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-accent-ink transition-colors whitespace-nowrap shrink-0"
          >
            <span>Ver catálogo completo</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Interactive Category Segmented Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            aria-pressed={selectedCategoryId === 'all'}
            className={`group text-left p-4 rounded-xl border transition-all min-h-[88px] flex flex-col justify-between ${
              selectedCategoryId === 'all'
                ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                : 'bg-card border-line-subtle text-ink hover:border-line-strong hover:bg-card-elevated'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <Layers
                className={`w-4 h-4 ${
                  selectedCategoryId === 'all' ? 'text-[#101010]' : 'text-accent-ink'
                }`}
                aria-hidden="true"
              />
              <span
                className={`font-mono-tabular text-xs font-semibold ${
                  selectedCategoryId === 'all' ? 'text-[#101010]/80' : 'text-ink-secondary'
                }`}
              >
                {totalCount}
              </span>
            </div>
            <span className="font-display text-sm font-bold uppercase tracking-tight mt-3 truncate">
              Todas
            </span>
          </button>

          {categories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            const isOpportunity = isOpportunityCategory(cat);
            const count = countsByCategory[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={active}
                className={`group text-left p-4 rounded-xl border transition-all min-h-[88px] flex flex-col justify-between ${
                  active
                    ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                    : isOpportunity
                      ? 'bg-card border-[#4A6800]/50 dark:border-[#B7F21B]/50 text-ink hover:border-[#4A6800] dark:hover:border-[#B7F21B] hover:bg-card-elevated'
                      : 'bg-card border-line-subtle text-ink hover:border-line-strong hover:bg-card-elevated'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {isOpportunity ? (
                    <span className="inline-flex items-center gap-1">
                      <Flame
                        className={`w-3.5 h-3.5 ${
                          active ? 'text-[#101010]' : 'text-accent-ink'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          active ? 'text-[#101010]' : 'text-accent-ink'
                        }`}
                      >
                        Oportunidade
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-xs ${
                        active ? 'bg-[#101010]' : 'bg-[#4A6800] dark:bg-[#B7F21B]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`font-mono-tabular text-xs font-semibold ${
                      active ? 'text-[#101010]/80' : 'text-ink-secondary'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-1">
                  <span className="font-display text-sm font-bold uppercase tracking-tight truncate">
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
