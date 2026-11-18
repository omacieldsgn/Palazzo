import React, { useEffect, useState } from 'react';
import { ExternalLink, Save } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SITE_SETTINGS } from '../../data/demoData';
import { buildWhatsAppUrl, sanitizeWhatsAppNumber } from '../../lib/formatters';
import { siteSettingsSchema } from '../../lib/validations';
import { saveSiteSettings, subscribeSiteSettings } from '../../services/firestoreService';
import type { SiteSettings } from '../../types';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Configurações Gerais — Admin Palazzo Motos';
    const unsub = subscribeSiteSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = siteSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message || 'Verifique os campos.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveSiteSettings({
        ...settings,
        whatsappNumber: sanitizeWhatsAppNumber(settings.whatsappNumber),
      });
      showToast('Configurações salvas!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewWhatsApp = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Olá! Teste de atendimento Palazzo Motos.',
  );

  return (
    <AdminLayout
      title="Configurações Gerais"
      subtitle="WhatsApp centralizado, dados de contato da loja e SEO"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            Atendimento &amp; WhatsApp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Número do WhatsApp (com DDI + DDD) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="Ex: 5511999999999"
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
              />
              <a
                href={previewWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#B7F21B] hover:underline"
              >
                <span>Testar link gerado</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Telefone Fixo / Secundário
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Instagram
              </label>
              <input
                type="text"
                value={settings.instagram || ''}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="@palazzomotos"
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Endereço da Loja
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={settings.openingHours || ''}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
            SEO &amp; Metadados
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Título SEO da Página Inicial
            </label>
            <input
              type="text"
              value={settings.seoTitle || ''}
              onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
              className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Descrição SEO
            </label>
            <textarea
              rows={2}
              value={settings.seoDescription || ''}
              onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
              className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
