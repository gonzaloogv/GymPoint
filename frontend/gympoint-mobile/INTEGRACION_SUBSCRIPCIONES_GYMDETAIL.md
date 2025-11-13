# Guía de Integración: Suscripciones en GymDetailScreen

## 📋 Resumen

Esta guía explica cómo integrar la funcionalidad de suscripciones en el componente `GymDetailScreen`.

---

## 🔧 Paso 1: Importar los hooks y componentes necesarios

En `src/features/gyms/presentation/ui/screens/GymDetailScreen.tsx`:

```typescript
import { useGymSubscriptionStatus, SubscriptionButton } from '@features/subscriptions';
```

---

## 🎯 Paso 2: Usar el hook en el componente

Dentro del componente `GymDetailScreen`, después de obtener los datos del gimnasio:

```typescript
export function GymDetailScreen({ route, navigation }: Props) {
  const { gymId } = route.params;
  const { gym, isLoading, error } = useGymDetail(gymId);

  // ⭐ NUEVO: Hook de estado de suscripción
  const subscriptionStatus = useGymSubscriptionStatus(
    gymId,
    gym?.name || '',
    gym?.trial_allowed || false // Asegúrate que el gym DTO incluya trial_allowed
  );

  // ... resto del código
}
```

---

## 📦 Paso 3: Agregar el componente SubscriptionButton

Agrega el botón de suscripción en la sección apropiada (por ejemplo, después de la información básica y antes del botón de check-in):

```typescript
return (
  <ScrollView style={styles.container}>
    {/* Información existente del gimnasio */}
    <HeroImage imageUrl={gym.profileImageUrl} />
    <Header gym={gym} />
    <BasicInfo gym={gym} />

    {/* ⭐ NUEVO: Sección de suscripción */}
    <View style={styles.subscriptionSection}>
      <Text style={styles.sectionTitle}>Suscripción</Text>
      <SubscriptionButton
        gymName={gym.name}
        status={subscriptionStatus}
      />
    </View>

    {/* Resto de secciones existentes */}
    <CheckInSection gym={gym} />
    <EquipmentList equipment={gym.equipment} />
    {/* ... */}
  </ScrollView>
);
```

---

## 🎨 Paso 4: Agregar estilos

```typescript
const styles = StyleSheet.create({
  // ... estilos existentes ...

  subscriptionSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
});
```

---

## 🔄 Paso 5: Actualizar validación de check-in (Opcional)

Si quieres mostrar mensajes más claros en la sección de check-in basados en el estado de suscripción:

```typescript
const renderCheckInButton = () => {
  const {
    hasActiveSubscription,
    canUseTrial,
    trialUsed,
  } = subscriptionStatus;

  // Si tiene suscripción activa o puede usar trial, mostrar botón normal
  if (hasActiveSubscription || canUseTrial) {
    return (
      <TouchableOpacity
        style={styles.checkInButton}
        onPress={handleCheckIn}
      >
        <Text style={styles.checkInButtonText}>Hacer Check-in</Text>
        {canUseTrial && (
          <Text style={styles.trialBadge}>Visita de prueba</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Si ya usó el trial, mostrar mensaje
  if (trialUsed) {
    return (
      <View style={styles.checkInDisabled}>
        <Text style={styles.checkInDisabledText}>
          Ya utilizaste tu visita de prueba. Suscríbete para continuar.
        </Text>
      </View>
    );
  }

  // Sin suscripción y sin trial
  return (
    <View style={styles.checkInDisabled}>
      <Text style={styles.checkInDisabledText}>
        Necesitas una suscripción activa para hacer check-in
      </Text>
    </View>
  );
};
```

---

## 📊 Paso 6: Actualizar tipo GymDTO

Asegúrate de que el DTO de Gym incluya el campo `trial_allowed`:

En `src/features/gyms/data/dto/GymApiDTO.ts` o similar:

```typescript
export interface GymDTO {
  id_gym: number;
  name: string;
  address: string;
  // ... otros campos ...
  trial_allowed: boolean; // ⭐ NUEVO CAMPO
}
```

Y actualiza el mapper correspondiente en `src/features/gyms/data/mappers/gym.mappers.ts`:

```typescript
export function mapGymDTOToEntity(dto: GymDTO): Gym {
  return {
    id: dto.id_gym,
    name: dto.name,
    address: dto.address,
    // ... otros campos ...
    trialAllowed: dto.trial_allowed, // ⭐ MAPEO DEL NUEVO CAMPO
  };
}
```

---

## 🧪 Paso 7: Probar los flujos

