import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@features/auth/presentation/state/auth.store';

/**
 * UserScopedStorage - Servicio para almacenamiento local con aislamiento por usuario
 *
 * Problema resuelto: Múltiples usuarios en el mismo dispositivo pueden ver datos de otros
 * Solución: Todos los keys incluyen el userId como prefijo
 *
 * Ejemplo:
 *  - Usuario 123: "@GymPoint:user_123:incompleteSession"
 *  - Usuario 456: "@GymPoint:user_456:incompleteSession"
 *
 * Beneficios:
 *  - Aislamiento de datos por usuario
 *  - Previene leaks de privacidad
 *  - Permite logout limpio (borrar solo datos del usuario)
 *  - Compatible con multi-tenancy en dispositivo compartido
 */
export class UserScopedStorage {
  private readonly APP_PREFIX = '@GymPoint';

  /**
   * Genera una key scoped al usuario actual
   * @param key - Key base (ej: "incompleteSession")
   * @returns Key con prefijo de usuario (ej: "@GymPoint:user_123:incompleteSession")
   * @throws Error si no hay usuario autenticado
   */
  private getUserKey(key: string): string {
    const userId = useAuthStore.getState().user?.id_user;

    if (!userId) {
      throw new Error('[UserScopedStorage] No authenticated user - cannot generate scoped key');
    }

    return `${this.APP_PREFIX}:user_${userId}:${key}`;
  }

  /**
   * Genera una key global (sin scope de usuario)
   * Usar SOLO para datos compartidos entre usuarios (ej: configuración de app)
   * @param key - Key base
   * @returns Key con prefijo de app (ej: "@GymPoint:global:appVersion")
   */
  private getGlobalKey(key: string): string {
    return `${this.APP_PREFIX}:global:${key}`;
  }

  /**
   * Guarda un item en AsyncStorage con scope de usuario
   * @param key - Key base
   * @param value - Valor a guardar (string)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const scopedKey = this.getUserKey(key);
      await AsyncStorage.setItem(scopedKey, value);
    } catch (error) {
      // Si no hay usuario autenticado, no hacer nada silenciosamente
      // Esto es normal durante la inicialización de la app antes del login
      if (error instanceof Error && error.message.includes('No authenticated user')) {
        return;
      }
      console.error(`[UserScopedStorage] Error saving item "${key}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene un item de AsyncStorage con scope de usuario
   * @param key - Key base
   * @returns Valor guardado o null si no existe o no hay usuario autenticado
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const scopedKey = this.getUserKey(key);
      return await AsyncStorage.getItem(scopedKey);
    } catch (error) {
      // Si no hay usuario autenticado, retornar null silenciosamente
      // Esto es normal durante la inicialización de la app antes del login
      if (error instanceof Error && error.message.includes('No authenticated user')) {
        return null;
      }
      console.error(`[UserScopedStorage] Error reading item "${key}":`, error);
      return null;
    }
  }

  /**
   * Elimina un item de AsyncStorage con scope de usuario
   * @param key - Key base
   */
  async removeItem(key: string): Promise<void> {
    try {
      const scopedKey = this.getUserKey(key);
      await AsyncStorage.removeItem(scopedKey);
    } catch (error) {
      // Si no hay usuario autenticado, no hacer nada silenciosamente
      // Esto es normal durante la inicialización de la app antes del login
      if (error instanceof Error && error.message.includes('No authenticated user')) {
        return;
      }
      console.error(`[UserScopedStorage] Error removing item "${key}":`, error);
      throw error;
    }
  }

  /**
   * Guarda un item global (sin scope de usuario)
   * Usar con precaución - solo para datos compartidos
   */
  async setGlobalItem(key: string, value: string): Promise<void> {
    try {
      const globalKey = this.getGlobalKey(key);
      await AsyncStorage.setItem(globalKey, value);
    } catch (error) {
      console.error(`[UserScopedStorage] Error saving global item "${key}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene un item global (sin scope de usuario)
   */
  async getGlobalItem(key: string): Promise<string | null> {
    try {
      const globalKey = this.getGlobalKey(key);
      return await AsyncStorage.getItem(globalKey);
    } catch (error) {
      console.error(`[UserScopedStorage] Error reading global item "${key}":`, error);
      return null;
    }
  }

  /**
   * Limpia TODOS los datos del usuario actual
   * Útil cuando el usuario hace logout
   *
   * @returns Número de keys eliminadas
   */
  async clearUserData(): Promise<number> {
    try {
      const userId = useAuthStore.getState().user?.id_user;

      if (!userId) {
        console.warn('[UserScopedStorage] No authenticated user - skipping clearUserData');
        return 0;
      }

      const userPrefix = `${this.APP_PREFIX}:user_${userId}:`;

      // Obtener todas las keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Filtrar keys del usuario actual
      const userKeys = allKeys.filter(key => key.startsWith(userPrefix));

      // Eliminar todas las keys del usuario
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log(`[UserScopedStorage] Cleared ${userKeys.length} items for user ${userId}`);
      }

      return userKeys.length;
    } catch (error) {
      console.error('[UserScopedStorage] Error clearing user data:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las keys del usuario actual
   * Útil para debugging o migración de datos
   */
  async getUserKeys(): Promise<string[]> {
    try {
      const userId = useAuthStore.getState().user?.id_user;

      if (!userId) {
        return [];
      }

      const userPrefix = `${this.APP_PREFIX}:user_${userId}:`;
      const allKeys = await AsyncStorage.getAllKeys();

      return allKeys.filter(key => key.startsWith(userPrefix));
    } catch (error) {
      console.error('[UserScopedStorage] Error getting user keys:', error);
      return [];
    }
  }

  /**
   * Migra datos legacy (sin user scope) al formato con user scope
   * Útil para migrar datos existentes después de implementar este servicio
   *
   * @param legacyKey - Key antigua sin user scope (ej: "@GymPoint:incompleteSession")
   * @param newKey - Key nueva base (ej: "incompleteSession")
   * @returns true si se migró data, false si no había data legacy
   */
  async migrateLegacyData(legacyKey: string, newKey: string): Promise<boolean> {
    try {
      // Intentar leer data legacy
      const legacyData = await AsyncStorage.getItem(legacyKey);

      if (!legacyData) {
        return false; // No hay data legacy
      }

      // Guardar con nuevo formato (user-scoped)
      await this.setItem(newKey, legacyData);

      // Eliminar key legacy
      await AsyncStorage.removeItem(legacyKey);

      console.log(`[UserScopedStorage] Migrated legacy key: ${legacyKey} -> ${this.getUserKey(newKey)}`);
      return true;
    } catch (error) {
      console.error(`[UserScopedStorage] Error migrating legacy data "${legacyKey}":`, error);
      return false;
    }
  }
}

// Export singleton instance
export const userStorage = new UserScopedStorage();
