import { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';

interface ResilientImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
  loading = 'lazy',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#141515] via-[#1C1F1F] to-[#0D0F0F] flex flex-col items-center justify-center p-4 text-center select-none"
        role="img"
        aria-label={alt}
      >
        <Bike className="w-10 h-10 text-[#5D6262] mb-2" aria-hidden="true" />
        {fallbackLabel && (
          <span className="text-xs font-medium text-[#858989] line-clamp-1 max-w-[200px]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
