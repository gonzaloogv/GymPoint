# Diagramas de Cambio - MapScreen Redesign

---

## 1. Flujo de Interacción: Vista Normal vs Fullscreen

```
┌─────────────────────────────────────────────────────────────┐
│                    MAPA NORMAL (Vista por defecto)          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Header:                                                │ │
│  │ "Buscar Gimnasio"                                      │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │ 🔍 Buscar por nombre o dirección...         🔍   │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  │ [Filtros] [🗺️ Mapa] [📋 Lista]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ "6 gimnasios encontrados ordenados por distancia"    │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │                                                  │  │ │
│  │ │              📍 MAPA INTERACTIVO                 │  │ │
│  │ │         (altura: ~250-300px)                    │  │ │
│  │ │                                                  │  │ │
│  │ │      Pins con iconos de mancuerna               │  │ │
│  │ │      (adaptativos al zoom)                      │  │ │
│  │ │                                                  │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ "Más cercanos" (solo en vista normal)                 │ │
│  │ ┌────────────────────────────────────────────────────┐ │ │
│  │ │ ① BULLDOG CENTER                      0.2 km  →  │ │ │
│  │ │ Av. Libertad 100, Resistencia                   │ │ │
│  │ ├────────────────────────────────────────────────────┤ │ │
│  │ │ ② Ginger Restobar                     0.8 km  →  │ │ │
│  │ │ Av. Sarmartín 234                              │ │ │
│  │ ├────────────────────────────────────────────────────┤ │ │
│  │ │ ③ Sherwood Grill                      1.2 km  →  │ │ │
│  │ │ Costanera Norte 456                             │ │ │
│  │ └────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             ↓
                    Usuario presiona 🗺️ Mapa
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  MAPA FULLSCREEN                            │
├─────────────────────────────────────────────────────────────┤
│ ┌─ ← (botón atrás flotante)                                 │
│ │                                                            │
│ │         📍 MAPA INTERACTIVO FULLSCREEN                   │
│ │      (altura: 100% de pantalla - botón atrás)           │
│ │                                                            │
│ │      Pins visibles, interactivos                          │
│ │      Usuario puede hacer zoom, pan                        │
│ │      Pins se adaptan al zoom automáticamente              │
│ │                                                            │
│ │  ⚠️ NO se muestra:                                        │
│ │     - Header (búsqueda)                                  │
│ │     - Botones Mapa/Lista                                 │
│ │     - Sección "Más cercanos"                             │
│ │                                                            │
│ └────────────────────────────────────────────────────────────┘
                             ↓
                    Usuario presiona ← (atrás)
                             ↓
                    Vuelve a MAPA NORMAL
```

---

## 2. Estructura de Componentes

### Antes del Cambio
```
MapScreen
├── MapScreenHeader
│   └── HeaderActions
│       ├── FilterButton (40x40)
│       │   └── BadgeDot (activo si activeFilters > 0) ❌
│       └── SegmentedControl ❌
│           ├── "Mapa"
│           └── "Lista"
├── MapSection (si !isListView)
│   └── MapView
│       └── Markers (size: 48px, sin zoom adaptativo) ❌
└── GymsList (si isListView)
    └── GymListItem (x n)
```

### Después del Cambio
```
MapScreen
├── MapScreenHeader (NO visible en fullscreen)
│   └── HeaderActions
│       ├── FilterButton (40x40)
│       │   └── Sin BadgeDot ✅
│       └── ViewModeButtons ✅
│           ├── "🗺️" (Mapa)
│           └── "📋" (Lista)
├── MapSection (normal o fullscreen según viewMode)
│   └── MapView
│       └── Markers (size dinámico, zoom adaptativo) ✅
├── GymsList (si viewMode === 'list')
│   └── GymListItem (x n)
└── BackButton (flotante, solo en fullscreen)
```

---

## 3. Cambio de Props: HeaderActions

### ANTES
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (v: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;  // ❌ ELIMINAR
};
```

### DESPUÉS
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (v: 'map' | 'list') => void;
  onOpenFilters: () => void;
  // activeFilters removido ✅
};
```

---

## 4. Cambio de Props: MapScreenHeader

### ANTES
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;      // ❌ ELIMINAR
  searchText: string;
  onChangeSearch: (value: string) => void;
};
```

### DESPUÉS
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  searchText: string;
  onChangeSearch: (value: string) => void;
  // activeFilters removido ✅
};
```

---

## 5. Zoom Adaptativo: Sistema de Tamaños

```
        Nivel de Zoom
        (latitudeDelta)     Tamaño Pin    Escala    Caso de Uso

        ┌──────────────┐
        │  very-close  │      64px       1.5      🔍 Muy cerca
        │  ≤ 0.005     │                          (usuario sobre
        └──────────────┘                          un gimnasio)
             ↓
        ┌──────────────┐
        │    close     │      56px       1.2      👀 Cercano
        │  ≤ 0.02      │                          (cuadra)
        └──────────────┘
             ↓
        ┌──────────────┐
        │    medium    │      48px       1.0      ✨ NORMAL/DEFAULT
        │  ≤ 0.05      │                          (pocas manzanas)
        └──────────────┘
             ↓
        ┌──────────────┐
        │     far      │      40px       0.8      🏙️ Lejano
        │  ≤ 0.15      │                          (varias cuadras)
        └──────────────┘
             ↓
        ┌──────────────┐
        │  very-far    │      32px       0.6      🗺️ Muy lejano
        │   > 0.15     │                          (vista ciudad)
        └──────────────┘

        Evento: onRegionChangeComplete
             ↓
        Hook: useMapZoom()
             ↓
        Calcula latitudeDelta
             ↓
        Determina nivel
             ↓
        Actualiza zoomState
        (pinSize, scale)
             ↓
        Se pasan a MapMarker
             ↓
        Se pasan a GymPin
             ↓
        GymPin se renderiza
        con nuevo tamaño ✅
```

