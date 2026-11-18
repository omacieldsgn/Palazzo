export type MotorcycleStatus = 'available' | 'reserved' | 'sold' | 'hidden';
export type MotorcycleCondition = 'new' | 'used';

export interface MotorcycleImage {
  id: string;
  storagePath: string;
  altText?: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Motorcycle {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  version?: string;
  categoryId: string;
  categoryName?: string;
  yearManufacture?: number;
  yearModel: number;
  engineCc?: number;
  mileage?: number;
  color?: string;
  fuel?: string;
  transmission?: string;
  power?: string;
  cylinders?: number;
  features?: string[];
  description?: string;
  price: number;
  oldPrice?: number | null;
  paymentInfo?: string;
  downPaymentInfo?: string;
  installmentInfo?: string;
  promoText?: string;
  condition?: MotorcycleCondition;
  status: MotorcycleStatus;
  featured: boolean;
  published: boolean;
  badge?: string;
  sortOrder: number;
  isDemo?: boolean;
  coverImage?: string;
  images?: MotorcycleImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imagePath?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageDesktop?: string;
  imageMobile?: string;
  ctaText?: string;
  ctaUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type StorefrontSectionKey =
  | 'hero'
  | 'categories'
  | 'featured'
  | 'catalog'
  | 'banners'
  | 'about'
  | 'final_cta';

export interface SiteSettings {
  companyName: string;
  logoUrl?: string;
  whatsappNumber: string;
  phone?: string;
  instagram?: string;
  email?: string;
  address?: string;
  openingHours?: string;
  heroHeadline: string;
  heroSubheadline?: string;
  heroImageDesktop?: string;
  heroImageMobile?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaUrl?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaUrl?: string;
  aboutTitle?: string;
  aboutText?: string;
  finalCtaTitle?: string;
  finalCtaSubtitle?: string;
  finalCtaButtonText?: string;
  seoTitle?: string;
  seoDescription?: string;
  activeSections: Record<StorefrontSectionKey, boolean>;
  sectionsOrder: StorefrontSectionKey[];
  updatedAt: string;
}

export type SortOption =
  | 'recent'
  | 'price_asc'
  | 'price_desc'
  | 'mileage_asc'
  | 'year_desc';

export interface CatalogFilters {
  search?: string;
  brand?: string;
  categoryId?: string;
  yearMin?: number | null;
  yearMax?: number | null;
  ccMin?: number | null;
  ccMax?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  mileageMax?: number | null;
  condition?: MotorcycleCondition | 'all';
}
