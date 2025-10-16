# Auditoría de Clean Architecture y Clean Code - Plan de Integración GymDetail

## Tabla de Validación

| Archivo/Concepto | Tipo de Error/Mejora | Recomendación Concreta |
|------------------|---------------------|------------------------|
| `GymDetail` (domain entity) | **❌ Responsabilidad poco clara** | Aclarar si `GymDetail` es una entidad de dominio o si debe existir. Si solo agrega campos a `Gym`, mejor extender la entidad `Gym` directamente en lugar de crear una nueva. Si tiene lógica de negocio diferente, justificar su existencia. |
| `GymDetailViewModel` | **❌ Violación SRP + Duplicación** | **ELIMINAR** este concepto. Los ViewModels en React/TypeScript causan confusión (no son MVVM de Android). La transformación Entity→UI debe hacerse con **funciones puras** en `presentation/mappers/` o directamente en el componente con hooks. Ejemplo: `useGymDetailPresentation(gymDetail)` que retorne objeto UI-ready. |
| `GymRepositoryImpl.getById()` | **❌ Violación SRP (hace demasiado)** | El repositorio NO debe orquestar múltiples llamadas ni componer objetos complejos. Debe solo: 1) Llamar a `/api/gyms/:id`, 2) Mapear DTO→Entity, 3) Retornar. La composición de datos (schedules, reviews, stats) debe ser responsabilidad de **`GetGymDetailUseCase`** que orqueste múltiples repositorios. |
| `GetGymDetailUseCase` | **⚠️ Falta especificar dependencias** | Debe recibir por constructor: `GymRepository`, `ScheduleRepository`, `ReviewRepository`. El caso de uso orquesta las llamadas en paralelo con `Promise.all()` y compone el objeto `GymDetail` final. NO debe conocer detalles de HTTP/API. |
| `useGymDetail` hook | **❌ Falta inyección de dependencias** | No especifica cómo obtiene el caso de uso. Debe usar **DI container** (ya existe en `di/container.ts`). Correcto: `const useCase = container.resolve('GetGymDetailUseCase'); const { data, loading } = useGymDetail(useCase, gymId);` o usar Context Provider para inyectar. |
| `GymDetailScreenWrapper` | **❌ Violación YAGNI (You Aren't Gonna Need It)** | **ELIMINAR** este wrapper innecesario. `GymDetailScreen` debe usar directamente el hook `useGymDetail`. Los wrappers agregan complejidad sin valor. Si se necesita lógica de navegación, usar el hook dentro del mismo screen. |
| `Linking.openURL()` (acciones) | **⚠️ Fuga potencial a UI** | Las acciones (llamar, email, maps) deben vivir en **`useGymActions(gym)`** hook separado, NO en el componente. Retorna funciones: `{ onCall, onEmail, onMaps }`. Esto permite testing sin React Native. Si necesita lógica compleja, crear `GymActionsService` en `services/`. |
| Cache en `GymRepositoryImpl` | **⚠️ Responsabilidad mezclada** | El cache es infraestructura transversal. Separar en **`CachedGymRepository`** (decorator pattern) que wrappea `GymRepositoryImpl`. O usar librería de cache como `react-query` en el hook. El repositorio base debe ser "tonto" (solo fetch). |
| Tabla de mapeo (Sección 2) | **❌ Mezcla niveles de abstracción** | La tabla mezcla mapeo DTO→Entity con Entity→UI. **Dividir en DOS tablas**: 1) "Backend DTO → Domain Entity" (responsabilidad de `data/mappers/`), 2) "Domain Entity → UI Props" (responsabilidad de `presentation/mappers/` o hooks). |
| `equipment` agrupamiento | **❌ No especifica responsabilidad** | Aclarar: Si backend retorna `equipment: string[]`, el **agrupamiento por categoría** NO debe hacerse en UI. Opciones: 1) Backend retorna ya agrupado, 2) `parseEquipment()` en mapper retorna `EquipmentCategory[]`, 3) Crear caso de uso `GroupEquipmentUseCase`. Nunca en componente. |
| `schedules` formateo | **⚠️ Responsabilidad poco clara** | "Formatear horarios" tiene múltiples niveles: 1) Parsear strings de backend (`data/mappers/`), 2) Detectar "abierto ahora" (lógica de negocio → `domain/services/ScheduleService`), 3) Formatear para UI (presentation helper `formatScheduleForDisplay()`). Separar explícitamente. |
| `rating.distribution` | **⚠️ Mapeo incorrecto** | La tabla dice "Array `[r1, r2, r3, r4, r5]` para barras". Esto es lógica de UI. El mapper debe retornar `{ rating_1_count, rating_2_count, ... }` (entity). La conversión a array se hace en presentation con `Object.values()` o helper `toDistributionArray()`. |
| `reviews_preview` | **⚠️ Lógica de negocio en UI** | "Tomar primeras 3" y "ordenar por helpful_count" es lógica de negocio. Debe hacerse en: 1) Backend (ideal), 2) Caso de uso con método `getReviewsPreview()`, o 3) Domain service. NO en componente ni hook de UI. |
| `pricing` formateo con currency | **✅ Correcto pero falta ubicación** | Bien identificado, pero aclarar que vive en `presentation/utils/formatters.ts` como función pura `formatCurrency(amount: number, currency: 'ARS'): string`. NO inline en componente. |
| `fecha relativa` en reviews | **✅ Correcto pero falta ubicación** | Crear helper `formatRelativeDate(date: Date): string` en `presentation/utils/formatters.ts`. Considerar usar librería `date-fns` o `dayjs` con `fromNow()`. |
| Nombres: `GymDetailScreenProps` | **⚠️ Inconsistencia** | Si se sigue el patrón, debería ser `GymDetailProps` (sin "Screen" redundante) o `GymDetailViewProps`. El sufijo "Screen" ya está en el componente. |
| Nombres: `DaySchedule` | **❌ Nombre ambiguo** | `DaySchedule` puede confundirse con "horario del día" vs "horario de UN día". Mejor: `WeekdaySchedule` o `GymScheduleEntry`. |
| Nombres: `GymActionsService` | **⚠️ Nombre genérico** | Si creas un servicio, llamarlo `DeviceActionsService` o `ExternalLinkingService` porque no es específico de gyms (call/email/maps son genéricos). Reusable en otras features. |
| `useCurrentLocation` hook | **⚠️ Falta validación de ubicación** | El plan menciona usar coordenadas del usuario pero no especifica cómo manejar permisos denegados o ubicación desactivada. Agregar estado `permissionDenied` y UI apropiada. |
| `dataSource` prop (api/mocks) | **❌ Fuga de implementación** | El prop `dataSource` en `GymDetailScreen` es detalle de implementación que NO debe llegar a UI. Remover. Si es para debug, usar `__DEV__` flag y solo mostrar en desarrollo. |
| Error boundaries | **⚠️ No especificado en arquitectura** | El plan menciona "error boundaries" al final pero no especifica dónde viven (`presentation/components/ErrorBoundary.tsx`) ni cómo se integran. Agregar al paso 6 explícitamente. |
| Telemetría en hooks | **⚠️ Violación SRP** | El plan dice "analytics solo en hooks". Esto mezcla responsabilidades. La telemetría debe estar en: 1) Capa de infraestructura (`services/analytics`), 2) Llamarse desde hooks pero NO ser parte de ellos. Usar custom hook `useAnalytics()` que wrappea el servicio. |
| `MOCK_UI` hardcoded en repository | **❌ Violación de arquitectura** | En `GymRepositoryImpl` actual, el fallback a mocks está hardcodeado. Debe inyectarse: `GymRepositoryImpl(apiService, fallbackDataSource?)`. Para tests, inyectar mock. Para prod, inyectar API. |
| Promise.all para llamadas paralelas | **✅ Correcto** | Bien identificado que schedules/reviews/stats deben cargarse en paralelo. Asegurar que un fallo NO rompa todo (usar `Promise.allSettled()` y manejar fallos individuales). |
| TTL de cache (5 min) | **⚠️ Magic number** | Bien, pero debe ser configurable: `const CACHE_TTL_MS = __DEV__ ? 30_000 : 5 * 60 * 1000;`. También considerar invalidación manual (ej: después de editar gym). |
| Skeleton screens | **⚠️ No especifica componente** | Menciona "skeleton screens" pero no dice dónde viven. Crear `<SkeletonGymDetail />` en `presentation/components/skeletons/`. Debe replicar estructura de secciones (no genérico). |
| Pull-to-refresh | **✅ Correcto** | Bien especificado "mantener contenido visible" (optimistic UI). Asegurar que el scroll no se resetee al refrescar. |
| Stale-while-revalidate | **✅ Correcto pero complejo** | Bien identificado, pero implementar esto desde cero es complejo. **Recomendación**: Usar librería `@tanstack/react-query` que ya implementa SWR, cache, retry, refetch, etc. Simplificaría mucho el código. |
| Tests unitarios de mappers | **✅ Correcto** | Bien, pero agregar: "Tests deben cubrir edge cases de tabla de mapeo (nulls, tipos incorrectos, strings vacíos)". |
| Accesibilidad `accessibilityLabel` | **⚠️ Incompleto** | Menciona labels en íconos pero no en secciones interactivas. Agregar `accessibilityRole`, `accessibilityHint`, `accessibilityState` en botones/cards. |
| i18n en pendientes | **⚠️ Debería ser desde MVP** | Si hay posibilidad de expansión, implementar i18n desde el inicio (costo bajo con `react-i18next`). Textos hardcodeados son deuda técnica que cuesta mucho refactorizar después. |
| Sección 11: "Presentation NO importa nada de presentation" | **❌ Error tipográfico** | Debe decir: "Presentation NO importa nada de `data/` (excepto tipos de error de dominio si se comparten)". Corregir typo. |
| Ejemplo de DI en container.ts | **⚠️ Incompleto** | El ejemplo muestra instanciación manual. Falta mostrar cómo se usa en el hook: `const container = useContainer(); const useCase = container.resolve(...)`. O usar Context: `const useCase = useContext(UseCaseContext).getGymDetailUseCase;`. |
| "Entidades puras, solo tipos" | **⚠️ Impreciso** | Las entidades NO son solo tipos (interfaces). Pueden tener métodos (lógica de dominio). Ejemplo: `gym.isOpenNow()`, `gym.isWithinRange(coords)`. Estos métodos NO tienen side effects y operan sobre el estado de la entidad. |
| Fallback "Sin descripción" | **⚠️ Localización hardcoded** | Los fallbacks como "Sin descripción" deben estar en archivos de i18n (`es.json`, `en.json`), no hardcoded. Usar `t('gym.no_description')`. |

