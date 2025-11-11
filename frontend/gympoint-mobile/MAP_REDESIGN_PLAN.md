# Plan de Rediseño - MapScreen con Consistencia Visual

**Fecha**: 11 de Noviembre, 2025
**Estado**: Pendiente de Aprobación
**Rama**: `redesign-map-screen`

---

## 📋 Resumen Ejecutivo

Se rediseñará la pantalla de Mapa (MapScreen) de GymPoint Mobile para:
1. Reemplazar el toggle (SegmentedControl) por **dos botones separados**: "Mapa" y "Lista"
2. Implementar **modo fullscreen** para el mapa cuando se presiona el botón "Mapa"
3. Eliminar el **contador de filtros activos** del header
4. Implementar **iconos/pins adaptativos al zoom** del mapa
5. Mantener **consistencia visual** con el resto de la aplicación
6. Mantener **colores y tema** del código fuente existente

---

## 🎯 Cambios Principales

### 1. Botones Separados (Reemplazando SegmentedControl)

#### Cambio Visual
**ANTES:**
```
[Filtros] [  Mapa  |  Lista  ] (SegmentedControl toggle)
```

**DESPUÉS:**
```
[Filtros] [Mapa] [Lista] (Dos botones separados)
```

#### Comportamiento
- **Botón "Mapa"**: Al presionar → Activa modo fullscreen del mapa
- **Botón "Lista"**: Al presionar → Muestra vista de lista de gimnasios
- El botón activo se destaca visualmente (color de fondo azul primario)
- Estilos consistentes con el resto de la app

#### Ventajas
✅ Mayor flexibilidad visual para futuras funcionalidades
✅ Mejor separación entre vistas (no es un toggle)
✅ Permite expandir el mapa a fullscreen sin confusiones
✅ Más intuitivo para usuarios

---

### 2. Eliminación del Contador de Filtros

#### Cambio Visual
**ANTES:**
```
┌─────────────────────────────────────────┐
│ [●Filtros]  [Mapa | Lista]             │  ← Indicador rojo/badge con número
└─────────────────────────────────────────┘
```

**DESPUÉS:**
```
┌─────────────────────────────────────────┐
│ [Filtros]  [Mapa] [Lista]               │  ← Sin indicador numérico
└─────────────────────────────────────────┘
```

#### Justificación
- El contador de filtros activos ocupa espacio visual
- Reduce legibilidad del header
- La apertura del sheet de filtros ya muestra qué filtros están activos
- Más limpio y minimalista

#### Cambios de Código
- **Archivo**: `src/features/gyms/presentation/ui/components/map/HeaderActions.tsx`
  - Eliminar props `activeFilters`
  - Remover `<BadgeDot count={activeFilters} />`
  - Simplificar renderización del botón de filtros

- **Archivo**: `src/features/gyms/presentation/ui/screens/MapScreen.tsx`
  - Eliminar llamada a `useActiveFiltersCount()`
  - No pasar `activeFilters` a `MapScreenHeader`
  - Actualizar tipos de props en `MapScreenHeader`

---

### 3. Modo Fullscreen del Mapa

#### Flujo de Interacción

```
Usuario presiona botón "Mapa"
         ↓
MapScreen cambia a modo fullscreen
         ↓
Se muestra:
  - Mapa en altura 100% de la pantalla
  - Botón atrás flotante (esquina superior izquierda)
  - Sin sección "Más cercanos" debajo
         ↓
Usuario presiona botón atrás o presiona "Lista"
         ↓
Vuelve a vista normal con mapa + "Más cercanos"
```

#### Componentes Afectados

**`MapScreen.tsx`** (Principal)
- Añadir estado `isMapFullscreen: boolean` (derivado de `viewMode === 'map'`)
- Cambiar lógica de renderización:
  ```typescript
  if (isMapFullscreen) {
    // Renderizar mapa fullscreen con botón atrás
  } else if (isListView) {
    // Renderizar lista
  } else {
    // Renderizar mapa normal + "Más cercanos"
  }
  ```

**`MapView.tsx`** (Pantalla de Mapa Fullscreen)
- Crear nueva pantalla o adaptar la existente
- Mostrar mapa en altura completa (menos padding superior para botón atrás)
- Mantener botón atrás flotante

**Estilos**
- En modo fullscreen: `height: 100%` del contenedor
- En modo normal: `height: MAP_SECTION_HEIGHT` (constante existente)

