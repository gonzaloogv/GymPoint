# 📱 Guía Frontend - GymPoint Mobile

## 📋 Índice

1. [Primeros Pasos](#primeros-pasos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Cómo Crear una Nueva Pantalla](#cómo-crear-una-nueva-pantalla)
4. [Navegación](#navegación)
5. [Componentes Reutilizables](#componentes-reutilizables)
6. [Consumir Datos del Backend](#consumir-datos-del-backend)
7. [Manejo de Estado](#manejo-de-estado)
8. [Formularios y Validaciones](#formularios-y-validaciones)
9. [Estilos y Temas](#estilos-y-temas)
10. [Permisos](#permisos)
11. [Errores Comunes](#errores-comunes)
12. [Checklist de Pull Request](#checklist-de-pull-request)

---

## 🚀 Primeros Pasos

### Levantar el proyecto

```bash
# 1. Instalar dependencias
cd frontend
npm install

# 2. Iniciar el servidor de desarrollo
npm start

# 3. Opciones:
# - Presiona 'a' para Android
# - Presiona 'i' para iOS
# - Escanea el QR con Expo Go en tu celular
```

### Estructura de carpetas clave

```
frontend/
├── app/                    # ← Navegación (Expo Router)
│   ├── (tabs)/            # Pantallas con tabs (Home, Map, Profile)
│   ├── auth/              # Pantallas de autenticación
│   └── _layout.tsx        # Layout raíz
│
├── features/              # ← Funcionalidades (AQUÍ TRABAJARÁS MÁS)
│   ├── auth/
│   ├── gyms/
│   ├── routines/
│   ├── rewards/
│   └── home/
│
├── shared/                # ← Componentes compartidos
│   ├── components/        # Botones, Cards, etc.
│   ├── hooks/             # Hooks reutilizables
│   └── constants/         # Colores, temas, etc.
│
└── di/                    # ← Inyección de dependencias (NO tocar mucho)
    └── container.ts
```

---

## 🏗️ Estructura del Proyecto

### Organización por Feature

Cada funcionalidad (feature) tiene su propia carpeta con 3 capas:

```
features/gyms/
├── domain/                 # 🧠 Lógica de negocio (casos de uso)
│   ├── entities/          # Modelos de datos
│   ├── repositories/      # Contratos (interfaces)
│   └── usecases/          # Operaciones de negocio
│
├── data/                   # 💾 Conexión con backend
│   ├── dto/               # Estructura de datos de la API
│   ├── mappers/           # Convierte API → Modelo
│   ├── datasources/       # API calls con axios
│   └── RepositoryImpl.ts  # Implementación
│
└── presentation/           # 🎨 UI (DONDE TRABAJARÁS MÁS)
    ├── ui/
    │   ├── components/    # Componentes específicos de esta feature
    │   ├── screens/       # Pantallas completas
    │   └── styles/        # Estilos (si son complejos)
    ├── hooks/             # Hooks personalizados
    ├── state/             # Estado global (Zustand)
    └── index.ts           # Exportaciones públicas
```

---

## 📄 Cómo Crear una Nueva Pantalla

### Ejemplo: Crear pantalla de "Mis Entrenamientos"

#### Paso 1: Crear el componente de la pantalla

```typescript
// features/routines/presentation/ui/screens/MyWorkoutsScreen.tsx

import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoutines } from '../../hooks/useRoutines';
import { WorkoutCard } from '../components/WorkoutCard';

export function MyWorkoutsScreen() {
  // Hook personalizado que obtiene datos
  const { routines, loading, error } = useRoutines();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Entrenamientos</Text>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutCard routine={item} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
```

#### Paso 2: Crear el hook personalizado

```typescript
// features/routines/presentation/hooks/useRoutines.ts

import { useState, useEffect } from 'react';
import { DI } from '@di/container';
import { Routine } from '../../domain/entities/Routine';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      // DI.getRoutines es un UseCase del domain
      const data = await DI.getRoutines.execute();
      setRoutines(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { routines, loading, error, refresh: fetchRoutines };
}
```

#### Paso 3: Agregar a la navegación

```typescript
// app/(tabs)/routines.tsx

import { MyWorkoutsScreen } from '@features/routines';

export default function RoutinesTab() {
  return <MyWorkoutsScreen />;
}
```

---

## 🧭 Navegación

### Navegación entre pantallas (Expo Router)

```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();

  // Navegar a otra pantalla
  const goToDetail = () => {
    router.push('/gyms/detail/123'); // ← Ruta absoluta
  };

  // Navegar con parámetros
  const goToRoutine = (id: string) => {
    router.push({
      pathname: '/routines/[id]',
      params: { id },
    });
  };

  // Volver atrás
  const goBack = () => {
    router.back();
  };

  return (
    <View>
      <Button title="Ver Detalle" onPress={goToDetail} />
      <Button title="Ver Rutina" onPress={() => goToRoutine('456')} />
      <Button title="Volver" onPress={goBack} />
    </View>
  );
}
```

### Recibir parámetros en la pantalla

```typescript
// app/gyms/[id].tsx

import { useLocalSearchParams } from 'expo-router';

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Gym ID: {id}</Text>
    </View>
  );
}
```

---

## 🧩 Componentes Reutilizables

### Componentes compartidos disponibles

```typescript
// shared/components/

import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Input } from '@shared/components/Input';
import { Loading } from '@shared/components/Loading';
```

### Ejemplo: Usar el componente Button

```typescript
import { Button } from '@shared/components/Button';

function MyScreen() {
  const handlePress = () => {
    console.log('Presionado');
  };

  return (
    <View>
      {/* Botón primario */}
      <Button
        title="Guardar"
        onPress={handlePress}
        variant="primary"
      />

      {/* Botón secundario */}
      <Button
        title="Cancelar"
        onPress={handlePress}
        variant="secondary"
      />

      {/* Botón deshabilitado */}
      <Button
        title="Enviar"
        onPress={handlePress}
        disabled
      />

      {/* Botón con loading */}
      <Button
        title="Guardando..."
        onPress={handlePress}
        loading
      />
    </View>
  );
}
```

### Crear un componente reutilizable

```typescript
// shared/components/Card.tsx

import { View, StyleSheet, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = true, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.shadow,
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android
  },
});
```

---

## 🌐 Consumir Datos del Backend

### Estructura de datos

#### 1. DTO (Data Transfer Object) - Lo que devuelve la API

```typescript
// features/gyms/data/dto/GymDTO.ts

export interface GymDTO {
  id_gym: number;              // ← API usa snake_case
  name: string;
  latitude: string;            // ← API devuelve string
  longitude: string;
  month_price: number | null;
  equipment: string | null;    // ← Viene como "Pesas,Cardio,Yoga"
  created_at: string;
}
```

#### 2. Entity (Modelo de negocio) - Lo que usa la app

```typescript
// features/gyms/domain/entities/Gym.ts

export interface Gym {
  id: string;                  // ← App usa string para IDs
  name: string;
  lat: number;                 // ← Convertido a number
  lng: number;
  monthPrice?: number;         // ← Opcional y camelCase
  equipment: string[];         // ← Array de strings
  // created_at NO se incluye (no es relevante en la UI)
}
```

#### 3. Mapper - Convierte DTO → Entity

```typescript
// features/gyms/data/mappers/gym.mapper.ts

import { GymDTO } from '../dto/GymDTO';
import { Gym } from '../../domain/entities/Gym';

export function mapGymDTOToEntity(dto: GymDTO): Gym {
  return {
    id: dto.id_gym.toString(),
    name: dto.name,
    lat: parseFloat(dto.latitude),
    lng: parseFloat(dto.longitude),
    monthPrice: dto.month_price ?? undefined,
    equipment: dto.equipment ? dto.equipment.split(',') : [],
  };
}
```

### Hacer un fetch al backend

#### Paso 1: Crear el DataSource (llamada a la API)

```typescript
// features/gyms/data/datasources/GymRemote.ts

import { api } from '@shared/api/client'; // ← Cliente axios configurado
import { GymDTO } from '../dto/GymDTO';

export const GymRemote = {
  async fetchNearby(params: {
    lat: number;
    lng: number;
    radius: number;
  }): Promise<GymDTO[]> {
    const response = await api.get<GymDTO[]>('/api/v1/gyms/nearby', {
      params: {
        latitude: params.lat,
        longitude: params.lng,
        radius: params.radius,
      },
    });

    return response.data;
  },

  async fetchById(id: string): Promise<GymDTO> {
    const response = await api.get<GymDTO>(`/api/v1/gyms/${id}`);
    return response.data;
  },
};
```

#### Paso 2: Implementar el Repository

```typescript
// features/gyms/data/GymRepositoryImpl.ts

import { GymRepository } from '../domain/repositories/GymRepository';
import { Gym } from '../domain/entities/Gym';
import { GymRemote } from './datasources/GymRemote';
import { mapGymDTOToEntity } from './mappers/gym.mapper';

export class GymRepositoryImpl implements GymRepository {
  async listNearby(params: {
    lat: number;
    lng: number;
    radius: number;
  }): Promise<Gym[]> {
    const dtos = await GymRemote.fetchNearby(params);
    return dtos.map(mapGymDTOToEntity);
  }

  async getById(id: string): Promise<Gym | null> {
    try {
      const dto = await GymRemote.fetchById(id);
      return mapGymDTOToEntity(dto);
    } catch (error) {
      return null;
    }
  }
}
```

#### Paso 3: Usar en un hook

```typescript
// features/gyms/presentation/hooks/useNearbyGyms.ts

import { useState, useEffect } from 'react';
import { DI } from '@di/container';
import { Gym } from '../../domain/entities/Gym';

export function useNearbyGyms(lat: number, lng: number, radius: number = 10000) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGyms();
  }, [lat, lng, radius]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al UseCase a través del DI Container
      const data = await DI.listNearbyGyms.execute(lat, lng, radius);
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

#### Paso 4: Consumir en la UI

```typescript
// features/gyms/presentation/ui/screens/GymsMapScreen.tsx

import { useNearbyGyms } from '../../hooks/useNearbyGyms';

export function GymsMapScreen() {
  const userLat = -27.4518;
  const userLng = -58.9867;

  const { gyms, loading, error, refresh } = useNearbyGyms(userLat, userLng);

  if (loading) return <Loading />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <MapView
      initialRegion={{
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {gyms.map((gym) => (
        <Marker
          key={gym.id}
          coordinate={{ latitude: gym.lat, longitude: gym.lng }}
          title={gym.name}
        />
      ))}
    </MapView>
  );
}
```

---

## 🗄️ Manejo de Estado

### Estado local (useState)

Para datos que solo usa un componente:

```typescript
function CounterScreen() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Contador: {count}</Text>
      <Button title="+" onPress={() => setCount(count + 1)} />
      <Button title="-" onPress={() => setCount(count - 1)} />
    </View>
  );
}
```

### Estado global (Zustand)

Para datos compartidos entre múltiples pantallas:

```typescript
// features/auth/presentation/state/auth.store.ts

import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { DI } from '@di/container';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    try {
      set({ loading: true });
      const user = await DI.loginUser.execute(email, password);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      set({ loading: true });
      const user = await DI.getMe.execute();
      set({ user, isAuthenticated: !!user, loading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));
```

### Consumir el store

```typescript
// En cualquier componente

import { useAuthStore } from '@features/auth';

function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View>
      <Text>Hola, {user?.name}</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
```

---

## 📝 Formularios y Validaciones

### Formulario simple con validación

```typescript
import { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    // Validar email
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar password
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await DI.loginUser.execute(email, password);
      // Navegar a home o hacer algo
    } catch (error) {
      setErrors({ email: 'Credenciales inválidas' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, errors.email && styles.inputError]}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, errors.password && styles.inputError]}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Button title="Ingresar" onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
  },
});
```

### Usando react-hook-form (recomendado para formularios complejos)

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema de validación con Zod
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await DI.loginUser.execute(data.email, data.password);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Contraseña"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text>{errors.password.message}</Text>}

      <Button title="Ingresar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

---

## 🎨 Estilos y Temas

### Sistema de colores

```typescript
// shared/constants/colors.ts

export const Colors = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#B00020',
  text: {
    primary: '#000000',
    secondary: '#757575',
    disabled: '#9E9E9E',
  },
};
```

### Usar colores en componentes

```typescript
import { Colors } from '@shared/constants/colors';

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  text: {
    color: Colors.text.primary,
    fontSize: 16,
  },
});
```

### Espaciado consistente

```typescript
// shared/constants/spacing.ts

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Uso:
const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
});
```

### Tipografía

```typescript
// shared/constants/typography.ts

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
};

