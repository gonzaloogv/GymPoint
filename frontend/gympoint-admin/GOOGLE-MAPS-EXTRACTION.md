# 🗺️ Extracción Automática de Datos desde Google Maps

## 📋 Descripción

El formulario de gimnasios ahora incluye una funcionalidad que **extrae automáticamente** información cuando pegas una URL de Google Maps, incluyendo:
- ✅ Latitud
- ✅ Longitud  
- ✅ Nombre del lugar (si está disponible)

---

## 🎯 Cómo Usar

### Paso 1: Obtener la URL de Google Maps

1. Abre **Google Maps** en tu navegador
2. Busca el gimnasio o lugar
3. Haz clic en el lugar para ver sus detalles
4. Haz clic en **"Compartir"** o copia la URL de la barra de direcciones

### Paso 2: Pegar en el Formulario

1. En el formulario de gimnasio, ve a la sección **"Ubicación"**
2. Pega la URL en el campo **"URL de Google Maps"**
3. ¡La información se extraerá automáticamente! 🎉

---

## 📝 Formatos de URL Soportados

La función soporta múltiples formatos de URLs de Google Maps:

### Formato 1: URL Completa con Place
```
https://www.google.com/maps/place/Gimnasio+Central/@-27.4511,-58.9867,17z/data=...
```
**Extrae:** Latitud, Longitud, Nombre del lugar

### Formato 2: URL Simple con Coordenadas
```
https://www.google.com/maps/@-27.4511,-58.9867,17z
```
**Extrae:** Latitud, Longitud

### Formato 3: URL con Parámetro Query
```
https://maps.google.com/?q=-27.4511,-58.9867
```
**Extrae:** Latitud, Longitud

### Formato 4: URL Corta (shortened)
```
https://maps.app.goo.gl/abc123
```
**Nota:** Las URLs cortas primero redirigen. Mejor usar URL completa.

---

## 🔍 Qué se Extrae

### Coordenadas (Siempre)
- **Latitud**: Se extrae del patrón `@LAT,LNG` o `?q=LAT,LNG`
- **Longitud**: Se extrae del mismo patrón

### Nombre del Lugar (Si está disponible)
- Se extrae del formato: `/place/Nombre+Del+Lugar/`
- Espacios son reemplazados por `+` en la URL
- Se decodifica automáticamente

### Ejemplo de Extracción
**URL:**
```
https://www.google.com/maps/place/Iron+Temple+Gym/@-27.451234,-58.986789,17z
```

**Datos Extraídos:**
- Latitud: `-27.451234`
- Longitud: `-58.986789`
- Nombre: `Iron Temple Gym`

---

## ⚙️ Cómo Funciona (Técnico)

### 1. Detección Automática
```typescript
const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const url = e.target.value;
  
  // Si la URL es de Google Maps, extraer datos
  if (url && (url.includes('google.com/maps') || url.includes('maps.app.goo.gl'))) {
    extractFromGoogleMaps(url);
  }
};
```

### 2. Extracción por Regex
```typescript
// Formato @lat,lng
const coordPattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

// Formato ?q=lat,lng  
const coordPattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;

// Nombre del lugar
const placePattern = /\/place\/([^/@]+)/;
```

### 3. Actualización del Formulario
```typescript
setFormData((prev) => ({
  ...prev,
  latitude,
  longitude,
  google_maps_url: url,
  ...(placeName && !prev.name ? { name: placeName } : {})
}));
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Gimnasio con Nombre
**URL:**
```
https://www.google.com/maps/place/CrossFit+Resistencia/@-27.4511,-58.9867,17z
```

**Resultado:**
- ✅ Latitud: -27.4511
- ✅ Longitud: -58.9867
- ✅ Nombre: CrossFit Resistencia (se autocompleta si el campo está vacío)

### Ejemplo 2: Solo Coordenadas
**URL:**
```
https://www.google.com/maps/@-27.4511,-58.9867,15z
```

**Resultado:**
- ✅ Latitud: -27.4511
- ✅ Longitud: -58.9867
- ⚠️ Nombre: (debes ingresarlo manualmente)

### Ejemplo 3: Búsqueda por Query
**URL:**
```
https://maps.google.com/?q=-27.4511,-58.9867
```

**Resultado:**
- ✅ Latitud: -27.4511
- ✅ Longitud: -58.9867

---

## 🚀 Mejoras Futuras (Opcional)

### Integración con Google Maps Geocoding API

Si quieres obtener **más información** (dirección completa, ciudad, código postal):

```typescript
const getPlaceDetails = async (lat: number, lng: number) => {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.results && data.results[0]) {
    const result = data.results[0];
    
    // Extraer componentes de dirección
    const address = result.formatted_address;
    const city = result.address_components.find(c => 
      c.types.includes('locality')
    )?.long_name;
    
    return { address, city };
  }
};
```

**Nota:** Requiere API Key de Google Cloud con Geocoding API habilitada.

---

## ⚠️ Limitaciones Actuales

1. **Solo extrae de la URL**: No hace llamadas a APIs externas
2. **Nombre parcial**: Solo se extrae si está en el formato `/place/`
3. **No extrae dirección**: La dirección debe ingresarse manualmente
4. **URLs cortas**: Pueden no funcionar directamente (usar URL completa)

---

## 🐛 Solución de Problemas

### "No se pudieron extraer las coordenadas"
**Causa:** La URL no contiene coordenadas en el formato esperado

**Solución:**
1. Asegúrate de usar una URL de Google Maps
2. Verifica que la URL contenga coordenadas (formato `@LAT,LNG`)
3. Si es una URL corta, ábrela en el navegador y copia la URL completa

### El nombre no se autocompleta
**Causa:** La URL no tiene el formato `/place/Nombre/`

**Solución:**
- Ingresa el nombre manualmente
- O busca el lugar específico en Google Maps para obtener una URL con `/place/`

### Las coordenadas son incorrectas
**Causa:** Google Maps puede mostrar coordenadas en diferentes formatos

**Solución:**
1. Verifica las coordenadas extraídas
2. Puedes editarlas manualmente si es necesario
3. Formato esperado: Latitud (negativa al sur), Longitud (negativa al oeste)

---

## 📚 Recursos

- [Google Maps URL Parameters](https://developers.google.com/maps/documentation/urls/get-started)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)
- [Places API](https://developers.google.com/maps/documentation/places/web-service/overview)

---

**Última actualización:** 16 de octubre de 2025




