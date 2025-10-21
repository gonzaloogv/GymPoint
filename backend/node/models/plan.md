# 📋 PLAN DE MIGRACIÓN: BD VIEJA → BD NUEVA + MEJORAS

## 🎯 RESUMEN EJECUTIVO

**Objetivo:** Actualizar la base de datos con campos faltantes críticos y ajustes de diseño.

**Total de cambios:** 
- 4 tablas afectadas
- 13 nuevos campos
- 2 campos modificados
- 6 nuevos índices

**Tiempo estimado:** 30 minutos (ejecución + testing)

---

## 📦 PARTE 1: CAMPOS A AGREGAR/MODIFICAR

### ✅ **TIER 1 - CRÍTICOS** (Implementar SÍ o SÍ)

#### **Tabla: `user_profiles`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `preferred_language` | VARCHAR(5) | `'es'` | ❌ NO | Idioma preferido (ISO 639-1: es, en, pt) |
| `timezone` | VARCHAR(50) | `'America/Argentina/Buenos_Aires'` | ❌ NO | Zona horaria para notificaciones |
| `onboarding_completed` | BOOLEAN | `FALSE` | ❌ NO | Si completó el tutorial inicial |

**Índices a crear:**
- `idx_user_profiles_onboarding` en `(onboarding_completed)`

**Razón:** Sin estos campos no puedes manejar internacionalización ni tutoriales.

---

#### **Tabla: `gym`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `google_maps_url` | VARCHAR(500) | `NULL` | ✅ SÍ | URL completa de Google Maps |
| `instagram` | VARCHAR(100) | `NULL` | ✅ SÍ | Usuario de Instagram (sin @) |
| `facebook` | VARCHAR(100) | `NULL` | ✅ SÍ | Usuario/página de Facebook |
| `equipment` | JSON | `'[]'` | ✅ SÍ | **NUEVO:** Array de equipamiento |
| `rules` | JSON | `'[]'` | ✅ SÍ | **MODIFICAR:** De TEXT a JSON array |

**Índices a crear:**
- `idx_gym_instagram` en `(instagram)`

**Razón:** 
- Redes sociales críticas para verificación
- `equipment` y `rules` como JSON arrays permiten flexibilidad
- Google Maps esperado por usuarios

**Ejemplo de datos JSON:**
```json
// equipment
["Mancuernas", "Barras olímpicas", "Cintas de correr", "Bicicletas"]

// rules
["Llevar toalla", "No usar celular en zona de pesas", "Guardar discos"]
```

---

### ⚠️ **TIER 2 - IMPORTANTES** (Si usas premium/recompensas)

#### **Tabla: `user_profiles`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `premium_since` | DATE | `NULL` | ✅ SÍ | Fecha inicio suscripción premium |
| `premium_expires` | DATE | `NULL` | ✅ SÍ | Fecha expiración premium |

**Índices a crear:**
- `idx_user_profiles_premium_expires` en `(premium_expires, subscription)`

**Razón:** Para degradar automáticamente a FREE cuando expire premium.

---

#### **Tabla: `claimed_reward`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `used_at` | DATETIME | `NULL` | ✅ SÍ | Cuándo se usó la recompensa |
| `expires_at` | DATETIME | `NULL` | ✅ SÍ | Fecha/hora de expiración |

**Índices a crear:**
- `idx_claimed_reward_expires` en `(expires_at, status)`

**Razón:** Recompensas con vigencia temporal (ej: "válido 30 días").

---

### 💡 **TIER 3 - OPCIONALES** (Nice to have)

#### **Tabla: `assistance`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `created_at` | DATETIME | `CURRENT_TIMESTAMP` | ❌ NO | Timestamp de registro (auditoría) |

**Índices a crear:**
- `idx_assistance_created_at` en `(created_at)`

**Razón:** Diferencia entre "asistió el día X" vs "se registró en sistema el día Y".

---

#### **Tabla: `gym`**

| Campo | Tipo | Default | Nullable | Comentario |
|-------|------|---------|----------|------------|
| `registration_date` | DATE | `CURRENT_DATE` | ❌ NO | Fecha de registro en plataforma |

