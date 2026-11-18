import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Flame,
  Loader2,
  Maximize2,
  Minimize2,
  Save,
  Zap,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ResilientImage } from '../../components/ui/ResilientImage';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_CATEGORIES } from '../../data/demoData';
import { isOpportunityCategory } from '../../lib/catalog';
import { generateSafeId, generateSlug } from '../../lib/formatters';
import { motorcycleFormSchema, quickMotorcycleSchema } from '../../lib/validations';
import {
  ensureOpportunityCategoryExists,
  getMotorcycleById,
  saveMotorcycle,
  subscribeAdminCategories,
} from '../../services/firestoreService';
import type {
  Category,
  CoverFit,
  MotorcycleCondition,
  MotorcycleImage,
  MotorcycleStatus,
} from '../../types';

export function AdminMotorcycleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(isEditing);
  const [quickMode, setQuickMode] = useState(!isEditing);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [vehicleFolderId] = useState(() => id || generateSafeId('moto'));

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [yearManufacture, setYearManufacture] = useState<string>(String(new Date().getFullYear()));
  const [yearModel, setYearModel] = useState<string>(String(new Date().getFullYear()));
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState<MotorcycleCondition>('used');

  const [engineCc, setEngineCc] = useState('');
  const [mileage, setMileage] = useState('0');
  const [fuel, setFuel] = useState('Gasolina');
  const [transmission, setTransmission] = useState('6 marchas');
  const [power, setPower] = useState('');
  const [cylinders, setCylinders] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [description, setDescription] = useState('');

  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [downPaymentInfo, setDownPaymentInfo] = useState('');
  const [installmentInfo, setInstallmentInfo] = useState('');
  const [promoText, setPromoText] = useState('');

  const [images, setImages] = useState<MotorcycleImage[]>([]);
  const [coverFit, setCoverFit] = useState<CoverFit>('cover');
  const [coverX, setCoverX] = useState<number>(50);
  const [coverY, setCoverY] = useState<number>(50);
  const ensuredOpportunityRef = useRef(false);

  const [status, setStatus] = useState<MotorcycleStatus>('available');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState('');
  const [sortOrder, setSortOrder] = useState('10');

  useEffect(() => {
    document.title = isEditing
      ? 'Editar Motocicleta — Admin Palazzo Motos'
      : 'Nova Motocicleta — Admin Palazzo Motos';

    const unsubCats = subscribeAdminCategories((list) => {
      if (list.length > 0) {
        setCategories(list);
        if (!isEditing) {
          setCategoryId((prev) => (list.some((c) => c.id === prev) ? prev : list[0].id));
        }
        if (!ensuredOpportunityRef.current && !list.some((c) => isOpportunityCategory(c))) {
          ensuredOpportunityRef.current = true;
          void ensureOpportunityCategoryExists();
        }
      } else if (!ensuredOpportunityRef.current) {
        ensuredOpportunityRef.current = true;
        void ensureOpportunityCategoryExists();
      }
    });

    if (id) {
      void getMotorcycleById(id)
        .then((moto) => {
          if (!moto) {
            showToast('Motocicleta não encontrada.', 'error');
            navigate('/admin/motos');
            return;
          }
          setName(moto.name);
          setSlug(moto.slug);
          setSlugTouched(true);
          setBrand(moto.brand);
          setModel(moto.model);
          setVersion(moto.version || '');
          setCategoryId(moto.categoryId);
          setYearManufacture(moto.yearManufacture ? String(moto.yearManufacture) : '');
          setYearModel(String(moto.yearModel));
          setColor(moto.color || '');
          setCondition(moto.condition || 'used');
          setEngineCc(moto.engineCc !== undefined ? String(moto.engineCc) : '');
          setMileage(moto.mileage !== undefined ? String(moto.mileage) : '');
          setFuel(moto.fuel || '');
          setTransmission(moto.transmission || '');
          setPower(moto.power || '');
          setCylinders(moto.cylinders ? String(moto.cylinders) : '');
          setFeaturesText(moto.features ? moto.features.join('\n') : '');
          setDescription(moto.description || '');
          setPrice(String(moto.price));
          setOldPrice(moto.oldPrice ? String(moto.oldPrice) : '');
          setPaymentInfo(moto.paymentInfo || '');
          setDownPaymentInfo(moto.downPaymentInfo || '');
          setInstallmentInfo(moto.installmentInfo || '');
          setPromoText(moto.promoText || '');
          setImages(moto.images || []);
          setCoverFit(moto.coverFit || 'cover');
          if (moto.coverPosition) {
            const match = moto.coverPosition.match(/^(\d{1,3})%\s+(\d{1,3})%$/);
            if (match) {
              setCoverX(Math.min(100, Math.max(0, Number(match[1]))));
              setCoverY(Math.min(100, Math.max(0, Number(match[2]))));
            }
          }
          setStatus(moto.status);
          setPublished(moto.published);
          setFeatured(moto.featured);
          setBadge(moto.badge || '');
          setSortOrder(String(moto.sortOrder));
          setQuickMode(false);
        })
        .catch(() => {
          showToast('Erro ao carregar motocicleta.', 'error');
        })
        .finally(() => setLoading(false));
    }

    return () => unsubCats();
  }, [id, isEditing, navigate, showToast]);

  // Auto-compose name & slug when creating
  useEffect(() => {
    if (isEditing) return;
    const composed = [brand.trim(), model.trim(), version.trim()].filter(Boolean).join(' ');
    if (composed && !name) {
      // leave user manual name editable
    }
    if (!slugTouched) {
      const slugSource = [name || composed, yearModel].filter(Boolean).join(' ');
      if (slugSource) setSlug(generateSlug(slugSource));
    }
  }, [brand, model, version, name, yearModel, slugTouched, isEditing]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );
  const selectedCategoryName = selectedCategory?.name || '';
  const isOpportunitySelected = isOpportunityCategory(selectedCategory);

  const coverPosition = `${Math.round(coverX)}% ${Math.round(coverY)}%`;
  const activeCoverPreview = useMemo(
    () => images.find((img) => img.isCover)?.storagePath || images[0]?.storagePath || '',
    [images],
  );

  const handleSave = async (overridePublished?: boolean) => {
    setErrorMsg(null);
    const targetPublished =
      overridePublished !== undefined ? overridePublished : published;

    const effectiveName =
      name.trim() || [brand.trim(), model.trim(), version.trim()].filter(Boolean).join(' ');
    const effectiveSlug =
      slug.trim() || generateSlug(`${effectiveName} ${yearModel}`);

    if (quickMode && !isEditing) {
      const quickCheck = quickMotorcycleSchema.safeParse({
        brand,
        model,
        yearModel: Number(yearModel),
        price: Number(price),
        categoryId,
        publishImmediately: targetPublished,
      });
      if (!quickCheck.success) {
        const msg = quickCheck.error.issues[0]?.message || 'Verifique os campos obrigatórios.';
        setErrorMsg(msg);
        setSaveState('error');
        return;
      }
    }

    const parsedFeatures = featuresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 20);

    const payload = {
      name: effectiveName,
      slug: effectiveSlug,
      brand: brand.trim(),
      model: model.trim(),
      version: version.trim() || undefined,
      categoryId,
      categoryName: selectedCategoryName,
      yearManufacture: yearManufacture ? Number(yearManufacture) : undefined,
      yearModel: Number(yearModel),
      engineCc: engineCc ? Number(engineCc) : undefined,
      mileage: mileage !== '' ? Number(mileage) : undefined,
      color: color.trim() || undefined,
      fuel: fuel.trim() || undefined,
      transmission: transmission.trim() || undefined,
      power: power.trim() || undefined,
      cylinders: cylinders ? Number(cylinders) : undefined,
      features: parsedFeatures.length > 0 ? parsedFeatures : undefined,
      description: description.trim() || undefined,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      paymentInfo: paymentInfo.trim() || undefined,
      downPaymentInfo: downPaymentInfo.trim() || undefined,
      installmentInfo: installmentInfo.trim() || undefined,
      promoText: promoText.trim() || undefined,
      condition,
      status,
      featured,
      published: targetPublished,
      badge: badge.trim() || undefined,
      sortOrder: Number(sortOrder || 0),
      isDemo: false,
      coverPosition,
      coverFit,
      images,
    };

    const validation = motorcycleFormSchema.safeParse(payload);
    if (!validation.success) {
      const firstErr = validation.error.issues[0];
      const msg = `${firstErr?.path.join('.') || 'Campo'}: ${firstErr?.message || 'Valor inválido'}`;
      setErrorMsg(msg);
      setSaveState('error');
      return;
    }

    setSaveState('saving');
    try {
      const savedId = await saveMotorcycle(payload, id);
      setSaveState('saved');
      showToast(
        targetPublished ? 'Motocicleta salva e publicada!' : 'Rascunho salvo com sucesso!',
        'success',
      );
      if (!isEditing) {
        navigate(`/admin/motos/${savedId}`, { replace: true });
      }
    } catch (err) {
      setSaveState('error');
      const msg = err instanceof Error ? err.message : 'Erro ao salvar motocicleta.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Carregando motocicleta...">
        <div className="p-8 text-sm text-[#858989]">Carregando dados...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? `Editar: ${name}` : 'Cadastrar Motocicleta'}
      subtitle={published ? 'Status: Publicada na vitrine' : 'Status: Rascunho'}
      actions={
        <div className="flex items-center gap-2">
          {saveState === 'saving' && (
            <span className="text-xs text-[#858989] inline-flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Salvando...
            </span>
          )}
          {saveState === 'saved' && (
            <span className="text-xs text-[#B7F21B] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Salvo
            </span>
          )}
          <Link
            to="/admin/motos"
            className="h-10 px-3.5 rounded-lg border border-[#303434] bg-[#141515] text-xs font-semibold text-[#F3F3F3] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {!isEditing && (
          <div className="bg-[#141515] border border-[#242727] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#B7F21B] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#F3F3F3]">
                  Modo de Cadastro
                </p>
                <p className="text-xs text-[#858989]">
                  Use o Cadastro Rápido para subir uma moto em segundos ou Completo para toda a ficha técnica.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#0D0F0F] border border-[#242727] rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setQuickMode(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  quickMode
                    ? 'bg-[#B7F21B] text-[#101010]'
                    : 'text-[#858989] hover:text-[#F3F3F3]'
                }`}
              >
                Cadastro Rápido
              </button>
              <button
                type="button"
                onClick={() => setQuickMode(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  !quickMode
                    ? 'bg-[#B7F21B] text-[#101010]'
                    : 'text-[#858989] hover:text-[#F3F3F3]'
                }`}
              >
                Cadastro Completo
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#F15B5B]/10 border border-[#F15B5B]/40 text-sm text-[#F15B5B]"
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="space-y-6"
        >
          {/* GRUPO 1 — IDENTIFICAÇÃO */}
          <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
              Grupo 1 — Identificação
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#858989] mb-1.5">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Ducati, Yamaha, BMW"
                  className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#858989] mb-1.5">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: MT-09, Panigale V4"
                  className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#858989] mb-1.5">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {isOpportunitySelected && (
                  <p className="mt-1.5 text-[11px] font-medium text-[#B7F21B] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      Categoria estratégica: exibida na Home e no topo do Estoque com etiqueta de escassez.
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#858989] mb-1.5">
                  Ano Modelo *
                </label>
                <input
                  type="number"
                  required
                  min={1950}
                  max={2100}
                  value={yearModel}
                  onChange={(e) => setYearModel(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular focus:outline-none focus:border-[#B7F21B]"
                />
              </div>

              {!quickMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#858989] mb-1.5">
                      Ano Fabricação
                    </label>
                    <input
                      type="number"
                      min={1950}
                      max={2100}
                      value={yearManufacture}
                      onChange={(e) => setYearManufacture(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular focus:outline-none focus:border-[#B7F21B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#858989] mb-1.5">
                      Versão
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="Ex: SP, RS, Triple Black"
                      className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#858989] mb-1.5">
                      Cor
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ex: Grafite Fosco"
                      className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                    />
                  </div>
                </>
              )}
            </div>

            {!quickMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Nome de Exibição (Título)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Preenchido automaticamente se vazio"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    URL Amigável (Slug)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular focus:outline-none focus:border-[#B7F21B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Condição
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as MotorcycleCondition)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  >
                    <option value="used">Seminova</option>
                    <option value="new">0 KM</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* GRUPO 2 — ESPECIFICAÇÕES */}
          {!quickMode && (
            <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
                Grupo 2 — Especificações Técnicas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Cilindrada (cc)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={engineCc}
                    onChange={(e) => setEngineCc(e.target.value)}
                    placeholder="Ex: 765"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Quilometragem (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Combustível
                  </label>
                  <input
                    type="text"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Transmissão
                  </label>
                  <input
                    type="text"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Potência
                  </label>
                  <input
                    type="text"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    placeholder="Ex: 130 cv @ 12.000 rpm"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Número de Cilindros
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={cylinders}
                    onChange={(e) => setCylinders(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Descrição Comercial
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Histórico, estado de conservação, diferenciais..."
                    className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Características / Equipamentos (1 por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder={'Freios ABS\nQuickshifter\nPainel TFT'}
                    className="w-full p-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] focus:outline-none focus:border-[#B7F21B]"
                  />
                </div>
              </div>
            </section>
          )}

          {/* GRUPO 3 — COMERCIAL */}
          <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
              {quickMode ? 'Preço' : 'Grupo 3 — Informações Comerciais'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#858989] mb-1.5">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 72990"
                  className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular focus:outline-none focus:border-[#B7F21B]"
                />
              </div>

              {!quickMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#858989] mb-1.5">
                      Preço Anterior (opcional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="Ex: 79900"
                      className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#858989] mb-1.5">
                      Texto Promocional
                    </label>
                    <input
                      type="text"
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      placeholder="Ex: Condição especial de showroom"
                      className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                    />
                  </div>
                </>
              )}
            </div>

            {!quickMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Entrada
                  </label>
                  <input
                    type="text"
                    value={downPaymentInfo}
                    onChange={(e) => setDownPaymentInfo(e.target.value)}
                    placeholder="Ex: Entrada a partir de 25%"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Parcelamento
                  </label>
                  <input
                    type="text"
                    value={installmentInfo}
                    onChange={(e) => setInstallmentInfo(e.target.value)}
                    placeholder="Ex: Até 48x no financiamento"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Observações de Pagamento
                  </label>
                  <input
                    type="text"
                    value={paymentInfo}
                    onChange={(e) => setPaymentInfo(e.target.value)}
                    placeholder="Ex: Aceitamos seminova na troca"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
              </div>
            )}
          </section>

          {/* GRUPO 4 — IMAGENS */}
          <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
              {quickMode ? 'Fotos da Motocicleta' : 'Grupo 4 — Galeria de Imagens'}
            </h2>
            <ImageUploader
              vehicleFolderId={vehicleFolderId}
              images={images}
              onChange={setImages}
            />

            {activeCoverPreview && (
              <div className="pt-5 border-t border-[#242727] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F3F3F3]">
                      Enquadramento e Centralização da Foto de Capa
                    </h3>
                    <p className="text-xs text-[#858989]">
                      Ajuste como a foto principal aparece nos cards da vitrine. Clique na imagem ou use os controles para centralizar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverX(50);
                      setCoverY(50);
                    }}
                    className="h-9 px-3.5 rounded-lg border border-[#B7F21B]/50 bg-[#B7F21B]/10 text-[#B7F21B] hover:bg-[#B7F21B] hover:text-[#101010] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
                  >
                    <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Centralizar Capa (50% / 50%)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Live 4:3 Storefront Crop Preview */}
                  <div className="md:col-span-5">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Prévia da capa. Clique para reposicionar o foco da imagem."
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const xPct = Math.round(
                          Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
                        );
                        const yPct = Math.round(
                          Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
                        );
                        setCoverX(xPct);
                        setCoverY(yPct);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCoverX(50);
                          setCoverY(50);
                        }
                      }}
                      className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#0D0F0F] border border-[#303434] cursor-crosshair select-none"
                    >
                      <ResilientImage
                        src={activeCoverPreview}
                        alt="Prévia do enquadramento da foto de capa"
                        className={`w-full h-full ${
                          coverFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                        }`}
                        style={{ objectPosition: coverPosition }}
                      />
                      {/* Subtle center alignment guides */}
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
                      {coverFit === 'cover' && (
                        <span
                          className="pointer-events-none absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#B7F21B] bg-[#080909]/80 shadow"
                          style={{ left: `${coverX}%`, top: `${coverY}%` }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  {/* Framing Controls */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-[#858989] mb-2">
                        Modo de Exibição no Card
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCoverFit('cover')}
                          className={`h-10 px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                            coverFit === 'cover'
                              ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                              : 'bg-[#0D0F0F] border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B]/60'
                          }`}
                        >
                          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Preencher quadro (Cover)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverFit('contain');
                            setCoverX(50);
                            setCoverY(50);
                          }}
                          className={`h-10 px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                            coverFit === 'contain'
                              ? 'bg-[#B7F21B] border-[#B7F21B] text-[#101010]'
                              : 'bg-[#0D0F0F] border-[#303434] text-[#F3F3F3] hover:border-[#B7F21B]/60'
                          }`}
                        >
                          <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Centralizar inteira sem cortes</span>
                        </button>
                      </div>
                    </div>

                    {coverFit === 'cover' && (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Centro', x: 50, y: 50 },
                            { label: 'Topo', x: 50, y: 20 },
                            { label: 'Base', x: 50, y: 80 },
                            { label: 'Esquerda', x: 20, y: 50 },
                            { label: 'Direita', x: 80, y: 50 },
                          ].map((preset) => {
                            const active = coverX === preset.x && coverY === preset.y;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setCoverX(preset.x);
                                  setCoverY(preset.y);
                                }}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#858989] mb-1">
                              <span>Posição Horizontal (X)</span>
                              <span className="font-mono-tabular text-[#F3F3F3]">{coverX}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={coverX}
                              onChange={(e) => setCoverX(Number(e.target.value))}
                              className="w-full accent-[#B7F21B]"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#858989] mb-1">
                              <span>Posição Vertical (Y)</span>
                              <span className="font-mono-tabular text-[#F3F3F3]">{coverY}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={coverY}
                              onChange={(e) => setCoverY(Number(e.target.value))}
                              className="w-full accent-[#B7F21B]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* GRUPO 5 — PUBLICAÇÃO */}
          {!quickMode && (
            <section className="bg-[#141515] border border-[#242727] rounded-xl p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#B7F21B]">
                Grupo 5 — Publicação e Visibilidade
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Status do Veículo
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MotorcycleStatus)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  >
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservada</option>
                    <option value="sold">Vendida</option>
                    <option value="hidden">Oculta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Badge (opcional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: 0 KM, ÚNICO DONO"
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#858989] mb-1.5">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] font-mono-tabular"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#B7F21B]"
                  />
                  <span className="text-sm font-medium text-[#F3F3F3]">
                    Publicada na vitrine
                  </span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#B7F21B]"
                  />
                  <span className="text-sm font-medium text-[#F3F3F3]">
                    Exibir em Máquinas em Destaque
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={saveState === 'saving'}
              onClick={() => void handleSave(false)}
              className="h-11 px-5 rounded-lg border border-[#303434] bg-[#1C1F1F] text-sm font-semibold text-[#F3F3F3] hover:border-[#B7F21B] transition-colors disabled:opacity-50"
            >
              Salvar como Rascunho
            </button>
            <button
              type="button"
              disabled={saveState === 'saving'}
              onClick={() => void handleSave(true)}
              className="h-11 px-6 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveState === 'saving' ? 'Salvando...' : 'Salvar e Publicar'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
