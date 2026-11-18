import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { generateSafeId, generateSlug } from '../lib/formatters';
import { optimizeImageToWebP } from '../lib/imageOptimizer';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  DEMO_MOTORCYCLES,
  OPPORTUNITY_CATEGORY_DEFAULT,
  OPPORTUNITY_CATEGORY_ID,
  OPPORTUNITY_CATEGORY_SLUG,
} from '../data/demoData';
import type { Banner, Category, Motorcycle, SiteSettings } from '../types';

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

function mapMotorcycle(id: string, data: Record<string, unknown>): Motorcycle {
  return {
    id,
    slug: String(data.slug || id),
    name: String(data.name || ''),
    brand: String(data.brand || ''),
    model: String(data.model || ''),
    version: data.version ? String(data.version) : undefined,
    categoryId: String(data.categoryId || ''),
    categoryName: data.categoryName ? String(data.categoryName) : undefined,
    yearManufacture: typeof data.yearManufacture === 'number' ? data.yearManufacture : undefined,
    yearModel: typeof data.yearModel === 'number' ? data.yearModel : new Date().getFullYear(),
    engineCc: typeof data.engineCc === 'number' ? data.engineCc : undefined,
    mileage: typeof data.mileage === 'number' ? data.mileage : undefined,
    color: data.color ? String(data.color) : undefined,
    fuel: data.fuel ? String(data.fuel) : undefined,
    transmission: data.transmission ? String(data.transmission) : undefined,
    power: data.power ? String(data.power) : undefined,
    cylinders: typeof data.cylinders === 'number' ? data.cylinders : undefined,
    features: Array.isArray(data.features) ? (data.features as string[]) : undefined,
    description: data.description ? String(data.description) : undefined,
    price: typeof data.price === 'number' ? data.price : 0,
    oldPrice: typeof data.oldPrice === 'number' ? data.oldPrice : null,
    paymentInfo: data.paymentInfo ? String(data.paymentInfo) : undefined,
    downPaymentInfo: data.downPaymentInfo ? String(data.downPaymentInfo) : undefined,
    installmentInfo: data.installmentInfo ? String(data.installmentInfo) : undefined,
    promoText: data.promoText ? String(data.promoText) : undefined,
    condition: data.condition === 'new' || data.condition === 'used' ? data.condition : undefined,
    status: (data.status as Motorcycle['status']) || 'available',
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    badge: data.badge ? String(data.badge) : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isDemo: Boolean(data.isDemo),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    coverPosition: data.coverPosition ? String(data.coverPosition) : undefined,
    coverFit: data.coverFit === 'contain' || data.coverFit === 'cover' ? data.coverFit : undefined,
    images: Array.isArray(data.images) ? (data.images as Motorcycle['images']) : [],
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: String(data.name || ''),
    slug: String(data.slug || id),
    description: data.description ? String(data.description) : undefined,
    imagePath: data.imagePath ? String(data.imagePath) : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    active: Boolean(data.active),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapBanner(id: string, data: Record<string, unknown>): Banner {
  return {
    id,
    title: String(data.title || ''),
    subtitle: data.subtitle ? String(data.subtitle) : undefined,
    imageDesktop: data.imageDesktop ? String(data.imageDesktop) : undefined,
    imageMobile: data.imageMobile ? String(data.imageMobile) : undefined,
    ctaText: data.ctaText ? String(data.ctaText) : undefined,
    ctaUrl: data.ctaUrl ? String(data.ctaUrl) : undefined,
    active: Boolean(data.active),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapSiteSettings(data: Record<string, unknown>): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(data as Partial<SiteSettings>),
    activeSections: {
      ...DEFAULT_SITE_SETTINGS.activeSections,
      ...((data.activeSections as SiteSettings['activeSections']) || {}),
    },
    sectionsOrder: Array.isArray(data.sectionsOrder)
      ? (data.sectionsOrder as SiteSettings['sectionsOrder'])
      : DEFAULT_SITE_SETTINGS.sectionsOrder,
    updatedAt: toIsoString(data.updatedAt),
  };
}

// ==========================================
// Public Subscriptions
// ==========================================

export function subscribePublicMotorcycles(
  onData: (items: Motorcycle[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(
    collection(db, 'motorcycles'),
    where('published', '==', true),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapMotorcycle(d.id, d.data() as Record<string, unknown>))
        .filter((m) => m.status !== 'hidden')
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'motorcycles');
    },
  );
}

export function subscribePublicCategories(
  onData: (items: Category[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(collection(db, 'categories'), where('active', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapCategory(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'categories');
    },
  );
}

export function subscribePublicBanners(
  onData: (items: Banner[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(collection(db, 'banners'), where('active', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapBanner(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'banners');
    },
  );
}

export function subscribeSiteSettings(
  onData: (settings: SiteSettings | null) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    doc(db, 'site_settings', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(mapSiteSettings(snap.data() as Record<string, unknown>));
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.GET, 'site_settings/main');
    },
  );
}

// ==========================================
// Admin Subscriptions
// ==========================================

export function subscribeAdminMotorcycles(
  onData: (items: Motorcycle[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, 'motorcycles'),
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapMotorcycle(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'motorcycles');
    },
  );
}

export function subscribeAdminCategories(
  onData: (items: Category[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, 'categories'),
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapCategory(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'categories');
    },
  );
}

export function subscribeAdminBanners(
  onData: (items: Banner[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, 'banners'),
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapBanner(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, 'banners');
    },
  );
}

