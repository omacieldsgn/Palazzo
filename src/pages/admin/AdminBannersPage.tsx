import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { bannerSchema } from '../../lib/validations';
import {
  deleteBanner,
  saveBanner,
  subscribeAdminBanners,
  uploadOptimizedImage,
} from '../../services/firestoreService';
import type { Banner } from '../../types';

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageDesktop, setImageDesktop] = useState('');
  const [imageMobile, setImageMobile] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Banners e Campanhas — Admin Palazzo Motos';
    const unsub = subscribeAdminBanners((list) => {
      setBanners(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageDesktop('');
    setImageMobile('');
    setCtaText('');
    setCtaUrl('');
    setSortOrder(String(banners.length + 1));
    setActive(true);
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageDesktop(banner.imageDesktop || '');
    setImageMobile(banner.imageMobile || '');
    setCtaText(banner.ctaText || '');
    setCtaUrl(banner.ctaUrl || '');
    setSortOrder(String(banner.sortOrder));
    setActive(banner.active);
  };

  const handleUpload = async (file: File, target: 'desktop' | 'mobile') => {
    setUploading(true);
    try {
      const url = await uploadOptimizedImage(file, 'site-assets');
      if (target === 'desktop') setImageDesktop(url);
      else setImageMobile(url);
      showToast('Imagem do banner otimizada e enviada!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro no upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = bannerSchema.safeParse({
      title,
      subtitle: subtitle || undefined,
      imageDesktop: imageDesktop || undefined,
      imageMobile: imageMobile || undefined,
      ctaText: ctaText || undefined,
      ctaUrl: ctaUrl || undefined,
      sortOrder: Number(sortOrder || 0),
      active,
    });
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message || 'Preencha os dados corretamente.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveBanner(parsed.data, editingId || undefined);
      showToast(editingId ? 'Banner atualizado!' : 'Banner criado!', 'success');
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar banner.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const current = banners[index];
    const swap = banners[targetIdx];
    await saveBanner({ ...current, sortOrder: swap.sortOrder }, current.id);
    await saveBanner({ ...swap, sortOrder: current.sortOrder }, swap.id);
  };

  return (
    <AdminLayout title="Banners e Campanhas" subtitle="Gerencie destaques promocionais da vitrine">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
              {editingId ? 'Editar Banner' : 'Novo Banner'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[#858989] hover:text-[#F3F3F3] inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Título *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Condições Especiais de Financiamento"
              className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Subtítulo
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Imagem Desktop
              </label>
              <label className="h-11 px-3 rounded-lg border border-[#303434] bg-[#0D0F0F] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#B7F21B]" />
                <span>{uploading ? 'Enviando...' : imageDesktop ? 'Trocar desktop' : 'Enviar desktop'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f, 'desktop');
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Imagem Mobile
              </label>
              <label className="h-11 px-3 rounded-lg border border-[#303434] bg-[#0D0F0F] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#B7F21B]" />
                <span>{uploading ? 'Enviando...' : imageMobile ? 'Trocar mobile' : 'Enviar mobile'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f, 'mobile');
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Texto do CTA
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Ex: Ver Ofertas"
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Link do CTA
              </label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/motos"
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-medium text-[#858989] mb-1.5">
                Ordem
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
              />
            </div>
            <label className="inline-flex items-center gap-2 pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#B7F21B]"
              />
              <span className="text-sm text-[#F3F3F3]">Banner ativo</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full h-11 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'Salvando...' : editingId ? 'Salvar Banner' : 'Criar Banner'}</span>
          </button>
        </form>

        <div className="lg:col-span-7 bg-[#141515] border border-[#242727] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#242727]">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#F3F3F3]">
              Banners Cadastrados ({banners.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-[#858989]">Carregando banners...</div>
          ) : banners.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#858989]">
              Nenhum banner promocional cadastrado. Crie um banner ao lado quando houver campanhas ativas.
            </div>
          ) : (
            <div className="divide-y divide-[#242727]">
              {banners.map((banner, idx) => (
                <div
                  key={banner.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-[#0D0F0F] border border-[#242727] shrink-0">
                      <ResilientImage
                        src={banner.imageDesktop || banner.imageMobile}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#F3F3F3] truncate">{banner.title}</p>
                      {banner.subtitle && (
                        <p className="text-xs text-[#858989] truncate">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleMove(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Subir banner"
                      className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMove(idx, 1)}
                      disabled={idx === banners.length - 1}
                      aria-label="Descer banner"
                      className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveBanner({ ...banner, active: !banner.active }, banner.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                        banner.active
                          ? 'border-[#B7F21B]/40 bg-[#B7F21B]/10 text-[#B7F21B]'
                          : 'border-[#303434] bg-[#0D0F0F] text-[#858989]'
                      }`}
                    >
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(banner)}
                      aria-label="Editar banner"
                      className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#F3F3F3]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(banner)}
                      aria-label="Excluir banner"
                      className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F15B5B]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Excluir banner "${deleteTarget?.title}"?`}
        description="Esta ação removerá o banner permanentemente da vitrine."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deleteTarget) {
            void deleteBanner(deleteTarget.id).then(() => {
              showToast('Banner excluído.', 'success');
              setDeleteTarget(null);
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
