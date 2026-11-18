import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'Ocorreu um erro inesperado na aplicação.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-line rounded-xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-[#F15B5B] mx-auto mb-4" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold uppercase tracking-tight mb-2">
              Algo saiu do esperado
            </h1>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              Não foi possível carregar esta visualização. Tente recarregar a página.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B7F21B] text-[#101010] font-semibold text-sm hover:bg-[#D0FF36] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