// ==========================================
// Motorcycles CRUD
// ==========================================

export async function getMotorcycleById(id: string): Promise<Motorcycle | null> {
  try {
    const snap = await getDoc(doc(db, 'motorcycles', id));
    if (!snap.exists()) return null;
    return mapMotorcycle(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `motorcycles/${id}`);
  }
}

export async function ensureUniqueMotorcycleSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  const cleanBase = generateSlug(baseSlug) || `moto-${Date.now()}`;
  const existingSnap = await getDocs(
    query(collection(db, 'motorcycles'), where('slug', '==', cleanBase)),
  );
  const conflict = existingSnap.docs.some((d) => d.id !== excludeId);
  if (!conflict) return cleanBase;
  return `${cleanBase}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function saveMotorcycle(
  input: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const id = existingId || generateSafeId('moto');
  const uniqueSlug = await ensureUniqueMotorcycleSlug(input.slug || input.name, existingId);
  const coverImage =
    input.images?.find((img) => img.isCover)?.storagePath ||
    input.images?.[0]?.storagePath ||
    input.coverImage;

  const cleanPayload = stripUndefined({
    slug: uniqueSlug,
    name: input.name.trim(),
    brand: input.brand.trim(),
    model: input.model.trim(),
    version: input.version?.trim(),
    categoryId: input.categoryId,
    categoryName: input.categoryName?.trim(),
    yearManufacture: input.yearManufacture,
    yearModel: input.yearModel,
    engineCc: input.engineCc,
    mileage: input.mileage,
    color: input.color?.trim(),
    fuel: input.fuel?.trim(),
    transmission: input.transmission?.trim(),
    power: input.power?.trim(),
    cylinders: input.cylinders,
    features: input.features?.filter(Boolean),
    description: input.description?.trim(),
    price: Number(input.price),
    oldPrice: input.oldPrice ? Number(input.oldPrice) : null,
    paymentInfo: input.paymentInfo?.trim(),
    downPaymentInfo: input.downPaymentInfo?.trim(),
    installmentInfo: input.installmentInfo?.trim(),
    promoText: input.promoText?.trim(),
    condition: input.condition,
    status: input.status,
    featured: Boolean(input.featured),
    published: input.status === 'hidden' ? false : Boolean(input.published),
    badge: input.badge?.trim(),
    sortOrder: Number(input.sortOrder || 0),
    isDemo: Boolean(input.isDemo),
    coverImage,
    coverPosition: input.coverPosition?.trim() || '50% 50%',
    coverFit: input.coverFit || 'cover',
    images: input.images || [],
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'motorcycles', id), {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'motorcycles', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      `motorcycles/${id}`,
    );
  }
}

export async function updateMotorcycleQuickFields(
  id: string,
  patch: Partial<Pick<Motorcycle, 'status' | 'published' | 'featured'>>,
): Promise<void> {
  try {
    await updateDoc(doc(db, 'motorcycles', id), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `motorcycles/${id}`);
  }
}

export async function duplicateMotorcycle(source: Motorcycle): Promise<string> {
  const newId = generateSafeId('moto');
  const uniqueSlug = await ensureUniqueMotorcycleSlug(`${source.slug}-copia`);
  const payload = stripUndefined({
    slug: uniqueSlug,
    name: `${source.name} (Cópia)`,
    brand: source.brand,
    model: source.model,
    version: source.version,
    categoryId: source.categoryId,
    categoryName: source.categoryName,
    yearManufacture: source.yearManufacture,
    yearModel: source.yearModel,
    engineCc: source.engineCc,
    mileage: source.mileage,
    color: source.color,
    fuel: source.fuel,
    transmission: source.transmission,
    power: source.power,
    cylinders: source.cylinders,
    features: source.features,
    description: source.description,
    price: source.price,
    oldPrice: source.oldPrice ?? null,
    paymentInfo: source.paymentInfo,
    downPaymentInfo: source.downPaymentInfo,
    installmentInfo: source.installmentInfo,
    promoText: source.promoText,
    condition: source.condition,
    status: source.status === 'sold' ? 'available' : source.status,
    featured: false,
    published: false,
    badge: source.badge,
    sortOrder: source.sortOrder,
    isDemo: false,
    coverImage: source.coverImage,
    coverPosition: source.coverPosition || '50% 50%',
    coverFit: source.coverFit || 'cover',
    images: source.images || [],
  });

  try {
    await setDoc(doc(db, 'motorcycles', newId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `motorcycles/${newId}`);
  }
}

export async function deleteMotorcycle(moto: Motorcycle): Promise<void> {
  try {
    await deleteDoc(doc(db, 'motorcycles', moto.id));
    if (moto.images?.length) {
      for (const img of moto.images) {
        if (img.storagePath.startsWith('/uploads/')) {
          void deleteUploadedImage(img.storagePath);
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `motorcycles/${moto.id}`);
  }
}

// ==========================================
// Categories CRUD
// ==========================================

export async function saveCategory(
  input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const id = existingId || generateSafeId('cat');
  const payload = stripUndefined({
    name: input.name.trim(),
    slug: generateSlug(input.slug || input.name),
    description: input.description?.trim(),
    imagePath: input.imagePath?.trim(),
    sortOrder: Number(input.sortOrder || 0),
    active: Boolean(input.active),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'categories', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'categories', id), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      `categories/${id}`,
    );
  }
}

export async function ensureOpportunityCategoryExists(): Promise<void> {
  try {
    const bySlugSnap = await getDocs(
      query(collection(db, 'categories'), where('slug', '==', OPPORTUNITY_CATEGORY_SLUG)),
    );
    if (!bySlugSnap.empty) return;

    const byIdSnap = await getDoc(doc(db, 'categories', OPPORTUNITY_CATEGORY_ID));
    if (byIdSnap.exists()) return;

    const { id, createdAt: _c, updatedAt: _u, ...rest } = OPPORTUNITY_CATEGORY_DEFAULT;
    await setDoc(doc(db, 'categories', id), {
      ...stripUndefined(rest),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking: admin may be offline or rules not yet matched during bootstrap
  }
}

export async function deleteCategorySafe(
  categoryId: string,
  motorcycles: Motorcycle[],
): Promise<void> {
  const linked = motorcycles.filter((m) => m.categoryId === categoryId);
  if (linked.length > 0) {
    throw new Error(
      `Não é possível excluir: existem ${linked.length} motocicleta(s) vinculada(s) a esta categoria. Reatribua-as antes de excluir.`,
    );
  }
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
}

// ==========================================
// Banners CRUD
// ==========================================

export async function saveBanner(
  input: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const id = existingId || generateSafeId('banner');
  const payload = stripUndefined({
    title: input.title.trim(),
    subtitle: input.subtitle?.trim(),
    imageDesktop: input.imageDesktop?.trim(),
    imageMobile: input.imageMobile?.trim(),
    ctaText: input.ctaText?.trim(),
    ctaUrl: input.ctaUrl?.trim(),
    active: Boolean(input.active),
    sortOrder: Number(input.sortOrder || 0),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'banners', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'banners', id), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      `banners/${id}`,
    );
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `banners/${bannerId}`);
  }
}

// ==========================================
// Site Settings
// ==========================================

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const payload = stripUndefined({
    companyName: settings.companyName.trim(),
    logoUrl: settings.logoUrl?.trim(),
    whatsappNumber: settings.whatsappNumber.trim(),
    phone: settings.phone?.trim(),
    instagram: settings.instagram?.trim(),
    email: settings.email?.trim(),
    address: settings.address?.trim(),
    openingHours: settings.openingHours?.trim(),
    defaultTheme: settings.defaultTheme || 'dark',
    heroHeadline: settings.heroHeadline.trim(),
    heroSubheadline: settings.heroSubheadline?.trim(),
    heroImageDesktop: settings.heroImageDesktop?.trim(),
    heroImageMobile: settings.heroImageMobile?.trim(),
    heroOverlayShadow: settings.heroOverlayShadow ?? true,
    heroShadowColor: settings.heroShadowColor?.trim() || '#080909',
    heroShadowOpacity:
      typeof settings.heroShadowOpacity === 'number' ? settings.heroShadowOpacity : 85,
    heroShadowDirection: settings.heroShadowDirection || 'left',
    heroShadowReach:
      typeof settings.heroShadowReach === 'number' ? settings.heroShadowReach : 70,
    heroHighlightBold: settings.heroHighlightBold ?? true,
    heroHighlightItalic: settings.heroHighlightItalic ?? false,
    heroHighlightBgEnabled: settings.heroHighlightBgEnabled ?? false,
    heroHighlightBgColor: settings.heroHighlightBgColor?.trim() || '#B7F21B',
    heroImagePosition: settings.heroImagePosition?.trim() || '50% 50%',
    heroImageFit: settings.heroImageFit || 'cover',
    heroMobileImagePosition:
      settings.heroMobileImagePosition?.trim() || settings.heroImagePosition?.trim() || '50% 50%',
    heroMobileImageFit: settings.heroMobileImageFit || settings.heroImageFit || 'cover',
    heroPrimaryCtaText: settings.heroPrimaryCtaText?.trim(),
    heroPrimaryCtaUrl: settings.heroPrimaryCtaUrl?.trim(),
    heroSecondaryCtaText: settings.heroSecondaryCtaText?.trim(),
    heroSecondaryCtaUrl: settings.heroSecondaryCtaUrl?.trim(),
    aboutTitle: settings.aboutTitle?.trim(),
    aboutText: settings.aboutText?.trim(),
    finalCtaTitle: settings.finalCtaTitle?.trim(),
    finalCtaSubtitle: settings.finalCtaSubtitle?.trim(),
    finalCtaButtonText: settings.finalCtaButtonText?.trim(),
    seoTitle: settings.seoTitle?.trim(),
    seoDescription: settings.seoDescription?.trim(),
    activeSections: settings.activeSections,
    sectionsOrder: settings.sectionsOrder,
  });

  try {
    await setDoc(
      doc(db, 'site_settings', 'main'),
      {
        ...payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
  }
}

// ==========================================
// Image Upload & Cleanup (WebP Optimized)
// ==========================================

export async function uploadOptimizedImage(
  file: File,
  folder: string,
): Promise<string> {
  const optimized = await optimizeImageToWebP(file);
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Sessão administrativa necessária para enviar imagens.');
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dataUrl: optimized.dataUrl,
      folder,
    }),
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `Falha no upload da imagem (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Servidor de upload não configurado neste deploy. Verifique a função /api/upload.');
  }

  const result = (await response.json()) as { url?: string };
  if (!result?.url) {
    throw new Error('Resposta inválida do servidor de upload.');
  }
  return result.url;
}

