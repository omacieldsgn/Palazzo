import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Save, Upload } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SITE_SETTINGS } from '../../data/demoData';
import {
  saveSiteSettings,
  subscribeSiteSettings,
  uploadOptimizedImage,
} from '../../services/firestoreService';
import type { SiteSettings, StorefrontSectionKey } from '../../types';

const SECTION_LABELS: Record<StorefrontSectionKey, string> = {
  hero: 'Hero Principal',
  categories: 'Categorias',
  featured: 'Máquinas em Destaque',
  banners: 'Banners Promocionais',
  catalog: 'Catálogo (Nosso Estoque)',
  about: 'Sobre a Palazzo Motos',
  final_cta: 'CTA Final (WhatsApp)',
};

export function AdminSiteEditorPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
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
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      showToast('Vitrine atualizada com sucesso!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar vitrine.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Personalizar Vitrine"
      subtitle="Edite textos, imagens do Hero e a ordem das seções mantendo o Design System Palazzo"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Editor */}
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
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
