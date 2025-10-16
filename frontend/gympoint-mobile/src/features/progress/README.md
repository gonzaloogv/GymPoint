# Feature: Progress

## Descripción
Este feature maneja el progreso del usuario en GymPoint, incluyendo rachas, entrenamientos semanales, progreso físico, progreso por ejercicio, logros y tendencias.

## Arquitectura

### Domain Layer
- **Entities**: `Progress`, `StreakData`, `WeeklyData`, `PhysicalProgress`, `ExerciseProgress`, `Achievement`, `TrendData`
- **Repositories**: `ProgressRepository`
- **Use Cases**: `GetProgress`

### Data Layer
- **DTOs**: `ProgressDTO`
- **Mappers**: `progressMapper`
- **Data Sources**: `ProgressLocal` (mock data)
- **Repository Implementation**: `ProgressRepositoryImpl`

### Presentation Layer
- **Hooks**: `useProgress`
- **State**: `useProgressStore` (Zustand)
- **Components**:
  - `ProgressHeader`: Encabezado de la pantalla
  - `StreakCard`: Tarjeta de racha y estadísticas semanales
  - `TokenTipsButton`: Botón para ver tips de tokens
  - `ProgressSection`: Sección clickeable de progreso
  - `AchievementsBadge`: Tarjeta de logros
- **Screens**: `ProgressScreen`

## Uso

### En una pantalla
```typescript
import { ProgressScreen } from '@features/progress';

// En tu componente de navegación
<ProgressScreen userId="user-1" />
```

### Usando el hook directamente
```typescript
import { useProgress } from '@features/progress/presentation/hooks';

const MyComponent = () => {
  const { progress, loading, error } = useProgress('user-1');

  if (loading) return <Spinner />;
  if (error) return <Error />;

  return <div>{progress.streak.currentStreak} días</div>;
};
```

## Integración con DI

El feature está completamente integrado con el contenedor de inyección de dependencias:

```typescript
// En container.ts
progressLocal: ProgressLocal;
progressRepository: ProgressRepository;
getProgress: GetProgress;

// Inicialización
this.progressLocal = new ProgressLocal();
this.progressRepository = new ProgressRepositoryImpl(this.progressLocal);
this.getProgress = new GetProgress(this.progressRepository);
```

## Datos Mock

Actualmente, el feature usa datos mock a través de `ProgressLocal`. Los datos incluyen:
- Racha de 14 días
- 4 entrenamientos esta semana
- Progreso físico (peso, medidas, composición corporal)
- Progreso en ejercicios (Press Banca, Sentadilla)
- 6 logros obtenidos
- Tendencias de volumen y peso

## TODO
- [ ] Conectar con API real
- [ ] Implementar persistencia local con AsyncStorage
- [ ] Agregar pantallas de detalle (progreso físico, ejercicios, logros, tendencias)
- [ ] Implementar navegación entre pantallas
- [ ] Agregar gráficos para visualizar tendencias
