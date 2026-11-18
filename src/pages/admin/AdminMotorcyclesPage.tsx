import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { paginateItems, sortMotorcycles } from '../../lib/catalog';
import { formatPriceBRL, getMotorcycleCoverImage, getStatusLabel } from '../../lib/formatters';
import {
  deleteMotorcycle,
  duplicateMotorcycle,
  subscribeAdminMotorcycles,
  updateMotorcycleQuickFields,
} from '../../services/firestoreService';
import type { Motorcycle, MotorcycleStatus, SortOption } from '../../types';

export function AdminMotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MotorcycleStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Motorcycle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Estoque de Motos — Admin Palazzo Motos';
    const unsub = subscribeAdminMotorcycles((list) => {
      setMotorcycles(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = motorcycles.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return `${m.name} ${m.brand} ${m.model} ${m.yearModel}`.toLowerCase().includes(q);
    });
    return sortMotorcycles(list, sortBy);
  }, [motorcycles, search, statusFilter, sortBy]);

  const paginated = useMemo(() => paginateItems(filtered, page, 12), [filtered, page]);

  const handleTogglePublished = async (moto: Motorcycle) => {
    try {
      await updateMotorcycleQuickFields(moto.id, { published: !moto.published });
      showToast(
        moto.published ? 'Motocicleta ocultada da vitrine.' : 'Motocicleta publicada na vitrine.',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar publicação.', 'error');
    }
  };

  const handleToggleFeatured = async (moto: Motorcycle) => {
    try {
      await updateMotorcycleQuickFields(moto.id, { featured: !moto.featured });
      showToast(
        moto.featured ? 'Removida dos destaques.' : 'Marcada como destaque!',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar destaque.', 'error');
    }
  };

  const handleToggleSold = async (moto: Motorcycle) => {
    const nextStatus: MotorcycleStatus = moto.status === 'sold' ? 'available' : 'sold';
    try {
      await updateMotorcycleQuickFields(moto.id, { status: nextStatus });
      showToast(
        nextStatus === 'sold' ? 'Marcada como vendida.' : 'Motocicleta reativada no estoque.',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar status.', 'error');
    }
  };

  const handleDuplicate = async (moto: Motorcycle) => {
    try {
      const newId = await duplicateMotorcycle(moto);
      showToast('Motocicleta duplicada como rascunho!', 'success');
      navigate(`/admin/motos/${newId}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao duplicar moto.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMotorcycle(deleteTarget);
      showToast('Motocicleta excluída permanentemente.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir moto.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Estoque de Motos"
      subtitle={`${filtered.length} motocicleta(s) encontrada(s)`}
      actions={
        <Link
          to="/admin/motos/nova"
          className="h-10 px-4 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#D0FF36] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Moto</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-[#141515] border border-[#242727] rounded-xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#858989] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, marca, modelo ou ano..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] placeholder:text-[#5D6262] focus:outline-none focus:border-[#B7F21B]"
            />
          </div>

          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as MotorcycleStatus | 'all');
              setPage(1);
            }}
            className="h-10 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
          >
            <option value="all">Todos os status</option>
            <option value="available">Disponível</option>
            <option value="reserved">Reservada</option>
            <option value="sold">Vendida</option>
            <option value="hidden">Oculta</option>
          </select>

          <select
            aria-label="Ordenar estoque"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="year_desc">Ano mais novo</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#141515] border border-[#242727] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-[#858989]">Carregando estoque...</div>
          ) : paginated.items.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm text-[#858989]">Nenhuma motocicleta encontrada.</p>
              <Link
                to="/admin/motos/nova"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar motocicleta</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#242727] text-[11px] uppercase tracking-wider text-[#858989] bg-[#0D0F0F]">
                    <th className="py-3.5 px-4 font-semibold">Motocicleta</th>
                    <th className="py-3.5 px-4 font-semibold">Ano</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Preço</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Vitrine</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Destaque</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242727] text-sm">
                  {paginated.items.map((moto) => (
                    <tr key={moto.id} className="hover:bg-[#1C1F1F]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#0D0F0F] border border-[#242727] shrink-0">
                            <ResilientImage
                              src={getMotorcycleCoverImage(moto)}
                              alt={moto.name}
                              className={`w-full h-full ${
                                moto.coverFit === 'contain' ? 'object-contain p-0.5' : 'object-cover'
                              }`}
                              style={{ objectPosition: moto.coverPosition || '50% 50%' }}
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/motos/${moto.id}`}
                              className="font-semibold text-[#F3F3F3] hover:text-[#B7F21B] truncate block max-w-[240px]"
                            >
                              {moto.name}
                            </Link>
                            <span className="text-xs text-[#858989]">
                              {moto.brand} · {moto.categoryName || 'Sem categoria'}
                              {moto.isDemo ? ' · DEMO' : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-[#858989]">
                        {moto.yearModel}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular font-semibold text-[#F3F3F3] text-right whitespace-nowrap">
                        {formatPriceBRL(moto.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-xs font-semibold ${
                            moto.status === 'available'
                              ? 'text-[#B7F21B]'
                              : moto.status === 'reserved'
                                ? 'text-[#F3B43C]'
                                : 'text-[#F15B5B]'
                          }`}
                        >
                          {getStatusLabel(moto.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => void handleTogglePublished(moto)}
                          aria-label={
                            moto.published
                              ? `Ocultar ${moto.name}`
                              : `Publicar ${moto.name}`
                          }
                          title={moto.published ? 'Publicada (clique para ocultar)' : 'Rascunho (clique para publicar)'}
                          className={`p-2 rounded-lg border transition-colors ${
                            moto.published
                              ? 'border-[#B7F21B]/40 bg-[#B7F21B]/10 text-[#B7F21B]'
                              : 'border-[#303434] bg-[#0D0F0F] text-[#5D6262]'
                          }`}
                        >
                          {moto.published ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => void handleToggleFeatured(moto)}
                          aria-label={
                            moto.featured
                              ? `Remover destaque de ${moto.name}`
                              : `Destacar ${moto.name}`
                          }
                          className={`p-2 rounded-lg border transition-colors ${
                            moto.featured
                              ? 'border-[#B7F21B]/40 bg-[#B7F21B]/10 text-[#B7F21B]'
                              : 'border-[#303434] bg-[#0D0F0F] text-[#5D6262]'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/motos/${moto.id}`}
                            aria-label={`Editar ${moto.name}`}
                            title="Editar"
                            className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B]"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleToggleSold(moto)}
                            aria-label={
                              moto.status === 'sold'
                                ? `Reativar ${moto.name}`
                                : `Marcar ${moto.name} como vendida`
                            }
                            title={moto.status === 'sold' ? 'Reativar moto' : 'Marcar como vendida'}
                            className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#B7F21B] hover:border-[#B7F21B]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDuplicate(moto)}
                            aria-label={`Duplicar ${moto.name}`}
                            title="Duplicar"
                            className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F3F3F3]"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(moto)}
                            aria-label={`Excluir ${moto.name}`}
                            title="Excluir"
                            className="p-2 rounded-lg border border-[#303434] bg-[#0D0F0F] text-[#858989] hover:text-[#F15B5B] hover:border-[#F15B5B]/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {paginated.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-[#858989]">
            <button
              type="button"
              disabled={paginated.currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3.5 py-2 rounded-lg border border-[#303434] bg-[#141515] text-[#F3F3F3] disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="font-mono-tabular">
              Página {paginated.currentPage} de {paginated.totalPages}
            </span>
            <button
              type="button"
              disabled={paginated.currentPage >= paginated.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-2 rounded-lg border border-[#303434] bg-[#141515] text-[#F3F3F3] disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Excluir ${deleteTarget?.name || 'motocicleta'}?`}
        description="Esta ação é permanente e removerá a motocicleta e suas referências do catálogo. Caso queira apenas removê-la da vitrine, utilize a opção Ocultar."
        confirmLabel="Excluir permanentemente"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