## Recomendaciones Generales

### 1. Estructura de carpetas sugerida
```
features/gyms/
├── domain/
│   ├── entities/
│   │   ├── Gym.ts
│   │   ├── Schedule.ts
│   │   └── Review.ts
│   ├── repositories/
│   │   ├── GymRepository.ts (interface)
│   │   ├── ScheduleRepository.ts (interface)
│   │   └── ReviewRepository.ts (interface)
│   ├── services/
│   │   └── ScheduleService.ts (lógica: isOpenNow, etc.)
│   └── usecases/
│       └── GetGymDetailUseCase.ts
├── data/
│   ├── dto/
│   │   ├── GymDTO.ts
│   │   ├── ScheduleDTO.ts
│   │   └── ReviewDTO.ts
│   ├── mappers/
│   │   ├── gym.mappers.ts (DTO→Entity SOLO)
│   │   ├── schedule.mappers.ts
│   │   └── review.mappers.ts
│   └── repositories/
│       ├── GymRepositoryImpl.ts
│       ├── ScheduleRepositoryImpl.ts
│       └── ReviewRepositoryImpl.ts
└── presentation/
    ├── hooks/
    │   ├── useGymDetail.ts (estado + caso de uso)
    │   ├── useGymActions.ts (call/email/maps)
    │   └── useGymAnalytics.ts (telemetría)
    ├── mappers/
    │   └── gymDetailPresentation.mapper.ts (Entity→UI)
    ├── utils/
    │   └── formatters.ts (currency, date, distance)
    └── ui/
        ├── screens/
        │   └── GymDetailScreen.tsx (UN SOLO archivo)
        └── components/
            ├── GallerySection.tsx
            ├── AmenitiesSection.tsx
            └── ...
```

