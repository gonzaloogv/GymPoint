# agent.md — Guía para un Agente de Refactor con Arquitectura Limpia

> **Objetivo**: Este agente debe leer el repositorio, aplicar un refactor guiado por **Arquitectura Limpia**, reduciendo complejidad y redundancias, **sin alterar el comportamiento observable**. Debe **mantener componentes ≤ 80 líneas** (cuando sean top‑level de UI) y usar subcomponentes/hooks cuando corresponda. **Aplicar patrones SOLAMENTE si son altamente necesarios** para mejorar diseño, testabilidad o desacople.

---

## 1) Alcance y prioridades
1. **Mantener funcionalidad** (contratos públicos, rutas, eventos, API responses, UX actual).  
2. **Limpieza y legibilidad**: dividir en piezas pequeñas, nombres claros, eliminar código muerto/repetido.  
3. **Arquitectura Limpia**: dominio independiente del framework; UI fina; infraestructura reemplazable.  
4. **Patrones sólo si aportan alto valor** (ver §6).  
5. **Comentarios mínimos y significativos**: sólo para decisiones no obvias (ver §11).

---

## 2) Capas y límites (Clean Architecture)
- **Domain**: entidades, value objects, reglas de negocio puras; sin imports de framework.  
- **Application (use cases)**: orquesta flujos; define puertos (interfaces) hacia infraestructura; pura/agnóstica.  
- **Infrastructure**: implementaciones de puertos (HTTP, DB, storage, mapas, sensores, etc.).  
- **Presentation/UI**: componentes, navegación, view-models/adaptadores; sin lógica de negocio.

**Reglas:**  
- UI → Application → Domain (dirección de dependencias).  
- Infrastructure depende de Application/Domain (no al revés).  
- Contratos cruzan capas vía **interfaces** (puertos/adaptadores).  
- No lógica de negocio en componentes UI.

---

## 3) Convenciones de carpetas (ajustar a repo actual)
```
/src
  /di                # containers 
  /application       # casos de uso, puertos (interfaces), DTOs de app
  /infrastructure    # http clients, device APIs, repos, mappers infra
  /presentation      # UI, navegación, view-models, hooks UI
  /features          # e.g., gyms, routines, auth, rewards, etc.
  /shared            # utilidades cross-layer (estrictamente puras), tokens UI
    /components
      /ui            # Button, Input, Card, Badge, MapBox, etc. (UI genérica)
    /styles          # design tokens (spacing, radius, colors, font sizes)
    /hooks           # hooks genéricos sin lógica de negocio
```
> **Nota**: Mantener **@shared/components/ui** para UI genérica y separar **brand** en `@shared/components/brand`.

---

## 4) Presupuestos de líneas y granularidad
- **Componentes de pantalla/top‑level**: ≤ **80 líneas**.  
- **Subcomponentes UI** (puros/“dumb”) o **hooks**: lo necesario, pero **preferir ≤ 120 líneas** por archivo.  
- **Casos de uso**: claros y autocontenidos (ideal ≤ 120 líneas).  
- Si un archivo supera el límite: **extraer** subcomponentes, helpers o hooks.

---

## 5) Reglas de refactor
1. **Eliminar** imports no usados, estados locales no usados, constantes duplicadas, estilos repetidos.  
2. **Extraer** lógica repetida en helpers/hook compartidos.  
3. **Sustituir** `any` por tipos precisos. TS `strict` cuando sea viable.  
4. **No cambiar APIs públicas**; si hay que cambiar, crear **adaptador** y deprecar gradual.  
5. **No mover lógica de negocio a UI**; trasladar al caso de uso o servicio de dominio.  
6. **Nombres** semánticos (sustantivos para componentes/entidades; verbos para funciones/casos de uso).  
7. **Estado**: global sólo si cruza pantallas; local preferible en UI.  
8. **Side‑effects** en infraestructura (no en dominio).  
9. **Mapas y sensores** (RN/Expo): envolver en puertos de Application + adaptadores en Infrastructure.  
10. **Accesibilidad y rendimiento**: ver §9 y §10.

---

## 6) Patrones — usar sólo si **altamente necesarios**
**Criterio de uso**: Aplica un patrón **únicamente** si soluciona un dolor real medible: duplicación, fuerte acoplamiento, ramas condicionales múltiples, fuentes de datos sustituibles, o flujos intrincados.

- **Repository**: para desacoplar acceso a datos de casos de uso.  
- **Adapter/Port**: para frameworks, SDKs (mapas, geoloc, cámara), HTTP, almacenamiento.  
- **Factory/Builder**: creación compleja de entidades/VOs; evitar “telescoping constructors”.  
- **Strategy**: múltiples variantes intercambiables (p. ej., ordenamiento, filtros).  
- **Facade**: simplificar subsistemas ruidosos (p. ej., permisos + sensores).  
- **Presenter/ViewModel**: mapear Domain→UI (formateos, flags).  
- **State Machine** (XState o casera minimal): sólo para flujos con estados/eventos no triviales.

**Evitar**: Singleton global para datos, Service Locator, herencias profundas, over‑engineering.

---

## 7) Estilo de código
- **TypeScript** consistente, `noImplicitAny` y `strictNullChecks`.  
- **Formato**: Prettier + ESLint (airbnb/standard + reglas para RN si aplica).  
- **Nomenclatura archivos**: `PascalCase` para componentes, `camelCase` utilidades/hooks.  
- **Imports**: absolutos con alias (`@shared`, `@features`, etc.).  
- **Estilos UI**: tokens (`spacing`, `radius`, `colors`, `font`) desde `@shared/styles`.  
- **Sin comentarios obvios**; preferir código autoexplicativo.

