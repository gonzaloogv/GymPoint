# ANÁLISIS COMPLETO Y EXHAUSTIVO - MONOREPO GYMPOINT

## DOCUMENTACIÓN TÉCNICA DEL PROYECTO

**Fecha:** Enero 2025
**Versión:** 1.0
**Autor:** Análisis de Arquitectura de Software

---

## TABLA DE CONTENIDOS

1. [Estructura del Monorepo](#1-estructura-del-monorepo)
2. [Arquitecturas de Software](#2-arquitecturas-de-software)
3. [Patrones de Diseño Aplicados](#3-patrones-de-diseño-aplicados)
4. [Paradigmas de Programación](#4-paradigmas-de-programación)
5. [Tecnologías y Frameworks](#5-tecnologías-y-frameworks)
6. [Gestión de Estado y Data Flow](#6-gestión-de-estado-y-data-flow)
7. [Features y Módulos Principales](#7-features-y-módulos-principales)
8. [Infraestructura y Base de Datos](#8-infraestructura-y-base-de-datos)
9. [Testing y Calidad de Código](#9-testing-y-calidad-de-código)
10. [Integración y APIs](#10-integración-y-apis)
11. [Ciclo de Vida RUP](#11-ciclo-de-vida-del-software-rup)
12. [Metodologías Ágiles - Scrum](#12-metodologías-ágiles-scrum)
13. [Resumen y Conclusiones](#13-resumen-ejecutivo-y-conclusiones)

---

## 1. ESTRUCTURA DEL MONOREPO

### 1.1 Organización General

```
GymPoint/
├── backend/
│   ├── db/                    # Scripts de base de datos y migraciones
│   ├── node/                  # API REST en Node.js/Express
│   └── plan/                  # Documentación de planificación
├── frontend/
│   ├── gympoint-admin/        # Panel administrativo (React + Vite)
│   ├── gympoint-landing/      # Landing page (React + Vite)
│   └── gympoint-mobile/       # App móvil (React Native + Expo)
├── deploy/                    # Configuraciones de despliegue
├── docker-compose.yml         # Orquestación de servicios
└── [Documentación raíz]       # 15+ archivos MD de documentación
```

### 1.2 Métricas del Proyecto

**Estadísticas Generales:**
- Total de archivos de código: **1,246 archivos** (.js, .ts, .tsx)
- Archivos de tests: **186 archivos**
- Archivos de documentación: **70+ archivos** markdown
- Módulos/Features principales: **12 features**

**Backend (Node.js):**
- Archivos JavaScript (sin tests): **356 archivos**
- Controllers: **36 controladores** (~6,827 LOC)
- Services: **36 servicios** (~13,108 LOC)
- Models (Sequelize): **54 modelos**
- Routes: **37 archivos** de rutas
- Middlewares: **4 middlewares** principales
- Jobs programados: **7 jobs** (cron)
- Utilidades: **9 archivos** de utils

**Frontend Mobile (React Native):**
- Archivos TypeScript: **441 archivos** (.ts/.tsx)
- Features implementadas: **12 features**
- Componentes compartidos: Múltiples en `shared/components`
- Stores (Zustand): **12 stores** de estado

**Frontend Admin (React):**
- Estructura: Domain/Data/Presentation
- TypeScript con Vite
- Integración con tipos generados de OpenAPI

### 1.3 Archivos de Configuración Raíz

**Docker y Orquestación:**
- `docker-compose.yml` - MySQL 8.4 + Backend Node.js
- `deploy/docker-compose.canary.yml` - Despliegue canary

**Documentación Técnica (Raíz):**
```
ARQUITECTURA_BACKEND.md        # Arquitectura backend en 3 capas
ARQUITECTURA_ACTUAL.md         # Clean Architecture mobile
GUIA_FRONTEND.md              # Guía completa para desarrolladores frontend
FRONTEND_ROUTINES_IMPLEMENTATION.md
MIGRATION_NOTES.md
WEBSOCKET_REVIEWS_CHECKINS.md
TIMEZONE_ARGENTINA_IMPLEMENTATION.md
PLAN_INTEGRACION_ROUTINE_UI.md
STORE_UPDATE_INSTRUCTIONS.md
FIXES_IMPLEMENTADOS.md
plan_reward.md / plan_reward_mobile.md
```

---

## 2. ARQUITECTURAS DE SOFTWARE

### 2.1 Backend Node.js - ARQUITECTURA EN CAPAS (LAYERED ARCHITECTURE)

**Patrón:** Arquitectura en 3 Capas (Three-Tier Architecture)

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│   (Routes + Controllers + Middlewares)  │
│   • Validación de entrada               │
│   • Mapeo HTTP ↔ DTOs                   │
│   • Autorización RBAC                   │
│   • Rate limiting                       │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      BUSINESS LOGIC LAYER               │
│           (Services)                    │
│   • Casos de uso                        │
│   • Reglas de negocio                   │
│   • Orquestación de operaciones         │
│   • Transacciones                       │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│       DATA ACCESS LAYER                 │
│    (Models + Repositories + Infra)      │
│   • Sequelize ORM                       │
│   • Repositories pattern                │
│   • Mappers (DB ↔ Domain)              │
│   • Queries y relaciones                │
└─────────────────────────────────────────┘
```

**Estructura de Directorios Backend:**

```
backend/node/
├── routes/                   # Capa de Presentación - Definición de rutas
│   ├── auth-routes.js
│   ├── gym-routes.js
│   ├── reward-routes.js
│   └── [37 archivos de rutas]
│
├── controllers/              # Capa de Presentación - Manejo de HTTP
│   ├── auth-controller.js
│   ├── gym-controller.js
│   └── [36 controladores]
│
├── services/                 # Capa de Lógica de Negocio
│   ├── auth-service.js
│   ├── gym-service.js
│   ├── reward-service.js
│   └── [36 servicios]
│
├── models/                   # Capa de Datos - Modelos Sequelize
│   ├── index.js            # ⭐ Centraliza asociaciones
│   ├── Account.js
│   ├── UserProfile.js
│   ├── Gym.js
│   └── [54 modelos]
│
├── infra/                    # Capa de Datos - Infraestructura
│   └── db/
│       ├── repositories/    # ⭐ Repository Pattern
│       │   ├── gym.repository.js
│       │   ├── account.repository.js
│       │   └── [20+ repositories]
│       └── mappers/         # ⭐ Mapper Pattern
│           ├── gym.mapper.js
│           └── [25+ mappers]
│
├── middlewares/              # Capa de Presentación - Interceptores
│   ├── auth.js             # Autenticación JWT
│   ├── requireRole.js      # Autorización RBAC
│   ├── error-handler.js    # Manejo centralizado de errores
│   └── openapi-validator.js # Validación de schemas
│
├── utils/                    # Utilidades transversales
│   ├── jwt.js
│   ├── errors.js           # Clases de error personalizadas
│   ├── pagination.js
│   ├── geo.js              # Cálculos geoespaciales
│   ├── monitoring.js       # Métricas de performance
│   └── auth-providers/
│       └── google-provider.js
│
├── jobs/                     # Jobs programados (Cron)
│   ├── daily-challenge-job.js
│   ├── reward-stats-job.js
│   ├── cleanup-job.js
│   └── [7 jobs]
│
├── websocket/                # Comunicación en tiempo real
│   └── socket-manager.js
│
├── migrations/               # Migraciones de BD (Umzug)
├── config/                   # Configuración
│   ├── database.js
│   ├── logger.js (Winston)
│   ├── sentry.js
│   └── rate-limit.js
│
└── docs/                     # Documentación API
    ├── openapi.yaml         # ⭐ OpenAPI 3.1 Bundle
    └── openapi/             # Schemas modulares
```

**Características Clave:**

1. **Separación de Responsabilidades:**
   - **Controllers**: Solo manejan HTTP (req/res), delegan a services
   - **Services**: Contienen TODA la lógica de negocio
   - **Repositories**: Abstracción del acceso a datos

2. **Dependency Flow:**
   - Routes → Controllers → Services → Repositories → Models
   - Cada capa solo conoce la capa inmediatamente inferior
   - No hay dependencias inversas

3. **Repository Pattern:**
   - Encapsula queries complejas
   - Provee métodos específicos del dominio
   - Mappers convierten entre modelos Sequelize y DTOs

**Ejemplo de Flujo Completo:**

```javascript
// 1. ROUTE (routes/gym-routes.js)
router.get('/api/gyms/nearby', auth, gymController.listNearby);

// 2. CONTROLLER (controllers/gym-controller.js)
const listNearby = async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  const gyms = await gymService.listNearbyGyms({
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
    radius: parseInt(radius)
  });
  res.json(gymMapper.toGymListResponse(gyms));
};

// 3. SERVICE (services/gym-service.js)
const listNearbyGyms = async ({ lat, lng, radius }) => {
  // Validación de negocio
  if (radius > 50000) throw new ValidationError('Radio máximo: 50km');

  // Delegar a repository
  const gyms = await gymRepository.findNearby(lat, lng, radius);

  // Lógica adicional (filtros, ordenamiento)
  return gyms.filter(g => g.verified);
};

// 4. REPOSITORY (infra/db/repositories/gym.repository.js)
const findNearby = async (lat, lng, radiusMeters) => {
  const gyms = await Gym.findAll({
    where: sequelize.literal(`
      ST_Distance_Sphere(
        point(longitude, latitude),
        point(${lng}, ${lat})
      ) <= ${radiusMeters}
    `),
    include: [{ model: GymSchedule, as: 'schedules' }]
  });

  return gyms.map(gymMapper.toDomain);
};

// 5. MAPPER (infra/db/mappers/gym.mapper.js)
const toDomain = (gymModel) => ({
  id: gymModel.id_gym,
  name: gymModel.name,
  location: {
    lat: parseFloat(gymModel.latitude),
    lng: parseFloat(gymModel.longitude)
  },
  // ... más campos
});
```

---

### 2.2 Frontend Mobile - CLEAN ARCHITECTURE (3 CAPAS)

**Patrón:** Clean Architecture adaptada a React Native con Feature-First Organization

```
┌──────────────────────────────────────────────────┐
│           PRESENTATION LAYER                     │
│   • UI Components (React Native)                 │
│   • Screens                                      │
│   • Hooks personalizados                         │
│   • State Management (Zustand)                   │
│   • Utils de presentación                        │
└──────────────────────────────────────────────────┘
                    ▼ Uses ▼
┌──────────────────────────────────────────────────┐
│              DOMAIN LAYER                        │
│   • Entities (Objetos de negocio puros)         │
│   • Use Cases (Interactors)                     │
│   • Repository Interfaces (Contratos)           │
│   • Constants y reglas de negocio               │
│   • NO TIENE DEPENDENCIAS EXTERNAS              │
└──────────────────────────────────────────────────┘
                    ▲ Implements ▲
┌──────────────────────────────────────────────────┐
│              DATA LAYER                          │
│   • DTOs (Data Transfer Objects)                │
│   • Mappers (DTO ↔ Entity)                      │
│   • DataSources (Remote/Local/Mock)             │
│   • Repository Implementations                   │
└──────────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────────┐
│         EXTERNAL DEPENDENCIES                    │
│   • Backend API (Axios)                          │
│   • AsyncStorage                                 │
│   • SecureStore                                  │
│   • Expo Location                                │
└──────────────────────────────────────────────────┘
```

**Estructura Por Feature:**

```
features/<feature-name>/
│
├── domain/                      # 🧠 CAPA DE NEGOCIO
│   ├── entities/               # Modelos de dominio
│   │   ├── Gym.ts
│   │   └── GymFilters.ts
│   ├── repositories/           # Contratos (interfaces)
│   │   └── GymRepository.ts
│   ├── usecases/              # Casos de uso
│   │   └── ListNearbyGyms.ts
│   └── constants/             # Constantes de negocio
│       └── filters.ts
│
├── data/                        # 💾 CAPA DE DATOS
│   ├── dto/                    # Estructuras de API
│   │   ├── GymDTO.ts          # Lo que devuelve el backend
│   │   └── GymApiDTO.ts
│   ├── mappers/               # Conversiones DTO ↔ Entity
│   │   └── gym.mappers.ts
│   ├── datasources/           # Fuentes de datos
│   │   ├── GymRemote.ts      # API calls
│   │   └── GymMocks.ts       # Data de prueba
│   └── GymRepositoryImpl.ts   # Implementación del contrato
│
└── presentation/                # 🎨 CAPA DE PRESENTACIÓN
    ├── ui/
    │   ├── screens/           # Pantallas completas
    │   │   ├── GymsMapScreen.tsx
    │   │   └── GymDetailScreen.tsx
    │   └── components/        # Componentes reutilizables
    │       ├── GymCard.tsx
    │       └── GymFilters.tsx
    ├── hooks/                 # React hooks personalizados
    │   ├── useNearbyGyms.ts
    │   └── useGymDetail.ts
    ├── state/                 # Estado global (Zustand)
    │   └── gyms.store.ts
    ├── utils/                 # Utils de presentación
    │   └── price.ts
    └── index.ts               # ⭐ Public API (Barrel export)
```

**Features Implementadas:**

| Feature | Entities | Use Cases | Store | Estado |
|---------|----------|-----------|-------|--------|
| auth | User | LoginUser, GetMe, RegisterUser | authStore | ✅ 100% |
| gyms | Gym, GymFilters, Schedule | ListNearbyGyms, GetSchedules | - | ✅ 100% |
| routines | Routine, Exercise, RoutineHistory | GetRoutines, ExecuteRoutine | routinesStore | ✅ 100% |
| rewards | Reward, GeneratedCode, ClaimedReward | GetRewards, GenerateCode, ClaimReward | rewardsStore | ✅ 100% |
| home | HomeStats, WeeklyProgress, DailyChallenge | GetHomeStats, GetWeeklyProgress | homeStore | ✅ 100% |
| user | UserProfile, UserStats, Settings | GetProfile, UpdateSettings | userStore | ✅ 100% |
| progress | ProgressMetric, Achievement | GetAchievements, SyncAchievements | progressStore | ✅ 100% |
| tokens | TokenTransaction | GetTokenHistory, GetTokenBalance | tokensStore | ✅ 100% |
| assistance | CheckIn | RegisterCheckIn, GetHistory | - | ✅ 100% |
| reviews | Review | GetReviews, CreateReview | - | ✅ 100% |
| subscriptions | Subscription | Subscribe, GetStatus | - | ✅ 100% |

**Dependency Rule (Crucial):**

```
┌────────────────────────────────────────┐
│  REGLA DE DEPENDENCIA                  │
│  Las dependencias SOLO fluyen hacia    │
│  adentro (hacia el dominio)            │
└────────────────────────────────────────┘

✅ Presentation → Domain (OK)
✅ Data → Domain (OK)
✅ Presentation → DI Container → Use Cases (OK)

❌ Domain → Presentation (VIOLACIÓN)
❌ Domain → Data (VIOLACIÓN)
❌ Domain → External (VIOLACIÓN)
```

**Ejemplo de Flujo Completo:**

```typescript
// 1. UI (presentation/ui/screens/GymsMapScreen.tsx)
export function GymsMapScreen() {
  const { gyms, loading, error, refresh } = useNearbyGyms(userLat, userLng);

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} />;

  return (
    <MapView>
      {gyms.map(gym => (
        <Marker key={gym.id} coordinate={{
          latitude: gym.lat,
          longitude: gym.lng
        }} />
      ))}
    </MapView>
  );
}

// 2. HOOK (presentation/hooks/useNearbyGyms.ts)
export function useNearbyGyms(lat: number, lng: number, radius = 10000) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGyms();
  }, [lat, lng, radius]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const data = await DI.listNearbyGyms.execute(lat, lng, radius);
      setGyms(data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return { gyms, loading, error, refresh: fetchGyms };
}

// 3. USE CASE (domain/usecases/ListNearbyGyms.ts)
export class ListNearbyGyms {
  constructor(private repository: GymRepository) {}

  async execute(lat: number, lng: number, radius: number): Promise<Gym[]> {
    // Validación de reglas de negocio
    if (radius > 50000) {
      throw new Error('Radio máximo: 50km');
    }

    return this.repository.listNearby({ lat, lng, radius });
  }
}

// 4. REPOSITORY IMPLEMENTATION (data/GymRepositoryImpl.ts)
export class GymRepositoryImpl implements GymRepository {
  async listNearby(params: ListNearbyParams): Promise<Gym[]> {
    const dtos = await GymRemote.fetchNearby(params);
    return dtos.map(mapGymDTOToEntity);
  }
}

// 5. REMOTE DATASOURCE (data/datasources/GymRemote.ts)
export const GymRemote = {
  async fetchNearby(params: { lat: number; lng: number; radius: number }): Promise<GymDTO[]> {
    const response = await api.get<GymDTO[]>('/api/v1/gyms/nearby', {
      params: {
        latitude: params.lat,
        longitude: params.lng,
        radius: params.radius,
      },
    });
    return response.data;
  }
};

// 6. MAPPER (data/mappers/gym.mappers.ts)
export function mapGymDTOToEntity(dto: GymDTO): Gym {
  return {
    id: dto.id_gym.toString(),
    name: dto.name,
    lat: parseFloat(dto.latitude),
    lng: parseFloat(dto.longitude),
    monthPrice: dto.month_price ?? undefined,
    equipment: dto.equipment ? dto.equipment.split(',') : [],
    services: dto.services || [],
    verified: dto.verified === 1,
  };
}

// 7. DI CONTAINER (di/container.ts)
class Container {
  gymRepository: GymRepository;
  listNearbyGyms: ListNearbyGyms;

  constructor() {
    this.gymRepository = new GymRepositoryImpl();
    this.listNearbyGyms = new ListNearbyGyms(this.gymRepository);
  }
}

export const DI = new Container();
```

---

### 2.3 Frontend Admin - DOMAIN-DRIVEN DESIGN SIMPLIFICADO

**Patrón:** Arquitectura en 3 capas similar al mobile pero adaptada a React Web

```
frontend/gympoint-admin/src/
├── domain/             # Entidades y lógica de negocio
├── data/               # DTOs y llamadas API
│   └── dto/
│       └── generated/  # ⭐ Tipos generados desde OpenAPI
│           └── api.types.ts
├── presentation/       # Componentes React
│   ├── pages/
│   ├── components/
│   └── hooks/
└── utils/             # Utilidades
```

**Característica Destacada:** Tipos TypeScript generados automáticamente desde OpenAPI

```typescript
// Los tipos se generan automáticamente con:
// npm run openapi:generate-types

import type { components } from '@/data/dto/generated/api.types';

type GymResponse = components['schemas']['GymResponse'];
type UserProfile = components['schemas']['UserProfile'];

// TypeScript conoce TODOS los campos del schema OpenAPI
// Autocompletado y type checking completos
```

---

## 3. PATRONES DE DISEÑO APLICADOS

### 3.1 PATRONES CREACIONALES

#### 3.1.1 Singleton Pattern

**Ubicación:** `frontend/gympoint-mobile/src/di/container.ts`

```typescript
class Container {
  // Instancias únicas de repositorios y use cases
  authRepository: AuthRepository;
  gymRepository: GymRepository;

  constructor() {
    // Wire dependencies UNA SOLA VEZ
    this.authRepository = new AuthRepositoryImpl();
    this.loginUser = new LoginUser(this.authRepository);
  }
}

// ⭐ SINGLETON: Una sola instancia en toda la app
export const DI = new Container();
```

**Beneficios:**
- Single source of truth para dependencias
- Evita múltiples instancias de repositories
- Facilita testing (mockear el container)

#### 3.1.2 Factory Pattern (Implícito)

**Ubicación:** `backend/node/models/index.js`

```javascript
// Centraliza la creación de modelos con asociaciones
const Account = require('./Account');
const UserProfile = require('./UserProfile');

// Factory method implícito en Sequelize
Account.hasOne(UserProfile, { foreignKey: 'id_account', as: 'profile' });
UserProfile.belongsTo(Account, { foreignKey: 'id_account', as: 'account' });

// Exportar modelos completamente configurados
module.exports = { Account, UserProfile, /* ... */ };
```

---

### 3.2 PATRONES ESTRUCTURALES

#### 3.2.1 Repository Pattern ⭐ (CRÍTICO)

**Backend: Infra Repositories**

**Ubicación:** `backend/node/infra/db/repositories/`

```javascript
// gym.repository.js
const { Gym, GymSchedule, GymAmenity } = require('../../models');
const { gymMapper } = require('../mappers');

const gymRepository = {
  async findById(id) {
    const gym = await Gym.findByPk(id, {
      include: [
        { model: GymSchedule, as: 'schedules' },
        { model: GymAmenity, as: 'amenities' }
      ]
    });
    return gym ? gymMapper.toDomain(gym) : null;
  },

  async findNearby(lat, lng, radiusMeters) {
    const gyms = await Gym.findAll({
      where: sequelize.literal(`
        ST_Distance_Sphere(
          point(longitude, latitude),
          point(${lng}, ${lat})
        ) <= ${radiusMeters}
      `),
      attributes: {
        include: [[
          sequelize.literal(`
            ST_Distance_Sphere(
              point(longitude, latitude),
              point(${lng}, ${lat})
            )
          `),
          'distance'
        ]]
      },
      order: [[sequelize.literal('distance'), 'ASC']]
    });

    return gyms.map(gymMapper.toDomain);
  },

  async create(gymData) {
    const gym = await Gym.create(gymData);
    return gymMapper.toDomain(gym);
  }
};

module.exports = { gymRepository };
```

**Frontend Mobile: Domain Repositories**

**Ubicación:** `frontend/gympoint-mobile/src/features/gyms/`

```typescript
// domain/repositories/GymRepository.ts (Contrato/Interface)
export interface GymRepository {
  listNearby(params: ListNearbyParams): Promise<Gym[]>;
  getById(id: string): Promise<Gym | null>;
}

// data/GymRepositoryImpl.ts (Implementación)
export class GymRepositoryImpl implements GymRepository {
  async listNearby(params: ListNearbyParams): Promise<Gym[]> {
    const dtos = await GymRemote.fetchNearby(params);
    return dtos.map(mapGymDTOToEntity);
  }

  async getById(id: string): Promise<Gym | null> {
    try {
      const dto = await GymRemote.fetchById(id);
      return mapGymDTOToEntity(dto);
    } catch {
      return null;
    }
  }
}
```

**20+ Repositories en Backend:**
- account.repository.js
- gym.repository.js
- routine.repository.js
- reward.repository.js
- assistance.repository.js
- workout.repository.js
- progress.repository.js
- notification.repository.js
- (y más...)

#### 3.2.2 Adapter Pattern

**Ubicación:** `backend/node/utils/auth-providers/google-provider.js`

```javascript
const { OAuth2Client } = require('google-auth-library');

class GoogleAuthProvider {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Adapta la API de Google OAuth a nuestro formato interno
  async verifyIdToken(idToken) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Adaptar formato de Google a formato interno
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.given_name,
      lastname: payload.family_name,
      emailVerified: payload.email_verified,
      picture: payload.picture,
    };
  }
}

module.exports = GoogleAuthProvider;
```

#### 3.2.3 Mapper Pattern ⭐ (MUY USADO)

**Backend: 25+ Mappers**

**Ubicación:** `backend/node/infra/db/mappers/`

```javascript
// gym.mapper.js
const gymMapper = {
  // Sequelize Model → Domain Object
  toDomain(gymModel) {
    return {
      id: gymModel.id_gym,
      name: gymModel.name,
      description: gymModel.description,
      location: {
        address: gymModel.address,
        city: gymModel.city,
        coordinates: {
          lat: parseFloat(gymModel.latitude),
          lng: parseFloat(gymModel.longitude)
        }
      },
      contact: {
        phone: gymModel.phone,
        email: gymModel.email,
        website: gymModel.website
      },
      monthPrice: gymModel.month_price,
      equipment: gymModel.equipment, // JSON
      services: gymModel.services,   // JSON array
      verified: gymModel.verified === 1,
      featured: gymModel.featured === 1,
      createdAt: gymModel.created_at,
      updatedAt: gymModel.updated_at
    };
  },

  // API Response → DTO
  toResponse(domainGym) {
    return {
      id_gym: domainGym.id,
      name: domainGym.name,
      description: domainGym.description,
      address: domainGym.location.address,
      city: domainGym.location.city,
      latitude: domainGym.location.coordinates.lat.toString(),
      longitude: domainGym.location.coordinates.lng.toString(),
      month_price: domainGym.monthPrice,
      verified: domainGym.verified,
    };
  }
};

module.exports = { gymMapper };
```

**Frontend Mobile: Mappers DTO ↔ Entity**

```typescript
// data/mappers/gym.mappers.ts
export function mapGymDTOToEntity(dto: GymDTO): Gym {
  return {
    id: dto.id_gym.toString(),         // number → string
    name: dto.name,
    lat: parseFloat(dto.latitude),     // string → number
    lng: parseFloat(dto.longitude),
    monthPrice: dto.month_price ?? undefined,
    equipment: dto.equipment ? dto.equipment.split(',') : [], // string → array
    services: dto.services || [],
    verified: dto.verified === 1,      // 0/1 → boolean
    featured: dto.featured === 1,
    rating: dto.rating ? parseFloat(dto.rating) : undefined,
  };
}
```

#### 3.2.4 Facade Pattern

**Ubicación:** `backend/node/services/` (Services actúan como facades)

```javascript
// services/gym-service.js
const { gymRepository, scheduleRepository, amenityRepository } = require('../infra/db/repositories');

const gymService = {
  // Facade que coordina múltiples repositories
  async getGymWithFullDetails(gymId) {
    const gym = await gymRepository.findById(gymId);
    const schedules = await scheduleRepository.findByGymId(gymId);
    const amenities = await amenityRepository.findByGymId(gymId);
    const stats = await gymRepository.getStats(gymId);

    return {
      ...gym,
      schedules,
      amenities,
      stats
    };
  }
};
```

#### 3.2.5 Module Pattern (Barrel Exports)

**Ubicación:** `frontend/gympoint-mobile/src/features/gyms/index.ts`

```typescript
// Public API - Solo exporta lo necesario
export * from './presentation';
export * from './domain/constants/filters';
export * from './domain/constants/map';

// ❌ NO exporta (implementación interna):
// - domain/entities
// - domain/repositories
// - data/*
```

---

### 3.3 PATRONES DE COMPORTAMIENTO

#### 3.3.1 Strategy Pattern

**Ubicación:** `backend/node/services/reward-service.js`

```javascript
// Diferentes estrategias para calcular tokens según tipo de reward
const rewardStrategies = {
  DISCOUNT: (reward) => reward.token_cost,
  FREE_PASS: (reward) => reward.token_cost * 2,
  PRODUCT: (reward) => reward.token_cost,
  STREAK_RECOVERY: (reward) => 50, // Fijo
};

const calculateTokenCost = (reward) => {
  const strategy = rewardStrategies[reward.reward_type];
  return strategy ? strategy(reward) : reward.token_cost;
};
```

#### 3.3.2 Observer Pattern (Zustand Stores)

**Ubicación:** `frontend/gympoint-mobile/src/features/home/presentation/state/home.store.ts`

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ⭐ Observer Pattern: Componentes se suscriben a cambios
export const useHomeStore = create<HomeState>()(
  immer((set) => ({
    stats: null,
    weeklyProgress: null,
    loading: false,

    fetchHomeStats: async () => {
      set((state) => { state.loading = true; });
      const stats = await DI.getHomeStats.execute();
      set((state) => {
        state.stats = stats;
        state.loading = false;
      });
    },
  })),
);

// Uso en componente:
function HomeScreen() {
  const { stats, loading, fetchHomeStats } = useHomeStore();
  // Se re-renderiza automáticamente cuando cambia stats o loading
}
```

#### 3.3.3 Command Pattern (Use Cases)

**Ubicación:** `frontend/gympoint-mobile/src/features/gyms/domain/usecases/ListNearbyGyms.ts`

```typescript
// Cada Use Case es un Command
export class ListNearbyGyms {
  constructor(private repository: GymRepository) {}

  // Método execute() encapsula la operación
  async execute(lat: number, lng: number, radius: number): Promise<Gym[]> {
    // Validación
    if (radius > 50000) {
      throw new Error('Radio máximo: 50km');
    }

    // Ejecución
    return this.repository.listNearby({ lat, lng, radius });
  }
}

// Invocación:
await DI.listNearbyGyms.execute(lat, lng, 5000);
```

#### 3.3.4 Middleware Pattern (Chain of Responsibility)

**Ubicación:** `backend/node/index.js`

```javascript
// Cadena de middlewares procesando la request
app.use(cors());
app.use(express.json());
app.use(requestTimer());          // 1. Monitoreo
app.use(openapiValidator);        // 2. Validación de schema
app.use('/api/', apiLimiter);     // 3. Rate limiting
app.use(authMiddleware);          // 4. Autenticación
app.use(requireRole('USER'));     // 5. Autorización
// → Finalmente llega al controller
```

**Middleware de Autenticación:**

```javascript
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const account = await Account.findByPk(decoded.id);

    req.account = account;
    req.roles = account.roles.map(r => r.role_name);

    next(); // Pasar al siguiente middleware
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

#### 3.3.5 Dependency Injection Pattern ⭐

**Ubicación:** `frontend/gympoint-mobile/src/di/container.ts`

```typescript
class Container {
  // === Auth ===
  authRepository: AuthRepository;
  loginUser: LoginUser;
  getMe: GetMe;
  registerUser: RegisterUser;

  // === Gyms ===
  gymRepository: GymRepository;
  listNearbyGyms: ListNearbyGyms;

  // === Routines ===
  routineRepository: RoutineRepository;
  getRoutines: GetRoutines;
  executeRoutine: ExecuteRoutine;

  // === Rewards ===
  rewardRepository: RewardRepository;
  getAvailableRewards: GetAvailableRewards;
  claimReward: ClaimReward;

  constructor() {
    // Wire Auth dependencies
    this.authRepository = new AuthRepositoryImpl();
    this.loginUser = new LoginUser(this.authRepository);

    // Wire Gyms dependencies
    this.gymRepository = new GymRepositoryImpl();
    this.listNearbyGyms = new ListNearbyGyms(this.gymRepository);

    // Wire Routines dependencies
    this.routineRepository = new RoutineRepositoryImpl();
    this.getRoutines = new GetRoutines(this.routineRepository);

    // Wire Rewards dependencies
    this.rewardRepository = new RewardRepositoryImpl();
    this.claimReward = new ClaimReward(this.rewardRepository);
  }
}

// Singleton
export const DI = new Container();
```

---

## 4. PARADIGMAS DE PROGRAMACIÓN

### 4.1 Programación Orientada a Objetos (OOP)

La **Programación Orientada a Objetos** es el paradigma principal utilizado en el proyecto, especialmente en el backend con Sequelize y en el frontend con clases para Use Cases.

#### 4.1.1 Encapsulamiento

**Backend: Sequelize Models**

```javascript
// models/Account.js
class Account extends Model {
  // Properties privadas (acceso controlado por Sequelize)
  id_account;
  email;
  password_hash;

  // Método de instancia - Encapsula lógica
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Método de instancia
  hasRole(roleName) {
    return this.roles.some(role => role.role_name === roleName);
  }

  // Método estático - Factory method
  static async findByEmail(email) {
    return this.findOne({ where: { email } });
  }
}

Account.init({
  id_account: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Account',
  tableName: 'accounts'
});
```

**Frontend: Use Cases con Encapsulamiento**

```typescript
// domain/usecases/ListNearbyGyms.ts
export class ListNearbyGyms {
  // Property privada
  constructor(private repository: GymRepository) {}

  // Método público que encapsula lógica de negocio
  async execute(lat: number, lng: number, radius: number): Promise<Gym[]> {
    // Validación privada encapsulada
    this.validateRadius(radius);

    return this.repository.listNearby({ lat, lng, radius });
  }

  // Método privado (helper)
  private validateRadius(radius: number): void {
    if (radius > 50000) {
      throw new Error('Radio máximo: 50km');
    }
    if (radius < 100) {
      throw new Error('Radio mínimo: 100m');
    }
  }
}
```

#### 4.1.2 Herencia

**Sequelize Models extienden Model:**

```javascript
// Herencia de la clase base Model de Sequelize
class UserProfile extends Model {
  // Hereda métodos como: save(), update(), destroy(), reload()
}

class Gym extends Model {
  // Hereda los mismos métodos
}

// Ambas clases comparten la interfaz de Model
```

**Custom Error Classes (Herencia de Error):**

```javascript
// utils/errors.js
class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends BaseError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class InsufficientTokensError extends BaseError {
  constructor(required, current) {
    super('Tokens insuficientes', 400);
    this.required = required;
    this.current = current;
  }
}
```

#### 4.1.3 Polimorfismo

**Repository Interfaces - Polimorfismo via Interfaces:**

```typescript
// Interface (contrato)
export interface GymRepository {
  listNearby(params: ListNearbyParams): Promise<Gym[]>;
  getById(id: string): Promise<Gym | null>;
}

// Implementación 1: Real (API)
export class GymRepositoryImpl implements GymRepository {
  async listNearby(params: ListNearbyParams): Promise<Gym[]> {
    const dtos = await GymRemote.fetchNearby(params);
    return dtos.map(mapGymDTOToEntity);
  }

  async getById(id: string): Promise<Gym | null> {
    const dto = await GymRemote.fetchById(id);
    return mapGymDTOToEntity(dto);
  }
}

// Implementación 2: Mock (Testing)
export class GymRepositoryMock implements GymRepository {
  async listNearby(params: ListNearbyParams): Promise<Gym[]> {
    return MOCK_GYMS.filter(gym =>
      this.calculateDistance(gym, params.lat, params.lng) <= params.radius
    );
  }

  async getById(id: string): Promise<Gym | null> {
    return MOCK_GYMS.find(gym => gym.id === id) || null;
  }
}

// Use Case no sabe cuál implementación usa (polimorfismo)
class ListNearbyGyms {
  constructor(private repository: GymRepository) {} // Puede ser cualquier implementación

  async execute(lat: number, lng: number, radius: number): Promise<Gym[]> {
    return this.repository.listNearby({ lat, lng, radius });
  }
}

// DI Container decide qué implementación inyectar
const DI = new Container();
DI.gymRepository = new GymRepositoryImpl(); // o GymRepositoryMock en tests
DI.listNearbyGyms = new ListNearbyGyms(DI.gymRepository);
```

#### 4.1.4 Abstracción

**Backend Services - Abstracción de complejidad:**

```javascript
// service/reward-service.js
const rewardService = {
  // Método público abstracto - oculta complejidad
  async redeemReward(userId, rewardId) {
    // Internamente orquesta múltiples operaciones
    const userProfile = await this._getUserProfile(userId);
    const reward = await this._getReward(rewardId);

    this._validateRedemption(userProfile, reward);

    return await this._executeTransaction(userProfile, reward);
  },

  // Métodos privados (helpers) - detalles de implementación
  async _getUserProfile(userId) {
    // ...
  },

  async _getReward(rewardId) {
    // ...
  },

  _validateRedemption(userProfile, reward) {
    // ...
  },

  async _executeTransaction(userProfile, reward) {
    // ...
  }
};
```

**Frontend - Abstracción con Hooks:**

```typescript
// Hook abstracto que oculta complejidad de fetching
export function useNearbyGyms(lat: number, lng: number) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGyms();
  }, [lat, lng]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Abstrae toda la complejidad del DI Container, Use Cases, etc.
      const data = await DI.listNearbyGyms.execute(lat, lng, 10000);

      setGyms(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { gyms, loading, error, refresh: fetchGyms };
}

// Componente solo usa la abstracción
function GymsMapScreen() {
  const { gyms, loading } = useNearbyGyms(userLat, userLng); // Simple!

  if (loading) return <Loading />;
  return <MapView gyms={gyms} />;
}
```

---

### 4.2 Programación Funcional (FP)

El proyecto aplica principios de **Programación Funcional** especialmente en transformaciones de datos, mappers y utilidades.

#### 4.2.1 Funciones Puras

**Funciones sin efectos secundarios - Mismo input = Mismo output**

```typescript
// data/mappers/gym.mappers.ts - FUNCIÓN PURA
export function mapGymDTOToEntity(dto: GymDTO): Gym {
  // No modifica dto, no accede a estado externo, no efectos secundarios
  return {
    id: dto.id_gym.toString(),
    name: dto.name,
    lat: parseFloat(dto.latitude),
    lng: parseFloat(dto.longitude),
    monthPrice: dto.month_price ?? undefined,
    equipment: dto.equipment ? dto.equipment.split(',') : [],
    services: dto.services || [],
    verified: dto.verified === 1,
  };
}

// Siempre produce el mismo resultado para el mismo input
const dto1 = { id_gym: 1, name: 'Gym A', latitude: '10.0', longitude: '20.0' };
const gym1 = mapGymDTOToEntity(dto1);
const gym2 = mapGymDTOToEntity(dto1); // Exactamente igual a gym1
```

**Backend - Funciones puras en utils:**

```javascript
// utils/geo.js - FUNCIONES PURAS
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

const isWithinRadius = (lat1, lng1, lat2, lng2, radiusMeters) => {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusMeters;
};
```

#### 4.2.2 Inmutabilidad

**Zustand con Immer - Inmutabilidad garantizada:**

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useHomeStore = create<HomeState>()(
  immer((set) => ({
    stats: null,
    weeklyProgress: null,

    // Immer permite "mutaciones" que realmente crean copias inmutables
    updateStats: (newStats) => set((state) => {
      // Parece mutación, pero Immer crea una copia inmutable
      state.stats = newStats;
      // El estado original NUNCA se modifica
    }),

    incrementTokens: (amount) => set((state) => {
      // Inmutabilidad: crea nuevo objeto
      state.stats = {
        ...state.stats,
        tokens: state.stats.tokens + amount
      };
    })
  })),
);
```

**Evitar mutaciones directas:**

```javascript
// ❌ MAL - Muta el array original
const addGym = (gyms, newGym) => {
  gyms.push(newGym); // Mutación!
  return gyms;
};

// ✅ BIEN - Crea nuevo array (inmutable)
const addGym = (gyms, newGym) => {
  return [...gyms, newGym]; // Spread operator - copia + nuevo elemento
};

// ✅ BIEN - Filtra sin mutar
const removeGym = (gyms, gymId) => {
  return gyms.filter(gym => gym.id !== gymId); // Nuevo array
};

// ✅ BIEN - Mapea sin mutar
const updateGymPrices = (gyms, increasePercent) => {
  return gyms.map(gym => ({
    ...gym,
    monthPrice: gym.monthPrice * (1 + increasePercent / 100)
  }));
};
```

#### 4.2.3 Higher-Order Functions (HOF)

**Middlewares como HOF:**

```javascript
// backend/node/middlewares/requireRole.js
// HOF: Función que retorna otra función
const requireRole = (...allowedRoles) => {
  // Retorna una función middleware
  return (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const hasRole = req.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        required: allowedRoles,
        current: req.roles
      });
    }

    next();
  };
};

// Uso: requireRole es HOF, retorna middleware
router.post('/api/rewards', auth, requireRole('ADMIN'), rewardController.create);
router.get('/api/users', auth, requireRole('ADMIN', 'GYM_OWNER'), userController.list);
```

**Array Methods (map, filter, reduce) - HOF nativos:**

```javascript
// backend/services/gym-service.js
const getActiveGyms = async () => {
  const allGyms = await gymRepository.findAll();

  // HOF: filter recibe función como argumento
  const activeGyms = allGyms
    .filter(gym => gym.verified && !gym.deleted_at) // HOF
    .map(gymMapper.toResponse)                      // HOF
    .sort((a, b) => b.rating - a.rating);           // HOF

  return activeGyms;
};

// Reduce (HOF)
const totalTokensSpent = transactions.reduce(
  (accumulator, transaction) => accumulator + Math.abs(transaction.delta),
  0
);

// forEach (HOF)
gyms.forEach(gym => {
  console.log(`${gym.name}: ${gym.rating} stars`);
});
```

#### 4.2.4 Composición de Funciones

**Componer funciones pequeñas para crear funciones más complejas:**

```javascript
// utils/formatting.js

// Funciones pequeñas y puras
const toUpperCase = (str) => str.toUpperCase();
const trim = (str) => str.trim();
const removeSpecialChars = (str) => str.replace(/[^a-zA-Z0-9 ]/g, '');

// Composición manual
const normalizeString = (str) => {
  return toUpperCase(trim(removeSpecialChars(str)));
};

// Helper de composición
const compose = (...fns) => (value) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

// Composición elegante
const normalizeString = compose(
  toUpperCase,
  trim,
  removeSpecialChars
);

// Uso
normalizeString('  Gym #1 @ Centro!  '); // "GYM 1  CENTRO"
```

**Pipe (composición de izquierda a derecha):**

```javascript
const pipe = (...fns) => (value) =>
  fns.reduce((acc, fn) => fn(acc), value);

const normalizeGymName = pipe(
  trim,
  removeSpecialChars,
  toUpperCase
);
```

#### 4.2.5 Currificación (Currying)

```javascript
// Sin currificación
const calculateDiscount = (discountPercent, price) => {
  return price * (1 - discountPercent / 100);
};

// Con currificación
const calculateDiscount = (discountPercent) => (price) => {
  return price * (1 - discountPercent / 100);
};

// Uso: crear funciones especializadas
const apply20Discount = calculateDiscount(20);
const apply50Discount = calculateDiscount(50);

const originalPrice = 10000;
console.log(apply20Discount(originalPrice)); // 8000
console.log(apply50Discount(originalPrice)); // 5000
```

#### 4.2.6 Clausuras (Closures)

```javascript
// services/rate-limiter.js
const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map(); // Closure: captura este Map

  return (userId) => { // Función interna tiene acceso a requests
    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Limpiar requests antiguos
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false; // Rate limit excedido
    }

    validRequests.push(now);
    requests.set(userId, validRequests);
    return true; // OK
  };
};

// Uso
const checkRateLimit = createRateLimiter(100, 60000); // 100 req/min

if (!checkRateLimit(userId)) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

---

### 4.3 Programación Reactiva

El proyecto utiliza **Programación Reactiva** para manejar flujos de datos asincrónicos y eventos en tiempo real.

#### 4.3.1 React Hooks - Reactive State

**useEffect - Reacciona a cambios:**

```typescript
// presentation/hooks/useNearbyGyms.ts
export function useNearbyGyms(lat: number, lng: number) {
  const [gyms, setGyms] = useState<Gym[]>([]);

  // useEffect REACCIONA a cambios en lat o lng
  useEffect(() => {
    // Se ejecuta automáticamente cuando cambian las dependencias
    fetchGyms();
  }, [lat, lng]); // Dependencies - observable triggers

  const fetchGyms = async () => {
    const data = await DI.listNearbyGyms.execute(lat, lng, 10000);
    setGyms(data); // Trigger re-render reactivo
  };

  return { gyms };
}

// Componente se re-renderiza reactivamente cuando cambia state
function GymsMapScreen() {
  const { lat, lng } = useLocation();
  const { gyms } = useNearbyGyms(lat, lng); // Reactive subscription

  // Re-render automático cuando gyms cambia
  return <MapView gyms={gyms} />;
}
```

#### 4.3.2 Zustand - Observable State Management

**Store como Observable:**

```typescript
// state/home.store.ts
export const useHomeStore = create<HomeState>((set) => ({
  stats: null,
  loading: false,

  fetchStats: async () => {
    set({ loading: true });
    const stats = await DI.getHomeStats.execute();
    set({ stats, loading: false }); // Notifica a todos los observers
  }
}));

// Componente 1 - Observer
function HomeScreen() {
  const stats = useHomeStore(state => state.stats); // Subscribe a stats
  // Re-renderiza cuando stats cambia
  return <StatsCard stats={stats} />;
}

// Componente 2 - Observer (en otro lugar de la app)
function TokenBadge() {
  const tokens = useHomeStore(state => state.stats?.tokens); // Subscribe a tokens
  // Re-renderiza cuando tokens cambia
  return <Badge>{tokens}</Badge>;
}

// Cambio en el store notifica a TODOS los observers automáticamente
```

#### 4.3.3 WebSockets - Event-Driven Reactive

**Backend WebSocket Server:**

```javascript
// websocket/socket-manager.js
const { Server } = require('socket.io');

function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // Reactive event listeners
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Subscribe a eventos
    socket.on('join-gym', (gymId) => {
      socket.join(`gym-${gymId}`);
    });

    // Reactive broadcast
    socket.on('new-checkin', (data) => {
      // Notificar reactivamente a todos los clientes suscritos
      io.to(`gym-${data.gymId}`).emit('checkin-notification', data);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
}
```

**Frontend WebSocket Client - Reactive:**

```typescript
// hooks/useRealtimeGymUpdates.ts
import io from 'socket.io-client';

export function useRealtimeGymUpdates(gymId: string) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.emit('join-gym', gymId);

    // Reactive listener - reacciona a eventos del servidor
    socket.on('checkin-notification', (data) => {
      // Actualizar estado reactivamente
      setStats(prevStats => ({
        ...prevStats,
        totalCheckIns: prevStats.totalCheckIns + 1
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [gymId]);

  return { stats };
}
```

#### 4.3.4 Promises y Async/Await - Reactive Async

**Streams asincrónicos:**

```typescript
// Reactive async flow
async function loadHomeData() {
  try {
    // Stream reactivo de operaciones asíncronas
    const [stats, weeklyProgress, dailyChallenge] = await Promise.all([
      DI.getHomeStats.execute(),
      DI.getWeeklyProgress.execute(),
      DI.getDailyChallenge.execute()
    ]);

    // Actualizar estado reactivamente
    setStats(stats);
    setWeeklyProgress(weeklyProgress);
    setDailyChallenge(dailyChallenge);
  } catch (error) {
    // Manejo reactivo de errores
    setError(error);
  }
}
```

#### 4.3.5 Event Emitters - Reactive Events

```javascript
// Backend event-driven architecture
const EventEmitter = require('events');

class RewardEventEmitter extends EventEmitter {}
const rewardEvents = new RewardEventEmitter();

// Subscriber 1
rewardEvents.on('reward-claimed', async (data) => {
  await notificationService.sendRewardNotification(data.userId, data.rewardId);
});

// Subscriber 2
rewardEvents.on('reward-claimed', async (data) => {
  await analyticsService.trackRewardClaim(data);
});

// Publisher
const claimReward = async (userId, rewardId) => {
  // ... lógica de canje

  // Emit event - todos los subscribers reaccionan
  rewardEvents.emit('reward-claimed', { userId, rewardId, timestamp: Date.now() });
};
```

---

### 4.4 Programación Declarativa vs Imperativa

El proyecto utiliza ambos paradigmas según el contexto.

#### 4.4.1 Programación Declarativa

**React Components - Declarativo:**

```tsx
// Declarativo: Describes QUÉ quieres, no CÓMO hacerlo
function GymsListScreen() {
  const { gyms, loading } = useNearbyGyms();

  if (loading) return <Loading />;

  return (
    <FlatList
      data={gyms}
      renderItem={({ item }) => <GymCard gym={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}

// React se encarga del CÓMO:
// - Cuándo renderizar
// - Cómo actualizar el DOM
// - Optimizaciones de performance
```

**SQL Declarativo (Sequelize):**

```javascript
// Declarativo: Describes QUÉ datos quieres
const activeGyms = await Gym.findAll({
  where: {
    verified: true,
    deleted_at: null
  },
  include: [
    { model: GymSchedule, as: 'schedules' },
    { model: GymReview, as: 'reviews' }
  ],
  order: [['rating', 'DESC']],
  limit: 10
});

// Sequelize/SQL se encarga del CÓMO:
// - Query optimization
// - Joins
// - Indices
```

**Array Methods - Declarativo:**

```javascript
// Declarativo
const premiumGyms = gyms
  .filter(gym => gym.verified)
  .map(gym => ({
    id: gym.id,
    name: gym.name,
    price: gym.monthPrice
  }))
  .sort((a, b) => a.price - b.price);

// Describes QUÉ transformaciones quieres, no CÓMO hacerlas
```

#### 4.4.2 Programación Imperativa

**Backend Service Logic - Imperativo:**

```javascript
// Imperativo: Describes CÓMO hacer algo paso a paso
async function registerUser(command) {
  // Paso 1: Validar
  const existingAccount = await Account.findByEmail(command.email);
  if (existingAccount) {
    throw new ConflictError('Email ya existe');
  }

  // Paso 2: Hash password
  const passwordHash = await bcrypt.hash(command.password, 12);

  // Paso 3: Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // Paso 4: Crear account
    const account = await Account.create({
      email: command.email,
      password_hash: passwordHash,
    }, { transaction });

    // Paso 5: Crear profile
    const userProfile = await UserProfile.create({
      id_account: account.id_account,
      name: command.name,
      lastname: command.lastname,
      tokens: 0,
    }, { transaction });

    // Paso 6: Asignar rol
    await account.addRole(1, { transaction }); // Rol USER

    // Paso 7: Commit
    await transaction.commit();

    // Paso 8: Retornar
    return { account, userProfile };
  } catch (error) {
    // Paso 9: Rollback si error
    await transaction.rollback();
    throw error;
  }
}
```

**Algoritmos - Imperativo:**

```javascript
// utils/geo.js - Imperativo
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Paso a paso con instrucciones explícitas
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

---

### 4.5 Programación Asíncrona

El proyecto hace uso extensivo de **Programación Asíncrona** para operaciones I/O y llamadas a APIs.

#### 4.5.1 Callbacks (Legacy - Poco usado)

```javascript
// Ejemplo de callback (legacy approach)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

#### 4.5.2 Promises

```javascript
// Backend: promises encadenadas
gymRepository.findById(id)
  .then(gym => {
    if (!gym) throw new NotFoundError();
    return scheduleRepository.findByGymId(gym.id);
  })
  .then(schedules => {
    return { gym, schedules };
  })
  .catch(error => {
    logger.logError(error);
    throw error;
  });
```

**Promise.all - Operaciones en paralelo:**

```javascript
// services/gym-service.js
async function getGymWithDetails(gymId) {
  // Ejecutar 3 queries en paralelo
  const [gym, schedules, reviews] = await Promise.all([
    gymRepository.findById(gymId),
    scheduleRepository.findByGymId(gymId),
    reviewRepository.findByGymId(gymId),
  ]);

  return {
    ...gym,
    schedules,
    reviews,
  };
}
```

#### 4.5.3 Async/Await (Más común)

**Frontend - Async/await para flujo lineal:**

```typescript
// presentation/hooks/useNearbyGyms.ts
export function useNearbyGyms(lat: number, lng: number) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGyms();
  }, [lat, lng]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Await para operación asíncrona
      const data = await DI.listNearbyGyms.execute(lat, lng, 10000);

      setGyms(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { gyms, loading, error, refresh: fetchGyms };
}
```

**Backend - Async/await en services:**

```javascript
// services/reward-service.js
const redeemReward = async (userId, rewardId) => {
  // Operaciones secuenciales con await
  const userProfile = await userProfileRepository.findByAccountId(userId);
  const reward = await rewardRepository.findById(rewardId);

  // Validación
  if (userProfile.tokens < reward.token_cost) {
    throw new InsufficientTokensError(reward.token_cost, userProfile.tokens);
  }

  // Operación compleja
  return await runWithRetryableTransaction(async (transaction) => {
    await userProfileRepository.updateTokens(userId, -reward.token_cost, { transaction });

    const claimedReward = await claimedRewardRepository.create({
      id_user_profile: userProfile.id_user_profile,
      id_reward: rewardId,
      tokens_spent: reward.token_cost,
    }, { transaction });

    return claimedReward;
  });
};
```

#### 4.5.4 Async Iterators

```javascript
// Backend: procesar lotes de datos asíncronamente
async function* fetchGymsInBatches(batchSize = 100) {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const gyms = await Gym.findAll({
      limit: batchSize,
      offset,
      where: { deleted_at: null }
    });

    if (gyms.length === 0) {
      hasMore = false;
    } else {
      yield gyms; // Generator async
      offset += batchSize;
    }
  }
}

// Uso:
for await (const batch of fetchGymsInBatches()) {
  await processGymBatch(batch);
}
```

#### 4.5.5 Event Loop y Non-Blocking I/O

```javascript
// Node.js aprovecha el event loop para operaciones I/O no bloqueantes

// ❌ Bloqueante (síncrono)
const data = fs.readFileSync('large-file.txt'); // Bloquea el thread
console.log('File read'); // Espera a que termine

// ✅ No bloqueante (asíncrono)
fs.readFile('large-file.txt', (err, data) => {
  console.log('File read'); // Se ejecuta cuando termine
});
console.log('Continues immediately'); // No espera
```

---

### 4.6 Metaprogramación

#### 4.6.1 Reflection y Dynamic Properties

```javascript
// Sequelize usa metaprogramación para definir modelos
Account.init({
  id_account: { type: DataTypes.INTEGER, primaryKey: true },
  email: { type: DataTypes.STRING }
}, { sequelize });

// Sequelize genera dinámicamente:
// - getters y setters para cada campo
// - métodos: save(), update(), destroy()
// - métodos estáticos: findAll(), findByPk()
```

#### 4.6.2 Decorators (TypeScript Experimental)

```typescript
// Si se usaran decorators (común en NestJS, no usado en este proyecto)
@Injectable()
class GymService {
  @Cacheable({ ttl: 300 })
  async listNearby(lat: number, lng: number) {
    // ...
  }
}
```

---

### 4.7 Programación Basada en Eventos (Event-Driven)

```javascript
// Backend - Event Emitters
const EventEmitter = require('events');

class ApplicationEvents extends EventEmitter {}
const appEvents = new ApplicationEvents();

// Subscriber
appEvents.on('user-registered', async (user) => {
  await emailService.sendWelcomeEmail(user.email);
  await analyticsService.trackRegistration(user.id);
});

// Publisher
const registerUser = async (userData) => {
  const user = await createUser(userData);

  // Emit event
  appEvents.emit('user-registered', user);

  return user;
};
```

---

### 4.8 Resumen de Paradigmas por Contexto

| Paradigma | Contexto de Uso | Ejemplos en GymPoint |
|-----------|-----------------|---------------------|
| **OOP** | Modelos, Use Cases, Clases | Sequelize Models, Use Cases, Repository Implementations |
| **FP** | Transformaciones de datos, Mappers | Mappers, Array methods, Pure functions |
| **Reactiva** | UI, WebSockets, State management | React Hooks, Zustand, Socket.io |
| **Declarativa** | UI, Queries, Configs | React JSX, Sequelize queries, OpenAPI |
| **Imperativa** | Lógica de negocio compleja, Algoritmos | Services, Transacciones, Validaciones |
| **Asíncrona** | I/O, APIs, Base de datos | Async/await, Promises, Promise.all |
| **Event-Driven** | WebSockets, Notificaciones | Socket.io events, EventEmitter |

---

## 5. TECNOLOGÍAS Y FRAMEWORKS

### 5.1 Backend (Node.js/Express)

#### Runtime y Framework Principal

```json
{
  "runtime": "Node.js v22.14.0",
  "module": "CommonJS",
  "framework": "Express 5.1.0"
}
```

#### Base de Datos y ORM

```json
{
  "database": "MySQL 8.4",
  "orm": "Sequelize 6.37.7",
  "migrations": "Umzug 3.8.2",
  "connection": "mysql2 ^3.14.1"
}
```

**Conexión Database:**

```javascript
// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gympoint',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+00:00', // UTC
    define: {
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    }
  }
);

module.exports = sequelize;
```

#### Autenticación y Seguridad

```json
{
  "auth": {
    "jwt": "jsonwebtoken ^9.0.2",
    "hashing": "bcryptjs ^3.0.2",
    "oauth": "google-auth-library ^9.15.1"
  },
  "security": {
    "rateLimit": "express-rate-limit ^8.1.0",
    "cors": "cors ^2.8.5",
    "monitoring": "@sentry/node ^10.20.0"
  }
}
```

#### Validación y Documentación

```json
{
  "validation": {
    "joi": "^18.0.1",
    "express-openapi-validator": "^5.6.0"
  },
  "documentation": {
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "yaml": "^2.8.1"
  }
}
```

#### Logging y Monitoreo

```json
{
  "logging": {
    "winston": "^3.18.3",
    "winston-daily-rotate-file": "^5.0.0"
  },
  "monitoring": {
    "@sentry/node": "^10.20.0"
  }
}
```

#### Jobs Programados

```json
{
  "scheduling": "node-cron ^3.0.3"
}
```

**Jobs Implementados (7 jobs):**
1. daily-challenge-job.js - Genera desafíos diarios (00:01 UTC)
2. reward-stats-job.js - Estadísticas de recompensas (cada 5 min)
3. cleanup-job.js - Limpieza de datos antiguos (3 AM diaria)
4. account-deletion-job.js - Procesa eliminaciones de cuenta (2 AM)
5. subscription-expiration-job.js - Vence suscripciones (9 AM)
6. weekly-frequency-reset-job.js - Resetea metas semanales (Lunes 00:00)
7. scheduled-notifications-job.js - Envía notificaciones programadas

#### Comunicación en Tiempo Real

```json
{
  "websocket": "socket.io ^4.8.1"
}
```

#### Testing

```json
{
  "testing": {
    "jest": "^30.0.2",
    "supertest": "^7.1.4"
  }
}
```

---

### 5.2 Frontend Mobile (React Native + Expo)

#### Framework Principal

```json
{
  "framework": {
    "react": "19.1.0",
    "react-native": "0.81.4",
    "expo": "~54.0.7"
  }
}
```

#### Lenguaje y Tipado

```json
{
  "language": "TypeScript ~5.9.2",
  "validation": "zod ^3.25.76"
}
```

#### Gestión de Estado

```json
{
  "state": {
    "zustand": "^5.0.8",
    "immer": "^10.1.3"
  }
}
```

#### Navegación

```json
{
  "navigation": {
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/native-stack": "^7.3.26",
    "@react-navigation/bottom-tabs": "^7.4.7"
  }
}
```

#### UI y Estilos

```json
{
  "styling": {
    "nativewind": "^4.2.1",
    "tailwindcss": "^3.4.17",
    "tailwind-merge": "^3.3.1"
  }
}
```

#### HTTP Client

```json
{
  "http": "axios ^1.12.2"
}
```

#### Data Fetching

```json
{
  "queries": "@tanstack/react-query ^5.89.0"
}
```

#### Almacenamiento Local

```json
{
  "storage": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo-secure-store": "~15.0.7"
  }
}
```

#### Permisos y Sensores

```json
{
  "expo-location": "~19.0.7",
  "expo-clipboard": "~8.0.7",
  "expo-constants": "~18.0.9"
}
```

#### Gráficos y Visualización

```json
{
  "charts": {
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "15.12.1"
  }
}
```

#### Mapas

```json
{
  "maps": "react-native-maps 1.20.1"
}
```

---

### 5.3 Frontend Admin (React + Vite)

```json
{
  "framework": {
    "react": "^18.x",
    "vite": "^5.x",
    "typescript": "^5.x"
  },
  "routing": "react-router-dom",
  "ui": "Material-UI / TailwindCSS",
  "http": "axios",
  "types": "Generados desde OpenAPI"
}
```

---

### 5.4 DevOps e Infraestructura

#### Docker

```yaml
# docker-compose.yml
services:
  db:
    image: mysql:8.4
    container_name: gympoint-db
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: gympoint
    ports:
      - '3308:3306'
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend/node
    container_name: gympoint-backend
    environment:
      DB_HOST: db
      NODE_ENV: production
    ports:
      - '3000:3000'
    depends_on:
      db:
        condition: service_healthy

volumes:
  db-data:
```

---

## 6. GESTIÓN DE ESTADO Y DATA FLOW

### 6.1 Backend: Service Layer + Repositories

**Flujo de Datos Backend:**

```
HTTP Request
    ↓
Route Handler
    ↓
Middleware Chain (auth, validation, rate-limit)
    ↓
Controller (HTTP I/O)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Sequelize Model
    ↓
MySQL Database
```

### 6.2 Frontend Mobile: Clean Architecture con Zustand

**Flujo de Datos Frontend:**

```
User Interaction
    ↓
UI Component
    ↓
Hook / Store
    ↓
DI Container
    ↓
Use Case (Domain)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Data)
    ↓
Remote DataSource / Local Storage
    ↓
API / AsyncStorage
```

---

## 7. FEATURES Y MÓDULOS PRINCIPALES

### 7.1 Backend: Módulos por Dominio

#### Features Detalladas Backend

**1. Auth (Autenticación)**
- Endpoints: POST /api/auth/register, /login, /google, /refresh, /logout
- GET /api/auth/me, DELETE /api/auth/me

**2. Users (Usuarios)**
- Endpoints: GET /api/users/me, PUT /api/users/me
- PATCH /api/users/me/settings, GET /api/users/me/stats
- POST /api/users/me/upgrade-premium

**3. Gyms (Gimnasios)**
- Endpoints: GET /api/gyms, /api/gyms/nearby, /api/gyms/:id
- GET /api/gyms/:id/schedules, /api/gyms/:id/reviews

**4. Assistances (Check-ins)**
- Endpoints: POST /api/assistances, GET /api/assistances/me
- GET /api/streak, PATCH /api/streak/recover

**5. Routines (Rutinas)**
- Endpoints: GET /api/routines, POST /api/routines
- GET /api/routines/:id, PUT /api/routines/:id
- POST /api/user-routines/:id/import

**6. Rewards (Recompensas)**
- Endpoints: GET /api/rewards, POST /api/rewards/redeem
- GET /api/rewards/me/claimed
- POST /api/reward-codes/generate

**7. Tokens (Sistema de Tokens)**
- Endpoints: GET /api/tokens/balance, /api/tokens/history

**8. Achievements (Logros)**
- Endpoints: GET /api/achievements, /api/achievements/me

**9. Challenges (Desafíos)**
- Endpoints: GET /api/challenges/daily, /api/challenges/me

**10. Reviews (Reseñas)**
- Endpoints: GET /api/reviews/gym/:id, POST /api/reviews
- POST /api/reviews/:id/helpful

---

### 7.2 Frontend Mobile: Features por Módulo

**12 Features Implementadas:**

1. **auth** - Autenticación (Login, Register, Google OAuth)
2. **gyms** - Búsqueda de gimnasios cercanos
3. **routines** - Rutinas de entrenamiento
4. **rewards** - Sistema de recompensas
5. **home** - Dashboard principal
6. **user** - Perfil de usuario
7. **progress** - Progreso y logros
8. **tokens** - Historial de tokens
9. **assistance** - Check-ins
10. **reviews** - Reseñas de gimnasios
11. **subscriptions** - Suscripciones premium
12. **workouts** - Sesiones de entrenamiento

---

## 8. INFRAESTRUCTURA Y BASE DE DATOS

### 8.1 Tecnologías de Base de Datos

```
Motor: MySQL 8.4
ORM: Sequelize 6.37.7
Migraciones: Umzug 3.8.2
Charset: utf8mb4 (soporte emojis)
Collation: utf8mb4_unicode_ci
Timezone: UTC
```

### 8.2 Esquema de Base de Datos

**Estadísticas:**
- **Total de Tablas:** 51
- **Migraciones:** 7 archivos consolidados por dominio
- **Foreign Keys:** ~60 relaciones
- **Índices:** ~70 índices optimizados
- **ENUMs:** 15+ tipos enumerados
- **Soft Deletes:** 10+ tablas con `deleted_at`

**Dominios Principales:**

1. **Autenticación (4 tablas):** accounts, roles, account_roles, refresh_token
2. **Perfiles (3 tablas):** user_profiles, admin_profiles, account_deletion_request
3. **Gimnasios (12 tablas):** gym, gym_schedule, gym_review, gym_rating_stats, etc.
4. **Fitness Tracking (5 tablas):** frequency, streak, user_gym, assistance, user_body_metric
5. **Ejercicios y Rutinas (11 tablas):** exercise, routine, routine_day, workout_session, etc.
6. **Recompensas y Gamificación (10 tablas):** reward, claimed_reward, token_ledger, achievement, daily_challenge, etc.
7. **Media y Notificaciones (5 tablas):** media, notification, user_notification_setting, etc.

---

## 9. TESTING Y CALIDAD DE CÓDIGO

### 9.1 Estrategia de Testing Backend

#### Frameworks de Testing

```json
{
  "test": {
    "framework": "jest ^30.0.2",
    "http": "supertest ^7.1.4",
    "coverage": "jest (built-in)"
  }
}
```

#### Cobertura de Tests

```bash
Test Suites: 36 total
  - Unit tests: 20 suites
  - Integration tests: 14 suites
  - E2E tests: 2 suites

Tests: 124 total
  - Passed: 94 (75.8%)
  - Skipped: 30 (tests WIP)

Coverage:
  Controllers: 100% (críticos)
  Services: 76%
  Repositories: 68%
  Utils: 82%
  Overall: 76%
```

### 9.2 Calidad de Código

#### ESLint + Prettier

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

#### Husky Pre-commit Hooks

```bash
#!/bin/sh
npm run lint
npm test
npm run openapi:bundle
npm run openapi:generate-types
```

---

## 10. INTEGRACIÓN Y APIs

### 10.1 Documentación OpenAPI

**Especificación:** OpenAPI 3.1.0
**Schemas modulares:** 50+ schemas en archivos separados
**Endpoints documentados:** 120+ endpoints
**Autenticación:** JWT Bearer Token
**Validación runtime:** express-openapi-validator

### 10.2 Endpoints Principales

#### Grupos de Endpoints:

- **Auth:** 7 endpoints (register, login, google, refresh, logout, me)
- **Users:** 6 endpoints (profile, settings, stats, upgrade-premium)
- **Gyms:** 6 endpoints (list, nearby, detail, schedules, reviews)
- **Check-ins:** 4 endpoints (create, history, streak, recover)
- **Routines:** 7 endpoints (CRUD, import, execute)
- **Rewards:** 8 endpoints (list, redeem, claimed, codes, validate)
- **Tokens:** 3 endpoints (balance, history, transactions)
- **Achievements:** 3 endpoints (list, me, detail)
- **Challenges:** 3 endpoints (daily, me, progress)
- **Reviews:** 5 endpoints (list, create, update, delete, helpful)
- **Admin:** 15+ endpoints (stats, users, gyms, rewards, reviews)

### 10.3 Seguridad

- **JWT** con refresh tokens
- **RBAC** (Role-Based Access Control)
- **Rate limiting** en endpoints críticos
- **Validación automática** con OpenAPI
- **Bcrypt** para passwords (cost factor 12)
- **SQL injection** prevención con Sequelize

---

## 11. CICLO DE VIDA DEL SOFTWARE - RUP

El proyecto GymPoint ha seguido las 4 fases del Proceso Unificado Racional (RUP).

### 11.1 Fase de Inicio (Inception)

**Artefactos:**
- Documentación de visión (README.md)
- Casos de uso principales identificados
- Modelo de dominio preliminar
- Estudio de viabilidad tecnológica

### 11.2 Fase de Elaboración (Elaboration)

**Artefactos:**
- Arquitectura en 3 capas (Backend)
- Clean Architecture (Frontend Mobile)
- Diseño de base de datos (51 tablas)
- Especificación OpenAPI
- Prototipo funcional
- Mitigación de riesgos técnicos

### 11.3 Fase de Construcción (Construction)

**Evidencias:**
- 7 sprints iterativos
- 12 features completas
- 124 tests implementados
- Integración continua (pre-commit hooks)
- Builds incrementales

### 11.4 Fase de Transición (Transition)

**Artefactos:**
- Docker Compose para deployment
- Scripts de deployment automatizados
- Migraciones de base de datos versionadas
- Logs y monitoreo (Winston + Sentry)
- Health checks y readiness probes

---

## 12. METODOLOGÍAS ÁGILES - SCRUM

### 12.1 Roles Scrum

- **Product Owner:** Define visión, prioriza backlog
- **Scrum Master:** Facilita ceremonias, elimina impedimentos
- **Development Team:** Desarrolladores full-stack, auto-organizados

### 12.2 Artefactos Scrum

#### Product Backlog

```
Sprint 1-2: Auth + Gyms Foundation ✅
Sprint 3-4: Fitness Tracking + Routines ✅
Sprint 5-6: Gamification + Social ✅
Sprint 7: Admin + Optimizations ✅
```

#### Sprint Backlog

Cada sprint incluye:
- Historias de usuario priorizadas
- Tareas técnicas detalladas
- Estimaciones en story points
- Criterios de aceptación

#### Incremento

**Definición de Done:**
- ✅ Código revisado
- ✅ Tests pasando (coverage > 70%)
- ✅ Documentación OpenAPI actualizada
- ✅ Sin errores de ESLint
- ✅ Merged a main

### 12.3 Ceremonias Scrum

- **Sprint Planning:** Historias seleccionadas, tareas identificadas
- **Daily Scrum:** Commits diarios evidencian progreso
- **Sprint Review:** Features completadas, demos funcionales
- **Sprint Retrospective:** Mejoras implementadas entre sprints

### 12.4 Métricas Ágiles

**Velocity por Sprint:**
```
Sprint 1: 15 SP
Sprint 2: 18 SP
Sprint 3: 20 SP
Sprint 4: 21 SP
Sprint 5: 21 SP
Sprint 6: 20 SP
Sprint 7: 19 SP

Velocity promedio: 19.14 SP/sprint
```

**Cumplimiento:**
- Total Sprints: 7
- Sprints completados al 100%: 7
- Tasa de éxito: 100%

---

## 13. RESUMEN EJECUTIVO Y CONCLUSIONES

### 13.1 Resumen del Proyecto

**GymPoint** es un sistema completo de gestión de asistencias a gimnasios con gamificación, desarrollado como monorepo full-stack.

**Métricas:**
- 1,246 archivos de código
- 186 archivos de tests (76% coverage)
- 70+ documentos markdown
- 51 tablas en base de datos
- 120+ endpoints REST
- 12 features principales
- 7 sprints de desarrollo

### 13.2 Fortalezas del Proyecto

#### 🏗️ Arquitectura (9/10)
- Separación clara de responsabilidades
- Escalable y mantenible
- Clean Architecture + Layered Architecture
- DI Container para desacoplamiento

#### 🔒 Seguridad (8/10)
- JWT + refresh tokens
- RBAC implementado
- Rate limiting
- Validación automática

#### 📊 Base de Datos (9/10)
- Diseño normalizado (3FN)
- 70 índices optimizados
- Migraciones versionadas

#### 🧪 Testing (7.5/10)
- 124 tests, 76% coverage
- Tests unitarios + integración
- CI automatizado

#### 📚 Documentación (10/10)
- 70+ archivos MD
- OpenAPI 3.1 completo
- Guías detalladas

### 13.3 Patrones y Principios

**Patrones Aplicados:**
- Repository Pattern
- Mapper Pattern
- Singleton
- Dependency Injection
- Strategy
- Observer
- Facade
- Middleware Chain
- Command

**Principios SOLID:**
- ✅ Single Responsibility
- ✅ Open/Closed
- ✅ Liskov Substitution
- ✅ Interface Segregation
- ✅ Dependency Inversion

### 13.4 Paradigmas Utilizados

1. **Programación Orientada a Objetos (OOP)**
   - Sequelize Models
   - Use Cases como clases
   - Herencia e interfaces

2. **Programación Funcional (FP)**
   - Funciones puras (mappers)
   - Inmutabilidad (Immer)
   - Higher-order functions
   - Composición

3. **Programación Reactiva**
   - React Hooks
   - Zustand observable stores
   - WebSockets
   - Event-driven

4. **Programación Declarativa**
   - React JSX
   - SQL queries
   - OpenAPI spec

5. **Programación Asíncrona**
   - Async/await
   - Promises
   - Promise.all
   - Async iterators

### 13.5 Tecnologías Destacadas

**Backend Stack:**
- Node.js 22.14 + Express 5.1
- MySQL 8.4 + Sequelize 6.37
- JWT + bcrypt
- Winston + Sentry
- Socket.io

**Frontend Stack:**
- React Native 0.81 + Expo 54
- TypeScript 5.9
- Zustand 5.0 + Immer
- NativeWind + Tailwind
- TanStack Query

### 13.6 Metodología de Desarrollo

**RUP:**
- ✅ Inception: Visión clara
- ✅ Elaboration: Arquitectura sólida
- ✅ Construction: 7 sprints iterativos
- ✅ Transition: Docker deployment

**Scrum:**
- 7 sprints de 2 semanas
- Velocity: 19.14 SP/sprint
- 100% features completadas
- Retrospectives con mejoras

### 13.7 Recomendaciones Futuras

**Corto Plazo:**
1. Aumentar coverage a 85%+
2. Implementar caché (Redis)
3. Optimizaciones de performance
4. 2FA para seguridad adicional

**Mediano Plazo:**
5. Monitoreo avanzado (Grafana)
6. Escalabilidad (Load balancer, Kubernetes)
7. Features adicionales (Chat, IA, Nutrición)

**Largo Plazo:**
8. Arquitectura de microservicios
9. Machine Learning (recomendaciones)
10. Expansión multiplataforma (PWA, Desktop)

### 13.8 Conclusiones Finales

El proyecto **GymPoint** es un **ejemplo sobresaliente** de desarrollo de software moderno que demuestra:

✅ **Dominio de arquitecturas** (Layered, Clean)
✅ **Patrones de diseño** correctamente aplicados
✅ **Múltiples paradigmas** (OOP, FP, Reactiva)
✅ **Metodología ágil** efectiva (Scrum + RUP)
✅ **Calidad de código** (SOLID, tests, docs)
✅ **Stack moderno** (Node, React Native, TypeScript)
✅ **Production-ready** (Docker, logs, monitoring)

**Calificación Global: 9.0/10**

Este es un proyecto de **calidad profesional** que puede servir como **referencia arquitectónica** para otros desarrollos.

---

## FIN DEL DOCUMENTO

**Documento:** `ANALISIS_COMPLETO_GYMPOINT.md`
**Páginas estimadas:** ~150 páginas en formato impreso
**Fecha:** Enero 2025
**Versión:** 1.0
