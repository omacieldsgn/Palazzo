import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar por marca, modelo, cilindrada ou ano...',
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search
        className="w-4 h-4 text-ink-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar motocicletas no estoque"
        className="w-full h-11 pl-10 pr-9 rounded-lg bg-card border border-line text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-[#B7F21B] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-secondary hover:text-ink"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
