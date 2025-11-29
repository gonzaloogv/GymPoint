# TEST QA   

Rol: Senior QA Architect & Automation Engineer.

OBJETIVO: Generar tests para src/services/ usando una estrategia inteligente basada en la complejidad del servicio.

## FASE 1: Calibración del Estilo (Tus Referencias)
Referencia para Servicios Complejos: Analiza la carpeta tests/unit/service/auth-service/.

Observa cómo se divide la lógica en múltiples archivos.

Observa cómo test-setup.js centraliza los mocks comunes.

Regla: Si creamos una carpeta, los imports deben ajustarse (subir un nivel extra ../../).

Referencia para Servicios Simples: Asume el estándar clásico de Jest: un solo archivo [nombre].test.js que contiene todos los describe.

## FASE 2: Ejecución (Repetible por Service)
Te proporciono: src/services/[Nombre_Service].js

Tu Proceso de Decisión (Algoritmo):

📏 ANÁLISIS DE TAMAÑO: Lee el código del servicio. Cuenta mentalmente los métodos públicos y la cantidad de dependencias.

Criterio de corte: Si tiene > 4 métodos públicos complejos O estimas que el test superará las 300 líneas -> Es COMPLEJO.

Si es menor: -> Es SIMPLE.

🛠️ GENERACIÓN:

CAMINO A (Es SIMPLE):

Crea un solo archivo: tests/unit/service/[nombre-service].test.js.

Incluye mocks y tests en ese mismo archivo.

CAMINO B (Es COMPLEJO):

Crea una carpeta: tests/unit/service/[nombre-service]/.

Crea un archivo test-setup.js dentro, con los mocks de las dependencias globales del servicio (Repositories, Mappers).

Divide los tests en 2 o más archivos lógicos (ej: [nombre].core.test.js, [nombre].actions.test.js).

Asegúrate de importar los mocks desde ./test-setup.js en los archivos de test.

🛡️ REGLAS DE ORO:

Cobertura: Happy Path + 2 Edge Cases por método.

Estilo: Copia estrictamente la sintaxis de expect y jest.fn() que viste en la carpeta auth-service.

Salida Esperada:

Diagnóstico: "Analizado PaymentService. Es COMPLEJO. Estrategia: Carpeta Modular."

Código: Genera los archivos necesarios (indica claramente el nombre y ruta de cada uno).