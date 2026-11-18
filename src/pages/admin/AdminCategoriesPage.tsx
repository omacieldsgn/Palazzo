import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { isOpportunityCategory } from '../../lib/catalog';
import { generateSlug } from '../../lib/formatters';
import { categorySchema } from '../../lib/validations';
import {
  deleteCategorySafe,
  ensureOpportunityCategoryExists,
  saveCategory,
  subscribeAdminCategories,
  subscribeAdminMotorcycles,
} from '../../services/firestoreService';
import type { Category, Motorcycle } from '../../types';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const ensuredOpportunityRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Categorias — Admin Palazzo Motos';
    const unsubCats = subscribeAdminCategories((list) => {
      setCategories(list);
      setLoading(false);
      if (!ensuredOpportunityRef.current && !list.some((c) => isOpportunityCategory(c))) {
        ensuredOpportunityRef.current = true;
        void ensureOpportunityCategoryExists();
      }
    });
    const unsubMotos = subscribeAdminMotorcycles(setMotorcycles);
    return () => {
      unsubCats();
      unsubMotos();
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(String(categories.length + 1));
    setActive(true);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setSortOrder(String(cat.sortOrder));
    setActive(cat.active);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSlug = slug.trim() || generateSlug(name);
    const parsed = categorySchema.safeParse({
      name,
      slug: targetSlug,
      description: description || undefined,
      sortOrder: Number(sortOrder || 0),
      active,
    });
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message || 'Dados inválidos.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveCategory(parsed.data, editingId || undefined);
      showToast(editingId ? 'Categoria atualizada!' : 'Categoria criada!', 'success');
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar categoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    const current = categories[index];
    const swap = categories[targetIdx];
    try {
      await saveCategory({ ...current, sortOrder: swap.sortOrder }, current.id);
      await saveCategory({ ...swap, sortOrder: current.sortOrder }, swap.id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao reordenar.', 'error');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await saveCategory({ ...cat, active: !cat.active }, cat.id);
      showToast(cat.active ? 'Categoria desativada.' : 'Categoria ativada.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategorySafe(deleteTarget.id, motorcycles);
      showToast('Categoria excluída.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir categoria.', 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout title="Categorias" subtitle="Gerencie segmentação e ordem do catálogo">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
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
              Nome *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Ex: Naked, Trail, Scooter"
              className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#858989] mb-1.5">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
            />
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
              <span className="text-sm text-[#F3F3F3]">Ativa</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Categoria'}</span>
          </button>
        </form>

        <div className="lg:col-span-8 bg-[#141515] border border-[#242727] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#242727] flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#F3F3F3]">
              Categorias Cadastradas ({categories.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-[#858989]">Carregando categorias...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#858989]">
              Nenhuma categoria cadastrada. Utilize o formulário ao lado para criar.
            </div>
          ) : (
            <div className="divide-y divide-[#242727]">
              {categories.map((cat, idx) => {
                const count = motorcycles.filter((m) => m.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#1C1F1F]/50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-[#F3F3F3]">
                          {cat.name}
                        </span>
                        <span className="text-xs font-mono-tabular text-[#858989]">
                          /{cat.slug} · {count} moto(s)
                        </span>
                        {isOpportunityCategory(cat) && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B7F21B]">
                            · Estratégica (Home + Topo do Estoque)
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[#858989] mt-1 truncate">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleMove(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`Subir ${cat.name}`}
                        className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F3F3F3] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleMove(idx, 1)}
                        disabled={idx === categories.length - 1}
                        aria-label={`Descer ${cat.name}`}
                        className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F3F3F3] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(cat)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                          cat.active
                            ? 'border-[#B7F21B]/40 bg-[#B7F21B]/10 text-[#B7F21B]'
                            : 'border-[#303434] bg-[#0D0F0F] text-[#858989]'
                        }`}
                      >
                        {cat.active ? 'Ativa' : 'Inativa'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label={`Editar ${cat.name}`}
                        className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#F3F3F3] hover:border-[#B7F21B]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        aria-label={`Excluir ${cat.name}`}
                        className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F15B5B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Excluir categoria "${deleteTarget?.name}"?`}
        description="Se houver motocicletas vinculadas a esta categoria, a exclusão será bloqueada para evitar perda de dados."
        confirmLabel="Excluir"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
