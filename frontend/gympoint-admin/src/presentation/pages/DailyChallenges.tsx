import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCreateDailyChallenge,
  useCreateDailyChallengeTemplate,
  useDailyChallengeConfig,
  useDailyChallengeTemplates,
  useDailyChallenges,
  useDeleteDailyChallenge,
  useDeleteDailyChallengeTemplate,
  useRunDailyChallengeRotation,
  useUpdateDailyChallenge,
  useUpdateDailyChallengeConfig,
  useUpdateDailyChallengeTemplate,
} from '../hooks';
import {
  Card
} from '../components';
import { 
  DailyChallengeTable,
  DailyChallengeConfigCard,
  DailyChallengeFilters,
  DailyChallengeFiltersState,
  DailyChallengeForm,
  DailyChallengeTemplateForm,
  DailyChallengeTemplateTable,
 } from '../components/daily-challenges';
import {
  CreateDailyChallengeDTO,
  CreateDailyChallengeTemplateDTO,
  DailyChallenge as DailyChallengeEntity,
  DailyChallengeDifficulty,
  DailyChallengeTemplate,
  DailyChallengeType,
} from '@/domain';
import { cronToTime, timeToCron } from '../utils/cron';

type ChallengeOption = { value: DailyChallengeType; label: string };
type DifficultyOption = { value: DailyChallengeDifficulty; label: string };

const TYPE_OPTIONS: ChallengeOption[] = [
  { value: 'MINUTES', label: 'Minutos entrenados' },
  { value: 'EXERCISES', label: 'Ejercicios completados' },
  { value: 'FREQUENCY', label: 'Asistencias al gimnasio' },
];

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'EASY', label: 'Facil' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HARD', label: 'Dificil' },
];

const TEMPLATE_DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' },
];

const createDefaultChallengeForm = (): CreateDailyChallengeDTO => ({
  challenge_date: '',
  title: '',
  description: '',
  challenge_type: 'MINUTES',
  target_value: 30,
  target_unit: '',
  tokens_reward: 10,
  difficulty: 'MEDIUM',
});

const createDefaultTemplateForm = (): CreateDailyChallengeTemplateDTO => ({
  title: '',
  description: '',
  challenge_type: 'MINUTES',
  target_value: 30,
  target_unit: '',
  tokens_reward: 10,
  rotation_weight: 1,
  difficulty: 'BEGINNER',
});

const DEFAULT_FILTERS: DailyChallengeFiltersState = {
  include_inactive: false,
};

const extractErrorMessage = (error: unknown): string | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response?.data?.error?.message === 'string'
  ) {
    return (error as any).response.data.error.message as string;
  }
  return undefined;
};

