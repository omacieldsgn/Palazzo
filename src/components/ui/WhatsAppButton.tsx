import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../../lib/formatters';

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: 'primary' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WhatsAppButton({
  phone,
  message,
  label = 'Falar no WhatsApp',
  variant = 'primary',
  size = 'md',
  className = '',
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phone, message);

  const variantClasses =
    variant === 'primary'
      ? 'bg-[#B7F21B] text-[#101010] hover:bg-[#D0FF36] active:bg-[#8AB90B]'
      : variant === 'outline'
        ? 'border border-[#B7F21B] text-[#B7F21B] bg-transparent hover:bg-[#B7F21B]/10'
        : 'border border-[#303434] bg-[#1C1F1F] text-[#F3F3F3] hover:bg-[#252727] hover:border-[#505555]';

  const sizeClasses =
    size === 'sm'
      ? 'px-3.5 py-2 text-xs'
      : size === 'lg'
        ? 'px-6 py-3.5 text-sm sm:text-base'
        : 'px-5 py-2.5 text-sm';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7F21B] ${variantClasses} ${sizeClasses} ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
