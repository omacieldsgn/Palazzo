import type { Motorcycle } from '../types';

export function formatPriceBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Sob consulta';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(km?: number | null): string {
  if (km === undefined || km === null) return '—';
  if (km === 0) return '0 km';
  return `${new Intl.NumberFormat('pt-BR').format(km)} km`;
}

export function formatEngineCc(cc?: number | null): string {
  if (!cc) return '—';
  return `${cc} cc`;
}

export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

export function generateSafeId(prefix = 'item'): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function sanitizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '5551999422491';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanNumber = sanitizeWhatsAppNumber(phone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildMotorcycleWhatsAppMessage(
  moto: Pick<Motorcycle, 'brand' | 'model' | 'yearModel' | 'version'>,
  mode: 'interest' | 'financing' = 'interest',
): string {
  if (mode === 'financing') {
    return `Olá! Gostaria de consultar as condições de pagamento e financiamento da ${moto.brand} ${moto.model}${moto.version ? ` ${moto.version}` : ''} (${moto.yearModel}) no site da Palazzo Motos.`;
  }
  return `Olá! Tenho interesse na ${moto.brand} ${moto.model}${moto.version ? ` ${moto.version}` : ''} ${moto.yearModel} que vi no site da Palazzo Motos. Gostaria de mais informações.`;
}

export function getStatusLabel(status: Motorcycle['status']): string {
  switch (status) {
    case 'available':
      return 'Disponível';
    case 'reserved':
      return 'Reservada';
    case 'sold':
      return 'Vendida';
    case 'hidden':
      return 'Oculta';
  }
}

export function getMotorcycleCoverImage(moto: Pick<Motorcycle, 'coverImage' | 'images'>): string | undefined {
  if (moto.coverImage) return moto.coverImage;
  const cover = moto.images?.find((img) => img.isCover);
  if (cover?.storagePath) return cover.storagePath;
  return moto.images?.[0]?.storagePath;
}
