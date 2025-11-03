const { toUserProfile, toUserProfiles } = require('../../../infra/db/mappers/user-profile.mapper');

describe('user-profile-mapper', () => {
  describe('toUserProfile', () => {
    it('transforma una instancia de UserProfile con todos los campos', () => {
      const dbInstance = {
        id_user_profile: 1,
        id_account: 100,
        name: 'Juan',
        lastname: 'Pérez',
        gender: 'M',
        birth_date: '1990-05-15',
        locality: 'Buenos Aires',
        profile_picture_url: 'https://example.com/avatar.jpg',
        app_tier: 'PREMIUM',
        tokens: 150,
        tokens_balance: 150,
        tokens_lifetime: 500,
        premium_since: '2024-01-01T00:00:00.000Z',
        premium_expires: '2025-01-01T00:00:00.000Z',
        id_streak: 5,
        preferred_language: 'es',
        timezone: 'America/Argentina/Buenos_Aires',
        onboarding_completed: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      const result = toUserProfile(dbInstance);

      expect(result).toEqual({
        id_user_profile: 1,
        id_account: 100,
        name: 'Juan',
        lastname: 'Pérez',
        gender: 'M',
        birth_date: '1990-05-15',
        locality: 'Buenos Aires',
        profile_picture_url: 'https://example.com/avatar.jpg',
        subscription: 'PREMIUM',
        tokens: 150,
        tokens_balance: 150,
        tokens_lifetime: 500,
        premium_since: '2024-01-01T00:00:00.000Z',
        premium_expires: '2025-01-01T00:00:00.000Z',
        id_streak: 5,
        preferred_language: 'es',
        timezone: 'America/Argentina/Buenos_Aires',
        onboarding_completed: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
        email: null,
        auth_provider: null,
        email_verified: false,
      });
    });

    it('transforma una instancia con campos opcionales nulos', () => {
      const dbInstance = {
        id_user_profile: 2,
        id_account: 200,
        name: 'María',
        lastname: 'González',
        gender: null,
        birth_date: null,
        locality: null,
        profile_picture_url: null,
        app_tier: 'FREE',
        tokens: 0,
        premium_since: null,
        premium_expires: null,
        id_streak: null,
        preferred_language: null,
        timezone: null,
        onboarding_completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = toUserProfile(dbInstance);

      expect(result).toEqual({
        id_user_profile: 2,
        id_account: 200,
        name: 'María',
        lastname: 'González',
        gender: null,
        birth_date: null,
        locality: null,
        profile_picture_url: null,
        subscription: 'FREE',
        tokens: 0,
        tokens_balance: 0,
        tokens_lifetime: 0,
        premium_since: null,
        premium_expires: null,
        id_streak: null,
        preferred_language: 'es',
        timezone: null,
        onboarding_completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        email: null,
        auth_provider: null,
        email_verified: false,
      });
    });

    it('transforma una instancia con relación Account incluida', () => {
      const dbInstance = {
        id_user_profile: 3,
        id_account: 300,
        name: 'Pedro',
        lastname: 'Martínez',
        gender: 'M',
        app_tier: 'FREE',
        tokens: 50,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        account: {
          email: 'pedro@example.com',
          auth_provider: 'LOCAL',
          email_verified: true,
        },
      };

      const result = toUserProfile(dbInstance);

      expect(result.email).toBe('pedro@example.com');
      expect(result.auth_provider).toBe('LOCAL');
      expect(result.email_verified).toBe(true);
    });

    it('maneja instancia de Sequelize con método get()', () => {
      const dbInstance = {
        id_user_profile: 4,
        id_account: 400,
        name: 'Ana',
        lastname: 'López',
        app_tier: 'PREMIUM',
        tokens: 100,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        get: jest.fn().mockReturnValue({
          id_user_profile: 4,
          id_account: 400,
          name: 'Ana',
          lastname: 'López',
          app_tier: 'PREMIUM',
          tokens: 100,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        }),
      };

      const result = toUserProfile(dbInstance);

      expect(dbInstance.get).toHaveBeenCalledWith({ plain: true });
      expect(result.name).toBe('Ana');
      expect(result.lastname).toBe('López');
    });

    it('retorna null si la instancia es null', () => {
      const result = toUserProfile(null);
      expect(result).toBeNull();
    });

    it('retorna null si la instancia es undefined', () => {
      const result = toUserProfile(undefined);
      expect(result).toBeNull();
    });

    it('maneja subscription como app_tier fallback', () => {
      const dbInstance = {
        id_user_profile: 5,
        id_account: 500,
        name: 'Test',
        lastname: 'User',
        subscription: 'PREMIUM',
        tokens: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = toUserProfile(dbInstance);

      expect(result.subscription).toBe('PREMIUM');
    });

    it('usa "FREE" como valor por defecto para subscription', () => {
      const dbInstance = {
        id_user_profile: 6,
        id_account: 600,
        name: 'Test',
        lastname: 'User',
        tokens: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = toUserProfile(dbInstance);

      expect(result.subscription).toBe('FREE');
    });
  });

  describe('toUserProfiles', () => {
    it('transforma un array de instancias', () => {
      const instances = [
        {
          id_user_profile: 1,
          id_account: 100,
          name: 'Juan',
          lastname: 'Pérez',
          app_tier: 'PREMIUM',
          tokens: 150,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id_user_profile: 2,
          id_account: 200,
          name: 'María',
          lastname: 'González',
          app_tier: 'FREE',
          tokens: 50,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      const result = toUserProfiles(instances);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Juan');
      expect(result[1].name).toBe('María');
    });

    it('retorna array vacío si instances es null', () => {
      const result = toUserProfiles(null);
      expect(result).toEqual([]);
    });

    it('retorna array vacío si instances es undefined', () => {
      const result = toUserProfiles(undefined);
      expect(result).toEqual([]);
    });

    it('retorna array vacío si instances no es un array', () => {
      const result = toUserProfiles({ not: 'an array' });
      expect(result).toEqual([]);
    });

    it('retorna array vacío para array vacío', () => {
      const result = toUserProfiles([]);
      expect(result).toEqual([]);
    });
  });
});