---

## 8) React/React Native
- Componentes **puros** y pequeños; props explícitas; evita de ser necesaario `any`.  
- **Hooks**: una preocupación por hook (`useNearbyGyms`, `useUserLocation`, etc.).  
- **Efectos** limpios; dependencias correctas; cancelar suscripciones/timeouts.  
- **Memoización** prudente (`useMemo/useCallback`) sólo con impacto medible.  
- **Navegación**: mantener en `presentation/navigation`; evitar lógica de negocio en navegadores.  
- **Mapas/Permisos**: aislar en adaptadores de infraestructura; UI recibe datos ya curados.

---

## 9) Rendimiento
- **Listas**: `FlatList/SectionList` con `keyExtractor`, `getItemLayout` si posible.  
- **Re‑renders**: dividir en subcomponentes; `React.memo` cuando aporte.  
- **Cálculos** costosos: mover a caso de uso o memoizar.  
- **Mapas**: limitar renders de marcadores, agrupar, throttling en gestos.

---

## 10) Accesibilidad e i18n
- Etiquetas accesibles, roles/`accessibilityLabel`.  
- No codificar cadenas en UI; extraer a archivo de i18n si existe.  
- Contraste y tamaños legibles por defecto.

---

## 11) Política de comentarios
- **Sólo en decisiones críticas**: por qué se eligió un patrón, invariantes, trade‑offs.  
- Formato breve en bloque superior del archivo o encima del fragmento relevante.  
- comentar “qué hace” de ser algo importante; pero el código debe explicarlo.

---

## 12) Manejo de errores y logging
- **Domain/Application**: errores como tipos/Resultados (`Either/Result`) o excepciones controladas.  
- **Infraestructura**: capturar y mapear a errores de aplicación.  
- **UI**: estado de error con mensajes amigables; sin detalles internos.  
- Logs discretos (remover `console.log` de producción).

---

## 13) Testing (alcance mínimo)
- **Unit**: casos de uso, entidades, mappers.  
- **Component**: componentes claves (con mocks de puertos).  
- **Contract tests** para repos/adaptadores si hay back.  
- **Snapshots** sólo para UI estable.

---

## 14) Flujo de trabajo del agente
1. **Inventario**: mapear features, dependencias, puntos de dolor (duplicación, god‑components, lógica en UI).  
2. **Plan de cortes**: proponer particiones por archivos para cumplir **≤80 líneas** en pantallas.  
3. **Extraer**:
   - lógica de negocio → casos de uso (application)
   - integraciones → adaptadores (infrastructure)
   - UI compartida → `@shared/components/ui`
4. **Aplicar patrones** sólo si cumplen criterio del §6 (documentar en comentario corto al inicio del archivo).  
5. **Tipar** correctamente (DTOs, Entities, Props).  
6. **Eliminar** código muerto/duplicado; unificar helpers/tokens.  
7. **Pruebas mínimas** para piezas movidas; lint/format.  
8. **Verificación** de comportamiento: rutas, flujos críticos, rendimiento base.

---

## 15) Criterios de aceptación
- No se rompen flujos existentes ni contratos externos.  
- Pantallas/top‑level UI ≤ 80 líneas cada una.  
- Lógica de negocio fuera de UI.  
- Patrones usados sólo con justificación breve en comentario.  
- Sin imports no usados, sin duplicación evidente.  
- Tipado consistente sin `any` innecesarios.  
- Estructura de carpetas según §3.

---

## 16) Plantillas breves

**Componente UI (top‑level, ≤80 líneas)**
```tsx
import React from 'react';
import { Screen } from '@shared/components/ui';
import Header from './components/Header';
import List from './components/List';
import useViewModel from './useViewModel';

export default function FeatureScreen() {
  const vm = useViewModel();
  return (
    <Screen>
      <Header title={vm.title} onAction={vm.onAction} />
      <List items={vm.items} loading={vm.loading} onSelect={vm.onSelect} />
    </Screen>
  );
}
```

**Hook de ViewModel**
```ts
import { useMemo } from 'react';
import { useFeature } from '../application/usecases/useFeature';

export default function useViewModel() {
  const { data, loading, onSelect } = useFeature();
  return useMemo(() => ({
    title: 'Titulo',
    items: data,
    loading,
    onSelect,
  }), [data, loading, onSelect]);
}
```

**Caso de uso (Application)**
```ts
// Comentario breve: usa Strategy para ordenar resultados por distancia.
export interface FeatureRepo { fetch(): Promise<Item[]> }
export function makeUseFeature(repo: FeatureRepo) {
  return async function useFeature() { return await repo.fetch(); };
}
```

**Adaptador (Infrastructure)**
```ts
import { FeatureRepo } from '@application/usecases/makeUseFeature';
export const httpFeatureRepo = (client: Http): FeatureRepo => ({
  async fetch() { const r = await client.get('/feature'); return r.data; }
});
```

---

## 17) Anti‑patrones a evitar
- God components, lógica de negocio en efectos/render.  
- Enums/flags que mezclan capas.  
- Services con responsabilidades múltiples.  
- “Utilidades” que tocan frameworks y dominio en el mismo archivo.  
- Reducers gigantes para todo.

---

## 18) Notas finales
- Priorizar **legibilidad y separaciones claras** sobre micro‑optimizaciones.  
- Cada decisión no obvia debe tener un **comentario breve** explicando el **porqué** (no el qué).  
- El agente debe abrir PRs atómicos por feature/refactor para facilitar revisión.