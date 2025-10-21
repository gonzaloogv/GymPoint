const notificationService = require('./notification-service');
const tokenLedgerService = require('./token-ledger-service');
const { TOKEN_REASONS } = require('../config/constants');

const ACHIEVEMENT_REF_TYPE = 'achievement';

const handleUnlock = async ({ idUserProfile, definition, userAchievement }) => {
  const tokenReward = definition.metadata?.token_reward || 0;
  const unlockMessage = definition.metadata?.unlock_message || definition.description || definition.name;

  try {
    await notificationService.createNotification({
      id_user_profile: idUserProfile,
      type: 'ACHIEVEMENT',
      title: '¡Nuevo logro desbloqueado!',
      message: unlockMessage,
      icon: definition.metadata?.icon || null
    });
  } catch (error) {
    console.error('[achievement-side-effects] Error creando notificación', error);
  }

  if (tokenReward > 0) {
    try {
      const alreadyRewarded = await tokenLedgerService.existeMovimiento(
        ACHIEVEMENT_REF_TYPE,
        userAchievement.id_user_achievement
      );

      if (!alreadyRewarded) {
        await tokenLedgerService.registrarMovimiento({
          userId: idUserProfile,
          delta: tokenReward,
          reason: TOKEN_REASONS.ACHIEVEMENT_UNLOCKED,
          refType: ACHIEVEMENT_REF_TYPE,
          refId: userAchievement.id_user_achievement
        });
      }
    } catch (error) {
      console.error('[achievement-side-effects] Error otorgando tokens por logro', error);
    }
  }
};

const processUnlockResults = async (idUserProfile, results) => {
  const unlockedCodes = [];

  for (const result of results) {
    if (result.justUnlocked) {
      unlockedCodes.push(result.definition.code);
      await handleUnlock({
        idUserProfile,
        definition: result.definition,
        userAchievement: result.userAchievement
      });
    }
  }

  return unlockedCodes;
};

module.exports = {
  handleUnlock,
  processUnlockResults
};