### 2. Flujo de datos correcto
```
Backend API
    ↓ (HTTP)
GymRepositoryImpl (data)
    ↓ (mapea DTO→Entity)
GetGymDetailUseCase (domain) ← orquesta múltiples repos
    ↓ (retorna Entity)
useGymDetail hook (presentation)
    ↓ (mapea Entity→UI con helpers)
GymDetailScreen component
    ↓ (renderiza)
UI Components (secciones)
```

### 3. Eliminaciones necesarias
- ❌ `GymDetailViewModel` → Reemplazar con funciones puras o hooks
- ❌ `GymDetailScreenWrapper` → Consolidar en `GymDetailScreen`
- ❌ Composición en repositorio → Mover a caso de uso
- ❌ `dataSource` prop en UI → Solo en logs de desarrollo

### 4. Agregar explícitamente
- ✅ `di/container.ts` configuración para inyectar casos de uso
- ✅ `presentation/mappers/` para Entity→UI (separado de data/mappers)
- ✅ `domain/services/ScheduleService` para lógica de "abierto ahora"
- ✅ `services/DeviceActionsService` para Linking (reutilizable)
- ✅ Tests con edge cases de la tabla de mapeo
- ✅ Error boundaries en estructura de componentes

### 5. Considerar librerías
- **@tanstack/react-query**: Cache, SWR, retry, refetch automático (reemplaza mucha lógica custom)
- **date-fns** o **dayjs**: Formateo de fechas relativas
- **react-i18next**: Internacionalización desde MVP

## Resumen Ejecutivo

**Violaciones críticas encontradas:**
- 🔴 3 violaciones de SRP (ViewModel, Repository, Hooks con analytics)
- 🔴 2 fugas de dependencias (Wrapper innecesario, dataSource en UI)
- 🔴 1 violación YAGNI (ViewModel conceptualmente innecesario en React)

**Mejoras necesarias:**
- 🟡 8 responsabilidades poco claras que deben especificarse
- 🟡 6 nombres inconsistentes o ambiguos
- 🟡 5 magic numbers/strings sin constantes

**Puntos fuertes del plan:**
- ✅ Buena identificación de estados UI (loading/error/empty)
- ✅ Correcta mención de Promise.all para paralelismo
- ✅ Buen enfoque en accesibilidad y telemetría
- ✅ Documentación exhaustiva de API y campos

**Acción requerida:**
Revisar el plan con las correcciones de esta auditoría antes de implementar. Priorizar la corrección de violaciones críticas (rojo) antes de proceder con código.

