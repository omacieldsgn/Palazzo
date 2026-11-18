import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const motorcycleImageSchema = z.object({
  id: z.string().min(1).max(128),
  storagePath: z.string().min(1).max(600),
  altText: z.string().max(160).optional(),
  sortOrder: z.number().int().min(0),
  isCover: z.boolean(),
});

export const motorcycleFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo da moto').max(140),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug inválido')
    .max(140)
    .regex(slugRegex, 'Use apenas letras minúsculas, números e hífens'),
  brand: z.string().trim().min(2, 'Informe a marca').max(60),
  model: z.string().trim().min(1, 'Informe o modelo').max(80),
  version: z.string().trim().max(80).optional(),
  categoryId: z.string().trim().min(1, 'Selecione uma categoria').max(128),
  yearManufacture: z.number().int().min(1950).max(2100).optional(),
  yearModel: z.number().int().min(1950, 'Ano inválido').max(2100, 'Ano inválido'),
  engineCc: z.number().int().min(0).max(10000).optional(),
  mileage: z.number().int().min(0).max(2000000).optional(),
  color: z.string().trim().max(40).optional(),
  fuel: z.string().trim().max(40).optional(),
  transmission: z.string().trim().max(60).optional(),
  power: z.string().trim().max(60).optional(),
  cylinders: z.number().int().min(1).max(12).optional(),
  features: z.array(z.string().trim().max(80)).max(20).optional(),
  description: z.string().trim().max(4000).optional(),
  price: z.number().min(0, 'Informe um preço válido').max(100000000),
  oldPrice: z.number().min(0).max(100000000).nullable().optional(),
  paymentInfo: z.string().trim().max(500).optional(),
  downPaymentInfo: z.string().trim().max(200).optional(),
  installmentInfo: z.string().trim().max(200).optional(),
  promoText: z.string().trim().max(160).optional(),
  condition: z.enum(['new', 'used']).optional(),
  status: z.enum(['available', 'reserved', 'sold', 'hidden']),
  featured: z.boolean(),
  published: z.boolean(),
  badge: z.string().trim().max(40).optional(),
  sortOrder: z.number().int().min(0).max(100000),
  coverPosition: z
    .string()
    .trim()
    .max(32)
    .regex(/^\d{1,3}%\s+\d{1,3}%$/, 'Posição de capa inválida')
    .optional(),
  coverFit: z.enum(['cover', 'contain']).optional(),
  images: z.array(motorcycleImageSchema).max(15).optional(),
});

export const quickMotorcycleSchema = z.object({
  brand: z.string().trim().min(2, 'Informe a marca').max(60),
  model: z.string().trim().min(1, 'Informe o modelo').max(80),
  yearModel: z.number().int().min(1950).max(2100),
  price: z.number().min(0, 'Informe o preço').max(100000000),
  categoryId: z.string().trim().min(1, 'Selecione uma categoria').max(128),
  publishImmediately: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da categoria').max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(slugRegex, 'Slug deve conter apenas minúsculas, números e hífens'),
  description: z.string().trim().max(300).optional(),
  imagePath: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).max(10000),
  active: z.boolean(),
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2, 'Informe o título do banner').max(120),
  subtitle: z.string().trim().max(280).optional(),
  imageDesktop: z.string().trim().max(600).optional(),
  imageMobile: z.string().trim().max(600).optional(),
  ctaText: z.string().trim().max(60).optional(),
  ctaUrl: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).max(10000),
  active: z.boolean(),
});

export const siteSettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(100),
  logoUrl: z.string().trim().max(600).optional(),
  whatsappNumber: z.string().trim().min(8, 'Informe um WhatsApp válido').max(24),
  phone: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(120).optional(),
  email: z.string().trim().max(120).optional(),
  address: z.string().trim().max(240).optional(),
  openingHours: z.string().trim().max(200).optional(),
  heroHeadline: z.string().trim().min(2, 'Informe a headline principal').max(160),
  heroSubheadline: z.string().trim().max(300).optional(),
  heroImageDesktop: z.string().trim().max(600).optional(),
  heroImageMobile: z.string().trim().max(600).optional(),
  heroOverlayShadow: z.boolean().optional(),
  heroImagePosition: z
    .string()
    .trim()
    .max(32)
    .regex(/^\d{1,3}%\s+\d{1,3}%$/, 'Posição do banner inválida')
    .optional(),
  heroImageFit: z.enum(['cover', 'contain']).optional(),
  heroMobileImagePosition: z
    .string()
    .trim()
    .max(32)
    .regex(/^\d{1,3}%\s+\d{1,3}%$/, 'Posição mobile do banner inválida')
    .optional(),
  heroMobileImageFit: z.enum(['cover', 'contain']).optional(),
  heroPrimaryCtaText: z.string().trim().max(60).optional(),
  heroPrimaryCtaUrl: z.string().trim().max(300).optional(),
  heroSecondaryCtaText: z.string().trim().max(60).optional(),
  heroSecondaryCtaUrl: z.string().trim().max(300).optional(),
  aboutTitle: z.string().trim().max(120).optional(),
  aboutText: z.string().trim().max(1600).optional(),
  finalCtaTitle: z.string().trim().max(160).optional(),
  finalCtaSubtitle: z.string().trim().max(300).optional(),
  finalCtaButtonText: z.string().trim().max(60).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});
