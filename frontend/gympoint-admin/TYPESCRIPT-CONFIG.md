# Configuración de TypeScript en GymPoint Admin

## 📋 Resumen

El proyecto **gympoint-admin** está configurado para usar **TypeScript** con **React** (TSX).

---

## 📁 Archivos de Configuración

### `tsconfig.json`
Configuración principal de TypeScript para el código fuente:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Características clave:**
- ✅ `jsx: "react-jsx"` - Soporte para JSX/TSX sin necesidad de importar React
- ✅ Path mapping `@/*` para imports absolutos
- ✅ `strict: false` - Modo no estricto para facilitar migración
- ✅ `noEmit: true` - TypeScript solo verifica tipos, Vite compila

### `tsconfig.node.json`
Configuración para archivos de configuración de Node (vite.config.js):

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.js"]
}
```

### `jsconfig.json`
Configuración legacy para JavaScript (se mantiene para compatibilidad):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📦 Dependencias

### Instaladas
```json
{
  "devDependencies": {
    "@types/node": "^24.7.0",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "typescript": "^5.x.x"
  }
}
```

---

## 🛠️ Scripts NPM

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo con Vite.

### Verificación de Tipos
```bash
npm run type-check
```
Ejecuta TypeScript para verificar tipos sin compilar.

### Build
```bash
npm run build
```
Compila el proyecto para producción.

### Lint
```bash
npm run lint
```
Ejecuta ESLint para verificar el código.

---

## 📝 Convenciones de Archivos

### Extensiones
- `.tsx` - Componentes de React con TypeScript
- `.ts` - Archivos TypeScript sin JSX
- `.jsx` - Componentes de React con JavaScript (legacy)
- `.js` - Archivos JavaScript (legacy)

### Estructura de Componentes
```typescript
// Ejemplo: src/presentation/components/ui/MyComponent.tsx
import { useState } from 'react';
import { MyType } from '@/domain';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [state, setState] = useState<string>('');

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

---

## 🎯 Path Mapping

El proyecto usa path mapping para imports absolutos:

```typescript
// ❌ Imports relativos (evitar)
import { Gym } from '../../../domain/entities/Gym';

// ✅ Imports absolutos (preferido)
import { Gym } from '@/domain/entities/Gym';
import { GymRepository } from '@/domain/repositories/GymRepository';
import { Card } from '@/presentation/components';
```

---

## 🔍 Verificación de Tipos

### En el Editor
VS Code y otros editores detectan automáticamente `tsconfig.json` y proveen:
- Autocompletado inteligente
- Verificación de tipos en tiempo real
- Navegación a definiciones
- Refactoring seguro

### En la Terminal
```bash
# Verificar tipos sin compilar
npm run type-check

# Verificar tipos en modo watch
npx tsc --noEmit --watch
```

---

## 🐛 Solución de Problemas

### Error: "Cannot use JSX unless the '--jsx' flag is provided"
**Solución:** Asegúrate de que:
1. Existe `tsconfig.json` con `"jsx": "react-jsx"`
2. El archivo tiene extensión `.tsx` (no `.ts`)
3. TypeScript está instalado: `npm install --save-dev typescript`

### Error: "Cannot find module '@/domain'"
**Solución:** Verifica que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: Type errors en componentes
**Solución:** Si necesitas migración gradual, puedes:
1. Usar `// @ts-ignore` para líneas específicas
2. Usar `any` temporalmente: `const data: any = ...`
3. Desactivar strict mode en `tsconfig.json`

---

## 📚 Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)

---

## ✅ Estado Actual

- ✅ TypeScript configurado correctamente
- ✅ JSX/TSX funcionando
- ✅ Path mapping `@/*` activo
- ✅ Tipos para React instalados
- ✅ Componentes nuevos usando TSX:
  - `GymForm.tsx`
  - `GymCard.tsx`
  - `Gyms.tsx`

---

**Última actualización:** 16 de octubre de 2025




