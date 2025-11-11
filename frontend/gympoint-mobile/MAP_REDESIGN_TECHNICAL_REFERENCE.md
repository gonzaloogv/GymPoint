# Referencia Técnica - MapScreen Redesign

**Documento Técnico Detallado**
**Para consultación durante implementación**

---

## 1. ViewModeButtons.tsx - Especificaciones

### Ubicación
```
src/shared/components/ui/ViewModeButtons.tsx
```

### Props Interface
```typescript
type ViewMode = 'map' | 'list';

interface ViewModeButtonsProps {
  value: ViewMode;                    // Modo actual ('map' | 'list')
  onChange: (mode: ViewMode) => void; // Callback al cambiar
  size?: 'sm' | 'md';                 // Tamaño (default: 'sm')
}
```

### Comportamiento
- Dos botones circulares con iconos
- Botón activo: fondo azul primario (#4A9CF5), ícono blanco
- Botón inactivo: borde gris, ícono gris
- Respeta dark mode automáticamente
- Sombras suaves
- Gap de 8px entre botones

### Iconografía
| Botón | Ícono Ionicons | Nombre |
|-------|---|---|
| Mapa | `map` | 🗺️ |
| Lista | `list` | 📋 |

### Tamaños
```
size='sm':
  - width/height: 40px
  - iconSize: 18
  - borderRadius: 20px

size='md':
  - width/height: 44px
  - iconSize: 20
  - borderRadius: 22px
```

### Ejemplo de Uso
```typescript
import { ViewModeButtons } from '@shared/components/ui';

<ViewModeButtons
  value={viewMode}
  onChange={setViewMode}
  size="sm"
/>
```

---

## 2. useMapZoom Hook - Especificaciones

### Ubicación
```
src/features/gyms/presentation/hooks/useMapZoom.ts
```

### Return Type
```typescript
interface UseMapZoomReturn {
  zoomState: {
    level: 'very-close' | 'close' | 'medium' | 'far' | 'very-far';
    pinSize: number;  // 32-64px
    scale: number;    // 0.6-1.5
  };
  handleRegionChange: (region: Region) => void;
}
```

### Zoom Configuration Table
```typescript
const ZOOM_CONFIG = {
  'very-close': { maxDelta: 0.005, pinSize: 64, scale: 1.5 },
  'close':      { maxDelta: 0.02,  pinSize: 56, scale: 1.2 },
  'medium':     { maxDelta: 0.05,  pinSize: 48, scale: 1.0 },
  'far':        { maxDelta: 0.15,  pinSize: 40, scale: 0.8 },
  'very-far':   { maxDelta: Infinity, pinSize: 32, scale: 0.6 },
};
```

### Throttling Configuration
```typescript
const THROTTLE_MS = 200; // Actualizar cada 200ms máximo
```

### Algoritmo
```
1. onRegionChangeComplete dispara con region: { latitudeDelta, ... }
2. Comparar latitudeDelta con ZOOM_CONFIG
3. Encontrar level correspondiente
4. Extraer pinSize y scale
5. setZoomState con nuevos valores
6. Componentes re-renderean con nuevo tamaño
```

### Ejemplo de Uso
```typescript
import { useMapZoom } from '@features/gyms/presentation/hooks';

const { zoomState, handleRegionChange } = useMapZoom();

<MapView
  onRegionChangeComplete={handleRegionChange}
>
  {locations.map(loc => (
    <MapMarker
      key={loc.id}
      pinSize={zoomState.pinSize}
      scale={zoomState.scale}
    />
  ))}
</MapView>
```

---

## 3. GymPin.tsx - Modificaciones

### Props Existentes
```typescript
// Ya existen (no cambiar)
// ... (SVG rendering props)
```

### Props Nuevas
```typescript
interface GymPinProps {
  size?: number;   // Tamaño base (default: 48)
  scale?: number;  // Factor de escala (default: 1.0)
}
```

### Cálculo de Tamaño Efectivo
```typescript
const effectiveSize = size * scale;

// Ejemplo:
// size=48, scale=1.0 → effectiveSize=48px (normal)
// size=48, scale=1.5 → effectiveSize=72px (ampliado)
// size=48, scale=0.6 → effectiveSize=28.8px (reducido)
```

### Animación de Bob Dinámica
```typescript
// El movimiento se adapta al tamaño
const bobAmount = size / 8;

// size=48 → bobAmount=6
// size=64 → bobAmount=8
// size=32 → bobAmount=4
```

### Key Change
En `useEffect`, incluir `size` en dependency array:
```typescript
useEffect(() => {
  const bobAmount = size / 8;
  // ... animación
}, [size]); // ← IMPORTANTE: size debe estar aquí
```

---

## 4. MapMarker.tsx - Modificaciones

### Props Nuevas
```typescript
interface MapMarkerProps {
  location: MapLocation;
  pinSize?: number;  // Default: 48
  scale?: number;    // Default: 1.0
}
```

### Memoización
```typescript
export const MapMarker = React.memo(
  ({ location, pinSize = 48, scale = 1.0 }: Props) => {
    // ... implementación
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.location.id === nextProps.location.id &&
      prevProps.pinSize === nextProps.pinSize &&
      prevProps.scale === nextProps.scale
    );
  }
);
```

### tracksViewChanges Optimization
```typescript
const [tracksViewChanges, setTracksViewChanges] = useState(true);

// Desactivar después de animación inicial
useEffect(() => {
  const timer = setTimeout(() => {
    setTracksViewChanges(false);
  }, 2000);
  return () => clearTimeout(timer);
}, []);

// Re-activar cuando cambia size
useEffect(() => {
  setTracksViewChanges(true);
  const timer = setTimeout(() => {
    setTracksViewChanges(false);
  }, 500);
  return () => clearTimeout(timer);
}, [pinSize, scale]);
```

### Offset Calculation
```typescript
const effectiveSize = pinSize * scale;
const yOffset = -(effectiveSize / 2);

// En Marker props
centerOffset={{ x: 0, y: yOffset }}
```

---

## 5. MapView.tsx - Integración

### Cambio Principal
```typescript
// NUEVO: Integrar hook
const { zoomState, handleRegionChange } = useMapZoom();

// MODIFICADO: Conectar evento
<NativeMapView
  onRegionChangeComplete={handleRegionChange}
  // ... resto de props
>
  {/* MODIFICADO: Pasar dinámicamente size y scale */}
  {locations.map((location) => (
    <MapMarker
      key={location.id}
      location={location}
      pinSize={zoomState.pinSize}  // NUEVO
      scale={zoomState.scale}       // NUEVO
    />
  ))}
</NativeMapView>
```

---

## 6. HeaderActions.tsx - Cambios

### Imports
```typescript
// ELIMINAR
import { SegmentedControl } from '@shared/components/ui/SegmentedControl';

// AGREGAR
import { ViewModeButtons } from '@shared/components/ui/ViewModeButtons';
```

### Props Interface
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (v: 'map' | 'list') => void;
  onOpenFilters: () => void;
  // activeFilters removido
};
```

### Render Changes
```typescript
// ELIMINAR este bloque
<View className="relative flex-shrink-0">
  <TouchableOpacity onPress={onOpenFilters} style={filterButtonStyle}>
    <Ionicons name="filter-sharp" size={16} color={iconColor} />
  </TouchableOpacity>
  {activeFilters > 0 && <BadgeDot count={activeFilters} />}
