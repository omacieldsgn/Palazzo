import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import { uploadOptimizedImage, deleteUploadedImage } from '../../services/firestoreService';
import { generateSafeId } from '../../lib/formatters';
import type { MotorcycleImage } from '../../types';
import { ResilientImage } from '../ui/ResilientImage';
import { useToast } from '../../context/ToastContext';

interface ImageUploaderProps {
  vehicleFolderId: string;
  images: MotorcycleImage[];
  onChange: (next: MotorcycleImage[]) => void;
}

export function ImageUploader({ vehicleFolderId, images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { showToast } = useToast();

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    if (images.length + files.length > 15) {
      showToast('Limite máximo de 15 fotos por motocicleta.', 'error');
      return;
    }

    setUploadingCount(files.length);
    const nextImages = [...images];

    for (const file of files) {
      try {
        const url = await uploadOptimizedImage(file, `motorcycles/${vehicleFolderId}`);
        nextImages.push({
          id: generateSafeId('img'),
          storagePath: url,
          altText: '',
          sortOrder: nextImages.length,
          isCover: nextImages.length === 0,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao enviar imagem.';
        showToast(msg, 'error');
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    }

    onChange(
      nextImages.map((img, i) => ({
        ...img,
        sortOrder: i,
        isCover: nextImages.some((x) => x.isCover) ? img.isCover : i === 0,
      })),
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    void processFiles(e.dataTransfer.files);
  };

  const setCover = (id: string) => {
    onChange(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    onChange(copy.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const removeImage = async (img: MotorcycleImage) => {
    const filtered = images.filter((item) => item.id !== img.id);
    const normalized = filtered.map((item, idx) => ({
      ...item,
      sortOrder: idx,
      isCover: filtered.some((x) => x.isCover) ? item.isCover : idx === 0,
    }));
    onChange(normalized);
    await deleteUploadedImage(img.storagePath);
  };

  const updateAlt = (id: string, altText: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, altText } : img)));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? 'border-[#B7F21B] bg-[#B7F21B]/5'
            : 'border-[#303434] bg-[#0D0F0F] hover:border-[#505555]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            void processFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <ImagePlus className="w-8 h-8 text-[#B7F21B] mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm font-semibold text-[#F3F3F3]">
          Arraste e solte fotos aqui ou selecione do computador
        </p>
        <p className="text-xs text-[#858989] mt-1">
          Conversão automática para WebP otimizado · Máximo 15 fotos por moto
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingCount > 0}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1F1F] border border-[#303434] text-xs font-semibold uppercase tracking-wider text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] transition-colors disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {uploadingCount > 0
              ? `Otimizando e enviando (${uploadingCount})...`
              : 'Selecionar imagens'}
          </span>
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`bg-[#0D0F0F] border rounded-xl overflow-hidden flex flex-col ${
                img.isCover ? 'border-[#B7F21B]' : 'border-[#242727]'
              }`}
            >
              <div className="relative aspect-[4/3] bg-[#141515]">
                <ResilientImage
                  src={img.storagePath}
                  alt={img.altText || `Foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {img.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#B7F21B] text-[#101010] text-[10px] font-bold uppercase tracking-wider">
                    Capa
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2.5">
                <input
                  type="text"
                  value={img.altText || ''}
                  onChange={(e) => updateAlt(img.id, e.target.value)}
                  placeholder="Descrição / Alt text (SEO)"
                  className="w-full h-9 px-2.5 rounded bg-[#141515] border border-[#242727] text-xs text-[#F3F3F3] placeholder:text-[#5D6262] focus:outline-none focus:border-[#B7F21B]"
                />

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Mover imagem para esquerda"
                      className="p-1.5 rounded bg-[#141515] border border-[#242727] text-[#858989] hover:text-[#F3F3F3] disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      aria-label="Mover imagem para direita"
                      className="p-1.5 rounded bg-[#141515] border border-[#242727] text-[#858989] hover:text-[#F3F3F3] disabled:opacity-30"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(img.id)}
                        className="px-2 py-1 rounded bg-[#141515] border border-[#242727] text-[11px] font-semibold text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] inline-flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Capa</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeImage(img)}
                      aria-label="Remover imagem"
                      className="p-1.5 rounded bg-[#141515] border border-[#242727] text-[#858989] hover:text-[#F15B5B] hover:border-[#F15B5B]/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
