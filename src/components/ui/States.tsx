import { AlertCircle, Bike, RotateCcw } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';

export function LoadingState({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-label="Carregando motocicletas"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-card border border-line-subtle rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-card-elevated" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 bg-card-hover rounded" />
            <div className="h-5 w-3/4 bg-card-hover rounded" />
            <div className="h-3 w-1/2 bg-card-elevated rounded" />
            <div className="pt-3 border-t border-line-subtle flex items-center justify-between">
              <div className="h-6 w-28 bg-card-hover rounded" />
              <div className="h-9 w-24 bg-card-elevated rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  whatsappNumber?: string;
  onResetFilters?: () => void;
}

export function EmptyState({
  title = 'AINDA NÃO TEMOS MOTOS POR AQUI.',
  description = 'Novas máquinas estão chegando. Volte em breve ou fale diretamente com nossa equipe para encomendas e próximas entradas.',
  whatsappNumber,
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="bg-card border border-line-subtle rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="w-12 h-12 rounded-xl bg-card-elevated border border-line flex items-center justify-center mx-auto mb-5">
        <Bike className="w-6 h-6 text-accent-ink" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-ink-secondary mt-3 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-lg border border-line bg-card-elevated text-sm font-semibold text-ink hover:bg-card-hover transition-colors whitespace-nowrap"
          >
            Limpar filtros
          </button>
        )}
        {whatsappNumber && (
          <WhatsAppButton
            phone={whatsappNumber}
            message="Olá! Gostaria de saber sobre próximas motocicletas e novidades no estoque da Palazzo Motos."
            label="FALAR COM A PALAZZO"
          />
        )}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Não foi possível conectar ao catálogo no momento.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="bg-card border border-[#F15B5B]/40 rounded-2xl p-8 text-center max-w-lg mx-auto">
      <AlertCircle className="w-8 h-8 text-[#D93838] dark:text-[#F15B5B] mx-auto mb-3" aria-hidden="true" />
      <h3 className="font-display text-lg font-bold text-ink uppercase">
        Falha ao carregar dados
      </h3>
      <p className="text-sm text-ink-secondary mt-2 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-semibold hover:bg-[#D0FF36] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