// Uso:
<Text style={Typography.h1}>Título</Text>
<Text style={Typography.body}>Contenido</Text>
```

---

## 🔐 Permisos

### Solicitar permiso de ubicación

```typescript
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      // Solicitar permiso
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      // Obtener ubicación actual
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
    } catch (err) {
      setError('Error al obtener ubicación');
    }
  };

  return { location, error, refresh: requestLocation };
}

// Uso en componente:
function MapScreen() {
  const { location, error } = useLocation();

  if (error) return <Text>{error}</Text>;
  if (!location) return <Loading />;

  return (
    <MapView
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    />
  );
}
```

### Otros permisos comunes

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

// Permiso de cámara
const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

// Permiso de galería
const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};
```

---

## ⚠️ Errores Comunes

### 1. "Cannot read property 'map' of undefined"

**Causa:** Intentas hacer `.map()` en un array que todavía no se cargó.

**Solución:**

```typescript
// ❌ MAL
const { gyms } = useNearbyGyms();
return <FlatList data={gyms} ... />; // gyms puede ser undefined

// ✅ BIEN
const { gyms } = useNearbyGyms();
return <FlatList data={gyms || []} ... />; // Usa array vacío si es undefined
```

### 2. "Each child in a list should have a unique key prop"

**Causa:** No pasaste `key` o `keyExtractor` en listas.

