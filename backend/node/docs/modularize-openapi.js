const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Rutas
const OPENAPI_FILE = path.join(__dirname, 'openapi.yaml');
const OUTPUT_DIR = path.join(__dirname, 'openapi');

// Dominios identificados
const DOMAINS = [
  'auth', 'users', 'gyms', 'exercises', 'routines', 'user-routines',
  'workouts', 'progress', 'media', 'streak', 'frequency', 'challenges',
  'rewards', 'achievements', 'daily-challenges', 'daily-challenge-templates',
  'gym-special-schedules'
];

// Enums comunes (schemas que son enums reutilizables)
const COMMON_ENUMS = [
  'PaginationMeta', 'SubscriptionType', 'Gender', 'DifficultyLevel',
  'ExtendedDifficultyLevel', 'WorkoutSessionStatus', 'UserRoutineStatus',
  'AchievementCategory', 'MuscleGroup', 'ChallengeType', 'ChallengeProgressStatus',
  'MediaType', 'EntityType', 'RewardCategory', 'PaymentStatus',
  'AccountDeletionStatus', 'AchievementMetric', 'ChallengeMetric', 'Error'
];

// Mapeo de schemas a dominios (usando prefijos y nombres específicos)
const SCHEMA_DOMAIN_MAP = {
  // Auth
  'RegisterRequest': 'auth',
  'LoginRequest': 'auth',
  'GoogleLoginRequest': 'auth',
  'RefreshTokenRequest': 'auth',
  'RefreshTokenResponse': 'auth',
  'LogoutRequest': 'auth',
  'AuthSuccessResponse': 'auth',
  'AuthTokenPair': 'auth',
  'AuthUser': 'auth',
  'UserProfileSummary': 'auth',

  // Users
  'UserProfileResponse': 'users',
  'UpdateUserProfileRequest': 'users',
  'UpdateEmailRequest': 'users',
  'EmailUpdateResponse': 'users',
  'RequestAccountDeletionRequest': 'users',
  'AccountDeletionResponse': 'users',
  'AccountDeletionStatusResponse': 'users',
  'NotificationSettingsResponse': 'users',
  'UpdateNotificationSettingsRequest': 'users',
  'UpdateTokensRequest': 'users',
  'TokensUpdateResponse': 'users',
  'UpdateSubscriptionRequest': 'users',

  // Gyms
  'GymListResponse': 'gyms',
  'GymResponse': 'gyms',
  'CreateGymRequest': 'gyms',
  'UpdateGymRequest': 'gyms',
  'GymAmenity': 'gyms',
  'GymTypeList': 'gyms',
  'CreateGymScheduleRequest': 'gyms',
  'GymScheduleResponse': 'gyms',
  'GymSchedulesWeekResponse': 'gyms',
  'CreateGymReviewRequest': 'gyms',
  'GymReviewResponse': 'gyms',
  'PaginatedGymReviewsResponse': 'gyms',
  'CreateGymPaymentRequest': 'gyms',
  'GymPaymentResponse': 'gyms',
  'PaginatedGymPaymentsResponse': 'gyms',

  // Exercises
  'Exercise': 'exercises',
  'CreateExerciseRequest': 'exercises',
  'UpdateExerciseRequest': 'exercises',
  'PaginatedExercisesResponse': 'exercises',

  // Routines
  'Routine': 'routines',
  'RoutineWithDetails': 'routines',
  'RoutineDay': 'routines',
  'RoutineExercise': 'routines',
  'ExerciseInRoutine': 'routines',
  'CreateRoutineRequest': 'routines',
  'UpdateRoutineRequest': 'routines',
  'AddExerciseToRoutineRequest': 'routines',
  'UpdateRoutineExerciseRequest': 'routines',
  'CreateRoutineDayRequest': 'routines',
  'UpdateRoutineDayRequest': 'routines',
  'PaginatedRoutinesResponse': 'routines',

  // User Routines
  'UserRoutine': 'user-routines',
  'AssignRoutineRequest': 'user-routines',
  'ImportRoutineRequest': 'user-routines',
  'UserRoutineCounts': 'user-routines',

  // Workouts
  'WorkoutSession': 'workouts',
  'StartWorkoutSessionRequest': 'workouts',
  'WorkoutSetResponse': 'workouts',
  'CreateWorkoutSetRequest': 'workouts',
  'UpdateWorkoutSetRequest': 'workouts',

  // Progress
  'ProgressPhotoResponse': 'progress',
  'CreateProgressPhotoRequest': 'progress',
  'UpdateProgressPhotoRequest': 'progress',
  'PaginatedProgressPhotosResponse': 'progress',

  // Media
  'Media': 'media',
  'UploadMediaRequest': 'media',
  'MediaResponse': 'media',
  'PaginatedMediaResponse': 'media',

  // Streak
  'StreakResponse': 'streak',
  'StreakStatsResponse': 'streak',

  // Frequency
  'FrequencyResponse': 'frequency',

  // Challenges
  'TodayChallengeResponse': 'challenges',
  'ChallengeProgressResponse': 'challenges',

  // Rewards
  'RewardResponse': 'rewards',
  'RedeemRewardRequest': 'rewards',
  'RedemptionResponse': 'rewards',
  'PaginatedRewardsResponse': 'rewards',

  // Achievements
  'AchievementResponse': 'achievements',
  'UserAchievementResponse': 'achievements',
  'PaginatedAchievementsResponse': 'achievements',
  'PaginatedUserAchievementsResponse': 'achievements',

  // Daily Challenges
  'DailyChallengeResponse': 'daily-challenges',
  'CreateDailyChallengeRequest': 'daily-challenges',
  'UpdateDailyChallengeRequest': 'daily-challenges',

  // Daily Challenge Templates
  'DailyChallengeTemplateResponse': 'daily-challenge-templates',
  'CreateDailyChallengeTemplateRequest': 'daily-challenge-templates',
  'UpdateDailyChallengeTemplateRequest': 'daily-challenge-templates',

  // Gym Special Schedules
  'GymSpecialScheduleResponse': 'gym-special-schedules',
  'CreateGymSpecialScheduleRequest': 'gym-special-schedules',
  'UpdateGymSpecialScheduleRequest': 'gym-special-schedules',
  'PaginatedGymSpecialSchedulesResponse': 'gym-special-schedules'
};