**Índices a crear:**
- `idx_gym_registration_date` en `(registration_date)`

**Razón:** Para mostrar "Miembro desde..." y reportes de crecimiento.

---

## 🔄 PARTE 2: CAMBIOS EN MODELS

### **Model: `UserProfile`**

#### **Campos a agregar en TypeScript/Interface:**
```typescript
// ✅ TIER 1 - Agregar siempre
preferred_language: string;        // 'es' | 'en' | 'pt'
timezone: string;                  // 'America/Argentina/Buenos_Aires'
onboarding_completed: boolean;     // false

// ⚠️ TIER 2 - Agregar si usas premium
premium_since: Date | null;        // null
premium_expires: Date | null;      // null
```

#### **Configuración en Sequelize:**
```typescript
// Definición de campos
preferred_language: {
  type: DataTypes.STRING(5),
  allowNull: false,
  defaultValue: 'es',
  validate: {
    isIn: [['es', 'en', 'pt']]
  }
}

timezone: {
  type: DataTypes.STRING(50),
  allowNull: false,
  defaultValue: 'America/Argentina/Buenos_Aires'
}

onboarding_completed: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false
}

premium_since: {
  type: DataTypes.DATEONLY,
  allowNull: true
}

premium_expires: {
  type: DataTypes.DATEONLY,
  allowNull: true
}
```

#### **Métodos de instancia a agregar:**
```typescript
isPremiumActive(): boolean {
  if (this.subscription !== 'PREMIUM') return false;
  if (!this.premium_expires) return true; // Premium sin expiración
  return new Date() < this.premium_expires;
}

hasCompletedOnboarding(): boolean {
  return this.onboarding_completed;
}

get languageConfig() {
  return {
    code: this.preferred_language,
    timezone: this.timezone,
    locale: `${this.preferred_language}_AR`
  };
}
```

#### **Índices a agregar:**
```typescript
indexes: [
  {
    name: 'idx_user_profiles_onboarding',
    fields: ['onboarding_completed']
  },
  {
    name: 'idx_user_profiles_premium_expires',
    fields: ['premium_expires', 'subscription']
  }
]
```

---

### **Model: `Gym`**

#### **Campos a agregar en TypeScript/Interface:**
```typescript
// ✅ TIER 1 - Agregar siempre
google_maps_url: string | null;    // null
instagram: string | null;          // null
facebook: string | null;           // null
equipment: string[];               // [] (JSON array)
rules: string[];                   // [] (JSON array)

// 💡 TIER 3 - Opcional
registration_date: Date;           // new Date()
```

#### **Configuración en Sequelize:**
```typescript
// Campos de redes sociales
google_maps_url: {
  type: DataTypes.STRING(500),
  allowNull: true,
  validate: {
    isUrl: true
  }
}

instagram: {
  type: DataTypes.STRING(100),
  allowNull: true
}

facebook: {
  type: DataTypes.STRING(100),
  allowNull: true
}

// IMPORTANTE: JSON arrays con getters/setters
equipment: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: [],
  comment: "algo aproopiado"
}

rules: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: [],
  commet: "poner algo apropiado"
}

registration_date: {
  type: DataTypes.DATEONLY,
  allowNull: false,
  defaultValue: DataTypes.NOW
}
```
```

#### **Índices a agregar:**
```typescript
indexes: [
  {
    name: 'idx_gym_instagram',
    fields: ['instagram']
  },
  {
    name: 'idx_gym_registration_date',
    fields: ['registration_date']
  }
]
```

---

### **Model: `ClaimedReward`**

#### **Campos a agregar en TypeScript/Interface:**
```typescript
// ⚠️ TIER 2 - Si usas sistema de recompensas
used_at: Date | null;              // null
expires_at: Date | null;           // null
```

#### **Configuración en Sequelize:**
```typescript
used_at: {
  type: DataTypes.DATE,
  allowNull: true
}

expires_at: {
  type: DataTypes.DATE,
  allowNull: true
}
```

#### **Métodos de instancia a agregar:**
```typescript
isExpired(): boolean {
  if (!this.expires_at) return false;
  return new Date() > this.expires_at;
}