**Solución:**

```typescript
// ❌ MAL
{gyms.map((gym) => <GymCard gym={gym} />)}

// ✅ BIEN
{gyms.map((gym) => <GymCard key={gym.id} gym={gym} />)}

// O en FlatList:
<FlatList
  data={gyms}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <GymCard gym={item} />}
/>
```

### 3. "Warning: Cannot update a component while rendering"

**Causa:** Llamaste a `setState` durante el render.

**Solución:**

```typescript
// ❌ MAL
function MyComponent() {
  const [count, setCount] = useState(0);
  setCount(1); // ← Esto causa loop infinito
  return <Text>{count}</Text>;
}

// ✅ BIEN
function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(1); // ← Dentro de useEffect
  }, []);

  return <Text>{count}</Text>;
}
```

### 4. "Invariant Violation: Tried to render a string without a Text component"

**Causa:** Pusiste texto directamente sin envolverlo en `<Text>`.

**Solución:**

```typescript
// ❌ MAL
<View>Hola</View>

// ✅ BIEN
<View>
  <Text>Hola</Text>
</View>
```

### 5. "Network request failed"

**Causa:** Backend no está corriendo o URL incorrecta.

**Solución:**

```typescript
// 1. Verificar que el backend esté corriendo
// 2. Revisar la URL en shared/api/client.ts

// shared/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: __DEV__
    ? 'http://192.168.1.100:3000' // ← IP de tu PC en red local
    : 'https://api.gympoint.com',
  timeout: 10000,
});
```