#### Usuario No Será Redirigido
- El usuario permanece en la misma pantalla (MapScreen)
- Solo cambia la vista internamente
- No se crea nueva ruta en navegación
- Historial de navegación sin cambios

---

### 4. Iconos Adaptativos al Zoom

#### Estrategia Técnica

Se implementará un sistema que **ajusta automáticamente el tamaño de los pins** según el nivel de zoom del mapa.

**Rangos de Zoom Definidos:**

| Nivel Zoom | latitudeDelta | Tamaño Pin | Escala | Caso de Uso |
|-----------|---------------|-----------|--------|------------|
| very-close | ≤ 0.005 | 64px | 1.5 | Usuario muy cerca de un gimnasio |
| close | ≤ 0.02 | 56px | 1.2 | Usuario cercano |
| medium | ≤ 0.05 | 48px | 1.0 | Vista normal (DEFAULT) |
| far | ≤ 0.15 | 40px | 0.8 | Usuario distante |
| very-far | > 0.15 | 32px | 0.6 | Vista regional |

#### Cómo Funciona

1. **Detección de Zoom**: El evento `onRegionChangeComplete` del mapa se dispara cuando el usuario hace zoom o pan
2. **Cálculo de Nivel**: Se analiza `region.latitudeDelta` para determinar el nivel de zoom actual
3. **Actualización de Tamaño**: Se actualiza el estado con el nuevo tamaño y escala
4. **Renderización Dinámica**: Los pins se re-renderean con el nuevo tamaño
5. **Animación**: El cambio de tamaño es suave gracias a Animated de React Native

#### Rendimiento

- **Throttling**: Las actualizaciones se limitan a cada 200ms (no en cada frame)
- **Memoización**: Los componentes MapMarker usan React.memo para evitar re-renders innecesarios
- **tracksViewChanges**: Se desactiva después de animaciones para optimizar performance

#### Componentes Involucrados

**Crear:**
- `src/features/gyms/presentation/hooks/useMapZoom.ts`
  - Hook personalizado que gestiona la lógica de zoom
  - Expone `zoomState` (level, pinSize, scale)
  - Expone `handleRegionChange` (callback para onRegionChangeComplete)

**Modificar:**
- `src/shared/components/ui/GymPin.tsx`
  - Agregar props: `size?: number` (tamaño base, default 48)
  - Agregar props: `scale?: number` (factor de escala, default 1.0)
  - Actualizar animación según tamaño

- `src/shared/components/ui/MapMarker.tsx`
  - Pasar `pinSize` y `scale` a `<GymPin />`
  - Optimizar con React.memo

- `src/features/gyms/presentation/ui/screens/MapView.tsx`
  - Integrar hook `useMapZoom`
  - Conectar `onRegionChangeComplete` a `handleRegionChange`
  - Pasar `pinSize` y `scale` a cada `<MapMarker />`

---

### 5. Nuevos Componentes

#### `ViewModeButtons.tsx`

**Ubicación**: `src/shared/components/ui/ViewModeButtons.tsx`

**Descripción**: Componente reutilizable que reemplaza el SegmentedControl
**Props**:
- `value: 'map' | 'list'` - Modo actual
- `onChange: (mode: 'map' | 'list') => void` - Callback al cambiar modo
- `size?: 'sm' | 'md'` - Tamaño de botones (default: 'sm')

**Características**:
- Dos botones icónicos (mapa y lista)
- El botón activo tiene fondo azul primario
- Sombras y bordes consistentes con tema
- Respeta dark mode
- Pequeño y compacto

**Uso**:
```typescript
<ViewModeButtons
  value={viewMode}
  onChange={setViewMode}
  size="sm"
/>
```

---

## 📁 Resumen de Cambios por Archivo

### Archivos a CREAR

| Archivo | Descripción |
|---------|------------|
| `src/shared/components/ui/ViewModeButtons.tsx` | Nuevo componente: botones separados Mapa/Lista |
| `src/features/gyms/presentation/hooks/useMapZoom.ts` | Nuevo hook: gestión de zoom adaptativo |
| `MAP_REDESIGN_PLAN.md` | Este documento (referencia) |

### Archivos a MODIFICAR