// Función para determinar el dominio de un path
function getPathDomain(pathUrl) {
  if (pathUrl.startsWith('/api/auth')) return 'auth';
  if (pathUrl.startsWith('/api/users')) return 'users';
  if (pathUrl.startsWith('/api/gyms')) {
    if (pathUrl.includes('/schedules') && pathUrl.includes('/special')) return 'gym-special-schedules';
    return 'gyms';
  }
  if (pathUrl.startsWith('/api/exercises')) return 'exercises';
  if (pathUrl.startsWith('/api/routines')) return 'routines';
  if (pathUrl.startsWith('/api/user-routines')) return 'user-routines';
  if (pathUrl.startsWith('/api/workouts')) return 'workouts';
  if (pathUrl.startsWith('/api/progress')) return 'progress';
  if (pathUrl.startsWith('/api/media')) return 'media';
  if (pathUrl.startsWith('/api/streak')) return 'streak';
  if (pathUrl.startsWith('/api/frequency')) return 'frequency';
  if (pathUrl.startsWith('/api/challenges')) return 'challenges';
  if (pathUrl.startsWith('/api/rewards')) return 'rewards';
  if (pathUrl.startsWith('/api/achievements')) return 'achievements';
  if (pathUrl.startsWith('/api/daily-challenges/templates')) return 'daily-challenge-templates';
  if (pathUrl.startsWith('/api/daily-challenges')) return 'daily-challenges';
  if (pathUrl.startsWith('/api/gym-special-schedules')) return 'gym-special-schedules';
  return 'unknown';
}

