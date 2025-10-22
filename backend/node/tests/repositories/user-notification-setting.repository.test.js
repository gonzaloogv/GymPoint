/**
 * Tests para user-notification-setting.repository
 */

jest.mock('../../models', () => ({
  UserNotificationSetting: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

const {
  findByUserProfileId,
  updateSettings,
  createDefaultSettings
} = require('../../infra/db/repositories/user-notification-setting.repository');
const { UserNotificationSetting } = require('../../models');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('findByUserProfileId', () => {
  it('retorna configuración existente', async () => {
    const mockSetting = {
      id_user_notification_setting: 1,
      id_user_profile: 5,
      push_enabled: true,
      email_enabled: true,
      get: jest.fn().mockReturnValue({
        id_user_notification_setting: 1,
        id_user_profile: 5,
        push_enabled: true,
        email_enabled: true
      })
    };

    UserNotificationSetting.findOne.mockResolvedValue(mockSetting);

    const result = await findByUserProfileId(5);

    expect(UserNotificationSetting.findOne).toHaveBeenCalledWith({
      where: { id_user_profile: 5 }
    });
    expect(result).toEqual(expect.objectContaining({
      id_user_profile: 5,
      push_enabled: true,
      email_enabled: true
    }));
  });

  it('crea configuración por defecto si no existe', async () => {
    UserNotificationSetting.findOne.mockResolvedValue(null);

    const mockCreated = {
      id_user_notification_setting: 2,
      id_user_profile: 10,
      push_enabled: true,
      email_enabled: true,
      reminder_enabled: true,
      achievement_enabled: true,
      reward_enabled: true,
      gym_news_enabled: false,
      get: jest.fn().mockReturnValue({
        id_user_notification_setting: 2,
        id_user_profile: 10,
        push_enabled: true,
        email_enabled: true
      })
    };

    UserNotificationSetting.create.mockResolvedValue(mockCreated);

    const result = await findByUserProfileId(10);

    expect(UserNotificationSetting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user_profile: 10,
        push_enabled: true,
        email_enabled: true
      }),
      undefined
    );
    expect(result.id_user_profile).toBe(10);
  });
});

describe('updateSettings', () => {
  it('actualiza configuración existente', async () => {
    const mockSetting = {
      update: jest.fn().mockResolvedValue(),
      get: jest.fn().mockReturnValue({
        id_user_notification_setting: 1,
        id_user_profile: 5,
        push_enabled: false,
        email_enabled: true
      })
    };

    UserNotificationSetting.findOne.mockResolvedValue(mockSetting);

    const result = await updateSettings(5, { push_enabled: false });

    expect(mockSetting.update).toHaveBeenCalledWith({ push_enabled: false });
    expect(result.push_enabled).toBe(false);
  });

  it('crea configuración si no existe', async () => {
    UserNotificationSetting.findOne.mockResolvedValue(null);

    const mockCreated = {
      get: jest.fn().mockReturnValue({
        id_user_notification_setting: 3,
        id_user_profile: 15,
        push_enabled: false
      })
    };

    UserNotificationSetting.create.mockResolvedValue(mockCreated);

    const result = await updateSettings(15, { push_enabled: false });

    expect(UserNotificationSetting.create).toHaveBeenCalledWith({
      id_user_profile: 15,
      push_enabled: false
    });
    expect(result.id_user_profile).toBe(15);
  });
});

describe('createDefaultSettings', () => {
  it('crea configuración con valores por defecto', async () => {
    const mockCreated = {
      get: jest.fn().mockReturnValue({
        id_user_notification_setting: 4,
        id_user_profile: 20,
        push_enabled: true,
        email_enabled: true,
        reminder_enabled: true,
        achievement_enabled: true,
        reward_enabled: true,
        gym_news_enabled: false
      })
    };

    UserNotificationSetting.create.mockResolvedValue(mockCreated);

    const result = await createDefaultSettings(20);

    expect(UserNotificationSetting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user_profile: 20,
        push_enabled: true,
        email_enabled: true,
        reminder_enabled: true,
        achievement_enabled: true,
        reward_enabled: true,
        gym_news_enabled: false
      }),
      undefined
    );
    expect(result.id_user_profile).toBe(20);
  });
});
