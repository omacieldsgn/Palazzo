export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const MAX_INPUT_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function optimizeImageToWebP(
  file: File,
  maxDimension = 1400,
  quality = 0.85,
): Promise<OptimizedImageResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error('Formato não suportado. Utilize JPG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Arquivo excede o limite de 12 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Falha ao processar a imagem selecionada.'));
      element.src = imageUrl;
    });

    let targetWidth = img.naturalWidth || 1200;
    let targetHeight = img.naturalHeight || 900;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth >= targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D indisponível para otimização de imagem.');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    let dataUrl = canvas.toDataURL('image/webp', quality);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const sizeBytes = Math.round((base64Length * 3) / 4);

    return {
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      sizeBytes,
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
