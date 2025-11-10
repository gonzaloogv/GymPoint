# Prompt de Refactorización de UI en React Native con NativeWind

**Rol:** Actúa como un desarrollador Front-End Senior y experto en UI/UX, especializado en refactorización de código React Native y la implementación de Sistemas de Diseño con **NativeWind (Tailwind CSS)**.

**Objetivo:** Armonizar la consistencia visual de un conjunto de pantallas existentes, basándote en el lenguaje de diseño de una carpeta de referencia. El objetivo final es que todas las pantallas modificadas se sientan parte de la misma aplicación que la referencia, utilizando exclusivamente las *utility classes* de NativeWind.

**Contexto del Proyecto:**
* **Stack:** React Native con **NativeWind**.
* **Problema:** Tengo un conjunto de pantallas complejas que son visualmente inconsistentes con el resto de la aplicación. Usan diferentes tamaños de fuente, iconos (ej. botones de retroceso), estilos de tarjetas, botones e inputs.
* **Carpeta de Referencia (Fuente de la Verdad):** `[Ruta/a/la/CarpetaDeReferencia]`
    * *Descripción:* Esta carpeta contiene las pantallas y componentes que definen el estilo visual correcto y el uso de NativeWind.
* **Carpeta a Modificar (Objetivo):** `[Ruta/a/la/CarpetaAModificar]`
    * *Descripción:* Esta carpeta contiene las pantallas (y sus componentes locales) que actualmente están desactualizadas (probablemente usando `StyleSheet` o clases incorrectas) y necesitan ser refactorizadas.

---

## Tarea Detallada (Paso a Paso)

### Fase 1: Análisis (Deconstrucción del Estilo de Referencia)

1.  **Analiza la `[Carpeta de Referencia]`.** Enfócate en las `className` que utilizan. Si tienes acceso, **analiza el `tailwind.config.js`** para entender los tokens de diseño personalizados (colores, fuentes, espaciado).
2.  **Identifica los "Design Tokens" y "Utility Classes" clave:**
    * **Tipografía:** ¿Qué clases se usan para la jerarquía? (Ej. `text-lg font-bold text-neutral-900`, `text-sm font-regular text-gray-600`).
    * **Paleta de Colores:** ¿Cuáles son los colores personalizados? (Ej. `bg-primary`, `text-secondary`, `border-destructive`, `bg-background`, `bg-card`).
    * **Espaciado (Spacing):** ¿Qué sistema de espaciado se usa? (Ej. `p-4`, `m-2`, `gap-3`, `space-y-4`).
    * **Bordes y Sombras:** ¿Qué clases de `borderRadius` y `shadow` son estándar? (Ej. `rounded-lg`, `rounded-full`, `shadow-md`, `shadow-lg`).
    * **Iconografía:** ¿Qué familia de iconos se usa y qué clases de tamaño/color se les aplica? (Ej. `size-5 text-neutral-500`).

3.  **Analiza los Componentes Reutilizables Clave:**
    * ¿Cómo se construye un `<Button>`? (Ej. `<Pressable className="bg-primary p-3 rounded-lg">...`).
    * ¿Cómo se construye un `<Input>`? (Ej. `<TextInput className="border border-input bg-background p-2 rounded-md">...`).
    * ¿Cómo se construye una `<Card>`? (Ej. `<View className="bg-card p-4 rounded-xl shadow-sm">...`).

### Fase 2: Ejecución (Refactorización de la Carpeta Objetivo)

1.  **Recorre los archivos en la `[Carpeta a Modificar]`.**
2.  Para cada pantalla y componente, **refactoriza los estilos para usar `className` de NativeWind**.
3.  **Modifica los componentes existentes:**
    * **Texto:** Reemplaza `style={{...}}` y `StyleSheet` por clases de NativeWind (ej. `className="text-lg font-semibold text-gray-900"`).
    * **Botones, Inputs, Cards:** Reemplaza sus estilos por `className` para aplicar `padding`, `backgroundColor`, `borderRadius` y `shadow` (ej. `className="bg-white p-4 rounded-xl shadow-sm"`).
    * **Iconos:** Reemplaza los iconos incorrectos (especialmente "back buttons") y aplica las clases de NativeWind correctas para tamaño y color.
    * **Layout y Espaciado:** Elimina `margin` y `padding` de `StyleSheet` y usa utilidades como `gap-4`, `space-y-2`, `p-6`, `m-4` en los `className` de los contenedores.

---

## Reglas Críticas y Restricter (¡Importante!)

1.  **NO ROMPER LA LÓGICA:** La funcionalidad de estas pantallas es compleja. **No modifiques** la lógica de negocio, el manejo de estado (`useState`, `useReducer`), las llamadas a API (`useEffect`) o el flujo de datos. Tu trabajo es *exclusivamente* visual y de estilo.

2.  **FOCO TOTAL EN NATIVEWIND:** Este es el cambio principal. **No uses `StyleSheet.create`** para ningún estilo nuevo. Todo el estilo visual debe manejarse a través de *utility classes* en la prop `className`. Si encuentras estilos complejos en línea (`style={{...}}`) que no tienen una utilidad de Tailwind, evalúa si deben agregarse al `tailwind.config.js`.

3.  **ADAPTACIÓN INTELIGENTE, NO COPIA CIEGA:** Si una pantalla en la `[Carpeta a Modificar]` tiene un componente único (ej. un gráfico) que no existe en la referencia, **no lo reemplaces**. En su lugar, **aplica el *estilo*** (colores, fuentes, bordes) usando las clases de NativeWind a ese componente único para que se integre visualmente.

4.  **REUTILIZA COMPONENTES EXISTENTES:** Si la `[Carpeta de Referencia]` ya define componentes reutilizables (ej. `<Button>`, `<Card>`, `<Input>`) que ya tienen el estilo de NativeWind aplicado, **prioriza importar y usar esos componentes** en lugar de volver a crear el estilo con `className` en un `<View>` o `<Pressable>` genérico.

## Entregable

Inicia el proceso de refactorización. Muéstrame los cambios (diffs) archivo por archivo para mi revisión, o lista los archivos que modificarás con un resumen de los cambios planeados antes de aplicarlos.