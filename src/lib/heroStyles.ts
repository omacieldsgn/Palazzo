import type { HeroShadowDirection } from '../types';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function parseHexRgb(hex?: string, fallback = '#080909'): RgbColor {
  const clean = (hex || fallback).trim();
  const match = clean.match(/^#([0-9a-fA-F]{6})$/);
  const resolved = match ? match[1] : fallback.replace('#', '');
  return {
    r: parseInt(resolved.slice(0, 2), 16) || 8,
    g: parseInt(resolved.slice(2, 4), 16) || 9,
    b: parseInt(resolved.slice(4, 6), 16) || 9,
  };
}

export function isLightColor(hex?: string): boolean {
  const { r, g, b } = parseHexRgb(hex, '#080909');
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance >= 0.58;
}

export function getContrastInk(hex?: string): '#101010' | '#F3F3F3' {
  return isLightColor(hex) ? '#101010' : '#F3F3F3';
}

export interface HeroShadowOptions {
  enabled?: boolean;
  color?: string;
  opacity?: number;
  direction?: HeroShadowDirection;
  reach?: number;
}

export function buildHeroShadowGradient(options: HeroShadowOptions): string | undefined {
  if (options.enabled === false) return undefined;

  const { r, g, b } = parseHexRgb(options.color, '#080909');
  const rawOpacity = typeof options.opacity === 'number' ? options.opacity : 85;
  const alpha = Math.min(1, Math.max(0, rawOpacity / 100));
  if (alpha <= 0) return undefined;

  const midAlpha = Number((alpha * 0.68).toFixed(3));
  const softAlpha = Number((alpha * 0.28).toFixed(3));
  const reach = Math.min(100, Math.max(10, Math.round(options.reach ?? 70)));
  const direction = options.direction || 'left';

  if (direction === 'all') {
    const innerClear = Math.max(0, Math.min(75, 90 - reach));
    return `radial-gradient(ellipse at center, rgba(${r}, ${g}, ${b}, ${softAlpha}) ${innerClear}%, rgba(${r}, ${g}, ${b}, ${alpha}) 100%)`;
  }

  const cssDirMap: Record<Exclude<HeroShadowDirection, 'all'>, string> = {
    left: 'to right',
    right: 'to left',
    bottom: 'to top',
    top: 'to bottom',
  };

  const midStop = Math.round(reach * 0.55);
  return `linear-gradient(${cssDirMap[direction]}, rgba(${r}, ${g}, ${b}, ${alpha}) 0%, rgba(${r}, ${g}, ${b}, ${midAlpha}) ${midStop}%, rgba(${r}, ${g}, ${b}, 0) ${reach}%)`;
}

export interface HeadlineSegment {
  text: string;
  emphasized: boolean;
}

/**
 * Parses `*EXEMPLO*` tokens while preserving exact user casing.
 */
export function parseHeadlineSegments(headline: string): HeadlineSegment[] {
  if (!headline) return [];
  const regex = /\*([^*]+)\*/g;
  const segments: HeadlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(headline)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: headline.slice(lastIndex, match.index),
        emphasized: false,
      });
    }
    segments.push({
      text: match[1],
      emphasized: true,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < headline.length) {
    segments.push({
      text: headline.slice(lastIndex),
      emphasized: false,
    });
  }

  return segments;
}