</View>

// NUEVO: Mantener FilterButton pero sin BadgeDot
<TouchableOpacity onPress={onOpenFilters} style={filterButtonStyle}>
  <Ionicons name="filter-sharp" size={16} color={iconColor} />
</TouchableOpacity>

// REEMPLAZAR SegmentedControl
<ViewModeButtons
  value={viewMode}
  onChange={onChangeViewMode}
  size="sm"
/>
```

---

## 7. MapScreenHeader.tsx - Cambios

### Props Interface
```typescript
// ANTES
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;           // ❌ ELIMINAR
  searchText: string;
  onChangeSearch: (value: string) => void;
};

// DESPUÉS
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  searchText: string;
  onChangeSearch: (value: string) => void;
  // activeFilters removido
};
```

### Function Signature
```typescript
// ANTES
function MapScreenHeader({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  activeFilters,
  searchText,
  onChangeSearch,
}: Props)

// DESPUÉS
function MapScreenHeader({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  searchText,
  onChangeSearch,
}: Props)
```

### HeaderActions Call
```typescript
// ANTES
<HeaderActions
  viewMode={viewMode}
  onChangeViewMode={onChangeViewMode}
  onOpenFilters={onOpenFilters}
  activeFilters={activeFilters}  // ❌ NO PASAR
/>

// DESPUÉS
<HeaderActions
  viewMode={viewMode}
  onChangeViewMode={onChangeViewMode}
  onOpenFilters={onOpenFilters}
/>
```

---

## 8. MapScreen.tsx - Cambios Complejos

### Eliminar Hook
```typescript
// ELIMINAR
const activeFilters = useActiveFiltersCount(
  selectedServices,
  selectedAmenities,
  selectedFeatures,
  priceFilter,
  ratingFilter,
  timeFilter,
  openNow,
);
```

### Nuevas Variables
```typescript
const isMapFullscreen = viewMode === 'map';
const isListView = viewMode === 'list';
const isNormalMapView = !isMapFullscreen && !isListView;

// Para fullscreen
const screenHeight = useWindowDimensions().height;
const statusBarHeight = 44; // Aproximado
const mapHeightFullscreen = screenHeight - statusBarHeight;
```

### Renderización Condicional
```typescript
const scroll = !isMapFullscreen && !isListView;