// Función para obtener el dominio de un schema
function getSchemaDomain(schemaName) {
  if (COMMON_ENUMS.includes(schemaName)) return 'common';
  if (SCHEMA_DOMAIN_MAP[schemaName]) return SCHEMA_DOMAIN_MAP[schemaName];

  // Intentar deducir por prefijo
  for (const domain of DOMAINS) {
    const prefix = domain.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    if (schemaName.startsWith(prefix)) return domain;
  }

  return 'common'; // Por defecto, va a common
}

// Función para actualizar referencias
function updateReferences(obj, context, domain) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => updateReferences(item, context, domain));
  }

  const updated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      if (value.startsWith('#/components/schemas/')) {
        const schemaName = value.split('/').pop();
        const schemaDomain = getSchemaDomain(schemaName);

        if (context === 'path') {
          if (schemaDomain === 'common') {
            updated[key] = `../components/common.yaml#/components/schemas/${schemaName}`;
          } else {
            updated[key] = `../components/schemas/${schemaDomain}.yaml#/components/schemas/${schemaName}`;
          }
        } else if (context === 'schema') {
          if (schemaDomain === 'common') {
            updated[key] = `../common.yaml#/components/schemas/${schemaName}`;
          } else if (schemaDomain === domain) {
            updated[key] = `#/components/schemas/${schemaName}`;
          } else {
            updated[key] = `./${schemaDomain}.yaml#/components/schemas/${schemaName}`;
          }
        }
      } else if (value.startsWith('#/components/parameters/')) {
        const paramName = value.split('/').pop();
        updated[key] = context === 'path'
          ? `../components/parameters.yaml#/components/parameters/${paramName}`
          : `../parameters.yaml#/components/parameters/${paramName}`;
      } else if (value.startsWith('#/components/responses/')) {
        const responseName = value.split('/').pop();
        updated[key] = context === 'path'
          ? `../components/responses.yaml#/components/responses/${responseName}`
          : `../responses.yaml#/components/responses/${responseName}`;
      } else {
        updated[key] = value;
      }
    } else {
      updated[key] = updateReferences(value, context, domain);
    }
  }

  return updated;
}

