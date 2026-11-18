import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Crosshair, Maximize2, Minimize2, Save, Upload } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SITE_SETTINGS } from '../../data/demoData';
import { siteSettingsSchema } from '../../lib/validations';
import {
  saveSiteSettings,
  subscribeSiteSettings,
  uploadOptimizedImage,
} from '../../services/firestoreService';
import type { CoverFit, SiteSettings, StorefrontSectionKey } from '../../types';

const SECTION_LABELS: Record<StorefrontSectionKey, string> = {
  hero: 'Hero Principal',
  categories: 'Categorias',
  featured: 'Máquinas em Destaque',
  banners: 'Banners Promocionais',
  catalog: 'Catálogo (Nosso Estoque)',
  about: 'Sobre a Palazzo Motos',
  final_cta: 'CTA Final (WhatsApp)',
};

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
        heroOverlayShadow: settings.heroOverlayShadow !== false,
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

  return (
    <AdminLayout
      title="Personalizar Vitrine"
      subtitle="Edite textos, imagens do Hero e a ordem das seções mantendo o Design System Palazzo"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Editor */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            Hero Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Headline Principal *
              </label>
              <input
                type="text"
                required
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Subheadline
              </label>
              <input
                type="text"
                value={settings.heroSubheadline || ''}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
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

          {/* Banner Shadow Toggle */}
          <div className="bg-[#0D0F0F] border border-[#242727] rounded-xl p-4">
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
                  Aplica um degradê escuro sobre a imagem para destacar os títulos. Desmarque para exibir a imagem limpa sem sombra.
                </span>
              </div>
            </label>
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
                {/* Live Click-to-Focus Preview */}
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
                      className={`w-full h-full ${
                        activeFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                      } ${showShadowPreview ? 'opacity-70' : 'opacity-100'}`}
                      style={{ objectPosition: `${posX}% ${posY}%` }}
                    />

                    {showShadowPreview && (
                      <>
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#080909] via-[#080909]/85 to-[#080909]/35"
                          aria-hidden="true"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-[#080909]/40"
                          aria-hidden="true"
                        />
                      </>
                    )}

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
