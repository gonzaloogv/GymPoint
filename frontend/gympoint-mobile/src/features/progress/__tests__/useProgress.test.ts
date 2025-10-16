/**
 * Test básico para verificar el hook useProgress
 * Este test verifica que el hook se integre correctamente con el DI container
 */

import { DI } from '@di/container';

describe('Progress Feature Integration', () => {
  it('DI Container tiene las dependencias de Progress configuradas', () => {
    expect(DI.progressLocal).toBeDefined();
    expect(DI.progressRepository).toBeDefined();
    expect(DI.getProgress).toBeDefined();
  });

  it('GetProgress use case puede ejecutarse', async () => {
    const result = await DI.getProgress.execute('user-1');

    expect(result).toBeDefined();
    expect(result.streak).toBeDefined();
    expect(result.weekly).toBeDefined();
    expect(result.physicalProgress).toBeDefined();
    expect(result.exerciseProgress).toBeDefined();
    expect(result.achievements).toBeDefined();
    expect(result.trends).toBeDefined();
  });

  it('Los datos de progreso tienen la estructura correcta', async () => {
    const result = await DI.getProgress.execute('user-1');

    // Verificar streak
    expect(result.streak.currentStreak).toBeGreaterThan(0);
    expect(result.streak.icon).toBe('🔥');

    // Verificar weekly
    expect(result.weekly.workoutsThisWeek).toBeGreaterThanOrEqual(0);
    expect(result.weekly.icon).toBe('🎯');

    // Verificar achievements
    expect(Array.isArray(result.achievements)).toBe(true);
    expect(result.achievements.length).toBeGreaterThan(0);

    // Verificar ejercicios
    expect(Array.isArray(result.exerciseProgress)).toBe(true);
    expect(result.exerciseProgress.length).toBeGreaterThan(0);
  });
});
