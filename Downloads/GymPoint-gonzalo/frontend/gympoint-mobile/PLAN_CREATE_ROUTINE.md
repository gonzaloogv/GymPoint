# Plan de Acción: Rediseño de CreateRoutineScreen

## Contexto
Actualmente la pantalla `CreateRoutineScreen` tiene 3 pasos (Básicos, Ejercicios, Revisión) con un indicador de pasos en la parte superior. El objetivo es cambiar el diseño para que tenga el mismo look que muestra la imagen del mockup, con un indicador de pasos mejorado y toda la información básica visible en el primer paso.

## Análisis Actual
- **Archivo principal**: `src/features/routines/presentation/ui/screens/CreateRoutineScreen.tsx`
- **Componentes de steps**:
  - `BasicInfoStep.tsx` - Contiene nombre, objetivo y grupos musculares
  - `ExercisesStep.tsx` - Lista de ejercicios con formulario
  - `ReviewStep.tsx` - Resumen final
- **Componente indicador**: `StepIndicator.tsx` - Indicador actual de pasos

## Objetivos del Rediseño

### 1. Actualizar StepIndicator
- Cambiar el diseño para que coincida con el mockup
- Círculos con números para cada paso
- Labels descriptivos debajo de cada círculo
- Líneas de conexión entre pasos
- Estados: activo (azul), completado (azul), pendiente (gris)
- Mejorar el espaciado y la tipografía

### 2. Mantener BasicInfoStep
- Ya tiene los campos correctos:
  - Nombre de la rutina (con placeholder)
  - Objetivo (chips: Fuerza, Hipertrofia, Resistencia)
  - Grupos musculares (chips múltiples: Pecho, Espalda, Piernas, etc.)
- Solo ajustar estilos para que coincidan con el mockup

### 3. Ajustes de Layout en CreateRoutineScreen
- Verificar que el Header esté correctamente estilizado
- Ajustar padding/margins del StepIndicatorContainer
- Asegurar que el botón "Siguiente" esté bien posicionado en el footer
- Verificar colores del tema

## Tareas Detalladas

### Fase 1: Actualizar StepIndicator ✅
**Archivo**: `src/features/routines/presentation/ui/components/StepIndicator.tsx`

- [ ] Actualizar el diseño del círculo (tamaño, colores)
- [ ] Ajustar el label debajo del círculo con el formato correcto
- [ ] Mejorar las líneas de conexión entre pasos
- [ ] Añadir sublabels descriptivos (ej: "Info general", "Seleccionar", "Confirmar")
- [ ] Verificar estados visuales (activo, completado, pendiente)

### Fase 2: Refinar BasicInfoStep ✅
**Archivo**: `src/features/routines/presentation/ui/components/steps/BasicInfoStep.tsx`

- [ ] Verificar que tenga el campo "Nombre de la rutina" con el placeholder correcto
- [ ] Verificar que el ejemplo "Ej: Rutina de fuerza" esté visible
- [ ] Asegurar que los chips de Objetivo estén estilizados correctamente
- [ ] Asegurar que los chips de Grupos musculares estén estilizados correctamente
- [ ] Ajustar espaciado y márgenes según mockup

### Fase 3: Verificar y Ajustar CreateRoutineScreen
**Archivo**: `src/features/routines/presentation/ui/screens/CreateRoutineScreen.tsx`

- [ ] Verificar que el Header tiene el título "Nueva rutina" y el botón de back
- [ ] Asegurar que el StepIndicator se muestra correctamente
- [ ] Verificar que el botón "Siguiente" funciona correctamente
- [ ] Añadir lógica para deshabilitar "Siguiente" si faltan campos obligatorios
- [ ] Verificar colores del tema en todos los componentes

### Fase 4: Verificar ExercisesStep y ReviewStep
**Archivos**:
- `src/features/routines/presentation/ui/components/steps/ExercisesStep.tsx`
- `src/features/routines/presentation/ui/components/steps/ReviewStep.tsx`

- [ ] Verificar que ExercisesStep funciona correctamente
- [ ] Verificar que ReviewStep muestra la información correctamente
- [ ] Ajustar estilos si es necesario

### Fase 5: Testing y Refinamiento
- [ ] Probar el flujo completo de creación de rutina
- [ ] Verificar transiciones entre pasos
- [ ] Verificar validaciones de campos
- [ ] Ajustar cualquier detalle visual que no coincida con el mockup

## Componentes UI Necesarios

Ya existen en el proyecto:
- `Input` - Campo de texto
- `FormField` - Wrapper para campos de formulario con label
- `Button` - Botones principales
- `ChipSelector` - Selector de chips (usado en objetivos y grupos musculares)
- `Label` - Labels para formularios
- `StepScrollContainer` - Contenedor scrollable para los steps
- `StepSection` - Sección dentro de un step

## Notas de Implementación

1. **Colores del Tema**: Usar siempre `theme.colors` para mantener consistencia
2. **Espaciado**: Usar la función `sp(theme, n)` para espaciado consistente
3. **Border Radius**: Usar la función `rad(theme, 'size', fallback)` para bordes redondeados
4. **Tipografía**: Seguir la jerarquía de tamaños existente en el proyecto
5. **Validaciones**: Considerar validar que el nombre de la rutina no esté vacío antes de permitir avanzar

## Referencias de Archivos

```
src/features/routines/presentation/ui/
├── screens/
│   └── CreateRoutineScreen.tsx          (Pantalla principal)
├── components/
│   ├── StepIndicator.tsx                (Indicador de pasos)
│   └── steps/
│       ├── BasicInfoStep.tsx            (Paso 1: Info básica)
│       ├── ExercisesStep.tsx            (Paso 2: Ejercicios)
│       └── ReviewStep.tsx               (Paso 3: Revisión)
```

## Criterios de Aceptación

✅ El StepIndicator coincide con el diseño del mockup
✅ El paso 1 muestra: nombre, objetivo y grupos musculares
✅ Los chips se pueden seleccionar correctamente
✅ El botón "Siguiente" avanza al siguiente paso
✅ El botón "Atrás" regresa al paso anterior o cierra la pantalla
✅ El flujo completo funciona de principio a fin
✅ Los estilos coinciden con el mockup proporcionado
✅ Las validaciones funcionan correctamente
