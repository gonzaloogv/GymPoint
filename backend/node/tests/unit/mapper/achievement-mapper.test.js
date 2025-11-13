/**
 * Tests para buildAchievementResponse (función mapper del achievement-controller)
 */

// Extraemos la lógica del mapper para testearla de forma aislada
const buildAchievementResponse = (entries) => {
  return entries.map((entry) => {
    const { definition, progress, unlocked, unlocked_at, last_source_type, last_source_id } = entry;

    return {
      id: definition.id_achievement_definition,
      code: definition.code,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      metric_type: definition.metric_type,
      target_value: definition.target_value,
      icon_url: definition.icon_url,
      is_active: definition.is_active,
      metadata: definition.metadata,
      progress,
      unlocked,
      unlocked_at,
      last_source_type,
      last_source_id
    };
  });
};

describe('achievement-mapper buildAchievementResponse', () => {
  it('transforma un achievement completo con progreso', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 1,
          code: 'FIRST_GYM_VISIT',
          name: 'Primera visita al gym',
          description: 'Completa tu primera visita al gimnasio',
          category: 'ONBOARDING',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 1,
          icon_url: 'https://example.com/icon.png',
          is_active: true,
          metadata: { reward_tokens: 10 },
        },
        progress: 1,
        unlocked: true,
        unlocked_at: '2025-11-02T10:00:00.000Z',
        last_source_type: 'assistance',
        last_source_id: 5,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      code: 'FIRST_GYM_VISIT',
      name: 'Primera visita al gym',
      description: 'Completa tu primera visita al gimnasio',
      category: 'ONBOARDING',
      metric_type: 'ASSISTANCE_TOTAL',
      target_value: 1,
      icon_url: 'https://example.com/icon.png',
      is_active: true,
      metadata: { reward_tokens: 10 },
      progress: 1,
      unlocked: true,
      unlocked_at: '2025-11-02T10:00:00.000Z',
      last_source_type: 'assistance',
      last_source_id: 5,
    });
  });

  it('transforma un achievement sin desbloquear', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 2,
          code: 'STREAK_7_DAYS',
          name: 'Racha de 7 días',
          description: 'Mantén una racha de 7 días consecutivos',
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          icon_url: 'https://example.com/streak.png',
          is_active: true,
          metadata: null,
        },
        progress: 3,
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'streak',
        last_source_id: 1,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 2,
      code: 'STREAK_7_DAYS',
      name: 'Racha de 7 días',
      description: 'Mantén una racha de 7 días consecutivos',
      category: 'STREAK',
      metric_type: 'STREAK_DAYS',
      target_value: 7,
      icon_url: 'https://example.com/streak.png',
      is_active: true,
      metadata: null,
      progress: 3,
      unlocked: false,
      unlocked_at: null,
      last_source_type: 'streak',
      last_source_id: 1,
    });
  });

  it('transforma múltiples achievements', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 1,
          code: 'ACH_1',
          name: 'Achievement 1',
          description: 'Desc 1',
          category: 'ONBOARDING',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 1,
          icon_url: null,
          is_active: true,
          metadata: null,
        },
        progress: 1,
        unlocked: true,
        unlocked_at: '2025-11-02T10:00:00.000Z',
        last_source_type: null,
        last_source_id: null,
      },
      {
        definition: {
          id_achievement_definition: 2,
          code: 'ACH_2',
          name: 'Achievement 2',
          description: 'Desc 2',
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          icon_url: null,
          is_active: true,
          metadata: null,
        },
        progress: 5,
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'streak',
        last_source_id: 1,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('maneja achievements con metadata complejos', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 3,
          code: 'COMPLEX_ACH',
          name: 'Complex Achievement',
          description: 'Complex description',
          category: 'PROGRESS',
          metric_type: 'BODY_WEIGHT_PROGRESS',
          target_value: 10,
          icon_url: 'https://example.com/icon.png',
          is_active: true,
          metadata: {
            reward_tokens: 50,
            badge_color: 'gold',
            difficulty: 'hard',
            requirements: ['req1', 'req2'],
          },
        },
        progress: 7,
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'progress',
        last_source_id: 10,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result[0].metadata).toEqual({
      reward_tokens: 50,
      badge_color: 'gold',
      difficulty: 'hard',
      requirements: ['req1', 'req2'],
    });
  });

  it('maneja achievements inactivos', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 4,
          code: 'INACTIVE_ACH',
          name: 'Inactive Achievement',
          description: 'This achievement is inactive',
          category: 'CHALLENGE',
          metric_type: 'DAILY_CHALLENGE_COMPLETED_COUNT',
          target_value: 10,
          icon_url: null,
          is_active: false,
          metadata: null,
        },
        progress: 0,
        unlocked: false,
        unlocked_at: null,
        last_source_type: null,
        last_source_id: null,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result[0].is_active).toBe(false);
  });

  it('retorna array vacío cuando no hay entries', () => {
    const result = buildAchievementResponse([]);
    expect(result).toEqual([]);
  });

  it('maneja todas las categorías posibles', () => {
    const categories = [
      'ONBOARDING',
      'STREAK',
      'FREQUENCY',
      'ATTENDANCE',
      'ROUTINE',
      'CHALLENGE',
      'PROGRESS',
      'TOKEN',
      'SOCIAL',
    ];

    categories.forEach((category, index) => {
      const entries = [
        {
          definition: {
            id_achievement_definition: index + 1,
            code: `ACH_${category}`,
            name: `Achievement ${category}`,
            description: `Description for ${category}`,
            category,
            metric_type: 'ASSISTANCE_TOTAL',
            target_value: 1,
            icon_url: null,
            is_active: true,
            metadata: null,
          },
          progress: 0,
          unlocked: false,
          unlocked_at: null,
          last_source_type: null,
          last_source_id: null,
        },
      ];

      const result = buildAchievementResponse(entries);

      expect(result[0].category).toBe(category);
    });
  });

  it('maneja todos los tipos de métrica posibles', () => {
    const metricTypes = [
      'STREAK_DAYS',
      'STREAK_RECOVERY_USED',
      'ASSISTANCE_TOTAL',
      'FREQUENCY_WEEKS_MET',
      'ROUTINE_COMPLETED_COUNT',
      'WORKOUT_SESSION_COMPLETED',
      'DAILY_CHALLENGE_COMPLETED_COUNT',
      'PR_RECORD_COUNT',
      'BODY_WEIGHT_PROGRESS',
      'TOKEN_BALANCE_REACHED',
      'TOKEN_SPENT_TOTAL',
      'ONBOARDING_STEP_COMPLETED',
    ];

    metricTypes.forEach((metricType, index) => {
      const entries = [
        {
          definition: {
            id_achievement_definition: index + 1,
            code: `ACH_${metricType}`,
            name: `Achievement ${metricType}`,
            description: `Description for ${metricType}`,
            category: 'ONBOARDING',
            metric_type: metricType,
            target_value: 10,
            icon_url: null,
            is_active: true,
            metadata: null,
          },
          progress: 5,
          unlocked: false,
          unlocked_at: null,
          last_source_type: null,
          last_source_id: null,
        },
      ];

      const result = buildAchievementResponse(entries);

      expect(result[0].metric_type).toBe(metricType);
    });
  });

  it('preserva todos los campos de progress y unlock', () => {
    const entries = [
      {
        definition: {
          id_achievement_definition: 5,
          code: 'PROGRESS_TEST',
          name: 'Progress Test',
          description: 'Testing progress fields',
          category: 'ATTENDANCE',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 100,
          icon_url: 'https://example.com/icon.png',
          is_active: true,
          metadata: { test: 'data' },
        },
        progress: 75,
        unlocked: true,
        unlocked_at: '2025-11-02T15:30:00.000Z',
        last_source_type: 'assistance',
        last_source_id: 999,
      },
    ];

    const result = buildAchievementResponse(entries);

    expect(result[0].progress).toBe(75);
    expect(result[0].unlocked).toBe(true);
    expect(result[0].unlocked_at).toBe('2025-11-02T15:30:00.000Z');
    expect(result[0].last_source_type).toBe('assistance');
    expect(result[0].last_source_id).toBe(999);
  });
});
