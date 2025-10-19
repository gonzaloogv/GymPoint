import { useEffect, useMemo, useState } from 'react';
import {
  useDailyChallenges,
  useDailyChallengeTemplates,
  useDailyChallengeConfig,
  useCreateDailyChallenge,
  useUpdateDailyChallenge,
  useDeleteDailyChallenge,
  useCreateDailyChallengeTemplate,
  useUpdateDailyChallengeTemplate,
  useDeleteDailyChallengeTemplate,
  useUpdateDailyChallengeConfig,
  useRunDailyChallengeRotation
} from '../hooks';
import { Button, Card, Input, Select, Textarea, Badge } from '../components';
import {
  DailyChallenge,
  DailyChallengeTemplate,
  CreateDailyChallengeDTO,
  CreateDailyChallengeTemplateDTO,
  DailyChallengeType,
  DailyChallengeDifficulty
} from '@/domain';

const TYPE_OPTIONS: { value: DailyChallengeType; label: string }[] = [
  { value: 'MINUTES', label: 'Minutos entrenados' },
  { value: 'EXERCISES', label: 'Ejercicios completados' },
  { value: 'FREQUENCY', label: 'Asistencias al gimnasio' }
];

const DIFFICULTY_OPTIONS: { value: DailyChallengeDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Facil' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HARD', label: 'Dificil' }
];

const TEMPLATE_DIFFICULTY_OPTIONS: { value: DailyChallengeDifficulty; label: string }[] = [
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' }
];