export const DailyChallenges = () => {
  const [filters, setFilters] = useState<DailyChallengeFiltersState>(() => ({ ...DEFAULT_FILTERS }));
  const [challengeForm, setChallengeForm] = useState<CreateDailyChallengeDTO>(
    createDefaultChallengeForm,
  );
  const [templateForm, setTemplateForm] = useState<CreateDailyChallengeTemplateDTO>(
    createDefaultTemplateForm,
  );
  const [configForm, setConfigForm] = useState<{ autoRotation: boolean; cronTime: string }>({
    autoRotation: true,
    cronTime: '00:01',
  });

  const challengesQuery = useDailyChallenges(filters);
  const templatesQuery = useDailyChallengeTemplates();
  const configQuery = useDailyChallengeConfig();

  const createChallengeMutation = useCreateDailyChallenge();
  const updateChallengeMutation = useUpdateDailyChallenge();
  const deleteChallengeMutation = useDeleteDailyChallenge();
  const createTemplateMutation = useCreateDailyChallengeTemplate();
  const updateTemplateMutation = useUpdateDailyChallengeTemplate();
  const deleteTemplateMutation = useDeleteDailyChallengeTemplate();
  const updateConfigMutation = useUpdateDailyChallengeConfig();
  const runRotationMutation = useRunDailyChallengeRotation();

  const challenges = challengesQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const config = configQuery.data;

  useEffect(() => {
    if (!config) {
      return;
    }
    setConfigForm({
      autoRotation: config.auto_rotation_enabled,
      cronTime: cronToTime(config.rotation_cron),
    });
  }, [config]);

  const sortedTemplates = useMemo<DailyChallengeTemplate[]>(
    () => [...templates].sort((a, b) => b.rotation_weight - a.rotation_weight),
    [templates],
  );

  const handleChallengeFieldChange = useCallback(
    <K extends keyof CreateDailyChallengeDTO>(field: K, value: CreateDailyChallengeDTO[K]) => {
      setChallengeForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleTemplateFieldChange = useCallback(
    <K extends keyof CreateDailyChallengeTemplateDTO>(
      field: K,
      value: CreateDailyChallengeTemplateDTO[K],
    ) => {
      setTemplateForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleFilterChange = useCallback(
    <K extends keyof DailyChallengeFiltersState>(
      field: K,
      value: DailyChallengeFiltersState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleChallengeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload: CreateDailyChallengeDTO = {
        challenge_date: challengeForm.challenge_date,
        title: challengeForm.title,
        challenge_type: challengeForm.challenge_type,
        target_value: Number(challengeForm.target_value),
        tokens_reward: Number(challengeForm.tokens_reward ?? 10),
        difficulty: challengeForm.difficulty || 'MEDIUM',
      };

      // Solo agregar campos opcionales si tienen valor
      if (challengeForm.description && challengeForm.description.trim()) {
        payload.description = challengeForm.description.trim();
      }
      if (challengeForm.target_unit && challengeForm.target_unit.trim()) {
        payload.target_unit = challengeForm.target_unit.trim();
      }
      if (challengeForm.id_template) {
        payload.id_template = Number(challengeForm.id_template);
      }

      await createChallengeMutation.mutateAsync(payload);
      setChallengeForm(createDefaultChallengeForm());
      window.alert('Desafio creado correctamente');
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo crear el desafio';
      window.alert(message);
    }
  };

  const handleTemplateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload: CreateDailyChallengeTemplateDTO = {
        title: templateForm.title,
        challenge_type: templateForm.challenge_type,
        target_value: Number(templateForm.target_value),
        tokens_reward: Number(templateForm.tokens_reward ?? 10),
        rotation_weight: Number(templateForm.rotation_weight ?? 1),
        difficulty: templateForm.difficulty || 'BEGINNER',
      };

      // Solo agregar campos opcionales si tienen valor
      if (templateForm.description && templateForm.description.trim()) {
        payload.description = templateForm.description.trim();
      }
      if (templateForm.target_unit && templateForm.target_unit.trim()) {
        payload.target_unit = templateForm.target_unit.trim();
      }

      await createTemplateMutation.mutateAsync(payload);
      setTemplateForm(createDefaultTemplateForm());
      window.alert('Plantilla creada correctamente');
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo crear la plantilla';
      window.alert(message);
    }
  };

  const toggleChallengeActive = async (challenge: DailyChallengeEntity) => {
    try {
      await updateChallengeMutation.mutateAsync({
        id_challenge: challenge.id_challenge,
        is_active: !challenge.is_active,
      });
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo actualizar el desafio';
      window.alert(message);
    }
  };

  const toggleTemplateActive = async (template: DailyChallengeTemplate) => {
    try {
      await updateTemplateMutation.mutateAsync({
        id_template: template.id_template,
        is_active: !template.is_active,
      });
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo actualizar la plantilla';
      window.alert(message);
    }
  };

  const saveConfig = async () => {
    try {
      await updateConfigMutation.mutateAsync({
        auto_rotation_enabled: configForm.autoRotation,
        rotation_cron: timeToCron(configForm.cronTime),
      });
      window.alert('Configuracion guardada');
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo actualizar la configuracion';
      window.alert(message);
    }
  };

  const runRotation = async () => {
    try {
      const result = await runRotationMutation.mutateAsync();
      if (result) {
        window.alert(`Se aseguro el desafio del dia: ${result.title}`);
      } else {
        window.alert('No se genero ningun desafio (rotacion deshabilitada o sin plantillas activas)');
      }
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'No se pudo ejecutar la rotacion';
      window.alert(message);
    }
  };

  const handleDeleteChallenge = (challenge: DailyChallengeEntity) => {
    if (!window.confirm('Eliminar este desafio?')) {
      return;
    }
    deleteChallengeMutation.mutate(challenge.id_challenge, {
      onError: (error) => {
        const message = extractErrorMessage(error) ?? 'No se pudo eliminar el desafio';
        window.alert(message);
      },
    });
  };

  const handleDeleteTemplate = (template: DailyChallengeTemplate) => {
    if (!window.confirm('Eliminar esta plantilla?')) {
      return;
    }
    deleteTemplateMutation.mutate(template.id_template, {
      onError: (error) => {
        const message = extractErrorMessage(error) ?? 'No se pudo eliminar la plantilla';
        window.alert(message);
      },
    });
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    challengesQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">
          Gestion de Desafios Diarios
        </h1>
        <p className="text-text-muted">
          Configura la rotacion automatica, crea desafios manuales y administra las plantillas
          disponibles.
        </p>
      </header>

      <DailyChallengeConfigCard
        autoRotation={configForm.autoRotation}
        cronTime={configForm.cronTime}
        onToggleAutoRotation={() =>
          setConfigForm((prev) => ({ ...prev, autoRotation: !prev.autoRotation }))
        }
        onCronTimeChange={(value) => setConfigForm((prev) => ({ ...prev, cronTime: value }))}
        onSave={saveConfig}
        onRunRotation={runRotation}
        isSaving={updateConfigMutation.isPending}
        isRunning={runRotationMutation.isPending}
        isLoadingConfig={configQuery.isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DailyChallengeForm
          title="Crear desafio manual"
          form={challengeForm}
          typeOptions={TYPE_OPTIONS}
          difficultyOptions={DIFFICULTY_OPTIONS}
          onSubmit={handleChallengeSubmit}
          onChange={handleChallengeFieldChange}
          isSubmitting={createChallengeMutation.isPending}
        />

        <DailyChallengeTemplateForm
          title="Crear plantilla"
          form={templateForm}
          typeOptions={TYPE_OPTIONS}
          difficultyOptions={TEMPLATE_DIFFICULTY_OPTIONS}
          onSubmit={handleTemplateSubmit}
          onChange={handleTemplateFieldChange}
          isSubmitting={createTemplateMutation.isPending}
        />
      </div>

      <Card title="Desafios programados">
        <DailyChallengeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={() => challengesQuery.refetch()}
          onReset={resetFilters}
          isApplying={challengesQuery.isFetching}
        />
        <DailyChallengeTable
          challenges={challenges}
          isLoading={challengesQuery.isLoading}
          onToggleActive={toggleChallengeActive}
          onDelete={handleDeleteChallenge}
          isToggling={updateChallengeMutation.isPending}
          isDeleting={deleteChallengeMutation.isPending}
        />
      </Card>

      <Card title="Plantillas">
        <DailyChallengeTemplateTable
          templates={sortedTemplates}
          isLoading={templatesQuery.isLoading}
          onToggleActive={toggleTemplateActive}
          onDelete={handleDeleteTemplate}
          isToggling={updateTemplateMutation.isPending}
          isDeleting={deleteTemplateMutation.isPending}
        />
      </Card>
    </div>
  );
};