---

## 6. Renderización Condicional en MapScreen

```typescript
// Estado
const viewMode = 'map' | 'list'; // De useGymsView()

// Derivados
const isMapFullscreen = viewMode === 'map';
const isListView = viewMode === 'list';

// Lógica de renderización
┌─────────────────────────────────────────┐
│ ¿isMapFullscreen?                       │
├─────────────────────────────────────────┤
│ true  → Mostrar MAPA FULLSCREEN        │
│         ├─ Header: NO                  │
│         ├─ Mapa: altura 100%           │
│         ├─ Botón atrás: flotante       │
│         └─ Más cercanos: NO            │
│                                         │
│ false → ¿isListView?                   │
│         ├─ true  → Mostrar LISTA       │
│         │         ├─ Header: SÍ        │
│         │         └─ GymsList: SÍ      │
│         │                               │
│         └─ false → Mostrar NORMAL      │
│                   ├─ Header: SÍ        │
│                   ├─ Mapa: ~250-300px  │
│                   └─ Más cercanos: SÍ  │
└─────────────────────────────────────────┘
```

---

## 7. Comparativa Visual: Botones

### SegmentedControl (ANTES)
```
┌───────────────────────┐
│   Mapa   |   Lista    │  ← Un solo componente
└───────────────────────┘
   (ambos en uno)
```

### ViewModeButtons (DESPUÉS)
```
┌─────┐ ┌─────┐
│ 🗺️  │ │ 📋  │  ← Dos componentes separados
└─────┘ └─────┘
 botón   botón
 (activo) (inactivo)

 Activo:     Inactivo:
 ┌─────┐    ┌─────┐
 │ 🗺️  │    │ 📋  │
 │ azul│    │gris │
 └─────┘    └─────┘
```

---

## 8. Llamadas de Función: Antes vs Después

### Eliminación de useActiveFiltersCount

**ANTES en MapScreen:**
```typescript
const activeFilters = useActiveFiltersCount(
  selectedServices,
  selectedAmenities,
  selectedFeatures,
  priceFilter,
  ratingFilter,
  timeFilter,
  openNow,
);

// Pasar a header
<MapScreenHeader {...props} activeFilters={activeFilters} />
```

**DESPUÉS en MapScreen:**
```typescript
// ❌ Función eliminada completamente
// No se calcula activeFilters

// No se pasa a header
<MapScreenHeader {...props} />
```

---

## 9. Timeline de Cambios

```
Paso 1: Crear nuevos archivos
├── ViewModeButtons.tsx
└── useMapZoom.ts
   ↓
Paso 2: Modificar componentes de UI
├── HeaderActions.tsx
│   ├─ Reemplazar SegmentedControl
│   └─ Eliminar BadgeDot
├── MapScreenHeader.tsx
│   └─ Eliminar activeFilters prop
└── GymPin.tsx
    ├─ Agregar size prop
    └─ Agregar scale prop
   ↓
Paso 3: Integrar zoom adaptativo
├── MapMarker.tsx
│   ├─ Pasar pinSize y scale
│   └─ Agregar memoización
└── MapView.tsx
    ├─ Integrar useMapZoom
    └─ Conectar onRegionChangeComplete
   ↓
Paso 4: Lógica de negocio
└── MapScreen.tsx
    ├─ Eliminar useActiveFiltersCount
    ├─ Agregar lógica fullscreen
    └─ Cambiar renderización
   ↓
Paso 5: Exportaciones
├── src/shared/components/ui/index.ts
└── src/features/gyms/presentation/hooks/index.ts
   ↓
✅ LISTO PARA DEPLOY
```

---

## 10. Puntos Clave de Implementación

### ✅ Qué SÍ hacer:
- Usar dos botones separados con iconos
- Mantener colores del código fuente
- Implementar fullscreen en misma pantalla (sin ruta nueva)
- Usar throttling en zoom (200ms)
- Memoizar MapMarker
- Desactivar tracksViewChanges después de animación

### ❌ Qué NO hacer:
- No seguir mocks visualmente al 100%
- No crear ruta nueva para fullscreen
- No mostrar header en fullscreen
- No mostrar "Más cercanos" en fullscreen
- No mantener el contador de filtros
- No re-renderizar pins en cada frame

---

## 11. Validación Post-Implementación

### Testing Manual
- [ ] Botón "Mapa" activa fullscreen
- [ ] Botón "Lista" muestra lista
- [ ] Header desaparece en fullscreen
- [ ] Botón atrás funciona en fullscreen
- [ ] Pins cambian de tamaño al hacer zoom
- [ ] Sin saltos visuales en cambios de tamaño
- [ ] Filtros siguen funcionando sin contador
- [ ] Dark mode en todas partes
- [ ] No hay memory leaks
- [ ] Performance es smooth (60fps)

### Testing en Dispositivos
- [ ] iPhone (diferentes tamaños)
- [ ] Android (diferentes tamaños)
- [ ] Landscape y portrait
- [ ] Con slow device mode en DevTools

---

**Documento de Diagramas Completado**
