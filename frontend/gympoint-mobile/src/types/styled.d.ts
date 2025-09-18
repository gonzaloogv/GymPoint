// src/types/styled.d.ts

/// <reference types="styled-components" />

// 👇 Importa ambos módulos para RN (v6 unifica, pero TS a veces no enlaza el de /native)
import 'styled-components';
import 'styled-components/native';

import type { AppTheme } from '../config/theme';

// 👇 Extiende el tema en los dos módulos
declare module 'styled-components' {
  // Para imports desde 'styled-components'
  export interface DefaultTheme extends AppTheme {}
}

declare module 'styled-components/native' {
  // Para imports desde 'styled-components/native'
  export interface DefaultTheme extends AppTheme {}
}
