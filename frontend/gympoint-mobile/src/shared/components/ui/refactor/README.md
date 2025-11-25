# Componentes Refactorizados

Esta carpeta contiene componentes UI refactorizados para ser altamente reutilizables en toda la aplicación.

## Componentes Disponibles

### 1. **Badge**
Etiquetas/badges reutilizables con múltiples variantes y tamaños.

**Props:**
- `label: string` - Texto del badge
- `variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'` - Estilo visual
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del badge
- `className?: string` - Clases adicionales

**Ejemplo:**
```tsx
<Badge label="Reciente" variant="success" size="sm" />
```

---

### 2. **MetricCard**
Tarjeta para mostrar métricas individuales con icono, label, valor y unidad.

**Props:**
- `label: string` - Etiqueta de la métrica (ej: "Peso", "Altura")
- `value: string | number` - Valor de la métrica
- `unit?: string` - Unidad de medida (ej: "kg", "cm", "%")
- `icon?: keyof typeof Ionicons.glyphMap` - Icono de Ionicons
- `iconColor?: string` - Color personalizado del icono

**Ejemplo:**
```tsx
<MetricCard
  label="Peso"
  value={74.5}
  unit="kg"
  icon="scale-outline"
/>
```

---

### 3. **IconButton**
Botón con icono y label opcional, múltiples variantes y tamaños.

**Props:**
- `icon: keyof typeof Ionicons.glyphMap` - Icono de Ionicons (requerido)
- `label?: string` - Texto del botón (opcional)
- `onPress: () => void` - Función al hacer click
- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` - Estilo visual
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del botón
- `disabled?: boolean` - Estado deshabilitado
- `className?: string` - Clases adicionales

**Ejemplo:**
```tsx
<IconButton
  icon="create-outline"
  label="Editar"
  onPress={handleEdit}
  variant="primary"
/>
```

---

### 4. **InfoSection**
Sección de información con título, contenido, icono opcional y variantes de estilo.

**Props:**
- `title: string` - Título de la sección
- `content: string | ReactNode` - Contenido (texto o JSX)
- `icon?: keyof typeof Ionicons.glyphMap` - Icono opcional
- `variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'` - Estilo visual

**Ejemplo:**
```tsx
<InfoSection
  title="Notas"
  content="Esta es una nota importante sobre la medición"
  icon="document-text-outline"
  variant="info"
/>
```

---

### 5. **SelectorModal**
Modal de selección genérico y completamente reutilizable para listas de items.

**Props:**
- `visible: boolean` - Controla visibilidad del modal
- `title: string` - Título del modal
- `subtitle?: string` - Subtítulo opcional
- `items: SelectorItem<T>[]` - Array de items a mostrar
- `selectedId?: string | number` - ID del item seleccionado
- `onSelect: (item: SelectorItem<T>) => void` - Callback al seleccionar
- `onClose: () => void` - Callback al cerrar
- `renderCustomContent?: (item: SelectorItem<T>) => ReactNode` - Renderizado personalizado

**SelectorItem Interface:**
```typescript
interface SelectorItem<T = any> {
  id: string | number;
  label: string;
  description?: string;
  metadata?: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string;
  value: T;
}
```

**Ejemplo:**
```tsx
<SelectorModal
  visible={showModal}
  title="Seleccionar opción"
  subtitle="3 opciones disponibles"
  items={[
    { id: 1, label: "Opción 1", description: "Descripción", value: data1 },
    { id: 2, label: "Opción 2", badge: "Nuevo", value: data2 }
  ]}
  selectedId={1}
  onSelect={(item) => console.log(item.value)}
  onClose={() => setShowModal(false)}
/>
```

---

### 6. **TrendCard**
Tarjeta para mostrar métricas con tendencias (cambio y porcentaje respecto a valor anterior).

**Props:**
- `label: string` - Etiqueta de la métrica
- `currentValue: number | null` - Valor actual
- `previousValue?: number | null` - Valor anterior para comparar
- `unit: string` - Unidad de medida
- `decimals?: number` - Cantidad de decimales (default: 1)
- `higherIsBetter?: boolean` - Si valores más altos son mejores (default: true)
- `icon?: keyof typeof Ionicons.glyphMap` - Icono opcional
- `iconColor?: string` - Color personalizado del icono

**Ejemplo:**
```tsx
<TrendCard
  label="Peso"
  currentValue={74.5}
  previousValue={76.2}
  unit="kg"
  decimals={1}
  higherIsBetter={false}
  icon="scale-outline"
/>
```

---

### 7. **PillSelector**
Selector horizontal de pills/tabs para filtros, períodos de tiempo, categorías, etc.

**Props:**
- `options: PillOption<T>[]` - Array de opciones
- `selected: T` - Valor seleccionado
- `onSelect: (value: T) => void` - Callback al seleccionar
- `activeColor?: string` - Color de fondo del pill seleccionado (default: 'bg-blue-500')
- `className?: string` - Clases adicionales

**PillOption Interface:**
```typescript
interface PillOption<T = string> {
  value: T;
  label: string;
}
```

**Ejemplo:**
```tsx
const periods = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' }
];

<PillSelector
  options={periods}
  selected="30d"
  onSelect={(value) => setPeriod(value)}
/>
```

---

## Características Generales

✅ **TypeScript**: Todos los componentes están completamente tipados
✅ **Dark Mode**: Soporte completo para tema oscuro/claro
✅ **Responsive**: Se adaptan a diferentes tamaños de pantalla
✅ **Accesibilidad**: Diseñados siguiendo principios de accesibilidad
✅ **Reutilizables**: Pueden usarse en cualquier parte de la aplicación
✅ **Consistentes**: Mantienen el diseño uniforme de la app

## Uso

Importar desde `@shared/components/ui`:

```tsx
import {
  Badge,
  MetricCard,
  TrendCard,
  IconButton,
  InfoSection,
  SelectorModal,
  PillSelector,
  type SelectorItem,
  type PillOption
} from '@shared/components/ui';
```

## Próximos Componentes a Refactorizar

- [ ] Button (mejorar el existente)
- [ ] Card (mejorar el existente)
- [ ] Input (mejorar el existente)
- [ ] FormField (mejorar el existente)
- [ ] Modal genérico base
- [ ] Dropdown/Select
- [ ] DatePicker
- [ ] TimePicker
- [ ] Switch/Toggle mejorado
- [ ] Slider
- [ ] Tabs
- [ ] Accordion
- [ ] Alert/Toast
- [ ] Loading/Skeleton
