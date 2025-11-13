# HISTORIAL DE CAMBIOS - GYMPOINT

## Documento de Control de Versiones

| Versión | Fecha | Edición | Descripción |
|---------|-------|---------|-------------|
| 1.5.0 | 2025-11-12 | Websockets | Integración de WebSockets en todo el monorepo para comunicación en tiempo real |
| 1.4.5 | 2025-11-12 | Achievements | Implementación de botón para desbloquear logros (achievements). Pendiente corrección en retorno de nombre y descripción |
| 1.4.0 | 2025-11-11 | Recompensas | Cambios en lógica de negocio de recompensas, mejoras visuales y correcciones en Weekly Progress |
| 1.3.5 | 2025-11-11 | Recompensas | Ajustes visuales en sistema de recompensas después de nueva lógica de negocio |
| 1.3.0 | 2025-11-11 | Sistema de Recompensas | Implementación de lógica para rewards: casos automáticos y acumulables |
| 1.2.5 | 2025-11-10 | Rutinas | Corrección de bugs en módulo de rutinas. Mejoras pendientes en lógica de rewards |
| 1.2.0 | 2025-11-10 | Integración Completa | Patrón visual consistente en proyecto. Integración de: rewards, daily challenges, routines y achievements. Corrección pendiente: parpadeo de modal en routine |
| 1.1.5 | 2025-11-08 | UI/UX | Generación de consistencia visual en toda la aplicación |
| 1.1.0 | 2025-11-06 | Desafíos Diarios | Inicio de consistencia visual y agregación de módulo de desafíos diarios (Daily Challenges) |
| 1.0.5 | 2025-11-05 | Rutinas | Corrección de problemas en rutinas. Finalización de RoutineScreen con ejecución. Agregación de SVGs para iconos principales de HomeScreen |
| 1.0.4 | 2025-11-05 | UI Routine | Cambios en UI de rutinas y lógica de backend. Preparación para integración de Daily Challenge a frontend |
| 1.0.3 | 2025-11-05 | Routine UI | Integración de cambios visuales con routine-ui y mejoras en lógica |
| 0.9.5 | 2025-11-03 | Testing | Agregación de tests para controller y mapper de assistance. Tests de service pendientes |
| 0.9.4 | 2025-11-03 | Notificaciones | Integración de validation.ts. API de notificaciones de usuario. Cambio de UI para botón único de notificaciones push. Refactorización de estructura de tests |
| 0.9.3 | 2025-11-02 | Backend | Correcciones menores en backend |
| 0.9.2 | 2025-10-31 | Progreso | Cambios visuales en módulo de progreso |
| 0.9.1 | 2025-10-31 | Timeline | Agregación de línea de tiempo en progress con mejoras visuales |
| 0.9.0 | 2025-10-31 | Progreso Físico | Integración de progreso físico. Usuarios free: 1/mes, usuarios premium: 1/semana |
| 0.8.5 | 2025-10-30 | Reviews y Websockets | Integración correcta de reviews y websockets. Finalización de integración de GymDetails |

---

## Notas

- **Versión actual**: 1.5.0
- **Última actualización**: 12 de noviembre de 2025
- **Estado del proyecto**: En desarrollo activo

## Módulos Principales

1. **Sistema de Recompensas (Rewards)**: Sistema de recompensas automáticas y acumulables
2. **Logros (Achievements)**: Sistema de desbloqueo de logros
3. **Rutinas (Routines)**: Gestión y ejecución de rutinas de ejercicio
4. **Desafíos Diarios (Daily Challenges)**: Sistema de desafíos diarios para usuarios
5. **Progreso (Progress)**: Seguimiento de progreso físico y estadísticas
6. **WebSockets**: Comunicación en tiempo real
7. **Notificaciones Push**: Sistema de notificaciones para usuarios

## Convenciones de Versionado

- **Mayor (X.0.0)**: Cambios significativos o nuevas funcionalidades principales
- **Menor (0.X.0)**: Nuevas características o mejoras importantes
- **Parche (0.0.X)**: Correcciones de bugs y mejoras menores
