# 🧹 Plan de Limpieza - Shared Components

## 📊 Análisis Actual

### ❌ Componentes NO Utilizados (eliminar completamente):

1. **FilterButton.tsx** - No se usa en features, solo en shared
2. **FilterChip.tsx** - No se usa en features
3. **GymsScreenLayout.tsx** - Redundante, cada feature tiene su layout
4. **UserProfileLayout.tsx** - Redundante, cada feature tiene su layout
5. **NavigationLayout.tsx** - Solo se usa en RootNavigator, mover inline
6. **StackNavigator.tsx** - No se usa
7. **HomeLayout.tsx** - No se usa directamente, redundante con Screen
8. **RadioGroup.tsx** - Solo se exporta, no se usa
9. **Select.tsx** - Solo se usa en examples
10. **Slider.tsx** - Solo se usa internamente en shared

### ⚠️ Hardcodes Detectados:

#### GeneratedCodeCard.tsx
```typescript
// ❌ Hardcodes:
- '#ffffff' (línea 129)
- '#111' (línea 60)
- '#635BFF' (línea 56)
- '#e5e7eb' (línea 47)
- 'USADO', 'VENCIDO', 'DISPONIBLE' (línea 80)
- 'Generado:', 'Vence:', 'Usado:' (líneas 100, 105, 113)
- 'Marcar como usado' (línea 131)
```

#### FilterSheet.tsx
```typescript
// ❌ Hardcodes:
- '#fff' (líneas 20, 60)
- '#111' (línea 60)
- '#635BFF' (línea 56)
- '#e5e7eb' (línea 47)
- 'Filtros' (línea 76)
- 'Limpiar', 'Aplicar' (líneas 93, 96)
```

#### FilterButton.tsx
```typescript
// ❌ Hardcodes:
- '#e5e7eb', '#fff' (líneas 20, 21)
```

### 🔄 Hooks en Lugar Incorrecto:

**shared/hooks/** (deberían estar en features/gyms/presentation/hooks/):
- useGymsData.ts
- useGymsFilters.ts
- useGymsView.ts
- useMapAnimations.ts
- useMapUserLocation.ts

**Mantener en shared:**
- useUserLocation.tsx (compartido entre features)

### ✅ Componentes Legítimos (mantener y mejorar):

- Avatar, Badge, Button, Card
- Circle, Divider, EmptyState, ErrorState
- FormField, Input, Text, Screen
- ListItem, IndexBadge, Row
- MapBox, MapMarker, MapFallback, UserLocationPin
- MenuItem, MenuList, PremiumCard
- ProgressBar, ProgressSection, StatsCard
- StatusPill, SetPill, TokenPill, MetaChip, TabPill
- GeneratedCodeCard (después de quitar hardcodes)

---

## 🎯 Plan de Ejecución

### Commit 1: Eliminar componentes no utilizados
**Archivos a eliminar:**
- FilterButton.tsx
- FilterChip.tsx
- GymsScreenLayout.tsx
- UserProfileLayout.tsx
- NavigationLayout.tsx
- StackNavigator.tsx
- HomeLayout.tsx
- RadioGroup.tsx
- Select.tsx
- Slider.tsx

**Actualizar:**
- shared/components/ui/index.ts (quitar exports)

---

### Commit 2: Mover hooks de gyms a su feature
**Mover desde** `shared/hooks/` **a** `features/gyms/presentation/hooks/`:
- useGymsData.ts
- useGymsFilters.ts
- useGymsView.ts
- useMapAnimations.ts
- useMapUserLocation.ts

**Actualizar:**
- shared/hooks/index.ts (quitar exports)
- features/gyms/presentation/hooks/index.ts (agregar exports)
- features/gyms/presentation/ui/screens/MapScreen.tsx (actualizar imports)

---

### Commit 3: Eliminar hardcodes en GeneratedCodeCard
**Cambios:**
```typescript
// Antes:
color: '#ffffff'
'USADO', 'VENCIDO', 'DISPONIBLE'
'Marcar como usado'

// Después:
color: theme.colors.onPrimary
statusLabels: { used: 'USADO', expired: 'VENCIDO', available: 'DISPONIBLE' } (como props o constants)
buttonLabel prop o constant
```

**Refactor:**
- Extraer constantes de textos a domain/constants
- Usar theme.colors en lugar de hardcodes
- Hacer el componente más configurable

---

### Commit 4: Eliminar hardcodes en FilterSheet
**Cambios:**
```typescript
// Antes:
title = "Filtros"
'Limpiar', 'Aplicar'
'#fff', '#111', '#635BFF', '#e5e7eb'

// Después:
title prop (obligatorio)
clearLabel, applyLabel props
theme.colors en todos lados
```

---

### Commit 5: Limpiar y optimizar barrel exports
**Actualizar:**
- shared/components/ui/index.ts
- shared/hooks/index.ts  
- Verificar que no haya imports rotos
- Agregar JSDoc a componentes compartidos clave

---

## 📝 Resumen de Impacto

**Archivos a eliminar:** 10
**Archivos a mover:** 5  
**Archivos a refactorizar:** 2
**Imports a actualizar:** ~5

**Beneficios:**
- ✅ Menos código muerto
- ✅ Sin hardcodes
- ✅ Mejor organización (hooks en su feature)
- ✅ Componentes más reusables
- ✅ Más fácil de mantener