| Archivo | Cambios |
|---------|---------|
| `src/features/gyms/presentation/ui/components/map/HeaderActions.tsx` | Reemplazar SegmentedControl con ViewModeButtons; Eliminar BadgeDot y activeFilters |
| `src/features/gyms/presentation/ui/components/map/MapScreenHeader.tsx` | Eliminar prop activeFilters; Actualizar tipos |
| `src/features/gyms/presentation/ui/screens/MapScreen.tsx` | Eliminar useActiveFiltersCount; Agregar lógica fullscreen; Actualizar tipos; Cambiar renderización por vistas |
| `src/shared/components/ui/GymPin.tsx` | Agregar props size y scale; Actualizar animación; Usar tamaño dinámico |
| `src/shared/components/ui/MapMarker.tsx` | Pasar pinSize y scale a GymPin; Agregar memoización; Optimizar tracksViewChanges |
| `src/features/gyms/presentation/ui/screens/MapView.tsx` | Integrar useMapZoom; Conectar onRegionChangeComplete; Pasar propiedades dinámicas a MapMarker |
| `src/shared/components/ui/index.ts` | Exportar ViewModeButtons |
| `src/features/gyms/presentation/hooks/index.ts` | Exportar useMapZoom |

### Archivos que NO cambian
- `MapSection.tsx` - Mantiene la lógica de "Más cercanos"
- `GymListItem.tsx` - Se usa igual en ambas vistas
- `FiltersSheet.tsx` - Se mantiene igual (solo se elimina el contador)
- `GymDetailScreen.tsx` - Sin cambios

---

## 🔄 Flujo de Cambios Detallado

### 1. Reemplazo de SegmentedControl → ViewModeButtons

**Archivo**: `HeaderActions.tsx`

**ANTES:**
```typescript
<SegmentedControl
  value={viewMode}
  onChange={(value: any) => value && onChangeViewMode(value as 'map' | 'list')}
  options={[
    { value: 'map', label: 'Mapa' },
    { value: 'list', label: 'Lista' },
  ]}
  size="sm"
/>
```

**DESPUÉS:**
```typescript
<ViewModeButtons
  value={viewMode}
  onChange={onChangeViewMode}
  size="sm"
/>
```

**Cambios en Props:**
- Eliminar: `activeFilters: number` ❌
- Eliminar: renderización de `<BadgeDot />` ❌
- Eliminar: `<View className="relative flex-shrink-0">` wrapper ❌

---

### 2. Eliminación del Contador de Filtros

**Archivo**: `MapScreenHeader.tsx`

**ANTES:**
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number; // ❌ ELIMINAR
  searchText: string;
  onChangeSearch: (value: string) => void;
};

function MapScreenHeader({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  activeFilters, // ❌ ELIMINAR
  searchText,
  onChangeSearch,
}: Props) {
  return (
    <SearchHeader {...props}>
      <HeaderActions
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        onOpenFilters={onOpenFilters}
        activeFilters={activeFilters} // ❌ NO PASAR
      />
    </SearchHeader>
  );
}
```

**DESPUÉS:**
```typescript
type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  searchText: string;
  onChangeSearch: (value: string) => void;
};

function MapScreenHeader({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  searchText,
  onChangeSearch,
}: Props) {
  return (
    <SearchHeader {...props}>
      <HeaderActions
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        onOpenFilters={onOpenFilters}
      />
    </SearchHeader>
  );
}
```

---

### 3. Lógica de Fullscreen en MapScreen

**Archivo**: `MapScreen.tsx`

**Cambio de Renderización:**

**ANTES:**
```typescript
const scroll = !isListView;

return (
  <SurfaceScreen scroll={scroll} {...props}>
    <MapScreenHeader {...headerProps} activeFilters={activeFilters} />

    {!isListView && (
      <MapSection {...mapProps} />
    )}

    {isListView && (
      <GymsList {...listProps} />
    )}
  </SurfaceScreen>
);
```

**DESPUÉS:**
```typescript
const isMapFullscreen = viewMode === 'map';
const isListView = viewMode === 'list';
const scroll = !isMapFullscreen && !isListView; // Solo scroll en vista normal

return (
  <SurfaceScreen scroll={scroll} {...props}>
    {/* Header NO se muestra en fullscreen */}
    {!isMapFullscreen && (
      <MapScreenHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenFilters={openFilters}
        searchText={searchText}
        onChangeSearch={setSearchText}
      />
    )}

    {/* Fullscreen Map */}
    {isMapFullscreen && (
      <MapSection
        initialRegion={initialRegion}
        mapLocations={mapLocations}
        userLocation={userLatLng}
        loading={isLoading}
        error={error}
        locError={locError}
        moreList={[]} // No mostrar "Más cercanos" en fullscreen
        mapHeight={screenHeight} // Altura completa
        showUserFallbackPin
        onGymPress={handleGymPress}
        showBackButton
        onBackPress={() => setViewMode('list')} // Volver
      />
    )}

    {/* Normal Map + Más Cercanos */}
    {!isMapFullscreen && !isListView && (
      <MapSection {...normalMapProps} />
    )}

    {/* List View */}
    {isListView && (
      <GymsList {...listProps} />
    )}
  </SurfaceScreen>
);
```

**Cambios en Estado:**
- Eliminar: `useActiveFiltersCount()` ❌
- Eliminar: paso de `activeFilters` a componentes ❌
- Mantener: `useGymsView('map')` para gestionar viewMode ✅

---

### 4. Integración de Zoom Adaptativo

**Archivo**: `MapView.tsx`

**Cambios:**

```typescript
// NUEVO: Integrar hook
const { zoomState, handleRegionChange } = useMapZoom();

