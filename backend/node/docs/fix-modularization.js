const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Paths
const BASE_DIR = path.join(__dirname, 'openapi');
const COMMON_FILE = path.join(BASE_DIR, 'components', 'schemas', 'common.yaml');

// Schemas que NO deberían estar en common
const MISPLACED_SCHEMAS = {
  // Workouts
  'WorkoutSet': 'workouts',
  'WorkoutStats': 'workouts',
  'CompleteWorkoutSessionRequest': 'workouts',
  'UpdateWorkoutSessionRequest': 'workouts',
  'RegisterWorkoutSetRequest': 'workouts',
  'CreateWorkoutSetRequest': 'workouts',
  'UpdateWorkoutSetRequest': 'workouts',
  'WorkoutSetResponse': 'workouts',

  // Assistance/Progress
  'CheckInRequest': 'progress',
  'AssistanceResponse': 'progress',
  'CheckInResponseData': 'progress',
  'CheckOutResponse': 'progress',
  'PresenceRequest': 'progress',
  'PresenceResponse': 'progress',
  'AssistanceHistoryResponse': 'progress',
  'CreateProgressPhotoRequest': 'progress',
  'UpdateProgressPhotoRequest': 'progress',
  'ProgressPhotoResponse': 'progress',
  'PaginatedProgressPhotosResponse': 'progress',
  'ProgressResponse': 'progress',

  // Rewards
  'CreateRewardRequest': 'rewards',
  'UpdateRewardRequest': 'rewards',
  'RewardResponse': 'rewards',
  'RedeemRewardRequest': 'rewards',
  'RedemptionResponse': 'rewards',
  'PaginatedRewardsResponse': 'rewards',

  // Achievements
  'AchievementDefinitionResponse': 'achievements',
  'CreateAchievementDefinitionRequest': 'achievements',
  'UpdateAchievementDefinitionRequest': 'achievements',
  'AchievementResponse': 'achievements',
  'UserAchievementResponse': 'achievements',
  'PaginatedAchievementsResponse': 'achievements',
  'PaginatedUserAchievementsResponse': 'achievements',

  // Media
  'Media': 'media',
  'UploadMediaRequest': 'media',
  'MediaResponse': 'media',
  'PaginatedMediaResponse': 'media'
};

// Schemas que SÍ deberían estar en common (enums y utilidades)
const TRUE_COMMON_SCHEMAS = [
  'PaginationMeta',
  'SubscriptionType',
  'Gender',
  'DifficultyLevel',
  'ExtendedDifficultyLevel',
  'WorkoutSessionStatus',
  'UserRoutineStatus',
  'AchievementCategory',
  'MuscleGroup',
  'ChallengeType',
  'ChallengeProgressStatus',
  'MediaType',
  'EntityType',
  'RewardCategory',
  'PaymentStatus',
  'AccountDeletionStatus',
  'AchievementMetric',
  'ChallengeMetric',
  'Error'
];

function updateReferences(obj, fromDomain, toDomain, schemaName) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => updateReferences(item, fromDomain, toDomain, schemaName));
  }

  const updated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      // Si la referencia es al schema que estamos moviendo, actualizarla
      if (value.includes(`/${schemaName}`)) {
        if (fromDomain === 'common' && toDomain !== 'common') {
          // Desde common hacia un dominio específico
          updated[key] = value.replace(
            '../common.yaml#/components/schemas/',
            `./${toDomain}.yaml#/components/schemas/`
          );
        } else if (fromDomain !== 'common' && toDomain === 'common') {
          // Desde un dominio específico hacia common
          updated[key] = value.replace(
            `./${fromDomain}.yaml#/components/schemas/`,
            '../common.yaml#/components/schemas/'
          );
        }
      } else {
        updated[key] = value;
      }
    } else {
      updated[key] = updateReferences(value, fromDomain, toDomain, schemaName);
    }
  }

  return updated;
}

async function main() {
  console.log('Corrigiendo clasificación de schemas...\n');

  // 1. Leer common.yaml
  const commonContent = fs.readFileSync(COMMON_FILE, 'utf8');
  const commonSpec = yaml.load(commonContent);

  const schemasToMove = {};
  const remainingCommonSchemas = {};

  // 2. Separar schemas mal clasificados
  for (const [name, schema] of Object.entries(commonSpec.components.schemas || {})) {
    if (MISPLACED_SCHEMAS[name]) {
      const domain = MISPLACED_SCHEMAS[name];
      if (!schemasToMove[domain]) schemasToMove[domain] = {};
      schemasToMove[domain][name] = schema;
      console.log(`✓ Moviendo ${name} → ${domain}.yaml`);
    } else if (TRUE_COMMON_SCHEMAS.includes(name)) {
      remainingCommonSchemas[name] = schema;
    } else {
      console.log(`⚠ Schema desconocido en common: ${name} (se mantiene en common)`);
      remainingCommonSchemas[name] = schema;
    }
  }

  // 3. Actualizar common.yaml con solo los schemas correctos
  const newCommonSpec = {
    components: {
      schemas: remainingCommonSchemas
    }
  };

  fs.writeFileSync(
    COMMON_FILE,
    yaml.dump(newCommonSpec, { lineWidth: -1, noRefs: true }),
    'utf8'
  );
  console.log(`\n✓ common.yaml actualizado (${Object.keys(remainingCommonSchemas).length} schemas)`);

  // 4. Mover schemas a sus dominios correspondientes
  for (const [domain, schemas] of Object.entries(schemasToMove)) {
    const domainFile = path.join(BASE_DIR, 'components', 'schemas', `${domain}.yaml`);

    let domainSpec;
    if (fs.existsSync(domainFile)) {
      const content = fs.readFileSync(domainFile, 'utf8');
      domainSpec = yaml.load(content);
    } else {
      domainSpec = { components: { schemas: {} } };
    }

    // Agregar los schemas movidos
    for (const [name, schema] of Object.entries(schemas)) {
      domainSpec.components.schemas[name] = schema;
    }

    fs.writeFileSync(
      domainFile,
      yaml.dump(domainSpec, { lineWidth: -1, noRefs: true }),
      'utf8'
    );

    console.log(`✓ ${domain}.yaml actualizado (${Object.keys(domainSpec.components.schemas).length} schemas totales)`);
  }

  console.log('\n✅ Corrección completada!');
  console.log('\nResumen:');
  console.log(`  - common.yaml: ${Object.keys(remainingCommonSchemas).length} schemas`);
  for (const [domain, schemas] of Object.entries(schemasToMove)) {
    console.log(`  - ${domain}.yaml: +${Object.keys(schemas).length} schemas movidos`);
  }
}

main().catch(console.error);