---

## ✅ Checklist de Pull Request

Antes de hacer un PR, verifica:

### Código

- [ ] No hay errores de TypeScript (`npm run type-check`)
- [ ] No hay warnings de ESLint (`npm run lint`)
- [ ] El código está formateado (`npm run format`)
- [ ] Agregué comentarios en lógica compleja
- [ ] Eliminé `console.log` de debug

### UI

- [ ] La pantalla se ve bien en Android e iOS
- [ ] Los estados de loading se muestran correctamente
- [ ] Los errores se manejan y muestran al usuario
- [ ] Los formularios tienen validaciones
- [ ] Los botones tienen feedback visual (disabled, loading)

### Datos

- [ ] Los DTOs tienen tipos correctos
- [ ] Los mappers convierten correctamente DTO → Entity
- [ ] Los hooks manejan loading, error y data
- [ ] No hay fugas de memoria (cleanup en useEffect)

### Testing

- [ ] Probé en modo avión (sin internet)
- [ ] Probé con datos vacíos
- [ ] Probé flujos de error (401, 500, etc.)
- [ ] Probé en diferentes tamaños de pantalla

### Navegación

- [ ] La navegación funciona correctamente
- [ ] El botón "volver" funciona
- [ ] Los parámetros se pasan correctamente

---

## 📚 Recursos Adicionales

### Documentación oficial

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Zustand](https://github.com/pmndrs/zustand)

### Snippets útiles

#### useEffect con cleanup

```typescript
useEffect(() => {
  const subscription = someObservable.subscribe();

  return () => {
    subscription.unsubscribe(); // ← Cleanup
  };
}, []);
```

#### Debounce para búsquedas

```typescript
import { useState, useEffect } from 'react';

function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Uso:
function SearchScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <TextInput value={search} onChangeText={setSearch} />;
}
```

---

##

Lee [ARQUITECTURA_ACTUAL.md](ARQUITECTURA_ACTUAL.md) para entender el contexto general
Explora el código de `features/gyms` como ejemplo de referencia