isUsable(): boolean {
  return (
    this.status === 'ACTIVE' && 
    !this.isExpired()
  );
}

daysUntilExpiration(): number | null {
  if (!this.expires_at) return null;
  const diff = this.expires_at.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

#### **Índices a agregar:**
```typescript
indexes: [
  {
    name: 'idx_claimed_reward_expires',
    fields: ['expires_at', 'status']
  }
]
```

---

### **Model: `Assistance`**

#### **Campos a agregar en TypeScript/Interface:**
```typescript
// 💡 TIER 3 - Opcional (auditoría)
created_at: Date;                  // new Date()
```

#### **Configuración en Sequelize:**
```typescript
created_at: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW
}
```

#### **Getter útil:**
```typescript
get registrationDelay(): number {
  // Minutos entre asistencia y registro
  const assistanceTime = new Date(`${this.date} ${this.check_in_time}`);
  return Math.floor((this.created_at.getTime() - assistanceTime.getTime()) / 60000);
}
```

#### **Índices a agregar:**
```typescript
indexes: [
  {
    name: 'idx_assistance_created_at',
    fields: ['created_at']
  }
]
```

---

## 🛠️ PARTE 3: CAMBIOS EN SERVICES

### **Service: `UserProfileService`**

#### **Métodos a agregar:**
```typescript
// ✅ TIER 1: Actualizar configuración de idioma/timezone
async updateLanguageSettings(
  userId: number, 
  language: string, 
  timezone: string
): Promise<UserProfile> {
  // 1. Validar idioma soportado
  const validLanguages = ['es', 'en', 'pt'];
  if (!validLanguages.includes(language)) {
    throw new BadRequestException('Idioma no soportado');
  }

  // 2. Validar timezone (usar librería como moment-timezone)
  if (!isValidTimezone(timezone)) {
    throw new BadRequestException('Zona horaria inválida');
  }

  // 3. Actualizar usuario
  await UserProfile.update(
    { preferred_language: language, timezone },
    { where: { id_user_profile: userId } }
  );

  // 4. Retornar perfil actualizado
  return await UserProfile.findByPk(userId);
}

// ✅ TIER 1: Marcar onboarding como completado
async completeOnboarding(userId: number): Promise<void> {
  // 1. Actualizar flag
  await UserProfile.update(
    { onboarding_completed: true },
    { where: { id_user_profile: userId } }
  );

  // 2. Crear notificación de bienvenida
  await NotificationService.create({
    id_user_profile: userId,
    type: 'SYSTEM',
    title: '¡Bienvenido a GymPoint!',
    message: 'Has completado el tutorial inicial'
  });

  // 3. Otorgar tokens de bienvenida
  await TokenLedgerService.addTokens({
    id_user_profile: userId,
    delta: 50,
    reason: 'ONBOARDING_COMPLETED',
    ref_type: 'onboarding'
  });
}

// ⚠️ TIER 2: Activar premium
async activatePremium(
  userId: number, 
  durationDays: number
): Promise<UserProfile> {
  const today = new Date();
  const expiresAt = new Date(today);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await UserProfile.update({
    subscription: 'PREMIUM',
    premium_since: today,
    premium_expires: expiresAt
  }, {
    where: { id_user_profile: userId }
  });

  // Otorgar tokens de bono premium
  await TokenLedgerService.addTokens({
    id_user_profile: userId,
    delta: 100,
    reason: 'PREMIUM_ACTIVATED',
    ref_type: 'subscription'
  });

  return await UserProfile.findByPk(userId);
}

// ⚠️ TIER 2: Cron job para expirar premium
async expirePremiumSubscriptions(): Promise<number> {
  const expiredUsers = await UserProfile.findAll({
    where: {
      subscription: 'PREMIUM',
      premium_expires: {
        [Op.lt]: new Date()
      }
    }
  });

  for (const user of expiredUsers) {
    await user.update({ subscription: 'FREE' });
    
    // Enviar notificación
    await NotificationService.create({
      id_user_profile: user.id_user_profile,
      type: 'SYSTEM',
      title: 'Premium expirado',
      message: 'Tu suscripción premium ha finalizado'
    });
  }

  return expiredUsers.length;
}
```

---

### **Service: `GymService`**

#### **Métodos a agregar/modificar:**
```typescript
// ✅ TIER 1: Crear gimnasio (MODIFICAR)
async create(gymData: CreateGymDTO): Promise<Gym> {
  // 1. Validar equipment es array
  if (gymData.equipment && !Array.isArray(gymData.equipment)) {
    throw new BadRequestException('equipment debe ser un array');
  }

  // 2. Validar rules es array
  if (gymData.rules && !Array.isArray(gymData.rules)) {
    throw new BadRequestException('rules debe ser un array');
  }

  // 3. Validar URLs de redes sociales
  if (gymData.google_maps_url && !gymData.google_maps_url.includes('google.com/maps')) {
    throw new BadRequestException('URL de Google Maps inválida');
  }

  // 4. Establecer defaults
  const gym = await Gym.create({
    ...gymData,
    equipment: gymData.equipment || [],
    rules: gymData.rules || [],
    registration_date: new Date()
  });

  return gym;
}

// ✅ TIER 1: Actualizar reglas
async updateRules(gymId: number, rules: string[]): Promise<Gym> {
  // Validar que sea array
  if (!Array.isArray(rules)) {
    throw new BadRequestException('rules debe ser un array');
  }

  // Validar cada regla
  rules.forEach(rule => {
    if (typeof rule !== 'string' || rule.length > 200) {
      throw new BadRequestException('Regla inválida');
    }
  });

  await Gym.update(
    { rules },
    { where: { id_gym: gymId } }
  );

  return await Gym.findByPk(gymId);
}

// ✅ TIER 1: Actualizar equipamiento
async updateEquipment(
  gymId: number, 
  equipment: string[]
): Promise<Gym> {
  if (!Array.isArray(equipment)) {
    throw new BadRequestException('equipment debe ser un array');
  }

  equipment.forEach(item => {
    if (typeof item !== 'string' || item.length > 100) {
      throw new BadRequestException('Equipamiento inválido');
    }
  });

  await Gym.update(
    { equipment },
    { where: { id_gym: gymId } }
  );

  return await Gym.findByPk(gymId);
}

// ✅ TIER 1: Buscar por equipamiento
async findByEquipment(equipmentName: string): Promise<Gym[]> {
  return await Gym.findAll({
    where: sequelize.literal(
      `JSON_CONTAINS(equipment, '"${equipmentName}"')`
    )
  });
}

// ✅ TIER 1: Obtener enlaces sociales
async getSocialMediaLinks(gymId: number): Promise<SocialLinks> {
  const gym = await Gym.findByPk(gymId);
  if (!gym) throw new NotFoundException('Gym not found');

  return {
    instagram: gym.instagram 
      ? `https://instagram.com/${gym.instagram}` 
      : null,
    facebook: gym.facebook 
      ? `https://facebook.com/${gym.facebook}` 
      : null,
    google_maps: gym.google_maps_url
  };
}
```

---

### **Service: `ClaimedRewardService`**

#### **Métodos a agregar/modificar:**
```typescript
// ⚠️ TIER 2: Canjear recompensa (MODIFICAR)
async claimReward(
  userId: number, 
  rewardId: number,
  expirationDays: number = 30
): Promise<ClaimedReward> {
  // 1. Verificar tokens suficientes
  const user = await UserProfile.findByPk(userId);
  const reward = await Reward.findByPk(rewardId);

  if (user.tokens < reward.token_cost) {
    throw new BadRequestException('Tokens insuficientes');
  }

  // 2. Calcular fecha de expiración
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  // 3. Crear claimed_reward
  const claimed = await ClaimedReward.create({
    id_user_profile: userId,
    id_reward: rewardId,
    claimed_date: new Date(),
    status: 'ACTIVE',
    tokens_spent: reward.token_cost,
    expires_at: expiresAt
  });

  // 4. Descontar tokens
  await TokenLedgerService.deductTokens({
    id_user_profile: userId,
    delta: -reward.token_cost,
    reason: 'REWARD_CLAIM',
    ref_type: 'claimed_reward',
    ref_id: claimed.id_claimed_reward
  });

  return claimed;
}

