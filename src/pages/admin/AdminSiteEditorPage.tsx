import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Crosshair,
  Maximize2,
  Minimize2,
  Moon,
  Save,
  Sun,
  Upload,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SITE_SETTINGS } from '../../data/demoData';
import {
  buildHeroShadowGradient,
  getContrastInk,
  isLightColor,
  parseHeadlineSegments,
} from '../../lib/heroStyles';
import { siteSettingsSchema } from '../../lib/validations';
import {
  saveSiteSettings,
  subscribeSiteSettings,
  uploadOptimizedImage,
} from '../../services/firestoreService';
import type {
  CoverFit,
  HeroShadowDirection,
  SiteSettings,
  StorefrontSectionKey,
  ThemeMode,
} from '../../types';

const SECTION_LABELS: Record<StorefrontSectionKey, string> = {
  hero: 'Hero Principal',
  categories: 'Categorias',
  featured: 'Máquinas em Destaque',
  banners: 'Banners Promocionais',
  catalog: 'Catálogo (Nosso Estoque)',
  about: 'Sobre a Palazzo Motos',
  final_cta: 'CTA Final (WhatsApp)',
};

const SHADOW_DIRECTION_OPTIONS: Array<{ value: HeroShadowDirection; label: string }> = [
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
  { value: 'top', label: 'Cima' },
  { value: 'bottom', label: 'Baixo' },
  { value: 'all', label: 'Vinheta' },
];

const SHADOW_COLOR_PRESETS = ['#080909', '#000000', '#141515', '#0F172A', '#FFFFFF'];
const HIGHLIGHT_BG_PRESETS = ['#B7F21B', '#FFFFFF', '#101212', '#F3B43C', '#EF4444'];

function parsePositionCoords(position?: string): [number, number] {
  const match = (position || '50% 50%').match(/^(\d{1,3})%\s+(\d{1,3})%$/);
  if (!match) return [50, 50];
  return [
    Math.min(100, Math.max(0, Number(match[1]))),
    Math.min(100, Math.max(0, Number(match[2]))),
  ];
}

