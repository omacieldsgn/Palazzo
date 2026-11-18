import type { CatalogFilters, Motorcycle, SortOption } from '../types';

export function filterMotorcycles(
  motorcycles: Motorcycle[],
  filters: CatalogFilters,
): Motorcycle[] {
  const searchTerm = (filters.search || '').trim().toLowerCase();

  return motorcycles.filter((moto) => {
    if (searchTerm) {
      const haystack = [
        moto.name,
        moto.brand,
        moto.model,
        moto.version,
        moto.categoryName,
        moto.color,
        String(moto.yearModel),
        moto.engineCc ? `${moto.engineCc}cc` : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    if (filters.brand && filters.brand !== 'all') {
      if (moto.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      if (moto.categoryId !== filters.categoryId) return false;
    }

    if (filters.condition && filters.condition !== 'all') {
      if (moto.condition !== filters.condition) return false;
    }

    if (filters.yearMin !== null && filters.yearMin !== undefined) {
      if (moto.yearModel < filters.yearMin) return false;
    }

    if (filters.yearMax !== null && filters.yearMax !== undefined) {
      if (moto.yearModel > filters.yearMax) return false;
    }

    if (filters.ccMin !== null && filters.ccMin !== undefined) {
      if ((moto.engineCc ?? 0) < filters.ccMin) return false;
    }

    if (filters.ccMax !== null && filters.ccMax !== undefined) {
      if ((moto.engineCc ?? 0) > filters.ccMax) return false;
    }

    if (filters.priceMin !== null && filters.priceMin !== undefined) {
      if (moto.price < filters.priceMin) return false;
    }

    if (filters.priceMax !== null && filters.priceMax !== undefined) {
      if (moto.price > filters.priceMax) return false;
    }

    if (filters.mileageMax !== null && filters.mileageMax !== undefined) {
      if ((moto.mileage ?? 0) > filters.mileageMax) return false;
    }

    return true;
  });
}

export function sortMotorcycles(
  motorcycles: Motorcycle[],
  sortBy: SortOption,
): Motorcycle[] {
  const copy = [...motorcycles];

  switch (sortBy) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'mileage_asc':
      return copy.sort((a, b) => (a.mileage ?? Number.MAX_SAFE_INTEGER) - (b.mileage ?? Number.MAX_SAFE_INTEGER));
    case 'year_desc':
      return copy.sort((a, b) => b.yearModel - a.yearModel || a.price - b.price);
    case 'recent':
    default:
      return copy.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; totalPages: number; totalItems: number; currentPage: number } {
  const safeSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * safeSize;

  return {
    items: items.slice(start, start + safeSize),
    totalPages,
    totalItems,
    currentPage,
  };
}

export function getRelatedMotorcycles(
  current: Motorcycle,
  all: Motorcycle[],
  limit = 3,
): Motorcycle[] {
  const candidates = all.filter(
    (m) =>
      m.id !== current.id &&
      m.published &&
      m.status !== 'hidden' &&
      m.status !== 'sold',
  );

  const scored = candidates.map((m) => {
    let score = 0;
    if (m.categoryId === current.categoryId) score += 4;
    if (m.brand.toLowerCase() === current.brand.toLowerCase()) score += 2;
    const priceDiffRatio = Math.abs(m.price - current.price) / Math.max(current.price, 1);
    if (priceDiffRatio <= 0.25) score += 3;
    else if (priceDiffRatio <= 0.5) score += 1;
    if (m.featured) score += 1;
    return { moto: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.moto);
}

export function extractCatalogFacets(motorcycles: Motorcycle[]) {
  const brandsSet = new Set<string>();
  const yearsSet = new Set<number>();
  let minPrice = Infinity;
  let maxPrice = 0;
  let minCc = Infinity;
  let maxCc = 0;

  for (const m of motorcycles) {
    if (m.brand) brandsSet.add(m.brand);
    if (m.yearModel) yearsSet.add(m.yearModel);
    if (m.price < minPrice) minPrice = m.price;
    if (m.price > maxPrice) maxPrice = m.price;
    if (m.engineCc !== undefined && m.engineCc !== null) {
      if (m.engineCc < minCc) minCc = m.engineCc;
      if (m.engineCc > maxCc) maxCc = m.engineCc;
    }
  }

  return {
    brands: Array.from(brandsSet).sort((a, b) => a.localeCompare(b)),
    years: Array.from(yearsSet).sort((a, b) => b - a),
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice,
    minCc: minCc === Infinity ? 0 : minCc,
    maxCc,
  };
}