return (
  <SurfaceScreen scroll={scroll} {...otherProps}>
    {/* Header: NO visible en fullscreen */}
    {!isMapFullscreen && (
      <MapScreenHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenFilters={openFilters}
        searchText={searchText}
        onChangeSearch={setSearchText}
        // activeFilters NO pasar
      />
    )}

    {/* Fullscreen Map */}
    {isMapFullscreen && (
      <>
        <BackButton onPress={() => setViewMode('list')} />
        <MapSection
          initialRegion={initialRegion}
          mapLocations={mapLocations}
          userLocation={userLatLng}
          loading={isLoading}
          error={error}
          locError={locError}
          moreList={[]}  // Empty en fullscreen
          mapHeight={mapHeightFullscreen}
          showUserFallbackPin
          onGymPress={handleGymPress}
        />
      </>
    )}

    {/* Normal Map View */}
    {isNormalMapView && (
      <View style={styles.mapModeContent}>
        <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />
        <MapSection
          initialRegion={initialRegion}
          mapLocations={mapLocations}
          userLocation={userLatLng}
          loading={isLoading}
          error={error}
          locError={locError}
          moreList={topNearbyGyms}
          mapHeight={MAP_SECTION_HEIGHT}
          showUserFallbackPin
          onGymPress={handleGymPress}
        />
      </View>
    )}

    {/* List View */}
    {isListView && (
      <View style={styles.listWrapper}>
        <GymsList
          data={filteredGyms}
          headerText={listHeader}
          onPressItem={handleGymPress}
        />
      </View>
    )}
  </SurfaceScreen>
);
```

### Back Button (Fullscreen)
```typescript
// Si no existe, crear componente simple
<TouchableOpacity
  style={{
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#111827' : '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  onPress={() => setViewMode('list')}
>
  <Ionicons
    name="chevron-back"
    size={24}
    color={isDark ? '#F9FAFB' : '#111827'}
  />
</TouchableOpacity>
```

---

## 9. Exports a Actualizar

### `src/shared/components/ui/index.ts`
```typescript
// AGREGAR
export { ViewModeButtons } from './ViewModeButtons';
export { GymPin } from './GymPin';  // Ya existe, verificar
export { MapMarker } from './MapMarker';  // Ya existe, verificar
```

### `src/features/gyms/presentation/hooks/index.ts`
```typescript
// AGREGAR
export { useMapZoom } from './useMapZoom';

// Mantener existentes
export { useGymSchedules } from './useGymSchedules';
export { useGymsData } from './useGymsData';
// ... etc
```

---

## 10. Testing Checklist

### Unit Tests Recomendados

#### useMapZoom Hook
```typescript
describe('useMapZoom', () => {
  it('should return medium zoom by default', () => {});
  it('should calculate zoom level correctly', () => {});
  it('should throttle region changes', () => {});
  it('should update pinSize on zoom change', () => {});
});
```

#### ViewModeButtons Component
```typescript
describe('ViewModeButtons', () => {
  it('should render two buttons', () => {});
  it('should highlight active button', () => {});
  it('should call onChange on button press', () => {});
  it('should respect dark mode', () => {});
});
```

### Manual Testing
```
[ ] Presionar "Mapa" → fullscreen activado
[ ] Presionar botón atrás → vuelta a normal
[ ] Presionar "Lista" → vista de lista
[ ] Hacer zoom en → pins crecen
[ ] Hacer zoom out → pins se reducen
[ ] Sin counter en filtros
[ ] Dark mode en todo
[ ] Sin memory leaks
[ ] Performance smooth (60fps)
```

---

## 11. Troubleshooting Común

### Problema: Pins no cambian de tamaño
**Solución**: Verificar que `onRegionChangeComplete` está conectado en MapView

### Problema: Header aparece en fullscreen
**Solución**: Verificar condición `{!isMapFullscreen && <Header />}`

### Problema: BadgeDot aún visible
**Solución**: Confirmar que fue eliminado de HeaderActions

### Problema: Performance lag en zoom
**Solución**: Verificar throttling de 200ms en useMapZoom

### Problema: Botones desalineados
**Solución**: Verificar gap y flex properties en ViewModeButtons

---

## 12. Git Workflow

### Recomendado
```bash
# Crear rama local (si no existe)
git checkout -b redesign-map-screen

# Commits por cambio lógico
git add src/shared/components/ui/ViewModeButtons.tsx
git commit -m "feat: create ViewModeButtons component"

git add src/features/gyms/presentation/hooks/useMapZoom.ts
git commit -m "feat: add useMapZoom hook for adaptive zoom"

# ... etc para cada archivo

git add .
git commit -m "feat: integrate adaptive zoom in MapView"

git add .
git commit -m "feat: implement fullscreen map mode in MapScreen"

git add .
git commit -m "refactor: remove filter counter from header"

# Push cuando todo esté listo
git push origin redesign-map-screen
```

---

**Fin de Referencia Técnica**

Para dudas durante implementación, consultar este documento.