export function AdminSiteEditorPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [framingTarget, setFramingTarget] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Personalizar Vitrine — Admin Palazzo Motos';
    const unsub = subscribeSiteSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (file: File, field: 'heroImageDesktop' | 'heroImageMobile') => {
    setUploading(true);
    try {
      const url = await uploadOptimizedImage(file, 'site-assets');
      setSettings((prev) => ({ ...prev, [field]: url }));
      showToast('Imagem do Hero enviada com sucesso!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro no upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const toggleSection = (key: StorefrontSectionKey) => {
    setSettings((prev) => ({
      ...prev,
      activeSections: {
        ...prev.activeSections,
        [key]: !prev.activeSections[key],
      },
    }));
  };

  const moveSection = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= settings.sectionsOrder.length) return;
    const copy = [...settings.sectionsOrder];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setSettings((prev) => ({ ...prev, sectionsOrder: copy }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = siteSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message || 'Verifique os campos da vitrine.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveSiteSettings({
        ...settings,
        defaultTheme: settings.defaultTheme === 'light' ? 'light' : 'dark',
        heroOverlayShadow: settings.heroOverlayShadow !== false,
        heroShadowColor: settings.heroShadowColor || '#080909',
        heroShadowOpacity:
          typeof settings.heroShadowOpacity === 'number' ? settings.heroShadowOpacity : 85,
        heroShadowDirection: settings.heroShadowDirection || 'left',
        heroShadowReach:
          typeof settings.heroShadowReach === 'number' ? settings.heroShadowReach : 70,
        heroHighlightBold: settings.heroHighlightBold !== false,
        heroHighlightItalic: settings.heroHighlightItalic === true,
        heroHighlightBgEnabled: settings.heroHighlightBgEnabled === true,
        heroHighlightBgColor: settings.heroHighlightBgColor || '#B7F21B',
        heroImageFit: settings.heroImageFit || 'cover',
        heroImagePosition: settings.heroImagePosition || '50% 50%',
        heroMobileImageFit: settings.heroMobileImageFit || settings.heroImageFit || 'cover',
        heroMobileImagePosition:
          settings.heroMobileImagePosition || settings.heroImagePosition || '50% 50%',
      });
      showToast('Vitrine atualizada com sucesso!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar vitrine.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeFit: CoverFit =
    framingTarget === 'desktop'
      ? settings.heroImageFit || 'cover'
      : settings.heroMobileImageFit || settings.heroImageFit || 'cover';

  const activePosStr =
    framingTarget === 'desktop'
      ? settings.heroImagePosition || '50% 50%'
      : settings.heroMobileImagePosition || settings.heroImagePosition || '50% 50%';

  const [posX, posY] = parsePositionCoords(activePosStr);

  const previewImg =
    framingTarget === 'desktop'
      ? settings.heroImageDesktop
      : settings.heroImageMobile || settings.heroImageDesktop;

  const setActiveFit = (fit: CoverFit) => {
    setSettings((prev) => ({
      ...prev,
      ...(framingTarget === 'desktop'
        ? {
            heroImageFit: fit,
            ...(fit === 'contain' ? { heroImagePosition: '50% 50%' } : {}),
          }
        : {
            heroMobileImageFit: fit,
            ...(fit === 'contain' ? { heroMobileImagePosition: '50% 50%' } : {}),
          }),
    }));
  };

  const setActiveCoords = (x: number, y: number) => {
    const nextPos = `${Math.round(x)}% ${Math.round(y)}%`;
    setSettings((prev) => ({
      ...prev,
      ...(framingTarget === 'desktop'
        ? { heroImagePosition: nextPos }
        : { heroMobileImagePosition: nextPos }),
    }));
  };

  const showShadowPreview = settings.heroOverlayShadow !== false;
  const shadowColor = settings.heroShadowColor || '#080909';
  const shadowOpacity =
    typeof settings.heroShadowOpacity === 'number' ? settings.heroShadowOpacity : 85;
  const shadowDirection: HeroShadowDirection = settings.heroShadowDirection || 'left';
  const shadowReach =
    typeof settings.heroShadowReach === 'number' ? settings.heroShadowReach : 70;

  const shadowGradientPreview = buildHeroShadowGradient({
    enabled: showShadowPreview,
    color: shadowColor,
    opacity: shadowOpacity,
    direction: shadowDirection,
    reach: shadowReach,
  });

  const highlightBold = settings.heroHighlightBold !== false;
  const highlightItalic = settings.heroHighlightItalic === true;
  const highlightBgEnabled = settings.heroHighlightBgEnabled === true;
  const highlightBgColor = settings.heroHighlightBgColor || '#B7F21B';
  const highlightInk = getContrastInk(highlightBgColor);
  const headlineSegments = parseHeadlineSegments(settings.heroHeadline);
  const hasEmphasized = headlineSegments.some((s) => s.emphasized);
  const previewDarkInk = showShadowPreview && Boolean(shadowGradientPreview) && isLightColor(shadowColor);
  const defaultTheme: ThemeMode = settings.defaultTheme === 'light' ? 'light' : 'dark';

  const renderStyledHeadline = () =>
    headlineSegments.map((seg, idx) => {
      if (!seg.emphasized) return <span key={idx}>{seg.text}</span>;
      return (
        <span
          key={idx}
          className={`${highlightBold ? 'font-extrabold' : 'font-medium'} ${
            highlightItalic ? 'italic' : ''
          } ${
            highlightBgEnabled
              ? 'inline-block px-2 py-0.5 rounded-md box-decoration-clone align-baseline'
              : ''
          }`}
          style={
            highlightBgEnabled
              ? { backgroundColor: highlightBgColor, color: highlightInk }
              : undefined
          }
        >
          {seg.text}
        </span>
      );
    });

  return (
    <AdminLayout
      title="Personalizar Vitrine"
      subtitle="Edite tema, textos, sombra e enquadramento do Hero mantendo o Design System Palazzo"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Default Storefront Theme */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
                Aparência da Vitrine Pública (Modo Claro / Escuro)
              </h2>
              <p className="text-xs text-[#858989] mt-1">
                Defina qual tema os visitantes veem por padrão ao acessar o site. O visitante também pode alternar manualmente pelo botão no cabeçalho.
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="Tema padrão da vitrine"
              className="inline-flex rounded-lg border border-[#303434] bg-[#0D0F0F] p-1 shrink-0"
            >
              <button
                type="button"
                role="radio"
                aria-checked={defaultTheme === 'dark'}
                onClick={() => setSettings((prev) => ({ ...prev, defaultTheme: 'dark' }))}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                  defaultTheme === 'dark'
                    ? 'bg-[#B7F21B] text-[#101010]'
                    : 'text-[#858989] hover:text-[#F3F3F3]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Modo Escuro</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={defaultTheme === 'light'}
                onClick={() => setSettings((prev) => ({ ...prev, defaultTheme: 'light' }))}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                  defaultTheme === 'light'
                    ? 'bg-[#B7F21B] text-[#101010]'
                    : 'text-[#858989] hover:text-[#F3F3F3]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Modo Claro</span>
              </button>
            </div>
          </div>
        </section>

        {/* Hero Editor */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            Hero Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="hero-headline-input"
                className="block text-xs font-medium text-[#858989] mb-1.5"
              >
                Headline Principal *
              </label>
              <input
                id="hero-headline-input"
                type="text"
                required
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
              <p className="text-[11px] text-[#858989] mt-1.5 leading-relaxed">
                Respeita exatamente maiúsculas e minúsculas digitadas. Envolva palavras em{' '}
                <code className="px-1.5 py-0.5 rounded bg-[#0D0F0F] border border-[#303434] text-[#B7F21B] font-mono-tabular">
                  *EXEMPLO*
                </code>{' '}
                para aplicar os estilos de ênfase abaixo.
              </p>
            </div>

            <div>
              <label
                htmlFor="hero-subheadline-input"
                className="block text-xs font-medium text-[#858989] mb-1.5"
              >
                Subheadline
              </label>
              <input
                id="hero-subheadline-input"
                type="text"
                value={settings.heroSubheadline || ''}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>

          {/* Headline Emphasis Style Controls for *EXEMPLO* */}
          <div className="bg-[#0D0F0F] border border-[#242727] rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3F3F3]">
                  Ênfase para palavras entre *asteriscos*
                </h3>
                <p className="text-[11px] text-[#858989] mt-0.5">
                  Personalize como cada trecho marcado como *EXEMPLO* aparece na capa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#242727] bg-[#141515] cursor-pointer hover:border-[#303434]">
                <input
                  type="checkbox"
                  checked={highlightBold}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroHighlightBold: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#B7F21B] shrink-0"
                />
                <span className="text-xs font-semibold text-[#F3F3F3]">Negrito</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#242727] bg-[#141515] cursor-pointer hover:border-[#303434]">
                <input
                  type="checkbox"
                  checked={highlightItalic}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroHighlightItalic: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#B7F21B] shrink-0"
                />
                <span className="text-xs font-semibold italic text-[#F3F3F3]">Itálico</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#242727] bg-[#141515] cursor-pointer hover:border-[#303434]">
                <input
                  type="checkbox"
                  checked={highlightBgEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      heroHighlightBgEnabled: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-[#B7F21B] shrink-0"
                />
                <span className="text-xs font-semibold text-[#F3F3F3]">
                  Plano de fundo na palavra
                </span>
              </label>
            </div>

            {highlightBgEnabled && (
              <div className="pt-3 border-t border-[#242727] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="highlight-bg-picker"
                    className="text-xs font-medium text-[#858989]"
                  >
                    Cor do plano de fundo:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="highlight-bg-picker"
                      type="color"
                      value={highlightBgColor}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          heroHighlightBgColor: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-9 h-9 rounded-lg border border-[#303434] bg-[#141515] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      aria-label="Código hexadecimal da cor do plano de fundo"
                      value={highlightBgColor}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          heroHighlightBgColor: e.target.value,
                        }))
                      }
                      className="w-24 h-9 px-2.5 rounded-lg bg-[#141515] border border-[#303434] text-xs font-mono-tabular text-[#F3F3F3]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#858989] mr-1">Sugestões:</span>
                  {HIGHLIGHT_BG_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, heroHighlightBgColor: preset }))
                      }
                      aria-label={`Aplicar cor ${preset} ao fundo da palavra`}
                      className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                        highlightBgColor.toUpperCase() === preset
                          ? 'border-[#B7F21B] ring-1 ring-[#B7F21B]'
                          : 'border-[#303434]'
                      }`}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#242727]">
              <span className="block text-[11px] uppercase tracking-wider text-[#858989] mb-1.5">
                Prévia da Headline
              </span>
              <div className="p-3 rounded-lg bg-[#080909] border border-[#242727]">
                <p
                  className={`font-display text-lg sm:text-xl text-[#F3F3F3] leading-snug ${
                    hasEmphasized ? 'font-medium' : 'font-extrabold'
                  }`}
                >
                  {renderStyledHeadline()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Imagem Desktop do Hero
              </label>
              <label className="h-11 px-3 rounded-lg border border-[#303434] bg-[#0D0F0F] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#B7F21B]" />
                <span>{uploading ? 'Enviando...' : 'Atualizar imagem desktop'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleImageUpload(f, 'heroImageDesktop');
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Imagem Mobile do Hero
              </label>
              <label className="h-11 px-3 rounded-lg border border-[#303434] bg-[#0D0F0F] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#B7F21B]" />
                <span>{uploading ? 'Enviando...' : 'Atualizar imagem mobile'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleImageUpload(f, 'heroImageMobile');
                  }}
                />
              </label>
            </div>
          </div>

          {/* Complete Banner Shadow Controls */}
          <div className="bg-[#0D0F0F] border border-[#242727] rounded-xl p-4 space-y-4">
            <label
              htmlFor="hero-overlay-shadow"
              className="flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                id="hero-overlay-shadow"
                checked={showShadowPreview}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, heroOverlayShadow: e.target.checked }))
                }
                className="w-4 h-4 mt-0.5 accent-[#B7F21B] shrink-0"
              />
              <div>
                <span className="block text-sm font-semibold text-[#F3F3F3]">
                  Ativar sombra sobre o banner
                </span>
                <span className="block text-xs text-[#858989] mt-0.5">
                  Controle a direção, cor, opacidade e o alcance do degradê sobre a capa. Desmarque para exibir a imagem totalmente limpa.
                </span>
              </div>
            </label>

            {showShadowPreview && (
              <div className="pt-4 border-t border-[#242727] space-y-4">
                {/* Direction Selector */}
                <div>
                  <span className="block text-xs font-medium text-[#858989] mb-2">
                    Origem / Direção da Sombra
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SHADOW_DIRECTION_OPTIONS.map((opt) => {
                      const active = shadowDirection === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, heroShadowDirection: opt.value }))
                          }
                          className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                              : 'bg-[#141515] border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B]/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Picker + Opacity + Center Reach */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <label
                      htmlFor="hero-shadow-color-picker"
                      className="block text-xs font-medium text-[#858989] mb-2"
                    >
                      Cor da Sombra
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="hero-shadow-color-picker"
                        type="color"
                        value={shadowColor}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            heroShadowColor: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-10 h-10 rounded-lg border border-[#303434] bg-[#141515] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        aria-label="Código hexadecimal da cor da sombra"
                        value={shadowColor}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, heroShadowColor: e.target.value }))
                        }
                        className="w-24 h-10 px-2.5 rounded-lg bg-[#141515] border border-[#303434] text-xs font-mono-tabular text-[#F3F3F3]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {SHADOW_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, heroShadowColor: preset }))
                          }
                          aria-label={`Aplicar cor ${preset} à sombra`}
                          className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                            shadowColor.toUpperCase() === preset
                              ? 'border-[#B7F21B] ring-1 ring-[#B7F21B]'
                              : 'border-[#303434]'
                          }`}
                          style={{ backgroundColor: preset }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#858989] mb-2">
                      <label htmlFor="hero-shadow-opacity">Opacidade da Sombra</label>
                      <span className="font-mono-tabular text-[#F3F3F3]">{shadowOpacity}%</span>
                    </div>
                    <input
                      id="hero-shadow-opacity"
                      type="range"
                      min={0}
                      max={100}
                      value={shadowOpacity}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          heroShadowOpacity: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#B7F21B]"
                    />
                    <p className="text-[11px] text-[#5D6262] mt-1">
                      0% transparente · 100% sólido na origem
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#858989] mb-2">
                      <label htmlFor="hero-shadow-reach">Avanço para o Centro</label>
                      <span className="font-mono-tabular text-[#F3F3F3]">{shadowReach}%</span>
                    </div>
                    <input
                      id="hero-shadow-reach"
                      type="range"
                      min={10}
                      max={100}
                      value={shadowReach}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          heroShadowReach: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#B7F21B]"
                    />
                    <p className="text-[11px] text-[#5D6262] mt-1">
                      Define até onde a sombra avança sobre a capa
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complete Banner Framing & Centralization */}
          <div className="pt-4 border-t border-[#242727] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F3F3F3]">
                  Enquadramento e Centralização do Banner Hero
                </h3>
                <p className="text-xs text-[#858989]">
                  Clique na prévia ou ajuste os controles para posicionar o foco da imagem no Desktop e no Mobile.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="tablist"
                  aria-label="Versão do banner para enquadramento"
                  className="inline-flex rounded-lg border border-[#303434] bg-[#0D0F0F] p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={framingTarget === 'desktop'}
                    onClick={() => setFramingTarget('desktop')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      framingTarget === 'desktop'
                        ? 'bg-[#B7F21B] text-[#101010]'
                        : 'text-[#858989] hover:text-[#F3F3F3]'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={framingTarget === 'mobile'}
                    onClick={() => setFramingTarget('mobile')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      framingTarget === 'mobile'
                        ? 'bg-[#B7F21B] text-[#101010]'
                        : 'text-[#858989] hover:text-[#F3F3F3]'
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                {framingTarget === 'mobile' && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        heroMobileImageFit: prev.heroImageFit || 'cover',
                        heroMobileImagePosition: prev.heroImagePosition || '50% 50%',
                      }))
                    }
                    className="h-9 px-3 rounded-lg border border-[#303434] bg-[#0D0F0F] text-xs font-medium text-[#F3F3F3] hover:border-[#B7F21B] transition-colors"
                  >
                    Espelhar Desktop
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCoords(50, 50)}
                  className="h-9 px-3.5 rounded-lg border border-[#B7F21B]/50 bg-[#B7F21B]/10 text-[#B7F21B] hover:bg-[#B7F21B] hover:text-[#101010] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Centralizar (50% / 50%)</span>
                </button>
              </div>
            </div>

            {previewImg ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Live Click-to-Focus + Shadow + Headline Preview */}
                <div className="md:col-span-6">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Prévia do banner. Clique para reposicionar o foco da imagem."
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const xPct = Math.round(
                        Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
                      );
                      const yPct = Math.round(
                        Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
                      );
                      setActiveCoords(xPct, yPct);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveCoords(50, 50);
                      }
                    }}
                    className={`relative rounded-xl overflow-hidden bg-[#080909] border border-[#303434] cursor-crosshair select-none ${
                      framingTarget === 'desktop'
                        ? 'aspect-[16/9] w-full'
                        : 'aspect-[3/4] max-w-[230px] mx-auto w-full'
                    }`}
                  >
                    <ResilientImage
                      src={previewImg}
                      alt={`Prévia do banner Hero (${framingTarget})`}
                      className={`w-full h-full opacity-100 ${
                        activeFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                      }`}
                      style={{ objectPosition: `${posX}% ${posY}%` }}
                    />

                    {shadowGradientPreview && (
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: shadowGradientPreview }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Mini Live Headline Overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 p-4 flex flex-col justify-center"
                      aria-hidden="true"
                    >
                      <p
                        className={`font-display leading-tight max-w-[85%] ${
                          framingTarget === 'desktop' ? 'text-sm sm:text-base' : 'text-xs'
                        } ${hasEmphasized ? 'font-medium' : 'font-extrabold'} ${
                          previewDarkInk ? 'text-[#101212]' : 'text-[#F3F3F3]'
                        }`}
                      >
                        {renderStyledHeadline()}
                      </p>
                    </div>

                    {/* Center Alignment Guides */}
                    <div
                      className="pointer-events-none absolute inset-0 border border-dashed border-white/15"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px bg-[#B7F21B]/25"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute top-1/2 left-0 right-0 h-px bg-[#B7F21B]/25"
                      aria-hidden="true"
                    />
                    {activeFit === 'cover' && (
                      <span
                        className="pointer-events-none absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#B7F21B] bg-[#080909]/80 shadow"
                        style={{ left: `${posX}%`, top: `${posY}%` }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {framingTarget === 'mobile' && !settings.heroImageMobile && (
                    <p className="text-[11px] text-[#858989] mt-2 text-center">
                      Usando a imagem Desktop como base no mobile; envie uma imagem mobile acima se desejar artes diferentes.
                    </p>
                  )}
                </div>

                {/* Framing Controls */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <span className="block text-xs font-medium text-[#858989] mb-2">
                      Modo de Exibição no Banner ({framingTarget === 'desktop' ? 'Desktop' : 'Mobile'})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveFit('cover')}
                        className={`h-10 px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                          activeFit === 'cover'
                            ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                            : 'bg-[#0D0F0F] border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B]/60'
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Preencher quadro (Cover)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFit('contain')}
                        className={`h-10 px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                          activeFit === 'contain'
                            ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                            : 'bg-[#0D0F0F] border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B]/60'
                        }`}
                      >
                        <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Centralizar inteira sem cortes</span>
                      </button>
                    </div>
                  </div>

                  {activeFit === 'cover' && (
                    <>
                      <div>
                        <span className="block text-xs font-medium text-[#858989] mb-2">
                          Atalhos de Posicionamento
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Centro', x: 50, y: 50 },
                            { label: 'Topo', x: 50, y: 20 },
                            { label: 'Base', x: 50, y: 80 },
                            { label: 'Esquerda', x: 20, y: 50 },
                            { label: 'Direita', x: 80, y: 50 },
                          ].map((preset) => {
                            const active = posX === preset.x && posY === preset.y;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setActiveCoords(preset.x, preset.y)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                  active
                                    ? 'border-[#B7F21B] bg-[#B7F21B]/15 text-[#B7F21B]'
                                    : 'border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F3F3F3]'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#858989] mb-1">
                            <span>Posição Horizontal (X)</span>
                            <span className="font-mono-tabular text-[#F3F3F3]">{posX}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={posX}
                            onChange={(e) => setActiveCoords(Number(e.target.value), posY)}
                            className="w-full accent-[#B7F21B]"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#858989] mb-1">
                            <span>Posição Vertical (Y)</span>
                            <span className="font-mono-tabular text-[#F3F3F3]">{posY}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={posY}
                            onChange={(e) => setActiveCoords(posX, Number(e.target.value))}
                            className="w-full accent-[#B7F21B]"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#303434] bg-[#0D0F0F] p-6 text-center text-xs text-[#858989]">
                Envie uma imagem Desktop ou Mobile acima para pré-visualizar e ajustar o enquadramento do banner.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                CTA Primário
              </label>
              <input
                type="text"
                value={settings.heroPrimaryCtaText || ''}
                onChange={(e) =>
                  setSettings({ ...settings, heroPrimaryCtaText: e.target.value })
                }
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Link CTA Primário
              </label>
              <input
                type="text"
                value={settings.heroPrimaryCtaUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, heroPrimaryCtaUrl: e.target.value })
                }
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                CTA Secundário
              </label>
              <input
                type="text"
                value={settings.heroSecondaryCtaText || ''}
                onChange={(e) =>
                  setSettings({ ...settings, heroSecondaryCtaText: e.target.value })
                }
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Link Secundário (&quot;whatsapp&quot; ou URL)
              </label>
              <input
                type="text"
                value={settings.heroSecondaryCtaUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, heroSecondaryCtaUrl: e.target.value })
                }
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>
        </section>

        {/* Institutional Text */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            Texto Institucional &amp; CTA Final
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Título Sobre a Palazzo
              </label>
              <input
                type="text"
                value={settings.aboutTitle || ''}
                onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Título CTA Final
              </label>
              <input
                type="text"
                value={settings.finalCtaTitle || ''}
                onChange={(e) => setSettings({ ...settings, finalCtaTitle: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Texto Sobre a Palazzo
            </label>
            <textarea
              rows={3}
              value={settings.aboutText || ''}
              onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
              className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>
        </section>

        {/* Section Visibility & Order */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            Ordem e Exibição das Seções da Página Inicial
          </h2>
          <div className="divide-y divide-[#242727] border border-[#242727] rounded-lg overflow-hidden">
            {settings.sectionsOrder.map((key, idx) => (
              <div
                key={key}
                className="px-4 py-3 bg-[#0D0F0F] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`sec-${key}`}
                    checked={Boolean(settings.activeSections[key])}
                    onChange={() => toggleSection(key)}
                    className="w-4 h-4 accent-[#B7F21B]"
                  />
                  <label htmlFor={`sec-${key}`} className="text-sm font-medium text-[#F3F3F3]">
                    {SECTION_LABELS[key] || key}
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    aria-label={`Mover ${SECTION_LABELS[key]} para cima`}
                    className="p-1.5 rounded border border-[#303434] bg-[#141515] text-[#858989] disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === settings.sectionsOrder.length - 1}
                    onClick={() => moveSection(idx, 1)}
                    aria-label={`Mover ${SECTION_LABELS[key]} para baixo`}
                    className="p-1.5 rounded border border-[#303434] bg-[#141515] text-[#858989] disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="h-11 px-6 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Vitrine'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