// ⚠️ TIER 2: Marcar como usado
async markAsUsed(claimedRewardId: number): Promise<ClaimedReward> {
  const claimed = await ClaimedReward.findByPk(claimedRewardId);
  
  if (!claimed) {
    throw new NotFoundException('Recompensa no encontrada');
  }

  if (claimed.isExpired()) {
    throw new BadRequestException('Recompensa expirada');
  }

  await claimed.update({
    status: 'USED',
    used_at: new Date()
  });

  return claimed;
}

// ⚠️ TIER 2: Cron job para expirar recompensas
async expireRewards(): Promise<number> {
  const expiredRewards = await ClaimedReward.findAll({
    where: {
      expires_at: {
        [Op.lt]: new Date()
      },
      status: {
        [Op.in]: ['PENDING', 'ACTIVE']
      }
    }
  });

  for (const reward of expiredRewards) {
    await reward.update({ status: 'EXPIRED' });

    // Notificar usuario
    await NotificationService.create({
      id_user_profile: reward.id_user_profile,
      type: 'REWARD',
      title: 'Recompensa expirada',
      message: 'Una de tus recompensas ha expirado'
    });
  }

  return expiredRewards.length;
}

// ⚠️ TIER 2: Obtener recompensas activas
async getActiveRewards(userId: number): Promise<ClaimedReward[]> {
  return await ClaimedReward.findAll({
    where: {
      id_user_profile: userId,
      status: {
        [Op.in]: ['ACTIVE', 'PENDING']
      },
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    },
    order: [['expires_at', 'ASC NULLS LAST']],
    include: [{ model: Reward }]
  });
}
```

---

### **Service: `AssistanceService`**

#### **Métodos a agregar (TIER 3 - opcional):**
```typescript
// 💡 TIER 3: Detectar registros tardíos
async getDelayedRegistrations(
  gymId: number, 
  delayMinutes: number = 60
): Promise<Assistance[]> {
  return await Assistance.findAll({
    where: {
      id_gym: gymId,
      [Op.and]: sequelize.literal(
        `TIMESTAMPDIFF(MINUTE, 
          CONCAT(date, ' ', check_in_time), 
          created_at
        ) > ${delayMinutes}`
      )
    },
    order: [['created_at', 'DESC']]
  });
}

