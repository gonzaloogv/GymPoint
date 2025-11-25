# 📚 Índice de Documentación - Colección Postman GymPoint

## 🚀 Empezar Aquí

### Para Principiantes
1. Lee **[QUICKSTART.md](./QUICKSTART.md)** - Guía rápida de 5 minutos
2. Importa los archivos en Postman
3. Ejecuta tu primer test

### Para Usuarios Avanzados
1. Lee **[README.md](./README.md)** - Documentación completa
2. Revisa **[RESUMEN.md](./RESUMEN.md)** - Vista general de la colección
3. Consulta **[test-data-examples.json](./test-data-examples.json)** - Datos de ejemplo
4. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución a problemas comunes

## 📁 Estructura de Archivos

```
postman/
├── 📄 INDEX.md                          ← Estás aquí
├── 📄 QUICKSTART.md                     ← Comienza aquí (5 min)
├── 📄 README.md                         ← Documentación completa
├── 📄 RESUMEN.md                        ← Vista general y estadísticas
├── 📄 TROUBLESHOOTING.md                ← Solución a problemas comunes
│
├── 📦 Archivos de Postman
│   ├── GymPoint-API-Collection.postman_collection.json    ← Colección principal
│   ├── GymPoint-Local.postman_environment.json           ← Entorno local
│   └── GymPoint-Production.postman_environment.json      ← Entorno producción
│
├── 🔧 Scripts de Ejecución
│   ├── run-tests.sh                     ← Script para Linux/Mac
│   └── run-tests.bat                    ← Script para Windows
│
├── ⚙️ Configuración
│   ├── newman.config.json               ← Configuración de Newman
│   ├── test-data-examples.json          ← Datos de prueba
│   └── .gitignore                       ← Archivos ignorados por git
│
└── 📊 Reportes
    └── test-reports/                    ← Reportes generados (HTML/JSON)
```

## 📖 Guías por Tarea

### ¿Quieres...?

#### Empezar rápidamente
→ Lee **QUICKSTART.md**  
Tiempo: 5 minutos

#### Entender todo en detalle
→ Lee **README.md**  
Tiempo: 15 minutos

#### Ver qué incluye la colección
→ Lee **RESUMEN.md**  
Tiempo: 5 minutos

#### Resolver un problema o error
→ Lee **TROUBLESHOOTING.md**  
Tiempo: Variable según el problema

#### Ejecutar tests desde terminal
→ Usa `run-tests.sh` (Linux/Mac) o `run-tests.bat` (Windows)

#### Integrar con CI/CD
→ Lee la sección "Integración CI/CD" en **README.md**

#### Personalizar datos de prueba
→ Edita **test-data-examples.json**

#### Ver ejemplos de requests
→ Importa **GymPoint-API-Collection.postman_collection.json** en Postman

## 🎯 Rutas de Aprendizaje

### Ruta 1: Usuario Nuevo (Principiante)
```
1. QUICKSTART.md (5 min)
2. Importar colección en Postman
3. Ejecutar Health Check
4. Ejecutar Register + Login
5. Explorar otros endpoints
```

### Ruta 2: Desarrollador (Intermedio)
```
1. README.md - Sección "Cómo Usar" (10 min)
2. Instalar Newman
3. Ejecutar tests desde CLI
4. Revisar reportes HTML
5. Personalizar variables de entorno
```

### Ruta 3: QA/DevOps (Avanzado)
```
1. README.md completo (15 min)
2. RESUMEN.md - Sección "Casos de Uso"
3. Configurar newman.config.json
4. Integrar en pipeline CI/CD
5. Automatizar ejecución de tests
```

## 🔍 Buscar Información Específica

### Endpoints y Requests
- **Lista completa de módulos**: RESUMEN.md → "Cobertura de Endpoints"
- **Ejemplos de cada endpoint**: Importar colección en Postman
- **Datos de ejemplo**: test-data-examples.json

### Configuración
- **Variables de entorno**: README.md → "Variables de Colección"
- **Configuración de Newman**: newman.config.json
- **Scripts de ejecución**: run-tests.sh / run-tests.bat

### Tests y Validaciones
- **Qué se valida**: README.md → "Tests Automatizados"
- **Cómo agregar tests**: QUICKSTART.md → "Personalizar los Tests"
- **Ver reportes**: README.md → "Ver Reportes"

### Troubleshooting
- **Problemas comunes**: README.md → "Troubleshooting"
- **Errores de autenticación**: QUICKSTART.md → "Solución de Problemas"

## 📊 Estadísticas Rápidas

| Métrica | Cantidad |
|---------|----------|
| **Endpoints** | 100+ |
| **Módulos** | 20 |
| **Tests Automáticos** | 200+ |
| **Variables de Entorno** | 8 |
| **Archivos de Documentación** | 5 |
| **Scripts de Automatización** | 2 |
| **Ejemplos de Datos** | 50+ |

## 🛠️ Comandos Rápidos

### Postman Desktop
```bash
# Importar colección
File → Import → Seleccionar archivos JSON

# Ejecutar colección
Click derecho → Run collection
```

### Newman CLI
```bash
# Instalar
npm install -g newman

# Ejecutar tests (Linux/Mac)
./run-tests.sh local

# Ejecutar tests (Windows)
.\run-tests.bat local

# Con npm
npm run test:postman
npm run test:postman:html
```

## 🎓 Recursos de Aprendizaje

### Documentación Oficial
- [Postman Learning Center](https://learning.postman.com/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [Postman Tests Guide](https://learning.postman.com/docs/writing-scripts/test-scripts/)

### Documentación del Proyecto
- [OpenAPI Spec](../docs/openapi.yaml) - Especificación completa de la API
- [Backend README](../README.md) - Documentación del backend

## 💡 Tips Rápidos

### Para Principiantes
- ✅ Empieza con Health Check (siempre funciona)
- ✅ Usa los datos de ejemplo tal como están
- ✅ Ejecuta los requests en orden dentro de cada carpeta
- ✅ Los tokens se guardan automáticamente

### Para Desarrolladores
- ✅ Usa Collection Runner para probar múltiples endpoints
- ✅ Personaliza las variables de entorno según tu setup
- ✅ Revisa los scripts de test para aprender
- ✅ Usa Newman para automatizar

### Para QA
- ✅ Guarda los reportes HTML para documentación
- ✅ Crea colecciones específicas para cada feature
- ✅ Integra con CI/CD para tests continuos
- ✅ Usa data files para testing con múltiples datasets

## 📞 Siguiente Paso

### ¿Primera vez aquí?
→ **QUICKSTART.md** es tu mejor opción

### ¿Necesitas detalles?
→ **README.md** tiene toda la información

### ¿Quieres una vista general?
→ **RESUMEN.md** te da el panorama completo

---

**¿Perdido? ¿No sabes por dónde empezar?**  
→ Lee **QUICKSTART.md** - En 5 minutos estarás haciendo tu primer test

**¿Necesitas ayuda?**  
→ Revisa la sección de Troubleshooting en **README.md**

**¿Quieres contribuir?**  
→ Lee la sección "Contribuir" en **README.md**

---

**Última actualización**: 25 de Octubre, 2025  
**Versión**: 1.0.0  
**Mantenedor**: Equipo GymPoint

