import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMotorcycleWhatsAppMessage,
  buildWhatsAppUrl,
  formatEngineCc,
  formatMileage,
  formatPriceBRL,
  generateSlug,
  sanitizeWhatsAppNumber,
} from './formatters';
import {
  extractCatalogFacets,
  filterMotorcycles,
  getRelatedMotorcycles,
  isOpportunityMotorcycle,
  paginateItems,
  sortMotorcycles,
} from './catalog';
import { categorySchema, motorcycleFormSchema } from './validations';
import type { Motorcycle } from '../types';

const sampleMotos: Motorcycle[] = [
  {
    id: 'm1',
    slug: 'ducati-panigale-v4s-2024',
    name: 'Ducati Panigale V4 S',
    brand: 'Ducati',
    model: 'Panigale V4',
    version: 'S',
    categoryId: 'cat-esportiva',
    categoryName: 'Esportiva',
    yearModel: 2024,
    engineCc: 1103,
    mileage: 1200,
    condition: 'used',
    price: 165000,
    status: 'available',
    featured: true,
    published: true,
    sortOrder: 1,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'm2',
    slug: 'triumph-street-triple-765-rs-2025',
    name: 'Triumph Street Triple 765 RS',
    brand: 'Triumph',
    model: 'Street Triple 765',
    version: 'RS',
    categoryId: 'cat-naked',
    categoryName: 'Naked',
    yearModel: 2025,
    engineCc: 765,
    mileage: 0,
    condition: 'new',
    price: 72990,
    status: 'available',
    featured: true,
    published: true,
    sortOrder: 2,
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'm3',
    slug: 'bmw-r-1300-gs-2024',
    name: 'BMW R 1300 GS',
    brand: 'BMW',
    model: 'R 1300 GS',
    version: 'Triple Black',
    categoryId: 'cat-trail',
    categoryName: 'Trail',
    yearModel: 2024,
    engineCc: 1300,
    mileage: 4800,
    condition: 'used',
    price: 119000,
    status: 'available',
    featured: false,
    published: true,
    sortOrder: 3,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
];

test('slugify handles Portuguese accents and punctuation', () => {
  assert.equal(generateSlug('Edição Especial — R 1300 GS!'), 'edicao-especial-r-1300-gs');
  assert.equal(generateSlug('  Yamaha MT-09 SP 2025  '), 'yamaha-mt-09-sp-2025');
});

test('formatters output BRL, km, cc and WhatsApp URLs cleanly', () => {
  assert.match(formatPriceBRL(72990), /72\.990/);
  assert.equal(formatMileage(0), '0 km');
  assert.match(formatMileage(4800), /4\.800 km/);
  assert.equal(formatEngineCc(765), '765 cc');
  assert.equal(sanitizeWhatsAppNumber('(11) 98888-7777'), '5511988887777');

  const msg = buildMotorcycleWhatsAppMessage(sampleMotos[1]);
  const url = buildWhatsAppUrl('5511988887777', msg);
  assert.ok(url.startsWith('https://wa.me/5511988887777?text='));
  assert.ok(url.includes(encodeURIComponent('Triumph Street Triple 765')));
});

test('filterMotorcycles filters by search, category, brand, cc, price and condition', () => {
  assert.equal(filterMotorcycles(sampleMotos, { search: 'panigale' }).length, 1);
  assert.equal(filterMotorcycles(sampleMotos, { categoryId: 'cat-naked' }).length, 1);
  assert.equal(filterMotorcycles(sampleMotos, { brand: 'BMW' }).length, 1);
  assert.equal(filterMotorcycles(sampleMotos, { condition: 'new' }).length, 1);
  assert.equal(filterMotorcycles(sampleMotos, { priceMax: 80000 }).length, 1);
  assert.equal(filterMotorcycles(sampleMotos, { ccMin: 1000 }).length, 2);
});

test('sortMotorcycles orders by price, mileage, year and prioritizes opportunity bikes', () => {
  const byPriceAsc = sortMotorcycles(sampleMotos, 'price_asc');
  assert.equal(byPriceAsc[0].id, 'm2');
  const byPriceDesc = sortMotorcycles(sampleMotos, 'price_desc');
  assert.equal(byPriceDesc[0].id, 'm1');
  const byYearDesc = sortMotorcycles(sampleMotos, 'year_desc');
  assert.equal(byYearDesc[0].id, 'm2');
  const byMileageAsc = sortMotorcycles(sampleMotos, 'mileage_asc');
  assert.equal(byMileageAsc[0].id, 'm2');

  const oppMoto: Motorcycle = {
    ...sampleMotos[2],
    id: 'm-opp',
    categoryId: 'cat-ofertas-imperdiveis',
    categoryName: 'Ofertas Imperdíveis',
    sortOrder: 99,
  };
  const soldOppMoto: Motorcycle = {
    ...oppMoto,
    id: 'm-opp-sold',
    status: 'sold',
    sortOrder: 0,
  };
  assert.equal(isOpportunityMotorcycle(oppMoto), true);
  assert.equal(isOpportunityMotorcycle(sampleMotos[0]), false);

  const sortedRecent = sortMotorcycles([...sampleMotos, soldOppMoto, oppMoto], 'recent');
  assert.equal(sortedRecent[0].id, 'm-opp');
  assert.notEqual(sortedRecent[1].id, 'm-opp-sold');
});

test('paginateItems clamps page boundaries cleanly', () => {
  const page1 = paginateItems(sampleMotos, 1, 2);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.totalPages, 2);
  const page99 = paginateItems(sampleMotos, 99, 2);
  assert.equal(page99.currentPage, 2);
  assert.equal(page99.items.length, 1);
});

test('getRelatedMotorcycles excludes current bike and sold bikes', () => {
  const related = getRelatedMotorcycles(sampleMotos[0], sampleMotos, 2);
  assert.equal(related.length, 2);
  assert.ok(related.every((m) => m.id !== 'm1'));
});

test('extractCatalogFacets extracts sorted brands and years', () => {
  const facets = extractCatalogFacets(sampleMotos);
  assert.deepEqual(facets.brands, ['BMW', 'Ducati', 'Triumph']);
  assert.deepEqual(facets.years, [2025, 2024]);
  assert.equal(facets.minPrice, 72990);
  assert.equal(facets.maxPrice, 165000);
});

test('Zod validation enforces required fields, slug pattern and cover framing', () => {
  const badCategory = categorySchema.safeParse({
    name: 'A',
    slug: 'Invalid Slug!',
    sortOrder: 1,
    active: true,
  });
  assert.equal(badCategory.success, false);

  const validMoto = motorcycleFormSchema.safeParse({
    name: 'Yamaha MT-09',
    slug: 'yamaha-mt-09-2025',
    brand: 'Yamaha',
    model: 'MT-09',
    categoryId: 'cat-naked',
    yearModel: 2025,
    price: 62990,
    status: 'available',
    featured: true,
    published: true,
    sortOrder: 1,
    coverPosition: '50% 35%',
    coverFit: 'contain',
  });
  assert.equal(validMoto.success, true);

  const invalidCoverPos = motorcycleFormSchema.safeParse({
    name: 'Yamaha MT-09',
    slug: 'yamaha-mt-09-2025',
    brand: 'Yamaha',
    model: 'MT-09',
    categoryId: 'cat-naked',
    yearModel: 2025,
    price: 62990,
    status: 'available',
    featured: true,
    published: true,
    sortOrder: 1,
    coverPosition: 'center top',
  });
  assert.equal(invalidCoverPos.success, false);
});