// En MapView
<NativeMapView
  ref={mapRef}
  onRegionChangeComplete={handleRegionChange} // NUEVO
  // ... resto de props
>
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

## 🎨 Consistencia Visual

### Tema y Colores
- **Mantener**: Colores existentes del código fuente
- **No seguir**: Mocks 100% (son solo referencias)
- **Aplicar**: Dark mode en todas partes

### Tipografía
- Tamaños de fuente estándar del proyecto
- Pesos: regular, medium, bold (según contexto)

### Iconografía
- Usar Ionicons (ya integrado)
- Botones de mapa/lista con iconos claros
- Botón atrás flotante con ícono "chevron-back"

### Espaciado
- Basado en escala: 4px, 8px, 12px, 16px, 20px, 24px
- Header: padding consistente
- Botones: gap de 8px entre ellos

---

## 📊 Impacto de Cambios

### Performance
✅ **Mejora**: Eliminación de contador reduce cálculos
✅ **Mejora**: Throttling en zoom (200ms) reduce updates
✅ **Neutral**: ViewModeButtons tiene mismo peso que SegmentedControl
⚠️ **Potencial**: Renderizado de pins con tamaños dinámicos (mitigado con memoización)

### UX
✅ **Mejora**: Header más limpio sin contador
✅ **Mejora**: Mapa fullscreen para mejor visualización
✅ **Mejora**: Pins se adaptan al zoom automáticamente
✅ **Mejora**: Botones separados más intuitivos

### Código
✅ **Mejora**: Nuevos hooks reutilizables (useMapZoom)
✅ **Mejora**: Componentes más enfocados (separación de responsabilidades)
✅ **Mejora**: Menos props circulando
⚠️ **Complejidad**: Lógica de fullscreen en MapScreen

---

## ✅ Checklist de Implementación

- [ ] Crear `ViewModeButtons.tsx`
- [ ] Crear `useMapZoom.ts` hook
- [ ] Modificar `GymPin.tsx` para tamaño dinámico
- [ ] Modificar `MapMarker.tsx` con memoización
- [ ] Modificar `MapView.tsx` con integración de zoom
- [ ] Modificar `HeaderActions.tsx` (SegmentedControl → ViewModeButtons)
- [ ] Modificar `MapScreenHeader.tsx` (eliminar activeFilters)
- [ ] Modificar `MapScreen.tsx` (lógica fullscreen + eliminar contador)
- [ ] Actualizar exports en `index.ts` files
- [ ] Pruebas en dispositivo/emulador
- [ ] Verificar dark mode
- [ ] Verificar animations suave
- [ ] Testing de zoom adaptativo

---

## 🤔 Preguntas de Diseño Resueltas

**P: ¿Se crea nueva ruta para fullscreen?**
R: No. Permanece en MapScreen, solo cambia vista internamente.

**P: ¿Dónde va el botón atrás en fullscreen?**
R: Esquina superior izquierda flotante (absoluta position).

**P: ¿Se muestra header en fullscreen?**
R: No. Solo se muestra el mapa y el botón atrás.

**P: ¿Qué pasa con "Más cercanos" en fullscreen?**
R: No se muestra. Es exclusivo de vista normal.

**P: ¿Los colores de los mocks se implementan?**
R: No. Se mantienen colores del código actual.

**P: ¿Se mantiene el FiltersSheet?**
R: Sí, funciona igual pero sin contador en el botón.

---

## 📝 Notas Adicionales

- Este plan mantiene backward compatibility en la mayoría de archivos
- La migración es incremental (puedes testear cada cambio)
- No hay cambios en la capa de datos/domain
- Los hooks nuevos son reutilizables para futuras pantallas

---

**Última actualización**: 11 de Noviembre, 2025
**Documento preparado para aprobación**
