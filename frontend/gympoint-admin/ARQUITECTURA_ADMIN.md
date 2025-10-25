# 🏗️ Arquitectura del Panel de Administración

## 📐 Estructura de Carpetas

```
gympoint-admin/
├── src/
│   ├── main.tsx                      # Punto de entrada
│   ├── App.tsx                       # Configuración de rutas
│   │
│   ├── context/                      # Contextos de React
│   │   └── ThemeContext.tsx          # Tema claro/oscuro
│   │
│   ├── domain/                       # Capa de Dominio (Clean Architecture)
│   │   ├── entities/                 # Entidades del dominio
│   │   │   ├── User.ts
│   │   │   ├── Gym.ts
│   │   │   ├── Reward.ts
│   │   │   ├── Exercise.ts
│   │   │   ├── RoutineTemplate.ts
│   │   │   ├── Review.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── DailyChallenge.ts
│   │   │   └── Achievement.ts
│   │   │
│   │   └── repositories/             # Interfaces de repositorios
│   │       ├── UserRepository.ts
│   │       ├── GymRepository.ts
│   │       ├── RewardRepository.ts
│   │       └── ...
│   │
│   ├── data/                         # Capa de Datos
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   └── generated/            # ✨ Tipos generados desde OpenAPI
│   │   │       └── api.types.ts
│   │   │
│   │   ├── repositories/             # Implementaciones de repositorios
│   │   │   ├── UserRepositoryImpl.ts
│   │   │   ├── GymRepositoryImpl.ts
│   │   │   ├── RewardRepositoryImpl.ts
│   │   │   └── ...
│   │   │
│   │   ├── mappers/                  # Mappers DTO ↔ Domain
│   │   │   ├── UserMappers.ts
│   │   │   ├── GymMappers.ts
│   │   │   ├── RewardMappers.ts
│   │   │   └── ...
│   │   │
│   │   └── api/                      # Cliente HTTP
│   │       └── apiClient.ts
│   │
│   └── presentation/                 # Capa de Presentación
│       ├── pages/                    # Páginas principales
│       │   ├── Dashboard.tsx
│       │   ├── Users.tsx
│       │   ├── Gyms.tsx
│       │   ├── Rewards.tsx
│       │   ├── Reviews.tsx
│       │   ├── RoutineTemplates.tsx
│       │   ├── Exercises.tsx
│       │   ├── DailyChallenges.tsx
│       │   ├── Transactions.tsx
│       │   ├── Achievements.tsx
│       │   └── Login.tsx
│       │
│       ├── components/               # Componentes reutilizables
│       │   ├── layout/               # Componentes de layout
│       │   │   ├── Layout.tsx
│       │   │   └── Navbar.tsx
│       │   │
│       │   ├── ui/                   # Componentes UI básicos
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Loading.tsx
│       │   │   └── ...
│       │   │
│       │   ├── gyms/                 # Componentes específicos de gimnasios
│       │   ├── rewards/              # Componentes específicos de recompensas
│       │   ├── daily-challenges/     # Componentes específicos de desafíos
│       │   └── achievements/         # Componentes específicos de logros
│       │
│       ├── hooks/                    # Custom Hooks
│       │   ├── useAuth.ts
│       │   ├── useUsers.ts
│       │   ├── useGyms.ts
│       │   ├── useRewards.ts
│       │   ├── useExercises.ts
│       │   ├── useRoutineTemplates.ts
│       │   ├── useReviews.ts
│       │   ├── useTransactions.ts
│       │   ├── useDailyChallenges.ts
│       │   ├── useAchievements.ts
│       │   └── ...
│       │
│       └── utils/                    # Utilidades
│           ├── formatters.ts
│           ├── validators.ts
│           └── cron.ts
│
├── public/                           # Archivos estáticos
├── index.html                        # HTML principal
├── package.json                      # Dependencias
├── tsconfig.json                     # Configuración TypeScript
├── vite.config.js                    # Configuración Vite
├── tailwind.config.ts                # Configuración Tailwind
└── RUTAS_Y_FUNCIONALIDADES.md        # ✨ Documentación de rutas
```

---

## 🔄 Flujo de Datos (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Pages   │ ←→ │  Hooks   │ ←→ │Components│                  │
│  └──────────┘    └──────────┘    └──────────┘                  │
│       ↓               ↓                                          │
└───────────────────────────────────────────────────────────────┘
        ↓               ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                               │
│  ┌──────────────┐         ┌──────────────────┐                 │
│  │   Entities   │         │ Repository Interfaces│              │
│  │  (Types)     │         │  (Contracts)     │                 │
│  └──────────────┘         └──────────────────┘                 │
│                                   ↑                              │
└───────────────────────────────────────────────────────────────┘
                                    ↑
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Repositories │ ←→ │ Mappers  │ ←→ │   DTOs   │             │
│  │     Impl     │    │          │    │          │             │
│  └──────────────┘    └──────────┘    └──────────┘             │
│         ↓                                                        │
│  ┌──────────────┐                                               │
│  │  API Client  │                                               │
│  └──────────────┘                                               │
└───────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                 │
│                   (Node.js + Express)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Ejemplo de Flujo Completo: Crear Gimnasio

