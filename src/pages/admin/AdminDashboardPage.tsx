import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike,
  CheckCircle2,
  Clock,
  Database,
  EyeOff,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { formatPriceBRL, getMotorcycleCoverImage, getStatusLabel } from '../../lib/formatters';
import {
  clearDemoMotorcycles,
  seedInitialDatabase,
  subscribeAdminMotorcycles,
  subscribeSiteSettings,
} from '../../services/firestoreService';
import type { Motorcycle } from '../../types';

export function AdminDashboardPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [settingsExists, setSettingsExists] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(false);
  const [confirmClearDemo, setConfirmClearDemo] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Dashboard — Admin Palazzo Motos';
    const unsubMotos = subscribeAdminMotorcycles((list) => {
      setMotorcycles(list);
      setLoading(false);
    });
    const unsubSettings = subscribeSiteSettings((s) => {
      setSettingsExists(s !== null);
    });
    return () => {
      unsubMotos();
      unsubSettings();
    };
  }, []);

  const stats = useMemo(() => {
    const total = motorcycles.length;
    const available = motorcycles.filter((m) => m.status === 'available').length;
    const sold = motorcycles.filter((m) => m.status === 'sold').length;
    const reserved = motorcycles.filter((m) => m.status === 'reserved').length;
    const hidden = motorcycles.filter((m) => m.status === 'hidden' || !m.published).length;
    const featured = motorcycles.filter((m) => m.featured && m.published).length;
    const demoCount = motorcycles.filter((m) => m.isDemo).length;
    return { total, available, sold, reserved, hidden, featured, demoCount };
  }, [motorcycles]);

  const recentMotos = useMemo(() => motorcycles.slice(0, 6), [motorcycles]);

  const handleSeed = async (includeDemo: boolean) => {
    setBusyAction(true);
    try {
      await seedInitialDatabase(includeDemo);
      showToast(
        includeDemo
          ? 'Vitrine inicializada com categorias e motos DEMO.'
          : 'Vitrine e categorias iniciais criadas com sucesso.',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Falha ao inicializar dados.', 'error');
    } finally {
      setBusyAction(false);
    }
  };

  const handleClearDemo = async () => {
    setBusyAction(true);
    try {
      const removed = await clearDemoMotorcycles(motorcycles);
      setConfirmClearDemo(false);
      showToast(`${removed} motocicleta(s) DEMO removida(s).`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao remover DEMO.', 'error');
    } finally {
      setBusyAction(false);
    }
  };

  const statCards = [
    { label: 'Total no Estoque', value: stats.total, icon: Bike, accent: false },
    { label: 'Disponíveis', value: stats.available, icon: CheckCircle2, accent: true },
    { label: 'Reservadas', value: stats.reserved, icon: Clock, accent: false },
    { label: 'Vendidas', value: stats.sold, icon: Tag, accent: false },
    { label: 'Ocultas / Rascunho', value: stats.hidden, icon: EyeOff, accent: false },
    { label: 'Em Destaque', value: stats.featured, icon: Sparkles, accent: true },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Resumo operacional do estoque e ações rápidas"
      actions={
        <Link
          to="/admin/motos/nova"
          className="h-10 px-4 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#D0FF36] transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Moto</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Setup / Demo Banner when uninitialized or holding DEMO vehicles */}
        {(!settingsExists || stats.demoCount > 0) && (
          <div className="bg-[#141515] border border-[#303434] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-[#B7F21B] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold uppercase text-[#F3F3F3]">
                  {!settingsExists
                    ? 'Configuração Inicial do Banco de Dados'
                    : `${stats.demoCount} Veículo(s) DEMO no Banco`}
                </h2>
                <p className="text-xs text-[#858989] mt-1">
                  {!settingsExists
                    ? 'Grave as configurações iniciais da vitrine e categorias no Firestore em um clique.'
                    : 'Você pode remover os veículos demonstrativos a qualquer momento antes de divulgar seu estoque real.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {!settingsExists && (
                <>
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => void handleSeed(false)}
                    className="h-9 px-3.5 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wider hover:bg-[#D0FF36] disabled:opacity-50"
                  >
                    Inicializar Vitrine Limpa
                  </button>
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => void handleSeed(true)}
                    className="h-9 px-3.5 rounded-lg border border-[#303434] bg-[#1C1F1F] text-xs font-semibold text-[#F3F3F3] hover:border-[#B7F21B] disabled:opacity-50"
                  >
                    Inicializar com Motos DEMO
                  </button>
                </>
              )}
              {stats.demoCount > 0 && (
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => setConfirmClearDemo(true)}
                  className="h-9 px-3.5 rounded-lg border border-[#F15B5B]/40 bg-[#F15B5B]/10 text-xs font-semibold text-[#F15B5B] hover:bg-[#F15B5B]/20 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Dados DEMO</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <section aria-label="Indicadores de estoque">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-[#141515] border border-[#242727] rounded-xl p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#858989]">{card.label}</span>
                    <Icon
                      className={`w-4 h-4 ${card.accent ? 'text-[#B7F21B]' : 'text-[#5D6262]'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    className={`font-display text-3xl font-extrabold font-mono-tabular mt-3 ${
                      card.accent ? 'text-[#B7F21B]' : 'text-[#F3F3F3]'
                    }`}
                  >
                    {loading ? '—' : card.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions & Recent Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-[#141515] border border-[#242727] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#242727] flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#F3F3F3]">
                Últimas Motos Atualizadas
              </h2>
              <Link
                to="/admin/motos"
                className="text-xs font-semibold text-[#B7F21B] hover:underline"
              >
                Gerenciar estoque
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-[#858989]">Carregando veículos...</div>
            ) : recentMotos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#858989]">
                  Nenhuma motocicleta cadastrada no banco de dados ainda.
                </p>
                <Link
                  to="/admin/motos/nova"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B7F21B] text-[#101010] text-xs font-bold uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar primeira moto</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#242727]">
                {recentMotos.map((moto) => (
                  <Link
                    key={moto.id}
                    to={`/admin/motos/${moto.id}`}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#1C1F1F] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#0D0F0F] border border-[#242727] shrink-0">
                        <ResilientImage
                          src={getMotorcycleCoverImage(moto)}
                          alt={moto.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F3F3F3] truncate">
                          {moto.name}
                        </p>
                        <p className="text-xs text-[#858989] truncate">
                          {moto.brand} · {moto.yearModel} ·{' '}
                          {moto.published ? 'Publicada' : 'Rascunho'}
                          {moto.isDemo ? ' · DEMO' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono-tabular text-sm font-bold text-[#F3F3F3]">
                        {formatPriceBRL(moto.price)}
                      </p>
                      <p
                        className={`text-[11px] font-medium ${
                          moto.status === 'available'
                            ? 'text-[#B7F21B]'
                            : moto.status === 'reserved'
                              ? 'text-[#F3B43C]'
                              : 'text-[#858989]'
                        }`}
                      >
                        {getStatusLabel(moto.status)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-4 bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#F3F3F3] mb-4">
              Ações Rápidas
            </h2>
            <Link
              to="/admin/motos/nova"
              className="block p-3.5 rounded-lg bg-[#1C1F1F] border border-[#303434] hover:border-[#B7F21B] transition-colors"
            >
              <span className="block text-sm font-semibold text-[#F3F3F3]">
                Cadastrar Nova Moto
              </span>
              <span className="block text-xs text-[#858989] mt-0.5">
                Modo rápido ou ficha completa com fotos
              </span>
            </Link>
            <Link
              to="/admin/categorias"
              className="block p-3.5 rounded-lg bg-[#1C1F1F] border border-[#303434] hover:border-[#B7F21B] transition-colors"
            >
              <span className="block text-sm font-semibold text-[#F3F3F3]">
                Gerenciar Categorias
              </span>
              <span className="block text-xs text-[#858989] mt-0.5">
                Organize categorias e ordem na vitrine
              </span>
            </Link>
            <Link
              to="/admin/banners"
              className="block p-3.5 rounded-lg bg-[#1C1F1F] border border-[#303434] hover:border-[#B7F21B] transition-colors"
            >
              <span className="block text-sm font-semibold text-[#F3F3F3]">
                Banners e Campanhas
              </span>
              <span className="block text-xs text-[#858989] mt-0.5">
                Crie ou ative destaques promocionais
              </span>
            </Link>
            <Link
              to="/admin/site"
              className="block p-3.5 rounded-lg bg-[#1C1F1F] border border-[#303434] hover:border-[#B7F21B] transition-colors"
            >
              <span className="block text-sm font-semibold text-[#F3F3F3]">
                Personalizar Vitrine
              </span>
              <span className="block text-xs text-[#858989] mt-0.5">
                Edite Hero, textos e visibilidade das seções
              </span>
            </Link>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearDemo}
        title="Remover todas as motos DEMO?"
        description="Todas as motocicletas demonstrativas marcadas como DEMO serão excluídas permanentemente do banco de dados."
        confirmLabel="Excluir motos DEMO"
        loading={busyAction}
        onConfirm={() => void handleClearDemo()}
        onCancel={() => setConfirmClearDemo(false)}
      />
    </AdminLayout>
  );
}
