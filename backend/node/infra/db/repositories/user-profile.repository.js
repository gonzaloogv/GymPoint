const { UserProfile } = require('../../../models');
const { toUserProfile } = require('../../db/mappers/user-profile.mapper');

async function createUserProfile(payload, options = {}) {
  const profile = await UserProfile.create(payload, {
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

async function updateUserProfile(idUserProfile, payload, options = {}) {
  await UserProfile.update(payload, {
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction,
  });

  if (options.returning === false) {
    return null;
  }

  return findById(idUserProfile, options);
}

async function findById(idUserProfile, options = {}) {
  const profile = await UserProfile.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

async function findByAccountId(idAccount, options = {}) {
  const profile = await UserProfile.findOne({
    where: { id_account: idAccount },
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

module.exports = {
  createUserProfile,
  updateUserProfile,
  findById,
  findByAccountId,
};