export async function deleteUploadedImage(url: string): Promise<void> {
  if (!url.startsWith('/uploads/') && !url.includes('.blob.vercel-storage.com/')) {
    return;
  }
  const token = await auth.currentUser?.getIdToken();
  if (!token) return;

  await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  }).catch(() => undefined);
}

// ==========================================
// Demo Seed & Cleanup Utilities
// ==========================================

export async function seedInitialDatabase(includeDemoMotorcycles = true): Promise<void> {
  const batch = writeBatch(db);

  batch.set(doc(db, 'site_settings', 'main'), {
    ...DEFAULT_SITE_SETTINGS,
    updatedAt: serverTimestamp(),
  });

  for (const cat of DEFAULT_CATEGORIES) {
    const { id, createdAt: _c, updatedAt: _u, ...rest } = cat;
    batch.set(doc(db, 'categories', id), {
      ...stripUndefined(rest),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  if (includeDemoMotorcycles) {
    for (const moto of DEMO_MOTORCYCLES) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = moto;
      batch.set(doc(db, 'motorcycles', id), {
        ...stripUndefined(rest),
        oldPrice: rest.oldPrice ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

export async function clearDemoMotorcycles(motorcycles: Motorcycle[]): Promise<number> {
  const demos = motorcycles.filter((m) => m.isDemo);
  if (demos.length === 0) return 0;

  const batch = writeBatch(db);
  for (const moto of demos) {
    batch.delete(doc(db, 'motorcycles', moto.id));
  }
  try {
    await batch.commit();
    return demos.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'motorcycles');
  }
}