### 1. Usuario Interactúa con la UI

```typescript
// presentation/pages/Gyms.tsx
const Gyms = () => {
  const createMutation = useCreateGym();
  
  const handleSubmit = (data: CreateGymDTO) => {
    createMutation.mutate(data);
  };
  
  return <GymForm onSubmit={handleSubmit} />;
};
```

### 2. Hook Usa el Repositorio

```typescript
// presentation/hooks/useGyms.ts
export const useCreateGym = () => {
  const gymRepository = new GymRepositoryImpl();
  
  return useMutation({
    mutationFn: (data: CreateGymDTO) => gymRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gyms']);
    }
  });
};
```

### 3. Repositorio Mapea y Llama al API

```typescript
// data/repositories/GymRepositoryImpl.ts
export class GymRepositoryImpl implements GymRepository {
  async create(dto: CreateGymDTO): Promise<Gym> {
    // Mapper: Domain → Request DTO
    const request = mapCreateGymDTOToRequest(dto);
    
    // API Call
    const response = await apiClient.post('/api/gyms', request);
    
    // Mapper: Response DTO → Domain
    return mapGymResponseToGym(response.data);
  }
}
```

### 4. Mappers Transforman los Datos

```typescript
// data/mappers/GymMappers.ts

// Domain → API Request
export const mapCreateGymDTOToRequest = (dto: CreateGymDTO) => ({
  name: dto.name,
  description: dto.description,
  city: dto.city,
  // ... más campos
  equipment: dto.equipment || [],
  rules: dto.rules || [],
  amenities: dto.amenities || []
});

// API Response → Domain
export const mapGymResponseToGym = (response: any): Gym => ({
  idGym: response.id_gym,
  name: response.name,
  description: response.description,
  // ... más campos
  equipment: response.equipment || [],
  rules: response.rules || [],
  amenities: response.amenities || []
});
```

### 5. API Client Hace la Petición HTTP

```typescript
// data/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 🔑 Patrones de Diseño Utilizados

### 1. **Clean Architecture**
Separación en capas:
- **Presentation**: UI, componentes, hooks
- **Domain**: Entidades, interfaces de repositorios
- **Data**: Implementaciones, mappers, API client

**Beneficios**:
- ✅ Testeable
- ✅ Independiente del framework
- ✅ Fácil de mantener

### 2. **Repository Pattern**
Abstracción del acceso a datos mediante interfaces

```typescript
// domain/repositories/GymRepository.ts
export interface GymRepository {
  findAll(): Promise<Gym[]>;
  findById(id: number): Promise<Gym>;
  create(dto: CreateGymDTO): Promise<Gym>;
  update(id: number, dto: UpdateGymDTO): Promise<Gym>;
  delete(id: number): Promise<void>;
}
```

**Beneficios**:
- ✅ Fácil cambiar la implementación
- ✅ Mockeable para tests
- ✅ Lógica de negocio desacoplada

### 3. **Mapper Pattern**
Transformación entre capas

```typescript
// Domain DTO → API Request
mapCreateGymDTOToRequest(dto: CreateGymDTO): CreateGymRequest

// API Response → Domain Entity
mapGymResponseToGym(response: GymResponse): Gym
```

**Beneficios**:
- ✅ Nomenclatura consistente en cada capa
- ✅ Validación y transformación centralizada
- ✅ Fácil adaptación a cambios del API

### 4. **Custom Hooks Pattern**
Lógica reutilizable encapsulada en hooks

```typescript
// presentation/hooks/useGyms.ts
export const useGyms = () => { ... }
export const useCreateGym = () => { ... }
export const useUpdateGym = () => { ... }
export const useDeleteGym = () => { ... }
```

**Beneficios**:
- ✅ Lógica reutilizable
- ✅ Componentes más limpios
- ✅ Fácil de testear

### 5. **Composition Pattern**
Componentes pequeños y componibles

```typescript
<GymForm>
  <GymBasicInfo />
  <GymContactInfo />
  <GymScheduleManager />
  <GymSpecialScheduleManager />
</GymForm>
```

**Beneficios**:
- ✅ Componentes reutilizables
- ✅ Fácil de mantener
- ✅ Mejor organización

---

## 🛠️ Tecnologías y Librerías

### Core
- **React 18**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server

### Routing
- **React Router v6**: Navegación y rutas

### State Management
- **React Query (TanStack Query)**: Server state
- **React Context**: Client state (theme)
- **Local Storage**: Persistencia (token, theme)

### Styling
- **Tailwind CSS**: Utility-first CSS
- **Custom Design System**: Componentes UI propios

### HTTP Client
- **Axios**: Peticiones HTTP

### Forms
- **React Hook Form**: (si se usa)
- **Custom Form Handling**: Manejo manual con useState

### Validation
- **Zod**: (si se usa)
- **Custom Validators**: Validación manual

---

## 📊 Gestión de Estado

### Server State (React Query)

```typescript
// Queries (GET)
const { data, isLoading, error } = useGyms();