const cronToTime = (cron?: string) => {
  if (!cron) return '00:01';
  const parts = cron.trim().split(' ');
  if (parts.length < 2) return '00:01';
  const minute = Number(parts[0]);
  const hour = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return '00:01';
  const hh = Math.max(0, Math.min(23, hour)).toString().padStart(2, '0');
  const mm = Math.max(0, Math.min(59, minute)).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const timeToCron = (time: string) => {
  const [hh, mm] = time.split(':');
  const hour = Math.max(0, Math.min(23, Number(hh)));
  const minute = Math.max(0, Math.min(59, Number(mm)));
  return `${minute} ${hour} * * *`;
};

export const DailyChallenges = () => {
  const [filters, setFilters] = useState<{ from?: string; to?: string; include_inactive?: boolean }>({ include_inactive: false });
  const [challengeForm, setChallengeForm] = useState<CreateDailyChallengeDTO>({
    challenge_date: '',
    title: '',
    challenge_type: 'MINUTES',
    target_value: 30,
    tokens_reward: 10,
    difficulty: 'MEDIUM'
  });
  const [templateForm, setTemplateForm] = useState<CreateDailyChallengeTemplateDTO>({
    title: '',
    challenge_type: 'MINUTES',
    target_value: 30,
    tokens_reward: 10,
    rotation_weight: 1,
    difficulty: 'BEGINNER'
  });
  const [configForm, setConfigForm] = useState<{ autoRotation: boolean; cronTime: string }>({
    autoRotation: true,
    cronTime: '00:01'
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

  const challenges = challengesQuery.data || [];
  const templates = templatesQuery.data || [];
  const config = configQuery.data;

  useEffect(() => {
    if (config) {
      setConfigForm({
        autoRotation: config.auto_rotation_enabled,
        cronTime: cronToTime(config.rotation_cron)
      });
    }
  }, [config]);

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => b.rotation_weight - a.rotation_weight),
    [templates]
  );

  const handleChallengeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createChallengeMutation.mutateAsync({
        ...challengeForm,
        target_value: Number(challengeForm.target_value),
        tokens_reward: Number(challengeForm.tokens_reward ?? 0),
        id_template: challengeForm.id_template ? Number(challengeForm.id_template) : undefined
      });
      setChallengeForm({
        challenge_date: '',
        title: '',
        challenge_type: 'MINUTES',
        target_value: 30,
        tokens_reward: 10,
        difficulty: 'MEDIUM'
      });
      window.alert('Desafio creado correctamente');
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo crear el desafio');
    }
  };

  const handleTemplateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createTemplateMutation.mutateAsync({
        ...templateForm,
        target_value: Number(templateForm.target_value),
        tokens_reward: Number(templateForm.tokens_reward ?? 0),
        rotation_weight: Number(templateForm.rotation_weight ?? 1)
      });
      setTemplateForm({
        title: '',
        challenge_type: 'MINUTES',
        target_value: 30,
        tokens_reward: 10,
        rotation_weight: 1,
        difficulty: 'BEGINNER'
      });
      window.alert('Plantilla creada correctamente');
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo crear la plantilla');
    }
  };

  const toggleChallengeActive = async (challenge: DailyChallenge) => {
    try {
      await updateChallengeMutation.mutateAsync({
        id_challenge: challenge.id_challenge,
        is_active: !challenge.is_active
      });
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo actualizar el desafio');
    }
  };

  const toggleTemplateActive = async (template: DailyChallengeTemplate) => {
    try {
      await updateTemplateMutation.mutateAsync({
        id_template: template.id_template,
        is_active: !template.is_active
      });
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo actualizar la plantilla');
    }
  };

  const saveConfig = async () => {
    try {
      await updateConfigMutation.mutateAsync({
        auto_rotation_enabled: configForm.autoRotation,
        rotation_cron: timeToCron(configForm.cronTime)
      });
      window.alert('Configuracion guardada');
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo actualizar la configuracion');
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
    } catch (error: any) {
      window.alert(error?.response?.data?.error?.message || 'No se pudo ejecutar la rotacion');
    }
  };

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Gestion de Desafios Diarios</h1>
        <p className="text-text-muted">Configura la rotacion automatica, crea desafios manuales y administra las plantillas disponibles.</p>
      </header>

      <Card title="Configuracion general">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex items-center gap-2">
            <span className="text-text dark:text-text-dark font-medium">Rotacion automatica:</span>
            <Button
              size="sm"
              variant={configForm.autoRotation ? 'success' : 'secondary'}
              onClick={() => setConfigForm((prev) => ({ ...prev, autoRotation: !prev.autoRotation }))}
              disabled={updateConfigMutation.isPending || configQuery.isLoading}
            >
              {configForm.autoRotation ? 'Activa' : 'Desactivada'}
            </Button>
          </div>
          <Input
            type="time"
            label="Hora de ejecucion (UTC)"
            value={configForm.cronTime}
            onChange={(event) => setConfigForm((prev) => ({ ...prev, cronTime: event.target.value }))}
          />
          <Button onClick={saveConfig} disabled={updateConfigMutation.isPending}>Guardar configuracion</Button>
          <Button onClick={runRotation} disabled={runRotationMutation.isPending}>Ejecutar rotacion ahora</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Crear desafio manual">
          <form className="space-y-4" onSubmit={handleChallengeSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha *"
                value={challengeForm.challenge_date}
                onChange={(event) => setChallengeForm({ ...challengeForm, challenge_date: event.target.value })}
                required
              />
              <Select
                label="Tipo"
                value={challengeForm.challenge_type}
                onChange={(event) => setChallengeForm({ ...challengeForm, challenge_type: event.target.value as DailyChallengeType })}
                options={TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Input
                label="Objetivo *"
                type="number"
                value={challengeForm.target_value}
                onChange={(event) => setChallengeForm({ ...challengeForm, target_value: Number(event.target.value) })}
                required
              />
              <Input
                label="Unidad"
                value={challengeForm.target_unit || ''}
                onChange={(event) => setChallengeForm({ ...challengeForm, target_unit: event.target.value })}
                placeholder="min, reps, etc."
              />
              <Input
                label="Tokens"
                type="number"
                value={challengeForm.tokens_reward ?? 10}
                onChange={(event) => setChallengeForm({ ...challengeForm, tokens_reward: Number(event.target.value) })}
              />
              <Select
                label="Dificultad"
                value={challengeForm.difficulty}
                onChange={(event) => setChallengeForm({ ...challengeForm, difficulty: event.target.value as DailyChallengeDifficulty })}
                options={DIFFICULTY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
            </div>
            <Textarea
              label="Descripcion"
              value={challengeForm.description || ''}
              onChange={(event) => setChallengeForm({ ...challengeForm, description: event.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={createChallengeMutation.isPending}>Crear desafio</Button>
            </div>
          </form>
        </Card>

        <Card title="Crear plantilla">
          <form className="space-y-4" onSubmit={handleTemplateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Titulo *"
                value={templateForm.title}
                onChange={(event) => setTemplateForm({ ...templateForm, title: event.target.value })}
                required
              />
              <Select
                label="Tipo"
                value={templateForm.challenge_type}
                onChange={(event) => setTemplateForm({ ...templateForm, challenge_type: event.target.value as DailyChallengeType })}
                options={TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Input
                label="Objetivo *"
                type="number"
                value={templateForm.target_value}
                onChange={(event) => setTemplateForm({ ...templateForm, target_value: Number(event.target.value) })}
                required
              />
              <Input
                label="Unidad"
                value={templateForm.target_unit || ''}
                onChange={(event) => setTemplateForm({ ...templateForm, target_unit: event.target.value })}
              />
              <Input
                label="Tokens"
                type="number"
                value={templateForm.tokens_reward ?? 10}
                onChange={(event) => setTemplateForm({ ...templateForm, tokens_reward: Number(event.target.value) })}
              />
              <Select
                label="Dificultad"
                value={templateForm.difficulty}
                onChange={(event) => setTemplateForm({ ...templateForm, difficulty: event.target.value as DailyChallengeDifficulty })}
                options={TEMPLATE_DIFFICULTY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Input
                label="Peso de rotacion"
                type="number"
                value={templateForm.rotation_weight ?? 1}
                min={0}
                onChange={(event) => setTemplateForm({ ...templateForm, rotation_weight: Number(event.target.value) })}
              />
            </div>
            <Textarea
              label="Descripcion"
              value={templateForm.description || ''}
              onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={createTemplateMutation.isPending}>Crear plantilla</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card title="Desafios programados">
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            type="date"
            label="Desde"
            value={filters.from || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            className="w-48"
          />
          <Input
            type="date"
            label="Hasta"
            value={filters.to || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            className="w-48"
          />
          <label className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
            <input
              type="checkbox"
              checked={Boolean(filters.include_inactive)}
              onChange={(event) => setFilters((prev) => ({ ...prev, include_inactive: event.target.checked }))}
            />
            Incluir inactivos
          </label>
          <Button size="sm" onClick={() => challengesQuery.refetch()} disabled={challengesQuery.isFetching}>Aplicar filtros</Button>
        </div>
        {challengesQuery.isLoading ? (
          <p className="text-text-muted">Cargando desafios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Titulo</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Objetivo</th>
                  <th className="px-4 py-2">Tokens</th>
                  <th className="px-4 py-2">Origen</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id_challenge} className="border-b border-border dark:border-border-dark hover:bg-muted/40 dark:hover:bg-muted-dark/40">
                    <td className="px-4 py-2 text-sm">{challenge.challenge_date}</td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-text dark:text-text-dark">{challenge.title}</p>
                      {challenge.description && <p className="text-xs text-text-muted max-w-xs truncate">{challenge.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-sm">{challenge.challenge_type}</td>
                    <td className="px-4 py-2 text-sm">{challenge.target_value} {challenge.target_unit || ''}</td>
                    <td className="px-4 py-2 text-sm">{challenge.tokens_reward}</td>
                    <td className="px-4 py-2 text-sm">
                      {challenge.auto_generated ? <Badge variant="free">Automatico</Badge> : <Badge variant="active">Manual</Badge>}
                    </td>
                    <td className="px-4 py-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={challenge.is_active ? 'secondary' : 'success'}
                        onClick={() => toggleChallengeActive(challenge)}
                        disabled={updateChallengeMutation.isPending}
                      >
                        {challenge.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Eliminar este desafio?')) {
                            deleteChallengeMutation.mutate(challenge.id_challenge);
                          }
                        }}
                        disabled={deleteChallengeMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {challenges.length === 0 && <p className="text-center py-6 text-text-muted">No hay desafios para el rango seleccionado.</p>}
          </div>
        )}
      </Card>

      <Card title="Plantillas">
        {templatesQuery.isLoading ? (
          <p className="text-text-muted">Cargando plantillas...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="px-4 py-2">Titulo</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Objetivo</th>
                  <th className="px-4 py-2">Tokens</th>
                  <th className="px-4 py-2">Peso</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTemplates.map((template) => (
                  <tr key={template.id_template} className="border-b border-border dark:border-border-dark hover:bg-muted/40 dark:hover:bg-muted-dark/40">
                    <td className="px-4 py-2">
                      <p className="font-medium text-text dark:text-text-dark">{template.title}</p>
                      {template.description && <p className="text-xs text-text-muted max-w-xs truncate">{template.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-sm">{template.challenge_type}</td>
                    <td className="px-4 py-2 text-sm">{template.target_value} {template.target_unit || ''}</td>
                    <td className="px-4 py-2 text-sm">{template.tokens_reward}</td>
                    <td className="px-4 py-2 text-sm">{template.rotation_weight}</td>
                    <td className="px-4 py-2 text-sm">
                      <Badge variant={template.is_active ? 'active' : 'inactive'}>
                        {template.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={template.is_active ? 'secondary' : 'success'}
                        onClick={() => toggleTemplateActive(template)}
                        disabled={updateTemplateMutation.isPending}
                      >
                        {template.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Eliminar esta plantilla?')) {
                            deleteTemplateMutation.mutate(template.id_template);
                          }
                        }}
                        disabled={deleteTemplateMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {templates.length === 0 && <p className="text-center py-6 text-text-muted">No hay plantillas registradas.</p>}
          </div>
        )}
      </Card>
    </div>
  );
};


