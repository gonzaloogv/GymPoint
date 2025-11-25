import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementDefinitionInput
} from '@/domain';
import {
  useAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement
} from '../hooks';
import { AchievementFilters, AchievementTable, AchievementForm } from '../components/achievements';
import { Alert, Button, Loading, Modal } from '../components/ui';

type CategoryFilter = AchievementCategory | 'ALL';

const CATEGORY_VALUES: AchievementCategory[] = [
  'ONBOARDING',
  'STREAK',
  'FREQUENCY',
  'ATTENDANCE',
  'ROUTINE',
  'CHALLENGE',
  'PROGRESS',
  'TOKEN',
  'SOCIAL'
];

const resolveApiError = (error: unknown): string => {
  if (!error) return 'Ocurrió un error inesperado';
  const anyError = error as any;
  return (
    anyError?.response?.data?.error?.message ||
    anyError?.message ||
    'Ocurrió un error inesperado'
  );
};

export const Achievements = () => {
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementDefinition | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearchString = searchParams.toString();

  useEffect(() => {
    const categoryParam = searchParams.get('category') as AchievementCategory | null;
    if (categoryParam && CATEGORY_VALUES.includes(categoryParam)) {
      setCategory(categoryParam);
    }

    const includeInactiveParam = searchParams.get('includeInactive');
    if (includeInactiveParam === 'false') {
      setIncludeInactive(false);
    }
  }, [currentSearchString, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'ALL') {
      params.set('category', category);
    }
    if (!includeInactive) {
      params.set('includeInactive', 'false');
    }
    if (params.toString() !== currentSearchString) {
      setSearchParams(params, { replace: true });
    }
  }, [category, includeInactive, currentSearchString, setSearchParams]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAchievements({
    category: category === 'ALL' ? undefined : category,
    includeInactive
  });
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const { filtered, counts } = useMemo(() => {
    const definitions = data ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredAchievements = definitions.filter((definition) => {
      if (!normalizedSearch) return true;
      return (
        definition.name.toLowerCase().includes(normalizedSearch) ||
        definition.code.toLowerCase().includes(normalizedSearch) ||
        definition.description?.toLowerCase().includes(normalizedSearch)
      );
    });

    const activeCount = definitions.filter((definition) => definition.is_active).length;
    const inactiveCount = definitions.length - activeCount;

    return {
      filtered: filteredAchievements,
      counts: { active: activeCount, inactive: inactiveCount }
    };
  }, [data, searchTerm]);

  if (isLoading) {
    return <Loading fullPage />;
  }

  if (isError) {
    return (
      <div className="px-6 py-12">
        <Alert
          type="error"
          title="No se pudo cargar el catálogo"
          message={resolveApiError(error)}
          onClose={() => refetch()}
        />
      </div>
    );
  }

  const handleCloseModal = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setIsModalOpen(false);
    setEditingAchievement(null);
    setFormError(null);
  };

  const handleSubmitForm = async (payload: AchievementDefinitionInput) => {
    setFormError(null);
    try {
      if (editingAchievement) {
        await updateMutation.mutateAsync({
          ...payload,
          id_achievement_definition: editingAchievement.id_achievement_definition
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (submitError) {
      setFormError(resolveApiError(submitError));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Catálogo de logros</h1>
          <p className="text-sm text-text-muted">
            Gestiona los hitos que ven los usuarios en la app. Puedes crear, editar o desactivar
            logros según la estrategia de engagement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setFormError(null);
              setEditingAchievement(null);
              setIsModalOpen(true);
            }}
          >
            Nuevo logro
          </Button>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Actualizar
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <AchievementFilters
          selectedCategory={category}
          onCategoryChange={setCategory}
          includeInactive={includeInactive}
          onIncludeInactiveChange={setIncludeInactive}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          activeCount={counts.active}
          inactiveCount={counts.inactive}
          onReset={() => {
            setCategory('ALL');
            setIncludeInactive(true);
            setSearchTerm('');
          }}
        />

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-border-dark dark:bg-card-dark">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {filtered.length} logros configurados
            </h2>
            {isFetching && <span className="text-xs text-text-muted">Actualizando…</span>}
          </div>

          <AchievementTable
            achievements={filtered}
            loading={isFetching}
            onEdit={(definition) => {
              setEditingAchievement(definition);
              setFormError(null);
              setIsModalOpen(true);
            }}
            onDelete={(definition) => {
              const confirmDelete = window.confirm(
                `¿Eliminar "${definition.name}"? Se eliminará el progreso asociado.`
              );
              if (!confirmDelete) return;
              deleteMutation.mutate(definition.id_achievement_definition);
            }}
            isProcessingId={
              deleteMutation.isPending && typeof deleteMutation.variables === 'number'
                ? deleteMutation.variables
                : null
            }
          />
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAchievement ? 'Editar logro' : 'Nuevo logro'}
        size="lg"
      >
        <AchievementForm
          initialDefinition={editingAchievement ?? undefined}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          serverError={
            formError ||
            (createMutation.isError ? resolveApiError(createMutation.error) : null) ||
            (updateMutation.isError ? resolveApiError(updateMutation.error) : null)
          }
        />
      </Modal>

      {deleteMutation.isError && (
        <div className="mt-4">
          <Alert type="error" message={resolveApiError(deleteMutation.error)} />
        </div>
      )}
    </div>
  );
};

