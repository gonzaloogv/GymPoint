### 🚀 Plan de Tarea (Tu Workflow)

Este es tu plan de ejecución principal. **Tienes total autonomía para dividir las siguientes Fases en sub-tareas o fases más pequeñas según lo consideres necesario para garantizar la calidad y corrección del trabajo.**

Tu objetivo es completar la misión de principio a fin. Deberás reportar cada fase y sub-fase completada en el `AGENT_TASK.log`.

**Fase 0: Preparación**

1.  Crearás un archivo temporal en la raíz del monorepo: `AGENT_TASK.log`.
2.  Escribirás en este log cada paso que tomes. (ej. "Iniciando Tarea para `exercise.js`", "Obteniendo JWT...", "JWT Obtenido.", "Probando endpoint GET /api/v1/exercises...").

**Fase 1: Validación y Arreglo del Backend (`backend/node`)**

1.  **Obtener JWT:** Ejecuta el flujo de autenticación. Si falla, detente y escríbelo en el log.
2.  **Analizar:** Lee el modelo que te pasé (ej. `exercise.js`). Identifica sus rutas, controlador, servicio, repositorio y mapper asociados en el backend.
3.  **Testear Endpoints (curl):**
    * Ejecutarás `curl` (con el JWT) para los 5 métodos (GET all, GET byId, POST, PUT, DELETE) del modelo.
    * Usarás un JSON de prueba válido (basado en el modelo) para POST y PUT.
4.  **Validar y Arreglar:**
    * **Si el `curl` falla (Error 500, 404, etc.) O si los datos devueltos no coinciden con el modelo:**
    * Esta es la parte crítica. **El archivo del Modelo (`exercise.js`) es la "fuente de la verdad".**
    * Rastrearás el error (Controller -> Service -> Repository -> Mapper).
    * **Corregirás el código** en el backend (el `service`, el `mapper`, el `controller`, etc.) para que la lógica coincida con la estructura del *modelo*.
    * **Si el path de OpenAPI no existe:** Lo agregarás y ejecutarás el script de "bundle" de OpenAPI (búscalo en `package.json`).
5.  **Re-Testear:** Repetirás el `curl` hasta que el endpoint funcione, esté protegido por auth, y devuelva el JSON correcto.
6.  *Log:* "Fase Backend para `exercise` completada y validada."

**Fase 2: Implementación del Frontend (`frontend/gympoint-mobile`)**

1.  **Analizar Arquitectura:** Cambiarás al directorio del frontend. Revisarás `src/features/auth/` (o cualquier otra feature existente) para entender la arquitectura exacta de DI, mappers y repositorios.
2.  **Crear Feature:** Crearás la nueva estructura de carpetas (ej. `src/features/exercise/`).
3.  **Escribir Código (Scaffolding):** Siguiendo la arquitectura existente, crearás la pila completa:
    * `domain/entities/exercise.entity.ts` (basado en el modelo del backend).
    * `domain/repositories/exercise.repository.ts` (la interfaz).
    * `data/dtos/exercise.dto.ts` (si es necesario para mapear).
    * `data/mappers/exercise.mapper.ts` (para convertir el JSON del API a la Entidad del dominio).
    * `data/remote/exercise.api.ts` (o como se llame el servicio que hace `fetch`/`axios`).
    * `data/repositoryimpl/ExerciseRepositoryImpl.ts` (la implementación concreta del repositorio).
4.  **Inyección de Dependencias (DI):**
    * Buscarás el archivo principal de DI (ej. `container.ts`, `di.ts`).
    * **Modificarás** ese archivo para registrar las nuevas implementaciones (ej. `container.register("ExerciseRepository", ...)`).
5.  *Log:* "Fase Frontend para `exercise` implementada."

**Fase 3: Finalización**

1.  *Log:* "Tarea completada."
2.  **Me notificarás con una sola frase:** "Tarea completada para `[nombre_del_modelo]`. El backend fue validado y el stack del frontend fue implementado. Revisa `AGENT_TASK.log` para ver los detalles."