// Mutations (POST, PUT, DELETE)
const createMutation = useCreateGym();
createMutation.mutate(data, {
  onSuccess: () => { ... },
  onError: (error) => { ... }
});
```

**Configuración Global**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Client State (React Context)

```typescript
// context/ThemeContext.tsx
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 🔐 Autenticación

### Flujo de Autenticación

```
1. Usuario ingresa credenciales en /login
   ↓
2. POST /api/auth/login
   ↓
3. Backend valida y retorna JWT
   ↓
4. Frontend guarda token en localStorage
   ↓
5. Redirect a /dashboard
   ↓
6. Todas las peticiones incluyen token en header
```

### Implementación

```typescript
// Login
const handleLogin = async (email: string, password: string) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password
  });
  
  const { tokens } = response.data;
  localStorage.setItem('admin_token', tokens.accessToken);
  
  navigate('/');
};

// Logout
const handleLogout = () => {
  localStorage.removeItem('admin_token');
  navigate('/login');
};

// Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🎨 Sistema de Diseño

### Colores (Tailwind Config)

```typescript
colors: {
  primary: '#3B82F6',      // Azul principal
  secondary: '#6B7280',    // Gris secundario
  success: '#10B981',      // Verde éxito
  danger: '#EF4444',       // Rojo peligro
  warning: '#F59E0B',      // Amarillo advertencia
  
  bg: '#F9FAFB',           // Fondo claro
  'bg-dark': '#111827',    // Fondo oscuro
  
  card: '#FFFFFF',         // Card claro
  'card-dark': '#1F2937',  // Card oscuro
  
  text: '#111827',         // Texto claro
  'text-dark': '#F9FAFB',  // Texto oscuro
  'text-muted': '#6B7280', // Texto secundario
}
```

### Componentes Base

```typescript
// Button
<Button variant="primary | secondary | danger | success" size="sm | md | lg">
  Click me
</Button>

// Card
<Card title="Título" as="article | section">
  Contenido
</Card>

// Badge
<Badge variant="primary | success | danger | warning | free | premium">
  Estado
</Badge>

// Input
<Input type="text" placeholder="..." value={...} onChange={...} />

// Select
<Select value={...} onChange={...} options={[...]} />

// Modal
<Modal isOpen={...} onClose={...} title="...">
  Contenido
</Modal>

// Table
<Table columns={...} data={...} rowKey="..." />
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

```
sm: 640px   → Mobile landscape
md: 768px   → Tablet
lg: 1024px  → Desktop
xl: 1280px  → Large desktop
2xl: 1536px → Extra large
```

### Estrategia Mobile-First

```typescript
// Mobile por defecto
<div className="grid grid-cols-1">
  
// Tablet (md)
<div className="grid grid-cols-1 md:grid-cols-2">
  
// Desktop (lg)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🧪 Testing (Pendiente)

### Estructura Recomendada

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── mappers/
│   │   ├── utils/
│   │   └── hooks/
│   │
│   ├── integration/
│   │   └── repositories/
│   │
│   └── e2e/
│       └── pages/
```

### Herramientas Sugeridas
- **Vitest**: Test runner
- **React Testing Library**: Testing de componentes
- **MSW**: Mock Service Worker para API
- **Playwright**: E2E testing

---

## 🚀 Build y Deployment

### Desarrollo

```bash
npm run dev
# → http://localhost:5173
```

### Producción

```bash
npm run build
# → Genera dist/

npm run preview
# → Preview de producción local
```

### Variables de Entorno

```env
# .env
VITE_API_URL=http://localhost:3000
```

```env
# .env.production
VITE_API_URL=https://api.gympoint.com
```

---

## 📈 Performance

### Optimizaciones Implementadas

1. **Code Splitting**: Lazy loading de rutas
2. **React Query Cache**: Caché automático de datos
3. **Memoization**: useMemo, useCallback en componentes
4. **Debounce**: En búsquedas y filtros

### Optimizaciones Pendientes

1. **Virtualización**: Para listas largas (react-window)
2. **Image Optimization**: Lazy loading de imágenes
3. **Bundle Analysis**: Analizar y reducir tamaño
4. **Service Worker**: PWA y caché offline

---

## 🔮 Roadmap Técnico

### Corto Plazo
- [ ] Tests unitarios para mappers
- [ ] Tests de integración para repositorios
- [ ] Storybook para componentes UI
- [ ] Error boundaries

### Mediano Plazo
- [ ] E2E tests con Playwright
- [ ] PWA (Service Worker)
- [ ] Internacionalización (i18n)
- [ ] Virtualización de listas

### Largo Plazo
- [ ] Migración a React Server Components
- [ ] Micro-frontends
- [ ] GraphQL en lugar de REST
- [ ] Real-time con WebSockets

---

**Última actualización**: 2025-10-25  
**Versión**: 1.0.0  
**Mantenido por**: Equipo GymPoint

