import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { MotorcycleImage } from '../../types';
import { ResilientImage } from '../ui/ResilientImage';

interface MotorcycleGalleryProps {
  images: MotorcycleImage[];
  motorcycleName: string;
}

export function MotorcycleGallery({ images, motorcycleName }: MotorcycleGalleryProps) {
  const ordered = [...images].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [motorcycleName]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % Math.max(ordered.length, 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + Math.max(ordered.length, 1)) % Math.max(ordered.length, 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, ordered.length]);

  const current = ordered[activeIndex];
  const hasMultiple = ordered.length > 1;

  const goPrev = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev - 1 + ordered.length) % ordered.length);
  };

  const goNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev + 1) % ordered.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = touchStartX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-3">
      {/* Main Viewport */}
      <div
        className="relative aspect-[4/3] bg-[#0D0F0F] border border-[#242727] rounded-xl overflow-hidden group select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ResilientImage
          src={current?.storagePath}
          alt={current?.altText || motorcycleName}
          fallbackLabel={motorcycleName}
          loading="eager"
          className={`w-full h-full object-cover object-center transition-transform duration-300 ${
            zoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        />

        {/* Click overlay for zoom/lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ampliar imagem da motocicleta"
          className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-[#080909]/80 border border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] inline-flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#080909]/80 border border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] inline-flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#080909]/80 border border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] inline-flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#080909]/80 border border-[#303434] text-xs font-mono-tabular text-[#F3F3F3] backdrop-blur-sm">
              {activeIndex + 1} / {ordered.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {ordered.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {ordered.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver foto ${idx + 1} de ${motorcycleName}`}
              aria-current={idx === activeIndex}
              className={`relative w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border shrink-0 transition-all ${
                idx === activeIndex
                  ? 'border-[#B7F21B] ring-1 ring-[#B7F21B]'
                  : 'border-[#242727] opacity-70 hover:opacity-100'
              }`}
            >
              <ResilientImage
                src={img.storagePath}
                alt={img.altText || `${motorcycleName} miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria ampliada — ${motorcycleName}`}
        >
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[#242727]">
            <span className="font-display text-sm font-semibold text-[#F3F3F3] truncate">
              {motorcycleName} · {activeIndex + 1} / {Math.max(ordered.length, 1)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? 'Reduzir zoom' : 'Ampliar zoom'}
                className="w-10 h-10 rounded-lg border border-[#303434] bg-[#141515] text-[#F3F3F3] inline-flex items-center justify-center hover:border-[#B7F21B]"
              >
                {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setZoomed(false);
                }}
                aria-label="Fechar galeria"
                className="w-10 h-10 rounded-lg border border-[#303434] bg-[#141515] text-[#F3F3F3] inline-flex items-center justify-center hover:border-[#B7F21B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`max-w-5xl max-h-full transition-transform duration-200 ${
                zoomed ? 'scale-150' : 'scale-100'
              }`}
            >
              <ResilientImage
                src={current?.storagePath}
                alt={current?.altText || motorcycleName}
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Foto anterior"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#141515]/90 border border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B] inline-flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Próxima foto"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#141515]/90 border border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B] inline-flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