async function main() {
  console.log('Cargando archivo OpenAPI...');
  const content = fs.readFileSync(OPENAPI_FILE, 'utf8');
  const spec = yaml.load(content);

  const report = {
    files: [],
    schemas: {},
    paths: {},
    stats: {}
  };

  // 1. Crear common.yaml
  console.log('Creando common.yaml...');
  const commonSchemas = {};
  for (const [name, schema] of Object.entries(spec.components.schemas || {})) {
    if (COMMON_ENUMS.includes(name)) {
      commonSchemas[name] = schema;
    }
  }

  const commonYaml = {
    components: {
      schemas: commonSchemas
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'components', 'common.yaml'),
    yaml.dump(commonYaml, { lineWidth: -1, noRefs: true }),
    'utf8'
  );
  report.files.push('components/common.yaml');
  report.schemas['common'] = Object.keys(commonSchemas);

  // 2. Crear parameters.yaml
  console.log('Creando parameters.yaml...');
  const parametersYaml = {
    components: {
      parameters: spec.components.parameters || {}
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'components', 'parameters.yaml'),
    yaml.dump(parametersYaml, { lineWidth: -1, noRefs: true }),
    'utf8'
  );
  report.files.push('components/parameters.yaml');

  // 3. Crear responses.yaml
  console.log('Creando responses.yaml...');
  const responsesYaml = {
    components: {
      responses: spec.components.responses || {}
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'components', 'responses.yaml'),
    yaml.dump(responsesYaml, { lineWidth: -1, noRefs: true }),
    'utf8'
  );
  report.files.push('components/responses.yaml');

  // 4. Crear securitySchemes.yaml
  console.log('Creando securitySchemes.yaml...');
  const securitySchemesYaml = {
    components: {
      securitySchemes: spec.components.securitySchemes || {}
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'components', 'securitySchemes.yaml'),
    yaml.dump(securitySchemesYaml, { lineWidth: -1, noRefs: true }),
    'utf8'
  );
  report.files.push('components/securitySchemes.yaml');

  // 5. Crear schemas por dominio
  console.log('Creando schemas por dominio...');
  const domainSchemas = {};
  DOMAINS.forEach(domain => domainSchemas[domain] = {});

  for (const [name, schema] of Object.entries(spec.components.schemas || {})) {
    if (COMMON_ENUMS.includes(name)) continue;

    const domain = getSchemaDomain(name);
    if (!domainSchemas[domain]) domainSchemas[domain] = {};
    domainSchemas[domain][name] = updateReferences(schema, 'schema', domain);
  }

  for (const [domain, schemas] of Object.entries(domainSchemas)) {
    if (Object.keys(schemas).length === 0) continue;

    const schemaYaml = {
      components: {
        schemas: schemas
      }
    };

    const filePath = path.join(OUTPUT_DIR, 'components', 'schemas', `${domain}.yaml`);
    fs.writeFileSync(
      filePath,
      yaml.dump(schemaYaml, { lineWidth: -1, noRefs: true }),
      'utf8'
    );
    report.files.push(`components/schemas/${domain}.yaml`);
    report.schemas[domain] = Object.keys(schemas);
  }

  // 6. Crear paths por dominio
  console.log('Creando paths por dominio...');
  const domainPaths = {};
  DOMAINS.forEach(domain => domainPaths[domain] = {});

  for (const [pathUrl, pathDef] of Object.entries(spec.paths || {})) {
    const domain = getPathDomain(pathUrl);
    if (!domainPaths[domain]) domainPaths[domain] = {};
    domainPaths[domain][pathUrl] = updateReferences(pathDef, 'path', domain);
  }

  for (const [domain, paths] of Object.entries(domainPaths)) {
    if (Object.keys(paths).length === 0) continue;

    const pathYaml = {
      paths: paths
    };

    const filePath = path.join(OUTPUT_DIR, 'paths', `${domain}.yaml`);
    fs.writeFileSync(
      filePath,
      yaml.dump(pathYaml, { lineWidth: -1, noRefs: true }),
      'utf8'
    );
    report.files.push(`paths/${domain}.yaml`);
    report.paths[domain] = Object.keys(paths);
  }

  // 7. Generar reporte
  console.log('\n===== REPORTE DE MODULARIZACIÓN =====\n');
  console.log(`Total de archivos creados: ${report.files.length}`);
  console.log(`\nArchivos de componentes comunes: 4`);
  console.log(`  - components/common.yaml (${Object.keys(commonSchemas).length} schemas)`);
  console.log(`  - components/parameters.yaml (${Object.keys(spec.components.parameters || {}).length} parameters)`);
  console.log(`  - components/responses.yaml (${Object.keys(spec.components.responses || {}).length} responses)`);
  console.log(`  - components/securitySchemes.yaml (${Object.keys(spec.components.securitySchemes || {}).length} schemes)`);

  console.log(`\nArchivos de schemas por dominio:`);
  for (const [domain, schemas] of Object.entries(report.schemas)) {
    if (domain === 'common') continue;
    console.log(`  - components/schemas/${domain}.yaml (${schemas.length} schemas)`);
  }

  console.log(`\nArchivos de paths por dominio:`);
  for (const [domain, paths] of Object.entries(report.paths)) {
    console.log(`  - paths/${domain}.yaml (${paths.length} paths)`);
  }

  // Guardar reporte detallado
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'MODULARIZATION_REPORT.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('\n✅ Modularización completada exitosamente!');
  console.log(`   Reporte guardado en: ${path.join(OUTPUT_DIR, 'MODULARIZATION_REPORT.json')}`);
}

main().catch(console.error);