### Flujo 1: Usuario sin suscripción, gym permite trial
1. Abrir GymDetailScreen
2. Ver mensaje "Visita de prueba disponible"
3. Ver botón "Suscribirme"
4. Hacer check-in → Debería permitir y marcar trial como usado

### Flujo 2: Usuario sin suscripción, gym NO permite trial
1. Abrir GymDetailScreen
2. Ver solo botón "Suscribirme"
3. Intentar check-in → Debería rechazar con mensaje claro

### Flujo 3: Usuario con suscripción activa
1. Abrir GymDetailScreen
2. Ver información de suscripción activa con días restantes
3. Ver botón "Cancelar suscripción"
4. Check-in debería funcionar normalmente

### Flujo 4: Usuario con 2 gimnasios activos
1. Abrir GymDetailScreen de un 3er gimnasio
2. Ver mensaje "Ya tienes 2 gimnasios activos"
3. Botón de suscribirse deshabilitado
4. No puede suscribirse hasta cancelar una de las existentes

### Flujo 5: Suscripción por vencer
1. Si la suscripción vence en ≤7 días
2. Ver alerta amarilla con "⚠️ X días restantes"
3. Información visual destacada

---

## 🚀 Código completo de ejemplo

```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGymDetail } from '../hooks/useGymDetail';
import { useGymSubscriptionStatus, SubscriptionButton } from '@features/subscriptions';
import { HeroImage, Header, BasicInfo, CheckInSection } from '../components/detail';

export function GymDetailScreen({ route, navigation }: Props) {
  const { gymId } = route.params;
  const { gym, isLoading, error } = useGymDetail(gymId);

  const subscriptionStatus = useGymSubscriptionStatus(
    gymId,
    gym?.name || '',
    gym?.trialAllowed || false
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (error || !gym) {
    return <ErrorView error={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      <HeroImage imageUrl={gym.profileImageUrl} />
      <Header gym={gym} />
      <BasicInfo gym={gym} />

      {/* Sección de suscripción */}
      <View style={styles.subscriptionSection}>
        <Text style={styles.sectionTitle}>Suscripción</Text>
        <SubscriptionButton
          gymName={gym.name}
          status={subscriptionStatus}
        />
      </View>

      {/* Check-in solo si tiene acceso */}
      {(subscriptionStatus.hasActiveSubscription || subscriptionStatus.canUseTrial) && (
        <CheckInSection gym={gym} />
      )}

      {/* Resto de secciones */}
      <EquipmentList equipment={gym.equipment} />
      <Services services={gym.services} />
      <ContactInfo gym={gym} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  subscriptionSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
});
```

---

## ✅ Checklist de integración

- [ ] Importar `useGymSubscriptionStatus` y `SubscriptionButton`
- [ ] Agregar hook en el componente
- [ ] Agregar `SubscriptionButton` en el layout
- [ ] Actualizar GymDTO con campo `trial_allowed`
- [ ] Actualizar mapper de Gym
- [ ] Agregar estilos para la sección
- [ ] Probar flujos de suscripción
- [ ] Probar flujos de trial
- [ ] Probar límite de 2 gimnasios
- [ ] Probar cancelación de suscripción

---

## 📝 Notas importantes

1. **Recarga automática**: El componente `SubscriptionButton` maneja internamente la recarga del estado después de suscribirse/cancelar

2. **Mensajes de error**: Los errores se manejan con Toast automáticamente, no necesitas código adicional

3. **Loading states**: El botón maneja sus propios estados de carga durante las operaciones

4. **Límite de 2 gimnasios**: La validación se hace tanto en frontend (UX) como en backend (seguridad)

5. **Trial automático**: Cuando el usuario hace check-in con trial disponible, el backend marca automáticamente el trial como usado

---

## 🐛 Troubleshooting

### El campo trial_allowed no aparece en el DTO
**Solución**: Asegúrate de que el backend incluya este campo en la respuesta. Verifica en el mapper del backend.

### El hook no se actualiza después de suscribirse
**Solución**: El hook tiene un `refetch()` interno que se llama automáticamente. Verifica que no haya errores en la consola.

### El botón no muestra el estado correcto
**Solución**: Verifica que estés pasando correctamente `trial_allowed` al hook. Usa console.log para debuggear el estado.

---

## 🎉 Resultado esperado

Después de esta integración, GymDetailScreen tendrá:
- ✅ Botón dinámico que se adapta al estado de suscripción
- ✅ Información clara sobre trial disponible/usado
- ✅ Validación de límite de 2 gimnasios
- ✅ Flujo completo de suscripción/cancelación
- ✅ Alertas de vencimiento próximo
- ✅ Mensajes de error claros y contextuales