// 💡 TIER 3: Reporte de auditoría
async getRegistrationAudit(
  startDate: Date, 
  endDate: Date
): Promise<AuditReport> {
  const assistances = await Assistance.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  const delayed = assistances.filter(a => {
    const assistTime = new Date(`${a.date} ${a.check_in_time}`);
    const diff = (a.created_at.getTime() - assistTime.getTime()) / 60000;
    return diff > 60; // Más de 1 hora de diferencia
  });

  return {
    total: assistances.length,
    delayed: delayed.length,
    delayedPercentage: (delayed.length / assistances.length) * 100,
    suspiciousPatterns: this.detectPatterns(delayed)
  };
}
```

---

## 📊 PARTE 4: CAMBIOS EN DTOs

### **UserProfile DTOs**
```typescript
// ✅ TIER 1: Preferencias de usuario
export class UpdateUserPreferencesDTO {
  @IsIn(['es', 'en', 'pt'])
  @IsOptional()
  preferred_language?: 'es' | 'en' | 'pt';

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class CompleteOnboardingDTO {
  @IsBoolean()
  onboarding_completed: true;

  @ValidateNested()
  @Type(() => UpdateUserPreferencesDTO)
  @IsOptional()
  initial_preferences?: UpdateUserPreferencesDTO;
}

// ⚠️ TIER 2: Activar premium
export class ActivatePremiumDTO {
  @IsInt()
  @Min(1)
  @Max(365)
  duration_days: number;

  @IsString()
  @IsOptional()
  payment_reference?: string;
}
```